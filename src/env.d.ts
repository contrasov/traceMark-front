/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_POLLING_INTERVAL_MS?: string
  readonly VITE_MAX_PHOTOS_PER_UPLOAD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
