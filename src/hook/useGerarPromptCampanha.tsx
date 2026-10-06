import { useCallback, useState } from "react";
import { CampaignRegistration } from "../interfaces/CampaignRegistration";
import { getCampaignRegistrationFile } from "../services/campaignRegistration.teleseler";
import { lerAnexoPlanilha, TipoAnexo } from "../utils/anexoPlanilha";
import { AnexoParaPrompt, gerarPromptCampanha, PromptGerado } from "../utils/gerarPromptCampanha";

async function carregarAnexo(
  campaign: CampaignRegistration,
  tipo: TipoAnexo,
  existe: boolean,
  nomeArquivo: string | null
): Promise<AnexoParaPrompt> {
  if (!existe) return { tipo, existe: false, nomeArquivo: null, leitura: null };

  try {
    const blob = await getCampaignRegistrationFile(campaign.idConference, tipo);
    const leitura = lerAnexoPlanilha(await blob.arrayBuffer(), tipo);
    return { tipo, existe: true, nomeArquivo, leitura };
  } catch {
    return {
      tipo,
      existe: true,
      nomeArquivo,
      leitura: null,
      erro: "falha ao baixar ou abrir o arquivo",
    };
  }
}

export function useGerarPromptCampanha(campaign: CampaignRegistration) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<PromptGerado | null>(null);

  const gerar = useCallback(async () => {
    setGerando(true);
    setErro("");
    try {
      const anexos = await Promise.all([
        carregarAnexo(campaign, "products", campaign.hasProductsFile, campaign.productsFileName),
        carregarAnexo(campaign, "clients", campaign.hasClientsFile, campaign.clientsFileName),
      ]);
      setResultado(gerarPromptCampanha(campaign, anexos));
    } catch {
      setErro("Erro ao gerar o prompt.");
    } finally {
      setGerando(false);
    }
  }, [campaign]);

  const fechar = useCallback(() => setResultado(null), []);

  return { gerando, erro, resultado, gerar, fechar };
}
