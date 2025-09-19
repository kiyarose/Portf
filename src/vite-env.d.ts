/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAGECLIP_API_KEY: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
