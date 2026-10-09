import { useMemo, useState } from "react";
import { FiCheck, FiCopy, FiX } from "react-icons/fi";
import {
  gerarScriptNovaMeta,
  LinhaMeta,
  valoresSupervisaoSugeridos,
} from "../../../utils/gerarScriptNovaMeta";

interface ModalScriptNovaMetaProps {
  linhas: LinhaMeta[];
  onClose: () => void;
}

function formatarCampo(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Aceita "5.140.000,00" (pt-BR) e também "5140000.50" (ponto com até 2 casas = decimal). */
function paraNumero(valor: string): number {
  const texto = valor.trim();
  const ehPontoDecimal = !texto.includes(",") && /^-?\d+\.\d{1,2}$/.test(texto);
  const normalizado = ehPontoDecimal ? texto : texto.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);
  return isNaN(numero) ? 0 : numero;
}

function CampoNumero({
  rotulo,
  valor,
  onChange,
  desabilitado,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  desabilitado: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
      {rotulo}
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        disabled={desabilitado}
        inputMode="decimal"
        className="w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-right text-sm font-medium text-gray-700 focus:border-indigo-400 focus:outline-none disabled:opacity-50"
      />
    </label>
  );
}

export function ModalScriptNovaMeta({ linhas, onClose }: ModalScriptNovaMetaProps) {
  const sugeridos = useMemo(() => valoresSupervisaoSugeridos(linhas), [linhas]);

  const [incluirSupervisao, setIncluirSupervisao] = useState(true);
  const [lojaVirtual, setLojaVirtual] = useState(formatarCampo(sugeridos.metaLojaVirtual));
  const [setor, setSetor] = useState(formatarCampo(sugeridos.metaSetor));
  const [cobertura, setCobertura] = useState(formatarCampo(sugeridos.cobertura));
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState("");

  const script = useMemo(
    () =>
      gerarScriptNovaMeta(linhas, {
        incluirSupervisao,
        valoresSupervisao: {
          metaLojaVirtual: paraNumero(lojaVirtual),
          metaSetor: paraNumero(setor),
          cobertura: paraNumero(cobertura),
        },
      }),
    [linhas, incluirSupervisao, lojaVirtual, setor, cobertura]
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(script);
      setErroCopia("");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErroCopia("Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-4 rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold text-indigo-950">Script de metas (#tmpNovaMeta)</h2>
            <span className="text-xs text-gray-500">
              {linhas.filter((l) => l.idVendedor !== 112321).length} vendedores
              {incluirSupervisao ? " + Auxiliar Supervisora e Supervisora" : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={incluirSupervisao}
              onChange={(e) => setIncluirSupervisao(e.target.checked)}
            />
            Incluir linhas de supervisão
          </label>
          <CampoNumero rotulo="Meta Loja Virtual" valor={lojaVirtual} onChange={setLojaVirtual} desabilitado={!incluirSupervisao} />
          <CampoNumero rotulo="Meta Setor" valor={setor} onChange={setSetor} desabilitado={!incluirSupervisao} />
          <CampoNumero rotulo="Cobertura" valor={cobertura} onChange={setCobertura} desabilitado={!incluirSupervisao} />
          <span className="basis-full text-xs text-gray-500">
            Os valores das linhas de supervisão começam com o total do lote (soma de loja virtual, setor e cobertura)
            ou com a linha do total do supervisor, se ela estiver na colagem. Ajuste se precisar.
          </span>
        </div>

        <textarea
          value={script}
          readOnly
          spellCheck={false}
          className="min-h-[40vh] w-full flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-700 outline-none"
        />

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-500">
            {erroCopia ? <span className="text-red-500">{erroCopia}</span> : `${script.length.toLocaleString("pt-BR")} caracteres`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={copiar}
              className="flex h-10 items-center gap-2 rounded-lg bg-indigo-950 px-4 text-sm font-semibold text-white hover:bg-indigo-900 cursor-pointer"
            >
              {copiado ? <FiCheck size={16} /> : <FiCopy size={16} />}
              {copiado ? "Copiado!" : "Copiar script"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
