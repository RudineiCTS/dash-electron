/* ==========================================================================================================
   CAMPANHA COMERCIAL - PEDIDOS CONSIDERADOS NA APURAÇÃO (PARTE 1: apuração de VENDAS, tipo 1)

   O que este script faz (rodar no banco GS300GP, na ordem):
     1. Cria a tabela dbo.tblCampanhaComercialRetornoPedido (equivalente Farma de tblCampanhaTelevendasRetornoPedido):
        uma linha por pedido/produto considerado na apuração, separada por IDCampanhaComercial.
     2. ALTER PROCEDURE dbo.uspUsuCampanhaComercialVendas: além de apurar, grava nessa tabela os pedidos que
        entraram no cálculo, junto com as demais informações (origem, operação, cliente, fabricante, linha,
        vendedor/gerente da venda, vendedor/gerente creditado, se foi por exclusivo, se contou no apurado...).

   NÃO é preciso alterar uspUsuCalculaCampanhaComercial: ela já chama esta procedure por campanha, e esta
   apaga e regrava os pedidos da própria campanha a cada execução (rodar de novo não duplica).

   Este script NÃO foi executado em nenhum banco. Rode primeiro em homologação e confira com a consulta da
   seção "CONFERÊNCIA" no final.

   Mudanças em uspUsuCampanhaComercialVendas (todo o resto está igual ao original):
     A. A base de vendas (GS300BI.dbo.tblConsolidacaoVendas) passa a ser lida UMA vez para #tmpPedido, com os
        MESMOS filtros e o MESMO crédito de vendedor/gerente do original.
     B. O resultado por vendedor (#tmpResultado) agora soma #tmpPedido (antes a soma lia a base direto):
        o valor apurado continua idêntico, e o que foi gravado é exatamente o que foi somado.
     C. No fim, apaga os pedidos da campanha e grava os de #tmpPedido em tblCampanhaComercialRetornoPedido
        (na mesma transação; se já houver uma transação aberta pelo chamador, usa a dele).
     D. #tmpPedido é removida no final com DROP TABLE IF EXISTS (a chamada original de limpeza fica igual).

   Observações:
     - ConsideradoNoApurado = 1 quando o vendedor creditado existe em tblCampanhaComercialVendedorAtual, ou
       seja, o pedido realmente contou para alguém no resultado. = 0 quando passou nos filtros da campanha mas o
       vendedor creditado não está na base de vendedores atuais (a venda não entrou em nenhum resultado).
     - O JOIN com o exclusivo (cliente + fabricante [+ linha]) é o mesmo do original: se o cadastro de exclusivos
       tiver mais de um vendedor para a mesma combinação, a linha de venda se repete (no original também
       somava repetido). Agora isso fica visível na tabela.
     - Valor da linha = Total da base consolidada (operações de devolução entram com o sinal que a base já traz).
   ========================================================================================================== */

USE [GS300GP]
GO

/* ==========================================================================================================
   1. TABELA
   ========================================================================================================== */
