import { beforeEach, describe, expect, it } from 'vitest';
import { itemFromUri, parseOtpUri, type VaultItem } from '@authx/core';
import { AppError } from '@authx/ui/i18n/errors.js';
import type { VaultStatus } from '@authx/ui/lib/protocol.js';
import { installPlatform, type KeyValueStore, type Platform } from '../src/platform.js';
import { handle, onTimer, toEnvelope, type VaultRequest } from '../src/service.js';

/**
 * The vault service on a platform that is not a browser: plain maps for disk
 * and memory, a key made here, timers that only remember. If the service still
 * reached for `chrome.*` anywhere, these would throw — and the rules that make
 * it the one safe writer have to hold on any platform, not only in Chrome.
 */

const SECRET = 'JBSWY3DPEHPK3PXP';
const PASSWORD = 'correct horse battery staple';

function store(): KeyValueStore & { dump(): string } {
  const entries = new Map<string, unknown>();
  return {
    async get(key) {
      return entries.get(key);
    },
    async set(key, value) {
      entries.set(key, structuredClone(value));
    },
    async remove(...keys) {
      for (const key of keys) entries.delete(key);
    },
    dump: () => JSON.stringify(Object.fromEntries(entries)),
  };
}

function testPlatform() {
  let deviceKey: CryptoKey | null = null;
  const timers = new Map<string, { minutes: number; repeat: boolean }>();
  const platform = {
    disk: store(),
    memory: store(),
    deviceKey: {
      get: async () => deviceKey,
      async getOrCreate() {
        deviceKey ??= await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']);
        return deviceKey;
      },
      async destroy() {
        deviceKey = null;
      },
    },
    timers: {
      once: (name: string, minutes: number) => void timers.set(name, { minutes, repeat: false }),
      every: (name: string, minutes: number) => void timers.set(name, { minutes, repeat: true }),
      clear: async (name: string) => void timers.delete(name),
    },
    changes: 0,
    announceChange() {
      platform.changes += 1;
    },
    locked: null as boolean | null,
    async showLocked(locked: boolean) {
      platform.locked = locked;
    },
    syncApiUrl: '',
    clientId: 'test',
    clientVersion: '0.4.0',
    deviceName: () => 'Test on Node',
    signInWindow: () => Promise.reject(new Error('No window here.')),
    timerSet: timers,
  } satisfies Platform & Record<string, unknown>;
  return platform;
}

let platform: ReturnType<typeof testPlatform>;

beforeEach(async () => {
  platform = testPlatform();
  installPlatform(platform);
  // The service keeps an open vault between requests, as a worker does
  // between messages. A reset is what clears it.
  await handle({ type: 'vault/reset' });
});

const ask = <R extends VaultRequest>(request: R) => handle(request);
const status = () => ask({ type: 'vault/status' }) as Promise<VaultStatus>;

function account(issuer: string): VaultItem {
  return itemFromUri(parseOtpUri(`otpauth://totp/${issuer}:me@example.com?secret=${SECRET}&issuer=${issuer}`));
}

async function refusal(request: VaultRequest): Promise<string | undefined> {
  try {
    await ask(request);
  } catch (error) {
    return error instanceof AppError ? error.key : String(error);
  }
  return undefined;
}

describe('the vault service, off the browser', () => {
  it('creates a vault, stores an account, and writes nothing readable to disk', async () => {
    await ask({ type: 'vault/create', protection: { mode: 'device' } });
    await ask({ type: 'vault/mutate', mutation: { op: 'items/add', items: [account('Example')] } });

    const now = await status();
    expect(now.state === 'unlocked' && now.data.items.map((item) => item.issuer)).toEqual(['Example']);
    expect(platform.changes).toBeGreaterThan(0);
    expect(platform.disk.dump()).not.toContain(SECRET);
    expect(platform.disk.dump()).not.toContain('Example');
  });

  it('locks a password-protected vault, keeps its key in memory only, and opens it with the password alone', async () => {
    await ask({ type: 'vault/create', protection: { mode: 'passphrase', password: PASSWORD } });
    await ask({ type: 'vault/mutate', mutation: { op: 'items/add', items: [account('Example')] } });
    expect(platform.memory.dump()).not.toBe('{}');

    await ask({ type: 'vault/lock' });
    expect(await status()).toEqual({ state: 'locked', hasRecovery: false });
    expect(platform.locked).toBe(true);
    expect(platform.memory.dump()).toBe('{}');
    expect(platform.disk.dump()).not.toContain(SECRET);
    expect(platform.disk.dump()).not.toContain(PASSWORD);

    expect(await refusal({ type: 'vault/unlock', password: 'not the password' })).toBe('error.wrongMasterPassword');
    const opened = (await ask({ type: 'vault/unlock', password: PASSWORD })) as VaultStatus;
    expect(opened.state === 'unlocked' && opened.data.items).toHaveLength(1);
    expect(platform.locked).toBe(false);
  });

  it('applies twenty writes sent at once, every one of them', async () => {
    await ask({ type: 'vault/create', protection: { mode: 'device' } });
    const issuers = Array.from({ length: 20 }, (_, index) => `Service ${index}`);

    await Promise.all(
      issuers.map((issuer) => ask({ type: 'vault/mutate', mutation: { op: 'items/add', items: [account(issuer)] } })),
    );

    const now = await status();
    expect(now.state === 'unlocked' && now.data.items.map((item) => item.issuer).sort()).toEqual([...issuers].sort());
  });

  it('will not restore an entry with nothing in it, and restores one that has', async () => {
    await ask({ type: 'vault/create', protection: { mode: 'device' } });
    const real = account('Example');
    // The deletion of an account this vault never had, as builds before 0.4
    // kept it: no key, no name. Restored, it would be an account that makes
    // no codes, sent to every device.
    const empty: VaultItem = { ...account('Gone'), id: 'empty', issuer: '', label: '', secret: '' };
    await ask({ type: 'vault/mutate', mutation: { op: 'items/add', items: [real, empty] } });
    await ask({ type: 'vault/mutate', mutation: { op: 'items/delete', id: real.id } });
    await ask({ type: 'vault/mutate', mutation: { op: 'items/delete', id: empty.id } });

    expect(await refusal({ type: 'vault/mutate', mutation: { op: 'items/restore', id: empty.id } })).toBe(
      'error.restoreEmpty',
    );
    await ask({ type: 'vault/mutate', mutation: { op: 'items/restore', id: real.id } });

    const now = await status();
    const live = now.state === 'unlocked' ? now.data.items.filter((item) => item.deletedAt === null) : [];
    expect(live.map((item) => item.id)).toEqual([real.id]);
  });

  it('locks when the platform says the auto-lock timer fired', async () => {
    await ask({ type: 'vault/create', protection: { mode: 'passphrase', password: PASSWORD } });
    expect(platform.timerSet.get('authx.autolock')).toEqual({ minutes: 15, repeat: false });

    onTimer('authx.autolock');
    await expect.poll(async () => (await status()).state).toBe('locked');
  });

  it('offers no account when the build has no sync server', async () => {
    await ask({ type: 'vault/create', protection: { mode: 'device' } });
    expect(await ask({ type: 'provider/offered' })).toEqual({ providers: [], inTab: false });
    expect(await refusal({ type: 'account/startSignUp', email: 'me@example.com', password: PASSWORD })).toBe(
      'error.syncUnavailable',
    );
  });

  it('answers a refusal with the key the page translates', async () => {
    expect(await toEnvelope(ask({ type: 'vault/unlock', password: PASSWORD }))).toMatchObject({
      ok: false,
      key: 'error.noVault',
    });
  });
});
