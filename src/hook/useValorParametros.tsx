import { useEffect, useState } from "react";
import { ValorParametro } from "../interfaces/ValorParametro";
import { getValorParametros } from "../services/valorParametros";

export function useValorParametros(tipoParametro: string) {
    const [termo, setTermo] = useState("");
    const [debouncedTermo, setDebouncedTermo] = useState("");
    const [opcoes, setOpcoes] = useState<ValorParametro[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // debounce: só dispara a busca depois que o usuário parar de digitar
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedTermo(termo.trim()), 400);
        return () => clearTimeout(timer);
    }, [termo]);

    useEffect(() => {
        if (!debouncedTermo) {
            setOpcoes([]);
            return;
        }

        const controller = new AbortController();
        // se o usuário digitou só números, busca por id; senão, busca por nome/descrição
        const isNumerico = /^\d+$/.test(debouncedTermo);

        setLoading(true);
        setError("");
        getValorParametros(
            {
                tipoParametro,
                id: isNumerico ? Number(debouncedTermo) : undefined,
                descricao: isNumerico ? undefined : debouncedTermo,
            },
            controller.signal
        )
            .then(setOpcoes)
            .catch((err) => {
                if (err instanceof Error && err.name === "AbortError") return;
                setError(`Erro ao buscar ${tipoParametro}`);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [tipoParametro, debouncedTermo]);

    return { termo, setTermo, opcoes, loading, error };
}
