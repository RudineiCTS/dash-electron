export interface CompassAPI {
  getOsUsername: () => Promise<string>;
  getHasSeenWelcome: () => Promise<boolean>;
  setHasSeenWelcome: (value: boolean) => Promise<boolean>;
}

declare global {
  interface Window {
    compassAPI?: CompassAPI;
  }
}
