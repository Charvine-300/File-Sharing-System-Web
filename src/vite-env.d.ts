/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_PUBLIC_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
