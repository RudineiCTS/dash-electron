/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_PERMITIR_TROCA_USUARIO?: string
  readonly VITE_MODO_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
