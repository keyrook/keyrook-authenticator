/**
 * Build-time product configuration.
 */

/**
 * The sync backend, injected at build time via `VITE_SYNC_API_URL` — the
 * official server unless the build says otherwise (scripts/release.mjs).
 *
 * Empty disables every account feature in the UI: a sign-in form that cannot
 * reach anything is worse than no sign-in form at all.
 */
export const SYNC_API_URL = (import.meta.env.VITE_SYNC_API_URL ?? '').replace(/\/+$/, '');

export const SYNC_ENABLED = SYNC_API_URL.length > 0;

/**
 * The site the Keyrook account's passkeys belong to, their RP ID, for that
 * server: scripts/build.mjs works it out once, for this and for the
 * manifest's one optional host permission. Empty in a build that asks no
 * passkey.
 */
export const ACCOUNT_RP = SYNC_ENABLED ? (import.meta.env.VITE_ACCOUNT_RP ?? '') : '';

/**
 * The account's page, for a server that has one of its own; empty for the
 * official page, which the pages link when told nothing.
 */
export const ACCOUNT_PAGE_URL = import.meta.env.VITE_ACCOUNT_PAGE_URL ?? '';

/**
 * The browser this build is for: `firefox` for `npm run build:firefox`,
 * Chrome's otherwise — Edge and Opera run the Chrome build as it is.
 */
export const IN_FIREFOX = import.meta.env.VITE_BROWSER === 'firefox';
