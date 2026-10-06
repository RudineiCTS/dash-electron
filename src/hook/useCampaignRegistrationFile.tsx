import { useCallback, useState } from "react";
import { CampaignRegistrationFileType } from "../interfaces/CampaignRegistration";
import { getCampaignRegistrationFile } from "../services/campaignRegistration.teleseler";
import { downloadBlob } from "../utils/downloadFile";

export function useCampaignRegistrationFile(idConference: number) {
  const [downloading, setDownloading] = useState<CampaignRegistrationFileType | null>(null);
  const [error, setError] = useState("");

  const download = useCallback(
    async (type: CampaignRegistrationFileType, filename: string) => {
      try {
        setDownloading(type);
        setError("");
        const blob = await getCampaignRegistrationFile(idConference, type);
        downloadBlob(blob, filename);
      } catch {
        setError(`Erro ao baixar o arquivo de ${type === "clients" ? "clientes" : "produtos"}.`);
      } finally {
        setDownloading(null);
      }
    },
    [idConference]
  );

  return { downloading, error, download };
}
