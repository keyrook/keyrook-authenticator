/**
 * Firefox's data consent, for the account (docs/firefox.md, Data consent).
 * The Firefox manifest declares what an account sends as optional data
 * (scripts/firefox.mjs, ACCOUNT_DATA), which Firefox grants none of at
 * install: the click that starts a sign-in asks for it, the vault service
 * checks it before every request, and the person can take it back in
 * about:addons whenever they like.
 *
 * Read from the manifest, so what is asked for is exactly what is declared:
 * a category asked for and not declared is refused outright by Firefox, and
 * one declared and not asked for would never be granted.
 */
type Gecko = {
  browser_specific_settings?: { gecko?: { data_collection_permissions?: { optional?: string[] } } };
};

function accountData(): chrome.permissions.Permissions {
  const manifest = chrome.runtime.getManifest() as Gecko;
  const optional = manifest.browser_specific_settings?.gecko?.data_collection_permissions?.optional ?? [];
  // Chrome's types know nothing of `data_collection`; Firefox has had it since 140.
  return { data_collection: optional } as chrome.permissions.Permissions;
}

/** Shows Firefox's prompt, unless it was already given. Only from a click: Firefox refuses it otherwise. */
export const askAccountData = (): Promise<boolean> => chrome.permissions.request(accountData());

/** Whether it is given now: asked before each request, since about:addons can take it back. */
export const accountDataAllowed = (): Promise<boolean> => chrome.permissions.contains(accountData());
