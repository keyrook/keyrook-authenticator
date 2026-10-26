/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the sync backend. Empty in builds that ship without sync. */
  readonly VITE_SYNC_API_URL?: string;
  /** Whose passkeys the Keyrook account's are, for that server; empty asks none. Set by scripts/build.mjs. */
  readonly VITE_ACCOUNT_RP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
