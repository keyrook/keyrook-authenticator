import { host } from '../host.js';

/**
 * Where the source and the security model are published.
 *
 * Linked from every place a person decides whether to trust the extension —
 * first run, the popup, the settings sidebar, About, signing up for sync —
 * because "open source" only earns trust when the code is one click away.
 * Following a link is ordinary navigation in a new tab; nothing is fetched.
 */
export const SOURCE_URL = 'https://github.com/keyrook/keyrook-authenticator';
export const SECURITY_MODEL_URL = `${SOURCE_URL}/blob/main/docs/security-model.md`;
export const LICENCE = 'GPL-3.0-or-later';

/**
 * What an account means for someone's data. Linked where the account is
 * created: the policy says creating one is agreeing to it, which only holds if
 * it was one click away at that moment.
 */
export const PRIVACY_URL = 'https://keyrook.com/authenticator/privacy/';

/**
 * Problems and suggestions, in public. Linked from About, with a warning:
 * an issue is readable by anyone, and a setup key pasted into one is gone.
 */
export const ISSUES_URL = `${SOURCE_URL}/issues`;

/**
 * The Keyrook account's own page: its address, its password, its recovery
 * key, its recent activity, a download of what the server holds, starting it
 * over, deleting it — for every Keyrook app at once. A build against a server
 * with a page of its own says so through the Host: its accounts are not here.
 */
const ACCOUNT_PAGE_URL = 'https://account.keyrook.com';

/**
 * The page's views a link opens by name, after signing in if it has to
 * (keyrook-account's docs/console.md). The names never change; deleting the
 * account has none, and is under `data`. `profile` changes the address, `data`
 * downloads what the server holds and deletes the account, and `activity`
 * lists 90 days of sign-ins and security changes (keyrook-account's
 * docs/settings.md): this app only links to them.
 */
export type AccountPageView = 'devices' | 'signin' | 'recovery' | 'passkeys' | 'profile' | 'data' | 'activity';

export function accountPageUrl(view?: AccountPageView): string {
  const page = host().accountPageUrl ?? ACCOUNT_PAGE_URL;
  return view ? `${page}/#${view}` : page;
}
