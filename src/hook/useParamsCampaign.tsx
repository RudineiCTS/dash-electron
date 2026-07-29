import { useCallback, useEffect, useState } from "react";
import { ClientCampaignType, LineProductCampaignType, ManufacturesCampaignType, PaginationType, ParamsCampaignType, ProductCampaignType } from "../interfaces/TParamsCampaign";
import { getCampaignParamsClient, getCampaignParamsLineProducts, getCampaignParamsManufactures, getCampaignParamsProducts } from "../services/campaign.teleseler";



export function useParamsCampaign(idCampaign: number) {
  const [manufactures, setManufactures] = useState<ManufacturesCampaignType[]>([]);
  const [lineProducts, setLineProducts] = useState<LineProductCampaignType[]>([]);
  const [products, setProducts] = useState<ProductCampaignType[]>([]);
  const [client, setClient] = useState<ClientCampaignType[]>([]);
  const [clientList, setClientList] = useState<ClientCampaignType[]>([]);

  const [pagination, setPagination] = useState<PaginationType>({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAbort = (err: unknown) => err instanceof Error && err.name === 'AbortError';

  const fetchCampaignManufact = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getCampaignParamsManufactures(idCampaign, signal);
      setManufactures(data);
    } catch (err) {
      if (isAbort(err)) return;
      setError(`Erro ao buscar fabricantes da campanha ${idCampaign}`);
    }
  }, [idCampaign]);

  const fetchCampaignLineProduct = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getCampaignParamsLineProducts(idCampaign, signal);
      setLineProducts(data);
    } catch (err) {
      if (isAbort(err)) return;
      setError(`Erro ao buscar linhas de produto da campanha ${idCampaign}`);
    }
  }, [idCampaign]);

  const fetchCampaignProduct = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getCampaignParamsProducts(idCampaign, signal);
      setProducts(data);
    } catch (err) {
      if (isAbort(err)) return;
      setError(`Erro ao buscar produtos da campanha ${idCampaign}`);
    }
  }, [idCampaign]);

  const fetchCampaignClient = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getCampaignParamsClient(idCampaign, pagination, signal);
      setClientList(data);
    } catch (err) {
      if (isAbort(err)) return;
      setError(`Erro ao buscar lista de clientes da campanha ${idCampaign}`);
    }
  }, [idCampaign, pagination]);

  const getCampaignClientByID = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getCampaignParamsClient(idCampaign, undefined, signal);
      setClient(data);
    } catch (err) {
      if (isAbort(err)) return;
      setError(`Erro ao buscar cliente da campanha ${idCampaign}`);
    }
  }, [idCampaign]);

  const fetchCampaignParams = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchCampaignManufact(signal),
        fetchCampaignLineProduct(signal),
        fetchCampaignProduct(signal),
        fetchCampaignClient(signal),
      ]);
    } catch (err) {
      if (isAbort(err)) return;
      setError(`Erro ao buscar parâmetros da campanha ${idCampaign}`);
    } finally {
      setLoading(false);
    }
  }, [idCampaign, fetchCampaignManufact, fetchCampaignLineProduct, fetchCampaignProduct, fetchCampaignClient]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCampaignParams(controller.signal);
    return () => controller.abort();
  }, [fetchCampaignParams]);

  return {
    manufactures,
    lineProducts,
    products,
    client,
    clientList,
    pagination,
    setPagination,
    fetchCampaignParams,
    getCampaignClientByID,
    loading,
    error,
  };
}