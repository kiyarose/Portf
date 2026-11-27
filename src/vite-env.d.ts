/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAGECLIP_API_KEY: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_TURNSTYLE_SITE?: string;
  /** Base URL for remote JSON (e.g. https://example.com/data); dev proxy uses its origin. */
  readonly VITE_REMOTE_DATA_URL?: string;
  /** When true, skip localStorage cache and always refetch remote JSON. */
  readonly VITE_REMOTE_DATA_BYPASS_CACHE?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __BUILD_TIME__: string | undefined;
declare const __PF_ALLOW_NOEDIT__: boolean;
