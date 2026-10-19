/**
 * The fragment the popup puts on the Settings URL to send someone straight to
 * the camera scanner. One constant for the side that writes it and the side
 * that reads it, so the two cannot drift apart and leave the button opening a
 * page that ignores it.
 */
export const SCAN_FRAGMENT = '#scan';

/**
 * Whether this page was opened to scan — and if so, remove the fragment.
 *
 * Consuming it matters: left in the URL, a reload or a visit from history
 * would open the camera for someone who only came to change a setting.
 *
 * Call it once, at load, outside React. StrictMode runs state initialisers
 * twice in development, and the second run would find the fragment already
 * gone and answer no.
 */
export function takeScanRequest(): boolean {
  if (location.hash !== SCAN_FRAGMENT) return false;
  history.replaceState(null, '', location.pathname + location.search);
  return true;
}

/**
 * Settings, on Sync: from the popup's "a browser is asking to join" banner, and
 * where a sign-in made in a tab comes back to. The other two land on the email
 * form someone chose in the popup, rather than on a card with the same two
 * buttons again. Consumed the same way.
 */
export const ACCOUNT_FRAGMENT = '#account';
export const SIGN_IN_FRAGMENT = '#account/sign-in';
export const CREATE_FRAGMENT = '#account/create';

/** Every place in Settings a page may open it at (`Host.openSettings`). */
export type SettingsFragment =
  | typeof SCAN_FRAGMENT
  | typeof ACCOUNT_FRAGMENT
  | typeof SIGN_IN_FRAGMENT
  | typeof CREATE_FRAGMENT;

export type AccountRequest = 'account' | 'signIn' | 'create';

const ACCOUNT_REQUESTS: Record<string, AccountRequest> = {
  [ACCOUNT_FRAGMENT]: 'account',
  [SIGN_IN_FRAGMENT]: 'signIn',
  [CREATE_FRAGMENT]: 'create',
};

export function takeAccountRequest(): AccountRequest | null {
  const request = ACCOUNT_REQUESTS[location.hash];
  if (!request) return null;
  history.replaceState(null, '', location.pathname + location.search);
  return request;
}
