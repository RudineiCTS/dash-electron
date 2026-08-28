// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

const compassAPI = {
  getOsUsername: (): Promise<string> => ipcRenderer.invoke('compass:get-os-username'),
  getHasSeenWelcome: (): Promise<boolean> => ipcRenderer.invoke('compass:get-has-seen-welcome'),
  setHasSeenWelcome: (value: boolean): Promise<boolean> => ipcRenderer.invoke('compass:set-has-seen-welcome', value),
};

contextBridge.exposeInMainWorld('compassAPI', compassAPI);