IF OBJECT_ID('dbo.tblCampanhaComercialRetornoPedido', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblCampanhaComercialRetornoPedido
	(
		IDCampanhaComercial       INT           NOT NULL,
		IDPedido                  INT           NULL,
		IDProduto                 INT           NULL,
		IDOperacao                INT           NULL,
		IDOrigem                  INT           NULL,
		IDPessoaCliente           INT           NULL,
		IDPessoaFabricante        INT           NULL,
		IDProdutoLinha            INT           NULL,
		Quantidade                INT           NULL,
		/* quem vendeu / gerente na própria venda */
		IDPessoaVendedor          INT           NULL,
		IDPessoaGerente           INT           NULL,
		/* quem recebeu o crédito na campanha (exclusivo -> vendedor da venda, conforme a campanha) */
		IDPessoaVendedorCreditado INT           NULL,
		IDPessoaGerenteCreditado  INT           NULL,
		CreditadoPorExclusivo     BIT           NOT NULL CONSTRAINT DF_tblCamComRetPed_CredExcl DEFAULT (0),
		ConsideradoNoApurado      BIT           NOT NULL CONSTRAINT DF_tblCamComRetPed_Consid  DEFAULT (0),
		DataFaturamento           DATETIME      NULL,
		ValorCampanha             DECIMAL(18,2) NOT NULL CONSTRAINT DF_tblCamComRetPed_Valor   DEFAULT (0),
		DataApuracao              DATETIME      NOT NULL CONSTRAINT DF_tblCamComRetPed_DataAp  DEFAULT (GETDATE())
	);

	/* leitura por campanha (e por pedido) */
	CREATE CLUSTERED INDEX IX_tblCamComRetPed_Campanha
		ON dbo.tblCampanhaComercialRetornoPedido (IDCampanhaComercial, IDPedido);

	/* detalhe por vendedor creditado dentro da campanha */
	CREATE NONCLUSTERED INDEX IX_tblCamComRetPed_Vendedor
		ON dbo.tblCampanhaComercialRetornoPedido (IDCampanhaComercial, IDPessoaVendedorCreditado)
		INCLUDE (ValorCampanha, ConsideradoNoApurado);
END
GO

/* ==========================================================================================================
   2. PROCEDURE
   ========================================================================================================== */
/* ==========================================================================================================
   uspUsuCampanhaComercialVendas - versão refatorada (campanhas de VALOR VENDIDO)

   Mesma assinatura, mesmo conteúdo em #tmpResultado e mesmo INSERT final em tblCampanhaComercialRetorno.

   Principais mudanças:
     1. Os 4 ramos de apuração (condição especial 1/2, sem OL, com OL) viraram UM único INSERT.
        - Ramos "condição especial" eram código morto (@intCampanhaCondicaoEspecial sempre = 0).
        - "Sem OL" x "com OL" só diferiam pelo filtro de devolução OL -> agora a #tmpDevolucaoVendasOL
          só é populada quando a campanha NÃO tem origem 3; com OL ela fica vazia e o filtro não corta nada.
     2. Gerentes participantes materializados 1x em #Gerente (antes a função de split era chamada
        dentro do WHERE de cada linha de venda, nos dois lados do OR).
     3. Vendedor/gerente creditado calculado 1x via CROSS APPLY (sem OR por @BitVendedorVenda).
     4. 5 cursores substituídos por UPDATEs set-based (mesmas regras de agregação e ranking).
     5. #tmpExclusivoVendedorFabricante sem os JOINs não usados da subquery e com índice
        na chave real do join (cliente + fabricante).
     6. Removidos: variável "Russon" (sempre 0,00), hints NOLOCK em temporárias.
     7. PEDIDOS CONSIDERADOS: a base de vendas é lida 1x para #tmpPedido; o resultado soma #tmpPedido e os
        pedidos são gravados em tblCampanhaComercialRetornoPedido, separados por IDCampanhaComercial.
   ========================================================================================================== */

ALTER PROCEDURE [dbo].[uspUsuCampanhaComercialVendas]
	@INintIDCampanhaComercial INT,
	@INdateDataInicio DATE,
	@INdateDataFim DATE,
	@INintTipoValor INT,
	@INintExtensaoRanking INT,
	@INintTipoRanking INT,
	@INintGrandesContasVendedor INT,
	@INdecGatilho DECIMAL(18,2) = NULL, -- mantido apenas por compatibilidade de assinatura (não é usado)
	@INvchOrigem VARCHAR(50),
	@BitVendedorVenda BIT
AS
BEGIN

	SET NOCOUNT ON;

	/* GRAVA LOG DA EXECUCAO DA PROCEDURE */
	DECLARE
		@sysNomeProcedure SYSNAME = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID),
		@sysBancoDados SYSNAME = DB_NAME();

	EXEC GS300GP.DBO.uspStoredProcedureInsereLogExececucao @INsysNomeProcedure = @sysNomeProcedure, @INsysBancoDados = @sysBancoDados;

	--==========================================================================================================
	/* PARÂMETROS DERIVADOS */
	DECLARE
		@ApoioOrigem BIT = 0, /* 1 = TEM ORIGEM 3 (OPERAÇÃO LOGÍSTICA) */
		@vchGerentesParticipantes VARCHAR(100); -- AJUSTAR: conferir tamanho da coluna GerenteParticipantes; se for maior, a lista é truncada aqui

	IF EXISTS (SELECT 1 FROM STRING_SPLIT(@INvchOrigem, ',') WHERE LTRIM(RTRIM(value)) = '3')
		SET @ApoioOrigem = 1;

	SELECT @vchGerentesParticipantes = tbl.GerenteParticipantes
	FROM tblCampanhaComercial tbl
	WHERE tbl.IDCampanhaComercial = @INintIDCampanhaComercial;

	DECLARE @vchMensagem VARCHAR(100) =
		'Campanha considerando vendedor venda ? ' + CAST(@BitVendedorVenda AS VARCHAR(1)) +
		' | Origem OL (3) ? ' + CAST(@ApoioOrigem AS VARCHAR(1));
	RAISERROR (@vchMensagem, 0, 1) WITH NOWAIT;

	--==========================================================================================================
	CREATE TABLE #Gerente
	(
		IDGerente INT NOT NULL
	);
	-- Insira os dados e depois crie o índice
	CREATE INDEX IX_Gerente_IDGerente ON #Gerente (IDGerente);

	INSERT INTO #Gerente
	SELECT CAST(ID AS INT) AS IDGerente FROM dbo.ufnTextoTabelaInformarSeparador(@vchGerentesParticipantes, ',')

	/* FILTROS DA CAMPANHA */
	SELECT IDOperacao     INTO #Operacao     FROM ufnCampanhaComercialOperacao(@INintIDCampanhaComercial);
	SELECT IDOrigem       INTO #Origem       FROM ufnCampanhaComercialOrigem(@INintIDCampanhaComercial);
	SELECT IDFabricante   INTO #Fabricante   FROM ufnCampanhaComercialFabricante(@INintIDCampanhaComercial);
	SELECT IDProduto      INTO #Produto      FROM ufnCampanhaComercialProduto(@INintIDCampanhaComercial);
	SELECT IDLinhaProduto INTO #ProdutoLinha FROM ufnCampanhaComercialProdutoLinha(@INintIDCampanhaComercial);
	SELECT IDCondicao     INTO #Condicao     FROM ufnCampanhaComercialCondicao(@INintIDCampanhaComercial);
	SELECT IDCliente      INTO #Cliente      FROM ufnCampanhaComercialCliente(@INintIDCampanhaComercial);
	/* a função de split devolve ID como texto (MAX) -> converte para INT (mesma conversão implícita que o IN original fazia) */
	--SELECT DISTINCT TRY_CAST(ID AS INT) AS IDGerente
	--INTO #Gerente
	--FROM dbo.ufnTextoTabelaInformarSeparador(@vchGerentesParticipantes, ',')
	--WHERE TRY_CAST(ID AS INT) IS NOT NULL;

	CREATE CLUSTERED INDEX IX_Operacao     ON #Operacao(IDOperacao);
	CREATE CLUSTERED INDEX IX_Origem       ON #Origem(IDOrigem);
	CREATE CLUSTERED INDEX IX_Fabricante   ON #Fabricante(IDFabricante);
	CREATE CLUSTERED INDEX IX_Produto      ON #Produto(IDProduto);
	CREATE CLUSTERED INDEX IX_ProdutoLinha ON #ProdutoLinha(IDLinhaProduto);
	CREATE CLUSTERED INDEX IX_Condicao     ON #Condicao(IDCondicao);
	CREATE CLUSTERED INDEX IX_Cliente      ON #Cliente(IDCliente);
	CREATE CLUSTERED INDEX IX_Gerente      ON #Gerente(IDGerente);

	--==========================================================================================================
	/* TEMPORÁRIAS DE TRABALHO */
	CREATE TABLE #tmpResultado
	(
		IDPessoa INT,
		TipoPessoa CHAR(1),
		IDSupervisor INT,
		IDGerente INT,
		Resultado DECIMAL(18,2),
		Meta DECIMAL(18,2),
		Colocacao INT
	);

	CREATE TABLE #tmpDevolucaoVendasOL
	(
		IDPedido INT
	);

	CREATE TABLE #tmpExclusivoVendedorFabricante
	(
		IDPessoaCliente INT,
		IDPessoaVendedor INT,
		IDPessoaSupervisor INT,
		IDPessoaGerente INT,
		IDPessoaFabricante INT,
		IDProdutoLinha INT
	);

	--==========================================================================================================
	/* CLIENTE x FABRICANTE (x LINHA) EXCLUSIVO */
	INSERT INTO #tmpExclusivoVendedorFabricante
	(
		IDPessoaCliente,
		IDPessoaVendedor,
		IDPessoaSupervisor,
		IDPessoaGerente,
		IDPessoaFabricante,
		IDProdutoLinha
	)
	SELECT
		tblVenExc.IDPessoaCliente,
		tblVenExc.IDPessoaVendedor,
		tblSupFab.IDPessoaSupervisor,
		tblSupFab.IDPessoaGerente,
		tblVenExc.IDPessoaFabricante,
		tblVenExc.IDProdutoLinha
	FROM
		(
		SELECT DISTINCT
			tblCliVenFabEx.IDPessoaCliente,
			ISNULL(tblFabExcLin.IDPessoaVendedor, tblCliVenFabEx.IDPessoaVendedor) IDPessoaVendedor,
			tblFabExcLin.IDProdutoLinha,
			tblCliVenFabEx.IDPessoaFabricante
		FROM
			GS300ERP.dbo.tblClienteVendedorFabricanteExclusivo tblCliVenFabEx WITH(NOLOCK)
		LEFT JOIN
			GS300ERP.dbo.tblClienteVendedorFabricanteExclusivoLinha tblFabExcLin WITH(NOLOCK)
				ON  tblFabExcLin.IDPessoaCliente    = tblCliVenFabEx.IDPessoaCliente
				AND tblFabExcLin.IDPessoaFabricante = tblCliVenFabEx.IDPessoaFabricante
		WHERE
			tblCliVenFabEx.IDPessoaFabricante IN (SELECT IDFabricante FROM #Fabricante)
		) tblVenExc
	LEFT JOIN
		GS300ERP.dbo.tblVendedor tblVendFab WITH(NOLOCK) ON tblVendFab.IDPessoaVendedor = tblVenExc.IDPessoaVendedor
	LEFT JOIN
		GS300ERP.dbo.tblVendedorEquipe tblEquipeFab WITH(NOLOCK) ON tblEquipeFab.IDVendedorEquipe = tblVendFab.IDVendedorEquipe
	LEFT JOIN
		GS300ERP.dbo.tblSupervisor tblSupFab WITH(NOLOCK) ON tblSupFab.IDPessoaSupervisor = tblEquipeFab.IDPessoaSupervisor;

	CREATE CLUSTERED INDEX IX_tmpExcVendedorFab
		ON #tmpExclusivoVendedorFabricante (IDPessoaCliente, IDPessoaFabricante, IDProdutoLinha);

	--==========================================================================================================
	/* DEVOLUÇÕES OL - só são excluídas quando a campanha NÃO tem origem 3 (mesma regra do antigo VendasSemOL) */
	IF @ApoioOrigem = 0
	BEGIN
		INSERT INTO #tmpDevolucaoVendasOL (IDPedido)
		SELECT DISTINCT
			tblDev.IDDevolucaoVenda
		FROM
			GS300ERP.dbo.tblDevolucaoVenda tblDev WITH(NOLOCK)
		JOIN
			GS300ERP.dbo.tblDevolucaoVendaItem tblDevVenIte WITH(NOLOCK) ON tblDev.IDDevolucaoVenda = tblDevVenIte.IDDevolucaoVenda
		JOIN
			GS300ERP.dbo.tblDevolucaoVendaTitulo tblDevVenTit WITH(NOLOCK) ON tblDev.IDDevolucaoVenda = tblDevVenTit.IDDevolucaoVenda
		JOIN
			GS300ERP.dbo.tblOLArquivoPedidoItem tblArqIte WITH(NOLOCK) ON tblDevVenTit.IDTitulo = tblArqIte.IDTitulo AND tblDevVenIte.IDProduto = tblArqIte.IDProduto
		JOIN
			GS300ERP.dbo.tblTitulo tblTitOri WITH(NOLOCK) ON tblArqIte.IDTitulo = tblTitOri.IDTitulo
		JOIN
			GS300ERP.dbo.tblPedidoEletronico tblPedEle WITH(NOLOCK) ON tblArqIte.IDPedidoEletronico = tblPedEle.IDPedidoEletronico
		JOIN
			GS300ERP.dbo.uvwClienteOutrasInformacoes uvwCliOutInf ON uvwCliOutInf.IDCliente = tblDev.IDPessoaCliente
		WHERE
			tblDev.IDSituacao IN (6,7)        /* FATURADA/FINALIZADA */
			AND tblPedEle.IDOrigem IN (3,8)   /* OPERAÇÃO LOGÍSTICA */
			AND uvwCliOutInf.IDGerenteAtual IN (SELECT IDGerente FROM #Gerente); /* GERENTES FARMA */
	END;

	CREATE CLUSTERED INDEX IX_tmpDevolucaoOL ON #tmpDevolucaoVendasOL (IDPedido);

	--==========================================================================================================
	/* APURAÇÃO POR VALOR VENDIDO - BLOCO ÚNICO */
	IF @INintTipoValor = 1 -- mantido: para outros tipos de valor a procedure não apura nada (mesmo comportamento anterior)
	BEGIN

		/* PEDIDOS CONSIDERADOS: única leitura da base de vendas, com os mesmos filtros e o mesmo crédito de
		   vendedor/gerente de antes. O resultado abaixo soma esta temporária e ela é a que vai para
		   tblCampanhaComercialRetornoPedido no final. */
		SELECT
			tblConVen.IDPedido,
			tblConVen.IDProduto,
			tblConVen.IDOperacao,
			tblConVen.IDOrigem,
			tblConVen.IDPessoaCliente,
			tblConVen.IDPessoaFabricante,
			tblConVen.IDProdutoLinha,
			tblConVen.Quantidade,
			tblConVen.IDPessoaVendedor,
			tblConVen.IDPessoaGerente,
			Cred.IDVendedorCreditado,
			Cred.IDGerenteCreditado,
			CASE WHEN @BitVendedorVenda = 0 AND tmpExcVenFab.IDPessoaVendedor IS NOT NULL THEN 1 ELSE 0 END AS CreditadoPorExclusivo,
			tblConVen.DataFaturamento,
			COALESCE(tblConVen.Total, 0) AS Total
		INTO
			#tmpPedido
		FROM
			GS300BI.dbo.tblConsolidacaoVendas tblConVen WITH(NOLOCK)
		LEFT JOIN
			#tmpExclusivoVendedorFabricante tmpExcVenFab
				ON  tmpExcVenFab.IDPessoaCliente    = tblConVen.IDPessoaCliente
				AND tmpExcVenFab.IDPessoaFabricante = tblConVen.IDPessoaFabricante
				AND (tmpExcVenFab.IDProdutoLinha IS NULL OR tmpExcVenFab.IDProdutoLinha = tblConVen.IDProdutoLinha)
		CROSS APPLY
			(
			SELECT
				CASE WHEN @BitVendedorVenda = 1 THEN tblConVen.IDPessoaVendedor
					 ELSE ISNULL(tmpExcVenFab.IDPessoaVendedor, tblConVen.IDPessoaVendedor) END AS IDVendedorCreditado,
				CASE WHEN @BitVendedorVenda = 1 THEN tblConVen.IDPessoaGerente
					 WHEN @BitVendedorVenda = 0 THEN ISNULL(tmpExcVenFab.IDPessoaGerente, tblConVen.IDPessoaGerente) END AS IDGerenteCreditado
			) Cred
		WHERE
			tblConVen.DataFaturamento >= @INdateDataInicio
			AND tblConVen.DataFaturamento < DATEADD(DAY, 1, @INdateDataFim)
			AND tblConVen.IDCanalVenda = 1 /* FARMA */
			AND tblConVen.IDOperacao         IN (SELECT IDOperacao     FROM #Operacao)
			AND tblConVen.IDOrigem           IN (SELECT IDOrigem       FROM #Origem)
			AND tblConVen.IDPessoaFabricante IN (SELECT IDFabricante   FROM #Fabricante)
			AND tblConVen.IDProduto          IN (SELECT IDProduto      FROM #Produto)
			AND tblConVen.IDProdutoLinha     IN (SELECT IDLinhaProduto FROM #ProdutoLinha)
			AND tblConVen.IDCondicao         IN (SELECT IDCondicao     FROM #Condicao)
			AND tblConVen.IDPessoaCliente    IN (SELECT IDCliente      FROM #Cliente)
			AND Cred.IDGerenteCreditado      IN (SELECT IDGerente      FROM #Gerente) /* GERENTES PARTICIPANTES */
			AND NOT EXISTS (SELECT 1 FROM #tmpDevolucaoVendasOL tmpDev WHERE tmpDev.IDPedido = tblConVen.IDPedido); /* vazia quando tem OL */

		CREATE CLUSTERED INDEX IX_tmpPedido ON #tmpPedido (IDVendedorCreditado);

		INSERT INTO #tmpResultado
		(
			IDPessoa,
			TipoPessoa,
			IDSupervisor,
			IDGerente,
			Resultado
		)
		SELECT DISTINCT
			tblVenAtu.IDPessoa,
			CASE WHEN tblVenAtu.IDPessoa IN (SELECT IDPessoa FROM tblCampanhaComercialGrandesContas) THEN 4 /* GRANDES CONTAS */
				 WHEN tblVenAtu.IDPessoa = tblVenAtu.IDSupervisor AND tblVenAtu.IDSupervisor <> tblVenAtu.IDGerente THEN 2 /* SUPERVISOR */
				 WHEN tblVenAtu.IDPessoa = tblVenAtu.IDGerente THEN 1 /* GERENTE */
				 WHEN tblVenAtu.IDPessoa IN (SELECT tblBasDig.IDPessoaTelevendas FROM tblCampanhaTelevendasBaseDigitadoras tblBasDig WITH (NOLOCK)) THEN 6 /* TELEVENDAS */
				 WHEN tblVenAtu.IDPessoa = 155613 THEN 6 /* GAMBIARRA TELEVENDAS */
				 WHEN tblVenAtu.IDPessoa IN (SELECT IDPessoa FROM tblCampanhaComercialPessoaInterna) THEN 5 /* PESSOA INTERNA */
				 ELSE 3 END TipoPessoa, /* VENDEDOR */
			tblVenAtu.IDSupervisor,
			tblVenAtu.IDGerente,
			COALESCE(tblConVen.Total, 0) Resultado
		FROM
			tblCampanhaComercialVendedorAtual tblVenAtu WITH(NOLOCK)
		LEFT JOIN
			(
			SELECT
				tmpPed.IDVendedorCreditado AS IDVendedorAtual,
				SUM(tmpPed.Total) Total
			FROM
				#tmpPedido tmpPed
			GROUP BY
				tmpPed.IDVendedorCreditado
			) tblConVen ON tblConVen.IDVendedorAtual = tblVenAtu.IDPessoa;

	END;

	--==========================================================================================================
	-- AJUSTAR / REVISAR: bloco provisório do original — supervisor 4680 removido manualmente.
	--DELETE FROM #tmpResultado WHERE IDSupervisor = 4680
	--==========================================================================================================

	/* RESULTADO PESSOA INTERNA = SOMA DOS GERENTES (antes da agregação do gerente, como no original) */
	UPDATE #tmpResultado
		SET Resultado = (SELECT SUM(r.Resultado) FROM #tmpResultado r WHERE r.TipoPessoa = 1 /* GERENTE */),
			Colocacao = 0
	WHERE
		TipoPessoa IN (5); /* PESSOA INTERNA */

	--==========================================================================================================
	/* RESULTADO E COLOCAÇÃO DO SUPERVISOR (substitui CursorResultadoSupervisor) */
	;WITH SupAgg AS
	(
		SELECT
			tblResult.IDSupervisor,
			SUM(COALESCE(tblResult.Resultado, 0)) Resultado
		FROM
			#tmpResultado tblResult
		WHERE
			tblResult.TipoPessoa NOT IN (1,4,5) /* DESCONSIDERA GERENTE, GRANDES CONTAS E PESSOA INTERNA */
		GROUP BY
			tblResult.IDSupervisor
	),
	SupRank AS
	(
		SELECT
			tblResult.IDSupervisor,
			tblResult.Resultado,
			RANK() OVER (ORDER BY
				CASE WHEN @INintTipoRanking = 1 AND tblCamComMet.MetaValor <> 0 THEN
						(CASE WHEN tblResult.Resultado = 0 THEN 1 ELSE COALESCE(tblResult.Resultado,1) END) /
						(CASE WHEN tblCamComMet.MetaValor = 0 THEN 1 ELSE COALESCE(tblCamComMet.MetaValor,1) END) * 100
					 WHEN @INintTipoRanking = 2 THEN COALESCE(tblResult.Resultado,0) END DESC) Colocacao
		FROM
			SupAgg tblResult
		LEFT JOIN
			tblCampanhaComercialMeta tblCamComMet
				ON  tblCamComMet.IDPessoa = tblResult.IDSupervisor
				AND tblCamComMet.IDCampanhaComercial = @INintIDCampanhaComercial
	)
	UPDATE tmp
		SET Resultado = sr.Resultado,
			Colocacao = sr.Colocacao
	FROM
		#tmpResultado tmp
	JOIN
		SupRank sr ON sr.IDSupervisor = tmp.IDSupervisor
	WHERE
		tmp.TipoPessoa = 2; /* SUPERVISOR */

	--==========================================================================================================
	/* RESULTADO E COLOCAÇÃO DO GERENTE (substitui CursorResultadoGerente) */
	;WITH GerBase AS
	(
		SELECT
			tblResult.IDGerente,
			SUM(COALESCE(tblResult.Resultado, 0)) Resultado
		FROM
			#tmpResultado tblResult
		WHERE
			tblResult.TipoPessoa IN (2,4) /* SUPERVISOR, GRANDES CONTAS */
		GROUP BY
			tblResult.IDGerente

		UNION ALL

		SELECT
			tblResult.IDGerente,
			SUM(COALESCE(tblResult.Resultado, 0)) Resultado
		FROM
			#tmpResultado tblResult
		WHERE
			tblResult.TipoPessoa IN (6,3)          /* TELEVENDAS, VENDEDORES TELEVENDAS */
			AND tblResult.IDGerente = 607601       /* GERENTE TELEVENDAS */
		GROUP BY
			tblResult.IDGerente
	),
	GerCalc AS
	(
		SELECT
			tblResult.IDGerente,
			tblResult.Resultado,
			CASE WHEN @INintTipoRanking = 1 AND tblCamComMet.MetaValor <> 0 THEN
					(CASE WHEN tblResult.Resultado = 0 THEN 1 ELSE COALESCE(tblResult.Resultado,1) END) /
					(CASE WHEN tblCamComMet.MetaValor = 0 THEN 1 ELSE COALESCE(tblCamComMet.MetaValor,1) END) * 100
				 WHEN @INintTipoRanking = 2 THEN COALESCE(tblResult.Resultado,0) END Realizado
		FROM
			GerBase tblResult
		LEFT JOIN
			tblCampanhaComercialMeta tblCamComMet
				ON  tblCamComMet.IDPessoa = tblResult.IDGerente
				AND tblCamComMet.IDCampanhaComercial = @INintIDCampanhaComercial
	),
	GerRank AS
	(
		SELECT
			IDGerente,
			SUM(COALESCE(Resultado, 0)) Resultado,
			RANK() OVER (ORDER BY SUM(COALESCE(Realizado, 0)) DESC) Colocacao
		FROM
			GerCalc
		GROUP BY
			IDGerente
	)
	UPDATE tmp
		SET Resultado = gr.Resultado,
			Colocacao = gr.Colocacao
	FROM
		#tmpResultado tmp
	JOIN
		GerRank gr ON gr.IDGerente = tmp.IDPessoa
	WHERE
		tmp.TipoPessoa = 1; /* GERENTE */

	--==========================================================================================================
	/* COLOCAÇÃO DE VENDEDOR E GRANDES CONTAS
	   (substitui os 3 cursores: VendedorGrandesContas / Vendedor / GrandesContas)
	   Grupo = 0  -> @INintGrandesContasVendedor = 1: vendedor e grandes contas ranqueados juntos
	   Grupo = 3/4 -> ranking separado por tipo */
	;WITH RankBase AS
	(
		SELECT
			tblResult.IDPessoa,
			tblResult.IDSupervisor,
			CASE WHEN @INintGrandesContasVendedor = 1 THEN '0' ELSE tblResult.TipoPessoa END Grupo,
			CASE WHEN @INintTipoRanking = 1 AND tblCamComMet.MetaValor <> 0 THEN
					(CASE WHEN tblResult.Resultado = 0 THEN 1 ELSE COALESCE(tblResult.Resultado,1) END) /
					(CASE WHEN tblCamComMet.MetaValor = 0 THEN 1 ELSE COALESCE(tblCamComMet.MetaValor,1) END) * 100
				 WHEN @INintTipoRanking = 2 THEN COALESCE(tblResult.Resultado,0)
				 ELSE 0 END Realizado
		FROM
			#tmpResultado tblResult
		JOIN
			tblCampanhaComercialMeta tblCamComMet
				ON  tblCamComMet.IDPessoa = tblResult.IDPessoa
				AND tblCamComMet.IDCampanhaComercial = @INintIDCampanhaComercial
		WHERE
			tblResult.TipoPessoa IN (3,4)
			AND tblCamComMet.TipoPessoa IN (3,4)
			AND (@INintGrandesContasVendedor = 1 OR tblCamComMet.TipoPessoa = tblResult.TipoPessoa)
		GROUP BY
			tblResult.IDPessoa,
			tblResult.IDSupervisor,
			CASE WHEN @INintGrandesContasVendedor = 1 THEN '0' ELSE tblResult.TipoPessoa END,
			tblResult.Resultado,
			tblCamComMet.MetaValor
	),
	RankFinal AS
	(
		SELECT
			IDPessoa,
			Grupo,
			CASE WHEN @INintExtensaoRanking = 1 THEN RANK() OVER (PARTITION BY Grupo, IDSupervisor ORDER BY Realizado DESC)
				 WHEN @INintExtensaoRanking = 2 THEN RANK() OVER (PARTITION BY Grupo ORDER BY Realizado DESC) END Colocacao
		FROM
			RankBase
	)
	UPDATE tmp
		SET Colocacao = rf.Colocacao
	FROM
		#tmpResultado tmp
	JOIN
		RankFinal rf
			ON  rf.IDPessoa = tmp.IDPessoa
			AND (
					(rf.Grupo = '0' AND tmp.TipoPessoa IN (3,4))
				 OR (rf.Grupo <> '0' AND tmp.TipoPessoa = rf.Grupo)
				);

	--==========================================================================================================
	/* INSERE DADOS NA TABELA DE RETORNO (inalterado) */
	INSERT INTO tblCampanhaComercialRetorno
	(
		IDCampanhaComercial,
		DataInicio,
		DataFim,
		IDPessoa,
		TipoPessoa,
		IDSupervisor,
		IDGerente,
		ValorApurado,
		Colocacao
	)
	SELECT
		@INintIDCampanhaComercial,
		@INdateDataInicio,
		@INdateDataFim,
		tblResult.IDPessoa,
		tblResult.TipoPessoa,
		tblResult.IDSupervisor,
		tblResult.IDGerente,
		tblResult.Resultado,
		tblResult.Colocacao
	FROM
		#tmpResultado tblResult;

	--==========================================================================================================
	/* GRAVA OS PEDIDOS CONSIDERADOS (separados por campanha).
	   Apaga os pedidos anteriores da campanha SEMPRE (inclusive quando @INintTipoValor <> 1 e nada é apurado, para
	   não sobrar pedido de um cálculo antigo) e grava os de #tmpPedido na mesma transação. Se o chamador já tem
	   uma transação aberta, usa a dele. */
	DECLARE @bitTransacaoPropria BIT = CASE WHEN @@TRANCOUNT = 0 THEN 1 ELSE 0 END;

	BEGIN TRY

		IF @bitTransacaoPropria = 1 BEGIN TRANSACTION;

		DELETE FROM tblCampanhaComercialRetornoPedido
		WHERE IDCampanhaComercial = @INintIDCampanhaComercial;

		IF @INintTipoValor = 1
		BEGIN
			INSERT INTO tblCampanhaComercialRetornoPedido
			(
				IDCampanhaComercial,
				IDPedido,
				IDProduto,
				IDOperacao,
				IDOrigem,
				IDPessoaCliente,
				IDPessoaFabricante,
				IDProdutoLinha,
				Quantidade,
				IDPessoaVendedor,
				IDPessoaGerente,
				IDPessoaVendedorCreditado,
				IDPessoaGerenteCreditado,
				CreditadoPorExclusivo,
				ConsideradoNoApurado,
				DataFaturamento,
				ValorCampanha
			)
			SELECT
				@INintIDCampanhaComercial,
				tmpPed.IDPedido,
				tmpPed.IDProduto,
				tmpPed.IDOperacao,
				tmpPed.IDOrigem,
				tmpPed.IDPessoaCliente,
				tmpPed.IDPessoaFabricante,
				tmpPed.IDProdutoLinha,
				tmpPed.Quantidade,
				tmpPed.IDPessoaVendedor,
				tmpPed.IDPessoaGerente,
				tmpPed.IDVendedorCreditado,
				tmpPed.IDGerenteCreditado,
				tmpPed.CreditadoPorExclusivo,
				/* contou no resultado de alguém: o vendedor creditado está na base de vendedores atuais */
				CASE WHEN EXISTS (SELECT 1 FROM tblCampanhaComercialVendedorAtual tblVenAtu WITH(NOLOCK) WHERE tblVenAtu.IDPessoa = tmpPed.IDVendedorCreditado) THEN 1 ELSE 0 END,
				tmpPed.DataFaturamento,
				tmpPed.Total
			FROM
				#tmpPedido tmpPed;
		END;

		IF @bitTransacaoPropria = 1 COMMIT TRANSACTION;

	END TRY
	BEGIN CATCH

		IF @bitTransacaoPropria = 1 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

		THROW;

	END CATCH;

	/* #tmpPedido só existe quando @INintTipoValor = 1; por isso não entra na lista da procedure de limpeza */
	DROP TABLE IF EXISTS #tmpPedido;

	EXEC dbo.uspDbaLimparTabelaTemporaria '#tmpResultado,#tmpExclusivoVendedorFabricante,#tmpDevolucaoVendasOL';

END
GO

/* ==========================================================================================================
   3. CONFERÊNCIA (rodar depois de calcular uma campanha de vendas; trocar o ID)

   Para vendedor (3), grandes contas (4) e televendas (6) o valor apurado é exatamente a soma dos pedidos
   considerados. Supervisor, gerente e pessoa interna são agregações deles, por isso ficam fora desta conferência.
   O resultado esperado é ZERO linhas (nenhuma diferença).

   DECLARE @IDCampanha INT = 713;

   SELECT
       ret.IDPessoa,
       ret.TipoPessoa,
       ret.ValorApurado,
       ISNULL(ped.Total, 0) AS SomaPedidos,
       ret.ValorApurado - ISNULL(ped.Total, 0) AS Diferenca
   FROM
       tblCampanhaComercialRetorno ret
   LEFT JOIN
       (
       SELECT IDPessoaVendedorCreditado AS IDPessoa, SUM(ValorCampanha) AS Total
       FROM tblCampanhaComercialRetornoPedido
       WHERE IDCampanhaComercial = @IDCampanha AND ConsideradoNoApurado = 1
       GROUP BY IDPessoaVendedorCreditado
       ) ped ON ped.IDPessoa = ret.IDPessoa
   WHERE
       ret.IDCampanhaComercial = @IDCampanha
       AND ret.TipoPessoa IN (3,4,6)
       AND ISNULL(ret.ValorApurado, 0) <> ISNULL(ped.Total, 0);

   -- Resumo dos pedidos da campanha:
   SELECT
       COUNT(*) AS Linhas,
       COUNT(DISTINCT IDPedido) AS Pedidos,
       SUM(ValorCampanha) AS Total,
       SUM(CASE WHEN ConsideradoNoApurado = 1 THEN ValorCampanha ELSE 0 END) AS TotalConsiderado,
       SUM(CASE WHEN ConsideradoNoApurado = 0 THEN ValorCampanha ELSE 0 END) AS TotalForaDoApurado
   FROM tblCampanhaComercialRetornoPedido
   WHERE IDCampanhaComercial = @IDCampanha;
   ========================================================================================================== */
