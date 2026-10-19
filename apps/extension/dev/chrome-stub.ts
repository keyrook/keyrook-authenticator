/**
 * An in-memory stand-in for the slice of the `chrome.*` API this extension
 * uses, so the popup, the options page and the real service-worker module can
 * be exercised in an ordinary browser tab.
 *
 * Development only — nothing here is part of the built extension.
 */
import QRCode from 'qrcode';
import { DEV_SENDER, DEV_RUNTIME_ID as RUNTIME_ID } from './identity.js';

/*
 * A message carries both an id and an origin because the background demands
 * both — `isTrustedSender` exists so a content script carrying the extension's
 * id cannot drive the vault from whatever page it was injected into. A stub
 * that sends only the id is refused as untrusted, and every harness page then
 * reports that the service worker never replied, with nothing in the console
 * to say why.
 *
 * This is not a way around the check. The check is untouched and still refuses
 * an id with no origin; `test/sender.test.ts` pins that, and
 * `test/dev-harness.test.ts` pins that the identity below satisfies it. All
 * this does is stop the fake API from lying about who is calling.
 */

type Listener = (
  message: unknown,
  sender: { id: string; origin: string },
  sendResponse: (r: unknown) => void,
) => unknown;

interface RegisteredListener {
  fn: Listener;
  /** The service worker registers first; broadcasts must not loop back to it. */
  isBackground: boolean;
}

const messageListeners: RegisteredListener[] = [];
let registeringBackground = false;

/**
 * Wrap the service-worker import so its listener is tagged as the background
 * one. Split into a setter rather than a callback because the import is async.
 */
export function setRegisteringBackground(value: boolean): void {
  registeringBackground = value;
}

function makeArea(persistKey: string | null) {
  const store = new Map<string, unknown>();

  if (persistKey) {
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved) for (const [key, value] of Object.entries(JSON.parse(saved))) store.set(key, value);
    } catch {
      /* a corrupted dev store is not worth recovering */
    }
  }

  const flush = () => {
    if (!persistKey) return;
    localStorage.setItem(persistKey, JSON.stringify(Object.fromEntries(store)));
  };

  return {
    async get(keys?: string | string[] | null) {
      const wanted = keys === undefined || keys === null ? [...store.keys()] : ([] as string[]).concat(keys);
      return Object.fromEntries(
        wanted.filter((key) => store.has(key)).map((key) => [key, store.get(key)]),
      );
    },
    async set(entries: Record<string, unknown>) {
      for (const [key, value] of Object.entries(entries)) store.set(key, value);
      flush();
    },
    async remove(keys: string | string[]) {
      for (const key of ([] as string[]).concat(keys)) store.delete(key);
      flush();
    },
    async clear() {
      store.clear();
      flush();
    },
  };
}

const alarms = new Map<string, number>();
const alarmListeners: ((alarm: { name: string }) => void)[] = [];

/** A believable screenshot: a real QR for a test account, drawn on a page-ish background. */
async function fakeScreenshot(): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#f4f4f5';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const qr = new Image();
  qr.src = await QRCode.toDataURL(
    'otpauth://totp/Harness%20Demo:qr@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Harness%20Demo',
    { margin: 2, width: 240 },
  );
  await qr.decode();
  context.drawImage(qr, 480, 260);

  return canvas.toDataURL('image/png');
}

const chromeStub = {
  runtime: {
    id: RUNTIME_ID,
    getManifest: () => ({ version: '0.1.0-dev' }),
    getURL: (path: string) => new URL(path, location.origin).toString(),
    openOptionsPage: async () => window.open('/dev/options.html', '_blank'),
    onMessage: {
      addListener(fn: Listener) {
        messageListeners.push({ fn, isBackground: registeringBackground });
      },
      removeListener(fn: Listener) {
        const index = messageListeners.findIndex((entry) => entry.fn === fn);
        if (index !== -1) messageListeners.splice(index, 1);
      },
    },
    onStartup: { addListener: () => undefined },
    onInstalled: { addListener: () => undefined },
    sendMessage(message: { type?: string }) {
      // Broadcasts skip the service worker, mirroring Chrome's rule that a
      // sender never receives its own message.
      const isBroadcast = message?.type === 'vault/changed';
      const targets = messageListeners.filter((entry) => !(isBroadcast && entry.isBackground));

      return new Promise((resolve) => {
        let settled = false;
        let async = false;
        const sendResponse = (response: unknown) => {
          if (settled) return;
          settled = true;
          resolve(response);
        };

        for (const entry of targets) {
          if (entry.fn(message, DEV_SENDER, sendResponse) === true) async = true;
        }
        if (!async && !settled) resolve(undefined);
      });
    },
  },

  storage: {
    local: makeArea('authx.dev.local'),
    // Session storage is memory-only in Chrome too, so no persistence here.
    session: makeArea(null),
  },

  alarms: {
    create(name: string, options: { delayInMinutes?: number }) {
      const existing = alarms.get(name);
      if (existing) window.clearTimeout(existing);
      alarms.set(
        name,
        window.setTimeout(
          () => alarmListeners.forEach((fn) => fn({ name })),
          (options.delayInMinutes ?? 1) * 60_000,
        ),
      );
    },
    async clear(name: string) {
      const existing = alarms.get(name);
      if (existing) window.clearTimeout(existing);
      alarms.delete(name);
      return true;
    },
    onAlarm: { addListener: (fn: (alarm: { name: string }) => void) => alarmListeners.push(fn) },
  },

  action: {
    setBadgeText: async () => undefined,
    setTitle: async () => undefined,
  },

  // The service worker listens for the fill shortcut as it loads; without
  // this it throws there and no page ever gets an answer.
  commands: {
    onCommand: { addListener: () => undefined },
    async getAll() {
      return [
        { name: '_execute_action', shortcut: 'Alt+Shift+A' },
        { name: 'fill-code', shortcut: 'Alt+Shift+F' },
      ];
    },
  },

  tabs: {
    async query() {
      return [{ id: 1, windowId: 1, url: 'https://github.com/settings/security', title: 'GitHub' }];
    },
    captureVisibleTab: fakeScreenshot,
    async sendMessage() {
      // Pretend the page has a one-time-code field so the Fill affordance shows.
      return { found: true, count: 1 };
    },
    async create({ url }: { url: string }) {
      window.open(url, '_blank');
    },
  },

  scripting: {
    async executeScript() {
      return [];
    },
  },
};

(globalThis as unknown as { chrome: typeof chromeStub }).chrome = chromeStub;

export function resetDevStorage(): void {
  localStorage.removeItem('authx.dev.local');
  location.reload();
}
