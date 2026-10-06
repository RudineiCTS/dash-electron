import dayjs from "dayjs";
import { CampaignRegistration } from "../interfaces/CampaignRegistration";
import { LeituraAnexoPlanilha, TipoAnexo, valoresPorExtenso } from "./anexoPlanilha";
import { formatCurrency } from "./formateCurrency";

/** Acima disso a lista não é embutida no prompt: o usuário anexa o arquivo na conversa. */
export const LIMITE_VALORES_NO_PROMPT = 2000;
const VALORES_POR_LINHA = 10;

export interface AnexoParaPrompt {
  tipo: TipoAnexo;
  /** A conferência tem esse anexo? */
  existe: boolean;
  nomeArquivo: string | null;
  /** null quando o anexo existe mas não foi possível baixar/ler. */
  leitura: LeituraAnexoPlanilha | null;
  erro?: string;
}

export interface PromptGerado {
  prompt: string;
  /** Uma linha por anexo, para o modal mostrar o que entrou. */
  resumo: string[];
  /** Avisos da leitura dos anexos e falhas. */
  avisos: string[];
}

const ROTULO: Record<TipoAnexo, string> = { products: "Produtos", clients: "Clientes" };

function data(valor: string | null): string {
  if (!valor) return "-";
  const d = dayjs(valor);
  return d.isValid() ? d.format("DD/MM/YYYY") : "-";
}

function moeda(valor: number | null): string {
  if (valor === null || valor === undefined) return "-";
  return `${formatCurrency(valor).replace(/ /g, " ")} (valor numérico: ${valor.toFixed(2)})`;
}

function texto(valor: string | null): string {
  const limpo = valor?.replace(/\r/g, "").trim();
  return limpo ? limpo : "-";
}

/** Premiações chegam como texto, uma posição por linha; mantém uma por linha, indentada. */
function bloco(rotulo: string, valor: string | null): string {
  const t = texto(valor);
  if (!t.includes("\n")) return `- ${rotulo}: ${t}`;
  const linhas = t.split("\n").map((l) => `  ${l.trim()}`).filter((l) => l.trim());
  return `- ${rotulo}:\n${linhas.join("\n")}`;
}

function descreverTipo(tipo: TipoAnexo, leitura: LeituraAnexoPlanilha): string {
  switch (leitura.tipoValor) {
    case "ID":
      return tipo === "products" ? "IDProduto (ID interno)" : "IDCliente (ID interno)";
    case "EAN":
      return "código de barras (EAN), não IDProduto";
    case "CPF/CNPJ":
      return "CPF/CNPJ, não IDCliente";
    default:
      return "não identificado";
  }
}

function instrucaoDeConversao(tipo: TipoAnexo, leitura: LeituraAnexoPlanilha): string {
  switch (leitura.tipoValor) {
    case "EAN":
      return "Converta para IDProduto com INSERT ... SELECT em GS300ERP.dbo.vwProduto (CodBarras -> IDProduto), em blocos de até 1000 valores.";
    case "CPF/CNPJ":
      return "Converta para IDCliente com INSERT ... SELECT em GS300ERP.dbo.uvwPessoaFisicaJuridica (CpfCnpj -> IDPessoa), em blocos de até 1000 valores.";
    case "ID":
      return "São IDs internos: use direto no INSERT, em blocos de até 1000 linhas por INSERT.";
    default:
      return "Não consegui identificar o tipo dos valores: confirme comigo antes de usar.";
  }
}

function listarValores(valores: string[]): string {
  const linhas: string[] = [];
  for (let i = 0; i < valores.length; i += VALORES_POR_LINHA) {
    linhas.push(valores.slice(i, i + VALORES_POR_LINHA).join(", "));
  }
  return linhas.join(",\n");
}

function secaoAnexo(anexo: AnexoParaPrompt): { texto: string; resumo: string; avisos: string[] } {
  const rotulo = ROTULO[anexo.tipo];
  const nome = anexo.nomeArquivo ? `"${anexo.nomeArquivo}"` : "(sem nome)";

  if (!anexo.existe) {
    return { texto: `### ${rotulo}\nSem anexo de ${rotulo.toLowerCase()} nesta campanha.`, resumo: `${rotulo}: sem anexo`, avisos: [] };
  }

  const leitura = anexo.leitura;
  if (!leitura || leitura.valores.length === 0) {
    const motivo = anexo.erro ?? "não encontrei valores numéricos na planilha";
    return {
      texto:
        `### ${rotulo}\nA campanha tem o arquivo ${nome}, mas não consegui lê-lo automaticamente (${motivo}). ` +
        `Vou anexá-lo nesta conversa: leia a coluna com os ${anexo.tipo === "products" ? "produtos" : "clientes"} e me diga qual usou.`,
      resumo: `${rotulo}: arquivo não lido (anexe manualmente)`,
      avisos: [`${rotulo}: ${motivo}.`, ...(leitura?.avisos.map((a) => `${rotulo}: ${a}`) ?? [])],
    };
  }

  const cabecalho = leitura.cabecalho ? ` ("${leitura.cabecalho}")` : "";
  const cabecaDoBloco =
    `### ${rotulo}\nArquivo: ${nome}${leitura.aba ? `, aba "${leitura.aba}"` : ""}\n` +
    `Coluna lida: ${leitura.coluna}${cabecalho} · ${valoresPorExtenso(leitura.valores.length)} ${leitura.valores.length === 1 ? "distinto" : "distintos"} · tipo: ${descreverTipo(anexo.tipo, leitura)}\n` +
    `${instrucaoDeConversao(anexo.tipo, leitura)}` +
    (leitura.ambiguo ? "\nAtenção: mais de uma coluna parece conter IDs; confirme comigo qual usar antes de gerar." : "");

  const resumoBase = `${rotulo}: ${valoresPorExtenso(leitura.valores.length)}, coluna ${leitura.coluna}${cabecalho}, tipo: ${descreverTipo(anexo.tipo, leitura)}`;
  const avisos = leitura.avisos.map((a) => `${rotulo}: ${a}`);

  if (leitura.valores.length > LIMITE_VALORES_NO_PROMPT) {
    return {
      texto:
        `${cabecaDoBloco}\nA lista tem mais valores do que cabe neste prompt, então não a incluí. ` +
        `Vou anexar o arquivo ${nome} nesta conversa: use a coluna ${leitura.coluna}${cabecalho}.`,
      resumo: `${resumoBase} — lista grande, anexe o arquivo na conversa`,
      avisos,
    };
  }

  return { texto: `${cabecaDoBloco}\nValores:\n${listarValores(leitura.valores)}`, resumo: resumoBase, avisos };
}

