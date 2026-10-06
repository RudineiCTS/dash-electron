import { ReactNode, useState } from "react";
import { FiChevronDown, FiChevronUp, FiDownload, FiMessageSquare } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { CampaignRegistration } from "../../../interfaces/CampaignRegistration";
import { useCampaignRegistrationFile } from "../../../hook/useCampaignRegistrationFile";
import { useGerarPromptCampanha } from "../../../hook/useGerarPromptCampanha";
import { ModalPromptCampanha } from "./ModalPromptCampanha";
import { formatCurrency } from "../../../utils/formateCurrency";

dayjs.locale("pt-br");

interface CardCampaignReceivedProps {
  campaign: CampaignRegistration;
  icone:string
}

function formatarData(data: string | null, formato = "DD/MM/YYYY") {
  if (!data) return "-";
  const dataFormatada = dayjs(data);
  return dataFormatada.isValid() ? dataFormatada.format(formato) : "-";
}

interface DetalheItemProps {
  label: string;
  valor?: string | number | null;
}

function DetalheItem({ label, valor }: DetalheItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-other-muted">{label}</span>
      <span className="text-sm text-github-text whitespace-pre-line">{valor || "-"}</span>
    </div>
  );
}

interface BotaoAcaoProps {
  label: string;
  rotuloOcupado: string;
  icone: ReactNode;
  carregando: boolean;
  desabilitado: boolean;
  onClick: () => void;
}

function BotaoAcao({ label, rotuloOcupado, icone, carregando, desabilitado, onClick }: BotaoAcaoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      className="border-other-green border rounded-lg flex gap-3 h-10 items-center px-3 text-sm font-medium shadow-2xl hover:bg-other-hoverbg active:scale-[0.98] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icone}
      <p className="text-other-secondaryBlue">{carregando ? rotuloOcupado : label}</p>
    </button>
  );
}

export function CardCampaignReceived({ campaign, icone }: CardCampaignReceivedProps) {
  const [expandido, setExpandido] = useState(false);
  const { downloading, error: erroDownload, download } = useCampaignRegistrationFile(campaign.idConference);
  const { gerando, erro: erroPrompt, resultado, gerar, fechar } = useGerarPromptCampanha(campaign);

  return (
    <div className="flex w-full flex-col bg-other-card rounded-lg shadow-md">
      <div className="flex w-full px-6 py-8 items-center">

        <div className="flex items-center justify-center w-14 h-14 bg-other-border rounded-md text-2xl mr-6">{icone}</div>

        <div className="flex-col flex gap-5">
          <div className="flex gap-2 items-center">
            <h1 className="font-bold text-lg">{campaign.campaignDescription || "-"}</h1>
            {campaign.assessmentType && (
              <span className="text-other-muted text-xs border border-other-border px-3 py-0.5 rounded-full">
                {campaign.assessmentType}
              </span>
            )}
            {campaign.status && (
              <span className="text-other-muted text-xs border border-other-border px-3 py-0.5 rounded-full">
                {campaign.status}
              </span>
            )}
          </div>
          <span className="flex text-sm text-other-muted gap-2">
            <p>Competência {formatarData(campaign.endDate, "MMMM/YYYY")}</p>
            <p>- Início {formatarData(campaign.startDate)}</p>
            <p>- Processado em {formatarData(campaign.processingDate, "DD/MM/YYYY HH:mm")}</p>
          </span>
        </div>

        <div className="flex gap-3 ml-auto shrink-0">
          <div className="flex flex-col">
            <strong>{formatarData(campaign.startDate, "DD/MM")} - {formatarData(campaign.endDate, "DD/MM")}</strong>
            <p className="text-other-muted text-sm">Vigência</p>
          </div>
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            title={expandido ? "Ver menos" : "Ver mais"}
            className="bg-other-border w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:brightness-95"
          >
            {expandido ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

      </div>

      {expandido && (
        <div className="grid grid-cols-3 gap-x-6 gap-y-5 border-t border-other-border px-6 py-6">
          <DetalheItem label="Meta" valor={formatCurrency(campaign.goalValue)} />
          <DetalheItem label="Tipo de Pagamento" valor={campaign.paymentType} />
          <DetalheItem label="Gatilho de Valor" valor={campaign.valueTrigger} />
          <DetalheItem label="Gatilho de CNPJ" valor={campaign.cnpjTrigger} />
          <DetalheItem label="Fabricantes" valor={campaign.manufacturers} />
          <DetalheItem label="Premiação Positivação" valor={campaign.positivationAward} />
          <DetalheItem label="Premiação Volume" valor={campaign.volumeAward} />
          <DetalheItem label="Premiação Auxiliar Supervisora" valor={formatCurrency(campaign.supervisorAssistantAward)} />
          <DetalheItem label="Premiação Supervisora" valor={formatCurrency(campaign.supervisorAward)} />
          <DetalheItem label="Observação de Cadastro" valor={campaign.registrationNotes} />
          <DetalheItem label="Observação" valor={campaign.notes} />
          {/* ações: baixar anexos (só quando existem) e gerar o prompt para a skill */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              {campaign.hasClientsFile && (
                <BotaoAcao
                  label="Clientes"
                  rotuloOcupado="Baixando..."
                  icone={<FiDownload color="000" />}
                  carregando={downloading === "clients"}
                  desabilitado={downloading !== null}
                  onClick={() => download("clients", campaign.clientsFileName || `clientes_${campaign.idConference}.xlsx`)}
                />
              )}
              {campaign.hasProductsFile && (
                <BotaoAcao
                  label="Produtos"
                  rotuloOcupado="Baixando..."
                  icone={<FiDownload color="000" />}
                  carregando={downloading === "products"}
                  desabilitado={downloading !== null}
                  onClick={() => download("products", campaign.productsFileName || `produtos_${campaign.idConference}.xlsx`)}
                />
              )}
              <BotaoAcao
                label="Gerar prompt"
                rotuloOcupado="Gerando..."
                icone={<FiMessageSquare color="000" />}
                carregando={gerando}
                desabilitado={gerando}
                onClick={gerar}
              />
            </div>
            {(erroDownload || erroPrompt) && <span className="text-xs text-red-500">{erroDownload || erroPrompt}</span>}
          </div>
        </div>
      )}

      {resultado && (
        <ModalPromptCampanha
          titulo={campaign.campaignDescription || `Conferência #${campaign.idConference}`}
          resultado={resultado}
          onClose={fechar}
        />
      )}
    </div>
  );
}
