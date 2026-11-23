import * as XLSX from 'xlsx'

export interface ColunaExcel<T> {
  titulo: string
  /** Largura aproximada, em caracteres. */
  largura?: number
  /** `moeda` grava número com duas casas (o Excel mostra como valor); `numero` grava inteiro. */
  tipo?: 'texto' | 'moeda' | 'numero'
  valor: (linha: T) => string | number | null | undefined
}

/**
 * Gera e baixa um arquivo .xlsx com uma aba: linha de títulos, as linhas e, se pedido, uma linha de total
 * (soma das colunas `moeda` e `numero`). Os números são gravados como número, para somar e filtrar no Excel.
 */
export function exportarExcel<T>(opcoes: {
  arquivo: string
  aba: string
  colunas: ColunaExcel<T>[]
  linhas: T[]
  totalizar?: boolean
}) {
  const { arquivo, aba, colunas, linhas, totalizar } = opcoes
  const dados: (string | number | null)[][] = [colunas.map((c) => c.titulo)]

  for (const linha of linhas) {
    dados.push(
      colunas.map((c) => {
        const v = c.valor(linha)
        return v === undefined ? null : v
      }),
    )
  }

  if (totalizar && linhas.length > 0) {
    dados.push(
      colunas.map((c, i) => {
        if (i === 0) return 'Total'
        if (c.tipo !== 'moeda' && c.tipo !== 'numero') return null
        return linhas.reduce((s, l) => s + (Number(c.valor(l)) || 0), 0)
      }),
    )
  }

  const planilha = XLSX.utils.aoa_to_sheet(dados)
  planilha['!cols'] = colunas.map((c) => ({ wch: c.largura ?? 16 }))

  // formato das células numéricas
  for (let r = 1; r < dados.length; r++) {
    colunas.forEach((c, i) => {
      const ref = XLSX.utils.encode_cell({ r, c: i })
      const celula = planilha[ref]
      if (!celula || typeof celula.v !== 'number') return
      celula.z = c.tipo === 'moeda' ? '#,##0.00' : '0'
    })
  }

  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, aba.slice(0, 31))
  XLSX.writeFile(livro, arquivo.endsWith('.xlsx') ? arquivo : `${arquivo}.xlsx`)
}
