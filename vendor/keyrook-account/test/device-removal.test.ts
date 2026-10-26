import { describe, expect, it } from 'vitest';
import {
  checkDeviceRemovalProof,
  generateDataKey,
  HttpSyncAdapter,
  makeDeviceRemovalProof,
  SyncHttpError,
  type DeviceRemovalProof,
  type Fetcher,
} from '../src/index.js';

/**
 * A removal proof is what lets a device act on being removed while the server
 * stays unable to order it. These play the server: every way it could make,
 * bend or replay a proof without the product's key must answer false, and
 * nothing it sends may make the check throw.
 */
const ACCOUNT = '6f1c2a9e-0b4d-4c3e-9a8f-1e2d3c4b5a69';
const DEVICE = { accountId: ACCOUNT, product: 'authenticator', deviceId: 'b8e1f0c2-laptop' };
const SIGNED_IN = 1_790_000_000_000;
const REMOVED = SIGNED_IN + 7 * 24 * 60 * 60_000;
const here = { ...DEVICE, signedInAt: SIGNED_IN };

async function made() {
  const key = await generateDataKey();
  return { key, proof: await makeDeviceRemovalProof(key, DEVICE, REMOVED) };
}

describe('a removal proof', () => {
  it('checks out for the device it names, under the key that made it', async () => {
    const { key, proof } = await made();
    expect(proof.removedAt).toBe(REMOVED);
    expect(await checkDeviceRemovalProof(key, here, proof)).toBe(true);
  });

  it('cannot be made without the product’s key: one under another key is refused', async () => {
    const { proof } = await made();
    expect(await checkDeviceRemovalProof(await generateDataKey(), here, proof)).toBe(false);
  });

  it('cannot be moved to another device, account or product', async () => {
    const { key, proof } = await made();
    for (const other of [
      { ...here, deviceId: 'another-device' },
      { ...here, deviceId: `${DEVICE.deviceId}x` },
      { ...here, accountId: '00000000-0000-4000-8000-000000000000' },
      { ...here, product: 'passhold' },
    ]) {
      expect(await checkDeviceRemovalProof(key, other, proof)).toBe(false);
    }
  });

  it('names one device whatever its id holds: colons in it are part of it', async () => {
    const key = await generateDataKey();
    const tricky = { ...DEVICE, deviceId: `${REMOVED}:laptop` };
    const proof = await makeDeviceRemovalProof(key, tricky, REMOVED);
    expect(await checkDeviceRemovalProof(key, { ...tricky, signedInAt: SIGNED_IN }, proof)).toBe(true);
    expect(await checkDeviceRemovalProof(key, { ...DEVICE, deviceId: 'laptop', signedInAt: SIGNED_IN }, proof)).toBe(false);
  });

  it('cannot be redated: the time is covered by the MAC', async () => {
    const { key, proof } = await made();
    expect(await checkDeviceRemovalProof(key, here, { ...proof, removedAt: REMOVED + 1 })).toBe(false);
    expect(await checkDeviceRemovalProof(key, here, { ...proof, removedAt: REMOVED - 1 })).toBe(false);
  });

  it('cannot be replayed after the device signs in again: a proof older than the session is refused', async () => {
    const { key, proof } = await made();
    // The device heard it, took the account's data off, and was signed in again an hour later.
    expect(await checkDeviceRemovalProof(key, { ...DEVICE, signedInAt: REMOVED + 60 * 60_000 }, proof)).toBe(false);
    // The moment of sign-in itself still counts as this session.
    expect(await checkDeviceRemovalProof(key, { ...DEVICE, signedInAt: REMOVED }, proof)).toBe(true);
  });

  it('answers false, never throws, for whatever a server sends instead', async () => {
    const { key, proof } = await made();
    const flipped = Uint8Array.from(atob(proof.mac), (char) => char.charCodeAt(0));
    flipped[0] ^= 1;
    const bent: unknown[] = [
      undefined,
      null,
      'proof',
      42,
      [],
      {},
      { removedAt: REMOVED },
      { mac: proof.mac },
      { ...proof, mac: btoa(String.fromCharCode(...flipped)) },
      { ...proof, mac: '' },
      { ...proof, mac: '!!!not base64!!!' },
      { ...proof, mac: proof.mac.slice(0, 20) },
      { ...proof, mac: 'A'.repeat(10_000) },
      { ...proof, mac: 7 },
      { ...proof, removedAt: String(REMOVED) },
      { ...proof, removedAt: REMOVED + 0.5 },
      { ...proof, removedAt: -1 },
      { ...proof, removedAt: Number.MAX_VALUE },
      { ...proof, removedAt: Number.NaN },
    ];
    for (const sent of bent) expect(await checkDeviceRemovalProof(key, here, sent)).toBe(false);
  });

  it('refuses to be made or checked for a device it cannot name', async () => {
    const key = await generateDataKey();
    await expect(makeDeviceRemovalProof(key, { ...DEVICE, deviceId: '' })).rejects.toThrow('Malformed device id.');
    await expect(makeDeviceRemovalProof(key, { ...DEVICE, deviceId: 'x'.repeat(129) })).rejects.toThrow('Malformed device id.');
    await expect(makeDeviceRemovalProof(key, { ...DEVICE, accountId: 'a:b' })).rejects.toThrow('Malformed account id.');
    await expect(makeDeviceRemovalProof(key, { ...DEVICE, product: 'Pass:hold' })).rejects.toThrow('Not a Keyrook product name.');
    await expect(makeDeviceRemovalProof(key, DEVICE, 0)).rejects.toThrow('Malformed removal time.');
    await expect(checkDeviceRemovalProof(key, { ...DEVICE, signedInAt: Number.NaN }, null)).rejects.toThrow('Malformed sign-in time.');
  });
});

describe('the client', () => {
  const answering =
    (status: number, body: unknown): Fetcher =>
    async () =>
      new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  it('hands a removal to the product as one, proof and all, and forgets the tokens', async () => {
    const proof: DeviceRemovalProof = { removedAt: REMOVED, mac: 'bWFj' };
    let tokens: { accessToken: string; refreshToken: string } | null = { accessToken: 'a', refreshToken: 'r' };
    const api = new HttpSyncAdapter({
      baseUrl: '',
      fetcher: answering(401, { error: 'device_removed', message: 'This device was removed from the account.', proof }),
      tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) },
    });
    const error = await api.pull(0).then(
      () => null,
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(SyncHttpError);
    expect(error).toMatchObject({ status: 401, code: 'device_removed', proof });
    expect(tokens).toBeNull();
  });

  it('says a removal without a proof had none, and carries a proof on no other answer', async () => {
    let tokens: { accessToken: string; refreshToken: string } | null = { accessToken: 'a', refreshToken: 'r' };
    const store = { get: async () => tokens, set: async (next: typeof tokens) => void (tokens = next), clear: async () => void (tokens = null) };
    const removed = new HttpSyncAdapter({ baseUrl: '', fetcher: answering(401, { error: 'device_removed', message: 'x' }), tokens: store });
    await expect(removed.pull(0)).rejects.toMatchObject({ code: 'device_removed', proof: null });

    tokens = { accessToken: 'a', refreshToken: 'r' };
    const other = new HttpSyncAdapter({
      baseUrl: '',
      fetcher: answering(401, { error: 'unauthorized', message: 'x', proof: { removedAt: REMOVED, mac: 'bWFj' } }),
      tokens: store,
    });
    const error = (await other.pull(0).catch((caught: unknown) => caught)) as SyncHttpError;
    expect(error.code).toBe('unauthorized');
    expect(error.proof).toBeUndefined();
  });
});
