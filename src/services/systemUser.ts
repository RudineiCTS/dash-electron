import { SystemUserProfile } from "../interfaces/SystemUser";
import { api } from "./api";

export async function getSystemUser(userName: string, signal?: AbortSignal): Promise<SystemUserProfile> {
    const response = await api.get<SystemUserProfile>(`system-user/${encodeURIComponent(userName)}`, { signal });
    return response.data;
}
