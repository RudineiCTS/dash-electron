import { TelevendasDigitador, TelevendasDigitadorGrupoUpdate } from "../interfaces/TelevendasDigitador";
import { api } from "./api";

export async function getTelevendasDigitadores(signal?: AbortSignal): Promise<TelevendasDigitador[]> {
    const response = await api.get<TelevendasDigitador[]>("televendas-digitador", { signal });
    return response.data;
}

export async function saveTelevendasDigitadorGrupo(
    payload: TelevendasDigitadorGrupoUpdate,
    signal?: AbortSignal
): Promise<void> {
    await api.put("televendas-digitador/grupo", payload, { signal });
}
