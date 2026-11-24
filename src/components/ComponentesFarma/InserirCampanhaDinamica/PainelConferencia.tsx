import { useRef } from "react";
import { FiAlertTriangle, FiUpload, FiX } from "react-icons/fi";
import { ConferenciaCampanha } from "../../../hook/useConferenciaCampanha";
import { MapeamentoColunas } from "./MapeamentoColunas";
import { FormatoPremio, formatadorDoPremio, TabelaConferencia } from "./TabelaConferencia";
import { ModalAvisosConferencia } from "./ModalAvisosConferencia";

const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Indicador({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: "ruim" | "bom" }) {
  const cor = destaque === "ruim" ? "text-red-600" : destaque === "bom" ? "text-green-600" : "text-other-text";
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-other-border bg-other-bg px-4 py-3">
      <span className="text-xs text-other-muted">{rotulo}</span>
      <strong className={`text-lg ${cor}`}>{valor}</strong>
    </div>
  );
}

interface PainelConferenciaProps {
  conferencia: ConferenciaCampanha;
  /** Existe um retorno (executado agora ou guardado do script aberto). */
  temRetorno: boolean;
  /** O script foi editado depois da execução: o retorno na tela não é mais o deste texto. */
  retornoDesatualizado: boolean;
  /** Como mostrar o prêmio: em R$ (padrão) ou em pontos. */
  formatoPremio?: FormatoPremio;
  /** Nome do prêmio nos cabeçalhos (padrão "Prêmio"). */
  rotuloPremio?: string;
  /** Texto quando não há retorno do sistema (padrão: o da tela de campanhas dinâmicas). */
  textoSemRetorno?: string;
}

/** Conteúdo da aba "Conferir com planilha": sobe a base, aponta as colunas e compara com o retorno do script. */
export function PainelConferencia({
  conferencia: c,
  temRetorno,
  retornoDesatualizado,
  formatoPremio = "moeda",
  rotuloPremio = "Prêmio",
  textoSemRetorno = "Execute o script (ou abra um script salvo com retorno) para ter o retorno do sistema e poder conferir.",
}: PainelConferenciaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formatarPremio = formatadorDoPremio(formatoPremio);

  return (
    <>
      {!temRetorno && (
        <p className="rounded-lg border border-other-orange/40 bg-other-orange/10 px-4 py-2 text-sm text-other-text">
          {textoSemRetorno}
        </p>
      )}

      {temRetorno && retornoDesatualizado && (
        <p className="rounded-lg border border-other-orange/40 bg-other-orange/10 px-4 py-2 text-sm text-other-text">
          O script foi alterado depois da última execução: a conferência usa o retorno anterior. Execute de novo para
          atualizar.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) c.carregarArquivo(arquivo);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={c.lendo}
          className="flex h-11 items-center gap-2 rounded-lg bg-[#32307B] px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 cursor-pointer disabled:opacity-60"
        >
          <FiUpload size={16} />
          {c.lendo ? "Lendo..." : c.nomeArquivo ? "Trocar planilha" : "Subir planilha da outra base"}
        </button>

        {c.nomeArquivo && (
          <span className="flex items-center gap-2 text-sm text-other-text">
            {c.nomeArquivo}
            <button
              type="button"
              onClick={c.limparArquivo}
              aria-label="Remover planilha"
              className="rounded p-1 text-other-muted transition-colors hover:bg-other-hoverbg cursor-pointer"
            >
              <FiX size={14} />
            </button>
          </span>
        )}
        {c.erro && <span className="text-sm text-red-500">{c.erro}</span>}

        {c.avisos.length > 0 && (
          <button
            type="button"
            onClick={c.reabrirAvisos}
            className="ml-auto flex h-11 items-center gap-2 rounded-lg border border-other-orange/60 bg-other-orange/10 px-4 text-sm font-semibold text-other-text transition-colors hover:bg-other-orange/20 cursor-pointer"
          >
            <FiAlertTriangle size={16} className="text-other-orange" />
            Avisos ({c.avisos.length})
          </button>
        )}
      </div>

      {c.avisosPendentes && <ModalAvisosConferencia avisos={c.avisos} onClose={c.fecharAvisos} />}

      {!c.nomeArquivo ? (
        <p className="py-2 text-sm text-other-muted">
          A planilha é lida aqui no navegador e não é enviada ao servidor. Pode ter uma aba por papel (VENDEDOR,
          SUPERVISOR, GERENTE): vendedores são conferidos pelo ID; supervisores e gerentes, pelo nome. O que a planilha
          não trouxer (prêmio, gerentes, outras pessoas) conta como 0 e a tela avisa.
        </p>
      ) : (
        <MapeamentoColunas conferencia={c} />
      )}

      {c.podeConferir && c.resumo && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <Indicador rotulo="Linhas na base" valor={String(c.linhasNaBase)} />
            <Indicador rotulo="OK" valor={String(c.resumo.ok)} destaque="bom" />
            <Indicador
              rotulo="Divergentes"
              valor={String(c.resumo.divergentes)}
              destaque={c.resumo.divergentes > 0 ? "ruim" : undefined}
            />
            <Indicador rotulo="Sem informação na base" valor={String(c.resumo.soSistema)} />
            <Indicador rotulo="Só na planilha" valor={String(c.resumo.soPlanilha + c.resumo.ambiguos)} />
            <Indicador
              rotulo={`Dif. valor / ${rotuloPremio.charAt(0).toLowerCase()}${rotuloPremio.slice(1)}`}
              valor={`${moeda(c.resumo.somaDifValor)} / ${formatarPremio(c.resumo.somaDifPremio)}`}
            />
          </div>

          <TabelaConferencia
            resultados={c.resultados}
            tolerancia={c.tolerancia}
            onBaixar={c.baixarDivergencias}
            formatoPremio={formatoPremio}
            rotuloPremio={rotuloPremio}
          />
        </>
      )}
    </>
  );
}
