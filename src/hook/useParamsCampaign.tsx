import { useCallback, useEffect, useState } from "react";
import { ClientCampaign, ClientCampaignType, LineProductCampaignType, ManufacturesCampaignType, PaginationType, ParamsCampaignType, ProductCampaign, ProductCampaignType } from "../interfaces/TParamsCampaign";
import { getCampaignParamsClient, getCampaignParamsLineProducts, getCampaignParamsManufactures, getCampaignParamsProducts } from "../services/campaign.teleseler";


export function useParamsCampaign(idCampaign: number) {
  const [manufactures, setManufactures] = useState<ManufacturesCampaignType[]>([]);
  const [lineProducts, setLineProducts] = useState<LineProductCampaignType[]>([]);

  const [products, setProducts] = useState<ProductCampaign[]>([]);
  const [productsList, setProductsList] = useState<ProductCampaign[]>([]);

  const [client, setClient] = useState<ClientCampaign[]>([]);
  const [clientList, setClientList] = useState<ClientCampaign[]>([]);

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [paginationProducts, setPaginationProducts] = useState<PaginationType>({
    pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0,
  });

  const [paginationClients, setPaginationClients] = useState<PaginationType>({
    pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAbort = (err: unknown) => err instanceof Error && err.name === "AbortError";


  // debounce: só atualiza a busca "real" depois que o usuário parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPaginationProducts((prev) => ({ ...prev, pageNumber: 1 }));
  }, [debouncedSearch]);


  // ---------- Dados estáticos (uma vez por campanha) ----------
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      getCampaignParamsManufactures(idCampaign, controller.signal).then(setManufactures),
      getCampaignParamsLineProducts(idCampaign, controller.signal).then(setLineProducts),
    ])
      .catch((err) => { if (!isAbort(err)) setError(`Erro ao buscar parâmetros da campanha ${idCampaign}`); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [idCampaign]);

  // ---------- Produtos paginados ----------
  useEffect(() => {
    const controller = new AbortController();
    getCampaignParamsProducts({
      idCampaign,
      pagination: { pageNumber: paginationProducts.pageNumber, pageSize: paginationProducts.pageSize, totalCount: 0, totalPages: 0 },      
      signal: controller.signal,
    })
      .then((data) => {
        setProductsList(data.items );
        setPaginationProducts((prev) => ({
          ...prev,
          totalCount: data.totalCount!,
          totalPages: data.totalPages!,
        }));
      })
      .catch((err) => { if (!isAbort(err)) setError(`Erro ao buscar produtos da campanha ${idCampaign}`); });

    return () => controller.abort();
    // só refaz quando idCampaign, page ou size mudam - NUNCA quando totalCount/totalPages mudam
  }, [idCampaign, paginationProducts.pageNumber, paginationProducts.pageSize]);

  // ---------- Clientes paginados (mesma ideia) ----------
  useEffect(() => {
    const controller = new AbortController();
    getCampaignParamsClient({
      idCampaign,
      pagination: { pageNumber: paginationClients.pageNumber, pageSize: paginationClients.pageSize, totalCount: 0, totalPages: 0 },
      signal: controller.signal,
    })
      .then((data) => {
        setClientList(data.items );
        setPaginationClients((prev) => ({
          ...prev,
          totalCount: data.totalCount!,
          totalPages: data.totalPages!,
        }));
      })
      .catch((err) => { if (!isAbort(err)) setError(`Erro ao buscar clientes da campanha ${idCampaign}`); });

    return () => controller.abort();
  }, [idCampaign, paginationClients.pageNumber, paginationClients.pageSize]);

  //----------- Exporta para CSV --------------------

  // ---------- Handlers explícitos pra UI ----------
  const goToProductsPage = useCallback((pageNumber: number) => {
    setPaginationProducts((prev) => ({ ...prev, pageNumber }));
  }, []);

  const setProductsPageSize = useCallback((pageSize: number) => {
    setPaginationProducts((prev) => ({ ...prev, pageSize, pageNumber: 1 }));
  }, []);

  const goToClientsPage = useCallback((pageNumber: number) => {
    setPaginationClients((prev) => ({ ...prev, pageNumber }));
  }, []);
  const setClientsPageSize = useCallback((pageSize: number) => {
    setPaginationClients((prev) => ({ ...prev, pageSize, pageNumber: 1 }));
  }, []);


  return {
    manufactures,
    lineProducts,
    products,
    productsList,
    client,
    clientList,

    paginationProducts,
    goToProductsPage,
    setProductsPageSize,


    paginationClients,
    goToClientsPage,
    setClientsPageSize,

    loading,
    error,
  };
}