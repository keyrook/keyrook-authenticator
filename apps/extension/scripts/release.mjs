/**
 * The official sync server, compiled into every build that does not say
 * otherwise — so `npm run build` from a release tag produces the same bytes
 * the stores ship. The e2e suite points a build at its own server through
 * `VITE_SYNC_API_URL`, and an empty value builds one with no account features.
 *
 * It is also what scripts/check-release.mjs holds a release's `connect-src`
 * to: the one origin a release may talk to besides itself. Changing it is a
 * change to the privacy policy and to both stores' privacy answers.
 */
export const PRODUCTION_SYNC_API_URL = 'https://api.keyrook.com';

/**
 * The site the Keyrook account's passkeys belong to — their RP ID — for the
 * server a build talks to: the account's page, for the official server;
 * staging's own page, for staging; and `localhost` for the kit's server on this
 * machine, whose page it places at localhost:5174. No other server's: a build
 * against one asks no passkey.
 *
 * Chrome lets an extension ask another site's passkeys only with the host
 * permission for that site, so this is also the one optional host permission
 * a build declares (scripts/manifest.mjs), and check-release holds a release
 * to the official one.
 */
export const PRODUCTION_ACCOUNT_RP = 'account.keyrook.com';

/**
 * Staging, for a build tried by hand before a change reaches production
 * (keyrook-account's docs/deploy.md). Matched by its whole origin, so a
 * look-alike address asks no passkey. Being named here lets nothing past
 * check-release, which holds a release to the official server alone.
 */
export const STAGING_SYNC_API_URL = 'https://api-staging.keyrook.com';
export const STAGING_ACCOUNT_RP = 'account-staging.keyrook.com';

export function accountRpFor(syncApiUrl) {
  if (!syncApiUrl) return '';
  const url = new URL(syncApiUrl);
  if (url.origin === new URL(PRODUCTION_SYNC_API_URL).origin) return PRODUCTION_ACCOUNT_RP;
  if (url.origin === new URL(STAGING_SYNC_API_URL).origin) return STAGING_ACCOUNT_RP;
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1' ? 'localhost' : '';
}

/**
 * The account's page for that server, or empty for the official one, which
 * the pages link when told nothing (packages/ui/src/lib/links.ts). Worked out
 * here so that staging's address enters no bundle but staging's: a test
 * account sent to the official page does not exist there, and a passkey made
 * for it there would be the official site's.
 */
export function accountPageFor(syncApiUrl) {
  const rp = accountRpFor(syncApiUrl);
  return rp === STAGING_ACCOUNT_RP ? `https://${rp}` : '';
}

/**
 * The Edge Add-ons listing's public key (Partner Center → the extension →
 * Extension identity). A manifest that carries it loads with the Edge
 * listing's id, lnbabkbknabedpnmdihllnbhdmolianm — one the sync server
 * accepts — which is how a build loaded unpacked can try sync against the
 * real server: `npm run build:as-edge`. In Chrome nothing else has that id; in
 * Edge it would stand in for the store install, so use Chrome.
 *
 * Public by nature: every copy of the listing's package carries it. A store
 * upload must not, and check-release refuses one that does.
 */
export const EDGE_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiJljD2s/4hKNRENlUchF1mn1uvv3e5nL/3Knqcz3xa0Hz+ojMW7PxcP/8wh/7np45gQ9rF1GWur97EJBX4y8bwgqoP8H1cRHGAgGR4X+VT/PWuZXtMnnv7ArN78ClkWlC2iIP1JDHvkWIia0OMWUNDbHgrURYirykI9wxzo0jfsXZ+29Ekwiu9AEz4p6XxFVJRD32o632Vbk+hF7pNytP0zYOAz2si96h/OnTAaYg0VUeYOsN23N1WZ2dWwVv43SHJ3rr+6GzgcvVK7GFUUaThS1RaOeAPREJyTidp5BqWy+xk8UHk+PSNepNqVlJy4Yztzfdtqoy2CX+a7ohlPt1wIDAQAB';
