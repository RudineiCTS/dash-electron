import { ID_VENDEDOR_TOTALIZADOR } from "../components/ContentGeneral/SharedGeneral/PreviewTableImportacao";

/** Linha de importação (mesmos campos de LinhaPreview, sem depender do componente). */
export interface LinhaMeta {
  idVendedor: number;
  cobertura: number;
  metaSetor: number;
  metaLojaVirtual: number;
}

export interface ValoresSupervisao {
  metaLojaVirtual: number;
  metaSetor: number;
  cobertura: number;
}

export interface OpcoesScriptNovaMeta {
  /** Acrescenta as linhas @intIDAssistenteSupervisor e @intIDSupervisor ao final. */
  incluirSupervisao: boolean;
  valoresSupervisao: ValoresSupervisao;
}

/**
 * Valores sugeridos para as linhas de supervisão: se a colagem trouxe a linha do total do
 * supervisor (ID_VENDEDOR_TOTALIZADOR) usa os valores dela; senão, a soma do lote.
 * A cobertura segue o padrão dos scripts já usados (soma das coberturas, não a média).
 */
export function valoresSupervisaoSugeridos(linhas: LinhaMeta[]): ValoresSupervisao {
  const totalizador = linhas.find((l) => l.idVendedor === ID_VENDEDOR_TOTALIZADOR);
  if (totalizador) {
    return {
      metaLojaVirtual: totalizador.metaLojaVirtual,
      metaSetor: totalizador.metaSetor,
      cobertura: totalizador.cobertura,
    };
  }

  const vendedores = linhas.filter((l) => l.idVendedor !== ID_VENDEDOR_TOTALIZADOR);
  return {
    metaLojaVirtual: vendedores.reduce((acc, l) => acc + l.metaLojaVirtual, 0),
    metaSetor: vendedores.reduce((acc, l) => acc + l.metaSetor, 0),
    cobertura: vendedores.reduce((acc, l) => acc + l.cobertura, 0),
  };
}

/** Número para o SQL: ponto decimal, sem separador de milhar, arredondado em 2 casas (como a tela mostra). */
function numeroSql(valor: number): string {
  if (!Number.isFinite(valor)) return "0";
  return String(Math.round(valor * 100) / 100);
}

function linhaSelect(id: string, lojaVirtual: number, setor: number, cobertura: number): string {
  return `SELECT ${id} IDTeleVendas, ${numeroSql(lojaVirtual)} LojaVirtual, ${numeroSql(setor)} Setor, ${numeroSql(cobertura)} Cobertura`;
}

/**
 * Gera o INSERT em #tmpNovaMeta, um SELECT por vendedor ligados por UNION.
 * A linha do total do supervisor (ID_VENDEDOR_TOTALIZADOR) não vira vendedor: os valores dela
 * alimentam as linhas de supervisão.
 */
export function gerarScriptNovaMeta(linhas: LinhaMeta[], opcoes: OpcoesScriptNovaMeta): string {
  const vendedores = linhas.filter((l) => l.idVendedor !== ID_VENDEDOR_TOTALIZADOR);
  const { incluirSupervisao, valoresSupervisao: sup } = opcoes;

  const selects: { sql: string; comentario?: string }[] = vendedores.map((l) => ({
    sql: linhaSelect(String(l.idVendedor), l.metaLojaVirtual, l.metaSetor, l.cobertura),
  }));

  if (incluirSupervisao) {
    selects.push({
      sql: `\t${linhaSelect("@intIDAssistenteSupervisor", sup.metaLojaVirtual, sup.metaSetor, sup.cobertura)}`,
      comentario: "/* Auxiliar Supervisora */",
    });
    selects.push({
      sql: `\t${linhaSelect("@intIDSupervisor", sup.metaLojaVirtual, sup.metaSetor, sup.cobertura)}`,
      comentario: "/* Supervisora */",
    });
  }

  // todas as linhas, menos a última, terminam em UNION (o comentário vem depois)
  const corpo = selects
    .map(({ sql, comentario }, i) => {
      const uniao = i < selects.length - 1 ? " UNION" : "";
      return `${sql}${uniao}${comentario ? ` ${comentario}` : ""}`;
    })
    .join("\n");

  return [
    "INSERT INTO #tmpNovaMeta",
    "(",
    "\tIDVendedor,",
    "\tMetaLojaVirtual,",
    "\tMetaSetor,",
    "\tMetaCoberturaCarteira",
    ")",
    "",
    corpo,
  ].join("\n");
}