const INSTRUCOES = `## Como proceder
1. Siga o fluxo da skill: antes de gerar, mostre o resumo dos parâmetros e peça minha confirmação. Gere só texto SQL; não execute nada.
2. Pergunte o que a campanha recebida não responde: tipo de apuração, tipo de cálculo, tipo de valor (valor de venda ou receita líquida), ConsideraExclusivas e RegraValidacao.
3. Se o tipo de apuração for "Venda, Positivação", o padrão das campanhas já cadastradas é criar duas campanhas: a de Vendas (ranking da premiação de volume, com a meta) e a "<nome> Positivação" (ranking da premiação de positivação). Proponha isso e confirme comigo. Para o texto "Produto vendido" não há equivalente fixo: pergunte.
4. Premiações vêm como texto, uma posição por linha: @intTotalRanking = quantidade de posições, vírgula decimal vira ponto, posições não usadas ficam 0.00. Premiação auxiliar e de supervisora vão na campanha de Vendas (na de Positivação ficam 0.00).
5. Confirme comigo o destino do "Gatilho de CNPJ" (costuma ser a meta de CNPJs da campanha de Positivação) e do "Gatilho de valor" (@decGatilhoVenda?). Não assuma.
6. Nome da campanha: proponha o nome curto usado nas já cadastradas (ex.: "Campanha Televendas Apsen Out'26" vira "Apsen"; a de positivação leva " Positivação").
7. Competência (@datDataCompetencia): último dia do mês do fim da apuração; se o período atravessar meses, pergunte.
8. Fabricante: o número antes do " - " vira IDFabricante no INSERT de fabricante; se houver mais de um, confirme a lista.
9. Grandes Contas: as observações costumam citar "Painel Sem Grandes Contas" ou "Painel Grandes Contas". A procedure não tem parâmetro para isso: se eu confirmar que a campanha considera Grandes Contas, acrescente depois do EXECUTE: UPDATE tblCampanhaTelevendas SET ConsideraGrandesContas = 1 WHERE IDCampanhaTelevendas = @intIDCampanhaTelevendas
10. Anexos: use os valores acima. Gere cada INSERT em blocos de até 1000 valores e não repita as listas no texto da resposta, só dentro do script.`;

export function gerarPromptCampanha(campaign: CampaignRegistration, anexos: AnexoParaPrompt[]): PromptGerado {
  const secoes = anexos.map(secaoAnexo);

  const dados = [
    `- Descrição: ${texto(campaign.campaignDescription)}`,
    `- Período de apuração: ${data(campaign.startDate)} a ${data(campaign.endDate)}`,
    `- Meta: ${moeda(campaign.goalValue)}`,
    `- Tipo de apuração: ${texto(campaign.assessmentType)}`,
    `- Tipo de pagamento: ${texto(campaign.paymentType)}`,
    `- Gatilho de valor: ${texto(campaign.valueTrigger)}`,
    `- Gatilho de CNPJ: ${texto(campaign.cnpjTrigger)}`,
    `- Fabricantes: ${texto(campaign.manufacturers)}`,
    bloco("Premiação de positivação", campaign.positivationAward),
    bloco("Premiação de volume", campaign.volumeAward),
    `- Premiação auxiliar de supervisora: ${moeda(campaign.supervisorAssistantAward)}`,
    `- Premiação de supervisora: ${moeda(campaign.supervisorAward)}`,
    bloco("Observação de cadastro", campaign.registrationNotes),
    bloco("Observação", campaign.notes),
    `- Situação: ${texto(campaign.status)}`,
  ];

  if (campaign.idCampaign) {
    dados.push(`- Já existe campanha vinculada (ID ${campaign.idCampaign}): confirme comigo antes de cadastrar de novo.`);
  }

  const prompt = [
    `Use a skill "insercao-campanha-televendas" para montar o script SQL de cadastro (uspUsuCampanhaTelevendasInclusao) da campanha de televendas que recebi, conforme os dados e os anexos abaixo.`,
    `## Campanha recebida (conferência #${campaign.idConference})\n${dados.join("\n")}`,
    `## Anexos\n${secoes.map((s) => s.texto).join("\n\n")}`,
    INSTRUCOES,
  ].join("\n\n");

  return {
    prompt,
    resumo: secoes.map((s) => s.resumo),
    avisos: secoes.flatMap((s) => s.avisos),
  };
}
