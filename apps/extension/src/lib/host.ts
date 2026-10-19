import type { Host } from '@authx/ui/host.js';
import { SYNC_ENABLED } from './config.js';
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

  async shortcuts() {
    const commands = await chrome.commands.getAll();
    return Object.fromEntries(commands.map((command) => [command.name ?? '', command.shortcut ?? '']));
  },

  storeListing: () => storeListing(),
};
