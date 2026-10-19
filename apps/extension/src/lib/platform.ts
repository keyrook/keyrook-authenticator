import type { KeyValueStore, Platform } from '@authx/service/platform.js';
import { APP_NAME } from '@authx/ui/lib/name.js';
import { SYNC_API_URL } from './config.js';
import { destroyDeviceKey, getDeviceKey, getOrCreateDeviceKey } from './deviceKey.js';
import { VAULT_CHANGED } from './messaging.js';

function area(storage: chrome.storage.StorageArea): KeyValueStore {
  return {
    async get(key) {
      return (await storage.get(key))[key];
    },
    async set(key, value) {
      await storage.set({ [key]: value });
    },
    async remove(...keys) {
      await storage.remove(keys);
    },
  };
}

/**
 * The toolbar button's tooltip. In the browser's language, from _locales: the
 * worker has no page, and so no language of its own to say it in.
 */
export async function setLockedTitle(locked: boolean): Promise<void> {
  const lockedTitle = chrome.i18n?.getMessage('actionLocked') || `${APP_NAME} — locked`;
  await chrome.action.setTitle({ title: locked ? lockedTitle : APP_NAME });
}

function deviceName(): string {
  const platform = navigator.userAgent.includes('Mac')
    ? 'Mac'
    : navigator.userAgent.includes('Windows')
      ? 'Windows'
      : navigator.userAgent.includes('Linux')
        ? 'Linux'
        : 'Browser';
  const browser = navigator.userAgent.includes('Edg/') ? 'Edge' : 'Chrome';
  return `${browser} on ${platform}`;
}

/** The vault service, run on Chrome: installed by the service worker as it loads. */
export const chromePlatform: Platform = {
  disk: area(chrome.storage.local),
  memory: area(chrome.storage.session),
  deviceKey: { get: getDeviceKey, getOrCreate: getOrCreateDeviceKey, destroy: destroyDeviceKey },

  timers: {
    // Chrome clamps alarms to a 30-second floor.
    once(name, minutes) {
      void chrome.alarms.create(name, { delayInMinutes: Math.max(0.5, minutes) });
    },
    every(name, minutes) {
      void chrome.alarms.create(name, { periodInMinutes: minutes });
    },
    async clear(name) {
      await chrome.alarms.clear(name);
    },
  },

  announceChange() {
    // No receiver is a normal state (nothing is open); swallow that specific error.
    chrome.runtime.sendMessage({ type: VAULT_CHANGED }).catch(() => undefined);
  },

  showLocked: setLockedTitle,
  syncApiUrl: SYNC_API_URL,

  get clientId() {
    return chrome.runtime.id;
  },

  get clientVersion() {
    return chrome.runtime.getManifest().version;
  },

  deviceName,

  // The browser's own sign-in window, back to this extension's
  // `chromiumapp.org` address.
  signInWindow: (url) => chrome.identity.launchWebAuthFlow({ url, interactive: true }),
};
