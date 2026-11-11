/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the sync backend. Empty in builds that ship without sync. */
  readonly VITE_SYNC_API_URL?: string;
  /** Whose passkeys the Keyrook account's are, for that server; empty asks none. Set by scripts/build.mjs. */
  readonly VITE_ACCOUNT_RP?: string;
  /** The account's page, for a server with one of its own; empty for the official. Set by scripts/build.mjs. */
  readonly VITE_ACCOUNT_PAGE_URL?: string;
  /** `firefox` in the Firefox build; absent in Chrome's. Set by scripts/build.mjs. */
  readonly VITE_BROWSER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
