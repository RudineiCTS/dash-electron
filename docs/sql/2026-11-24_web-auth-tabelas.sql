/* ==========================================================================================================
   LOGIN DO APP WEB - TABELAS DE CREDENCIAL, CÓDIGO DE E-MAIL E LOG DE ACESSO

   Rodar no servidor do banco GestaoProcessos (o mesmo de tblSegUsuario, usado por DefaultConnectionTotvs).
   Não altera nenhuma tabela existente. Script idempotente: pode ser executado mais de uma vez.

   - tblWebCredencial : uma linha por usuário que já definiu senha (IDUsuario = tblSegUsuario.IDUsuario).
                        Guarda só o HASH da senha (PBKDF2), a data da última confirmação por e-mail, as falhas de
                        senha seguidas e o bloqueio temporário.
   - tblWebCodigoEmail: códigos de 6 dígitos enviados por e-mail (primeiro acesso/redefinição de senha e
                        confirmação do 1º acesso do dia). Guarda só o HASH do código, validade e tentativas.
   - tblWebAcessoLog  : auditoria dos eventos de login (sucesso, falha, bloqueio, código enviado...).

   Não há FOREIGN KEY para tblSegUsuario de propósito: a tabela é compartilhada com outros sistemas (IDSistema)
   e a API valida o usuário (ativo, sistema Compass) a cada login.

   Este script NÃO foi executado em nenhum banco.
   ========================================================================================================== */

USE [GestaoProcessos]
GO

IF OBJECT_ID('dbo.tblWebCredencial', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblWebCredencial
	(
		IDUsuario            INT          NOT NULL CONSTRAINT PK_tblWebCredencial PRIMARY KEY,
		SenhaHash            VARCHAR(300) NULL,
		SenhaDefinidaEm      DATETIME2    NULL,
		/* dia (no fuso da API) em que o usuário confirmou o código do e-mail pela última vez */
		UltimaConfirmacaoDia DATE         NULL,
		FalhasConsecutivas   INT          NOT NULL CONSTRAINT DF_tblWebCredencial_Falhas DEFAULT (0),
		BloqueadoAte         DATETIME2    NULL,
		UltimoAcessoEm       DATETIME2    NULL
	);
END
GO

IF OBJECT_ID('dbo.tblWebCodigoEmail', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblWebCodigoEmail
	(
		IDCodigo   BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_tblWebCodigoEmail PRIMARY KEY,
		IDUsuario  INT          NOT NULL,
		/* 'LOGIN' = confirmação do dia | 'SENHA' = primeiro acesso / redefinição de senha */
		Finalidade VARCHAR(10)  NOT NULL,
		CodigoHash VARBINARY(32) NOT NULL,
		CriadoEm   DATETIME2    NOT NULL,
		ExpiraEm   DATETIME2    NOT NULL,
		Tentativas INT          NOT NULL CONSTRAINT DF_tblWebCodigoEmail_Tent DEFAULT (0),
		UsadoEm    DATETIME2    NULL
	);

	CREATE INDEX IX_tblWebCodigoEmail_Usuario
		ON dbo.tblWebCodigoEmail (IDUsuario, Finalidade, UsadoEm)
		INCLUDE (ExpiraEm, CriadoEm);
END
GO

IF OBJECT_ID('dbo.tblWebAcessoLog', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblWebAcessoLog
	(
		IDLog         BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_tblWebAcessoLog PRIMARY KEY,
		IDUsuario     INT          NULL,
		/* o que a pessoa digitou (usuário ou e-mail); serve para investigar tentativas em usuário inexistente */
		Identificador VARCHAR(200) NULL,
		Evento        VARCHAR(30)  NOT NULL,
		Ip            VARCHAR(45)  NULL,
		DataHora      DATETIME2    NOT NULL CONSTRAINT DF_tblWebAcessoLog_Data DEFAULT (SYSUTCDATETIME()),
		Detalhe       VARCHAR(300) NULL
	);

	CREATE INDEX IX_tblWebAcessoLog_Data ON dbo.tblWebAcessoLog (DataHora DESC) INCLUDE (IDUsuario, Evento, Ip);
END
GO
