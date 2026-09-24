import { useCallback, useEffect, useState } from "react";
import { TelevendasDigitador } from "../interfaces/TelevendasDigitador";
import { getTelevendasDigitadores, saveTelevendasDigitadorGrupo } from "../services/televendasDigitador";

export function useTelevendasDigitador() {
    const [digitadores, setDigitadores] = useState<TelevendasDigitador[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [salvandoId, setSalvandoId] = useState<number | null>(null);
    const [salvarErro, setSalvarErro] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError("");
        getTelevendasDigitadores(controller.signal)
            .then(setDigitadores)
            .catch((err) => {
                if (err instanceof Error && err.name === "AbortError") return;
                setError("Erro ao buscar os digitadores de televendas.");
            })
            .finally(() => setLoading(false));
        console.log(digitadores)
        return () => controller.abort();
    }, [attempt]);

    const retry = useCallback(() => setAttempt((a) => a + 1), []);

    const salvarGrupo = useCallback(async (idPessoa: number, grupo: string, subGrupo: string) => {
        setSalvandoId(idPessoa);
        setSalvarErro("");
        try {
            await saveTelevendasDigitadorGrupo({
                idPessoaTelevendas: idPessoa,
                grupo: grupo.trim() || null,
                subGrupo: subGrupo.trim() || null,
            });
            setDigitadores((prev) =>
                prev.map((d) =>
                    d.idPessoa === idPessoa
                        ? { ...d, grupo: grupo.trim() || null, subGrupo: subGrupo.trim() || null }
                        : d
                )
            );
        } catch {
            setSalvarErro("Erro ao salvar grupo/subgrupo do digitador.");
        } finally {
            setSalvandoId(null);
        }
    }, []);

    return { digitadores, loading, error, retry, salvarGrupo, salvandoId, salvarErro };
}
