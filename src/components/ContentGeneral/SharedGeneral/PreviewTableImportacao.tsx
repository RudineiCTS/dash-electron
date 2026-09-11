import { useMemo, useState } from "react";

export interface LinhaPreview {
  idVendedor: number;
  nome: string;
  cobertura: number;
  metaSetor: number;
  metaLojaVirtual: number;
}

interface PreviewImportacaoProps {
  linhas: LinhaPreview[];
  onAlterarCelula: (
    idVendedor: number,
    campo: "cobertura" | "metaSetor" | "metaLojaVirtual",
    valor: number
  ) => void;
  onDescartarImportacao: () => void;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarNumero(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function parseNumeroBr(valor: string): number {
  const limpo = valor.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(limpo);
  return isNaN(numero) ? 0 : numero;
}

interface CelulaEditavelProps {
  valor: number;
  casas?: number;
  onCommit: (valor: number) => void;
}

function CelulaEditavel({ valor, casas = 2, onCommit }: CelulaEditavelProps) {
  const [texto, setTexto] = useState(formatarNumero(valor, casas));

  return (
    <input
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => onCommit(parseNumeroBr(texto))}
      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-right text-sm font-medium text-gray-700 focus:border-indigo-400 focus:outline-none"
    />
  );
}

export function PreviewImportacao({
  linhas,
  onAlterarCelula,
  onDescartarImportacao,
}: PreviewImportacaoProps) {
  const totais = useMemo(() => {
    const qtd = linhas.length || 1;
    const somaCobertura = linhas.reduce((acc, l) => acc + l.cobertura, 0);
    const somaSetor = linhas.reduce((acc, l) => acc + l.metaSetor, 0);
    const somaLojaVirtual = linhas.reduce((acc, l) => acc + l.metaLojaVirtual, 0);

    return {
      coberturaMedia: somaCobertura / qtd,
      somaSetor,
      somaLojaVirtual,
      total: somaSetor + somaLojaVirtual,
    };
  }, [linhas]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-indigo-950">
            Pré-visualização — {linhas.length} linhas
          </span>
          <span className="text-sm text-gray-400">
            células editáveis · alterações refletem no total
          </span>
        </div>

        <button
          onClick={onDescartarImportacao}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Descartar importação
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto px-6 pb-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-950 text-xs font-bold uppercase tracking-wide text-white">
              <th className="rounded-l-lg px-4 py-3 text-left">ID Vendedor</th>
              <th className="px-3 py-3 text-left">Nome</th>
              <th className="px-3 py-3 text-right">Cobertura Carteira (%)</th>
              <th className="px-3 py-3 text-right">Meta Setor (R$)</th>
              <th className="px-3 py-3 text-right">Meta Loja Virtual (R$)</th>
              <th className="rounded-r-lg px-3 py-3 text-right">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => {
              const total = linha.metaSetor + linha.metaLojaVirtual;

              return (
                <tr
                  key={linha.idVendedor}
                  className="border-b border-gray-100 last:border-none"
                >
                  <td className="px-4 py-2.5 font-medium text-gray-400">
                    {linha.idVendedor}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-gray-800">
                    {linha.nome}
                  </td>
                  <td className="px-3 py-2.5">
                    <CelulaEditavel
                      valor={linha.cobertura}
                      onCommit={(v) =>
                        onAlterarCelula(linha.idVendedor, "cobertura", v)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <CelulaEditavel
                      valor={linha.metaSetor}
                      onCommit={(v) =>
                        onAlterarCelula(linha.idVendedor, "metaSetor", v)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <CelulaEditavel
                      valor={linha.metaLojaVirtual}
                      onCommit={(v) =>
                        onAlterarCelula(linha.idVendedor, "metaLojaVirtual", v)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-800">
                    {formatarMoeda(total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 text-sm">
              <td
                colSpan={2}
                className="rounded-l-lg px-4 py-3 font-bold text-indigo-950"
              >
                Total do lote → meta do supervisor
              </td>
              <td className="px-3 py-3 text-right font-bold text-gray-700">
                {formatarNumero(totais.coberturaMedia)}% méd.
              </td>
              <td className="px-3 py-3 text-right font-bold text-gray-700">
                {formatarMoeda(totais.somaSetor)}
              </td>
              <td className="px-3 py-3 text-right font-bold text-gray-700">
                {formatarMoeda(totais.somaLojaVirtual)}
              </td>
              <td className="rounded-r-lg px-3 py-3 text-right font-bold text-orange-500">
                {formatarMoeda(totais.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}