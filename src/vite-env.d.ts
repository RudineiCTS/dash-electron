/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
    readonly VITE_API_HOST?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
