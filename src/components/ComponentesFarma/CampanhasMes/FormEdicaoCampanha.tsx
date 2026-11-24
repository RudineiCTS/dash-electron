import { ReactNode } from "react";
import {
  CampanhaComercial,
  CampanhaComercialForm,
  CampanhaComercialOpcao,
  CampanhaComercialOpcoes,
} from "../../../interfaces/CampanhaComercial";
import { filtrarDigitacaoNumero } from "../../../utils/campanhaComercialForm";
import { rotuloSituacao } from "../../../utils/resumoCampanhasComerciais";

const estiloCampo =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none " +
  "focus:border-[#32307B] disabled:cursor-not-allowed disabled:opacity-60";

function Campo({ rotulo, children, className = "" }: { rotulo: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ${className}`}>
      {rotulo}
      {children}
    </label>
  );
}

interface FormEdicaoCampanhaProps {
  campanha: CampanhaComercial;
  form: CampanhaComercialForm;
  opcoes: CampanhaComercialOpcoes;
  onAlterar: <K extends keyof CampanhaComercialForm>(campo: K, valor: CampanhaComercialForm[K]) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  salvando: boolean;
  alterada: boolean;
  erro: string;
}

/** Campos editáveis da campanha; aparece embaixo da linha clicada. */
export function FormEdicaoCampanha({
  campanha,
  form,
  opcoes,
  onAlterar,
  onSalvar,
  onCancelar,
  salvando,
  alterada,
  erro,
}: FormEdicaoCampanhaProps) {
  const texto = (campo: "descricaoCampanha" | "observacao" | "recebimentoPremiacao", max?: number) => (
    <input
      value={form[campo]}
      maxLength={max}
      disabled={salvando}
      onChange={(e) => onAlterar(campo, e.target.value)}
      className={estiloCampo}
    />
  );

  const numero = (campo: "objetivoTotal" | "valorTotalPremiacao" | "gatilhoVenda" | "positivacaoAtrelada") => (
    <input
      value={form[campo]}
      inputMode="decimal"
      disabled={salvando}
      onChange={(e) => onAlterar(campo, filtrarDigitacaoNumero(e.target.value))}
      className={`${estiloCampo} text-right`}
    />
  );

  const data = (campo: "dataInicioApuracao" | "dataFimApuracao") => (
    <input
      type="date"
      value={form[campo]}
      disabled={salvando}
      onChange={(e) => onAlterar(campo, e.target.value)}
      className={estiloCampo}
    />
  );

  const seletor = (
    campo: "idSituacao" | "idTipoApuracao" | "idTipoCalculo" | "tipoValor" | "tipoMeta",
    lista: CampanhaComercialOpcao[],
    descricaoAtual: string | null
  ) => (
    <select
      value={form[campo]}
      disabled={salvando}
      onChange={(e) => onAlterar(campo, e.target.value)}
      className={`${estiloCampo} cursor-pointer`}
    >
      {/* sem o cadastro carregado (ou valor fora dele), a opção atual continua visível */}
      {!lista.some((o) => o.valor === form[campo]) && <option value={form[campo]}>{descricaoAtual ?? form[campo]}</option>}
      {lista.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.descricao}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Campo rotulo="Descrição da campanha" className="xl:col-span-2">
          {texto("descricaoCampanha", 200)}
        </Campo>
        <Campo rotulo="Situação">
          {seletor(
            "idSituacao",
            opcoes.situacoes.map((o) => ({ ...o, descricao: rotuloSituacao(o.descricao) })),
            rotuloSituacao(campanha.descricaoSituacao)
          )}
        </Campo>
        <Campo rotulo="Tipo de meta">{seletor("tipoMeta", opcoes.tiposMeta, campanha.descricaoTipoMeta)}</Campo>

        <Campo rotulo="Início da apuração">{data("dataInicioApuracao")}</Campo>
        <Campo rotulo="Fim da apuração">{data("dataFimApuracao")}</Campo>
        <Campo rotulo="Tipo de apuração">
          {seletor("idTipoApuracao", opcoes.tiposApuracao, campanha.descricaoTipoApuracao)}
        </Campo>
        <Campo rotulo="Tipo de cálculo">
          {seletor("idTipoCalculo", opcoes.tiposCalculo, campanha.descricaoTipoCalculo)}
        </Campo>

        <Campo rotulo="Objetivo total">{numero("objetivoTotal")}</Campo>
        <Campo rotulo="Prêmio total">{numero("valorTotalPremiacao")}</Campo>
        <Campo rotulo="Gatilho de venda">{numero("gatilhoVenda")}</Campo>
        <Campo rotulo="Positivação atrelada">{numero("positivacaoAtrelada")}</Campo>

        <Campo rotulo="Tipo de valor">{seletor("tipoValor", opcoes.tiposValor, campanha.descricaoTipoValor)}</Campo>
        <Campo rotulo="Extensão do ranking">
          <input
            value={form.extensaoRanking}
            maxLength={1}
            disabled={salvando}
            onChange={(e) => onAlterar("extensaoRanking", e.target.value)}
            className={estiloCampo}
          />
        </Campo>
        <Campo rotulo="Recebimento do prêmio" className="xl:col-span-2">
          {texto("recebimentoPremiacao", 300)}
        </Campo>

        <Campo rotulo="Observação" className="md:col-span-2 xl:col-span-3">
          {texto("observacao")}
        </Campo>
        <label className="flex items-center gap-2 pt-5 text-sm font-medium normal-case tracking-normal text-gray-700">
          <input
            type="checkbox"
            checked={form.bitVendedorVenda === true}
            disabled={salvando}
            onChange={(e) => onAlterar("bitVendedorVenda", e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[#32307B]"
          />
          Vendedor venda
        </label>
      </div>

      {erro && <p className="text-sm font-medium text-red-500">{erro}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSalvar}
          disabled={!alterada || salvando}
          className="h-10 rounded-lg bg-[#32307B] px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110
                     disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={salvando}
          className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 hover:bg-gray-100
                     disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
