import type { Host } from '@authx/ui/host.js';
import { accountPasskeys } from './accountPasskeys.js';
import { passkeyUnlock } from './passkeyUnlock.js';
import { ACCOUNT_PAGE_URL, IN_FIREFOX, SYNC_ENABLED } from './config.js';
import { askAccountData } from './consent.js';
import { storeListing } from './listing.js';
import { VAULT_CHANGED, type VaultChangedEvent } from './messaging.js';

/**
 * What the popup and Settings get from the browser: the vault through the
 * service worker, and the few things only an extension page can do. Installed
 * by each page's entry point before it renders.
 */
export const chromeHost: Host = {
  request: (request) => chrome.runtime.sendMessage(request),

  onVaultChanged(handler) {
    const listener = (message: unknown) => {
      if (
        typeof message === 'object' &&
        message !== null &&
        (message as VaultChangedEvent).type === VAULT_CHANGED
      ) {
        handler();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  },

  preferences: {
    async get(key) {
      return (await chrome.storage.local.get(key))[key];
    },
    async set(key, value) {
      await chrome.storage.local.set({ [key]: value });
    },
    async remove(key) {
      await chrome.storage.local.remove(key);
    },
    // A change made in Settings reaches an open popup too, and the reverse.
    // The dev harness's stand-in storage has no change events, hence the `?.`.
    watch(key, handler) {
      const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
        if (area === 'local' && key in changes) handler(changes[key]!.newValue);
      };
      chrome.storage.onChanged?.addListener(listener);
      return () => chrome.storage.onChanged?.removeListener(listener);
    },
  },

  syncEnabled: SYNC_ENABLED,
  accountPageUrl: ACCOUNT_PAGE_URL || undefined,

  get version() {
    return chrome.runtime.getManifest().version;
  },

  // openOptionsPage takes no fragment, and the fragment is what lands someone
  // on the scanner or the account rather than on a list they then have to
  // navigate; a new tab carries one. Both are asked for before this returns,
  // so a popup that closes straight after still opens the tab.
  async openSettings(fragment) {
    if (fragment) await chrome.tabs.create({ url: chrome.runtime.getURL(`options.html${fragment}`) });
    else await chrome.runtime.openOptionsPage();
  },

  async openUrl(url) {
    await chrome.tabs.create({ url });
  },

  overPage: true,
  device: 'browser',
  browser: IN_FIREFOX ? 'firefox' : undefined,

  async saveFile(name, contents) {
    const url = URL.createObjectURL(contents);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    // Not straight away: the download reads the blob after click() returns.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },

  print: () => window.print(),

  copy: (text) => navigator.clipboard.writeText(text),

  async shortcuts() {
    const commands = await chrome.commands.getAll();
    return Object.fromEntries(commands.map((command) => [command.name ?? '', command.shortcut ?? '']));
  },

  storeListing: () => storeListing(),

  // Firefox asks before anything is sent to the account; Chrome does not.
  allowAccountData: IN_FIREFOX && SYNC_ENABLED ? askAccountData : undefined,

  // Neither on Firefox. Fingerprint and security-key unlock is a passkey
  // whose RP ID is the extension's own, and Firefox lets an extension's page
  // make one only for a site it holds a host permission for, never for
  // itself. The account's passkeys could be asked only with a host permission
  // for account.keyrook.com, and the server takes none from an origin Firefox
  // makes on install (keyrook-account's docs/firefox.md, section 3).
  accountPasskeys: IN_FIREFOX ? undefined : accountPasskeys,
  passkeyUnlock: IN_FIREFOX ? undefined : passkeyUnlock,
};
