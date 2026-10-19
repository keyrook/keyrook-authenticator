import { describe, expect, it } from 'vitest';
import {
  DecryptionError,
  exportDataKey,
  exportPairingKeys,
  generateDataKey,
  importPairingKeys,
  newPairingKeys,
  pairingCode,
  unwrapPairedDataKey,
  wrapDataKeyForPairing,
} from '../src/index.js';

/**
 * Joining by approval, attacked the way a hostile server would: it carries
 * every public key between the two browsers, so it tries swapping each one,
 * replaying a wrap into another pairing, and searching for a colliding code.
 */
const ID = 'pairing-1';

describe('the code both browsers show', () => {
  it('is fifteen Crockford characters in three groups, the same on both sides', async () => {
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const code = await pairingCode(ID, requester.publicKey, approver.publicKey);
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(await pairingCode(ID, requester.publicKey, approver.publicKey)).toBe(code);
  });

  it('changes when the server swaps either key, or replays the keys into another pairing', async () => {
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const server = await newPairingKeys();
    const honest = await pairingCode(ID, requester.publicKey, approver.publicKey);

    // The approver computes over the key it was handed; the requester over its own.
    expect(await pairingCode(ID, server.publicKey, approver.publicKey)).not.toBe(honest);
    expect(await pairingCode(ID, requester.publicKey, server.publicKey)).not.toBe(honest);
    expect(await pairingCode('pairing-2', requester.publicKey, approver.publicKey)).not.toBe(honest);
    // Order matters: which side is which is part of what is compared.
    expect(await pairingCode(ID, approver.publicKey, requester.publicKey)).not.toBe(honest);
  });

  it('refuses keys that are not points on the curve, and a pairing with itself', async () => {
    const keys = await newPairingKeys();
    const bogus = btoa(String.fromCharCode(4, ...new Array(64).fill(1)));
    await expect(pairingCode(ID, keys.publicKey, bogus)).rejects.toThrow(/Malformed/);
    await expect(pairingCode(ID, keys.publicKey, 'not base64!')).rejects.toThrow(/Malformed/);
    await expect(pairingCode(ID, keys.publicKey, keys.publicKey)).rejects.toThrow(/two different keys/);
  });
});

describe('the data key, carried from the approving browser', () => {
  it('arrives intact at the browser whose key the codes were compared over', async () => {
    const dataKey = await generateDataKey();
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const box = await wrapDataKeyForPairing(dataKey, approver, ID, requester.publicKey);
    const received = await unwrapPairedDataKey(requester, ID, approver.publicKey, box);
    expect(await exportDataKey(received)).toBe(await exportDataKey(dataKey));
  });

  it('is useless to a server that swapped in its own key for the requester', async () => {
    // The approver, deceived, wraps for the server's key; the server holds a
    // wrap it can open — which is exactly why the codes must be compared.
    // What this asserts is the other half: the real requester cannot be fed
    // that wrap as if it were meant for it.
    const dataKey = await generateDataKey();
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const server = await newPairingKeys();
    const forServer = await wrapDataKeyForPairing(dataKey, approver, ID, server.publicKey);
    await expect(unwrapPairedDataKey(requester, ID, approver.publicKey, forServer)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('cannot be replaced by a key of the server’s choosing under the approver’s name', async () => {
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const server = await newPairingKeys();
    const planted = await wrapDataKeyForPairing(await generateDataKey(), server, ID, requester.publicKey);
    // Opened against the approver key the codes were compared over: refused.
    await expect(unwrapPairedDataKey(requester, ID, approver.publicKey, planted)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('cannot be replayed into another pairing, or tampered with', async () => {
    const dataKey = await generateDataKey();
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const box = await wrapDataKeyForPairing(dataKey, approver, ID, requester.publicKey);
    await expect(unwrapPairedDataKey(requester, 'pairing-2', approver.publicKey, box)).rejects.toBeInstanceOf(
      DecryptionError,
    );
    const flipped = { ...box, ct: box.ct.slice(0, -4) + (box.ct.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA') };
    await expect(unwrapPairedDataKey(requester, ID, approver.publicKey, flipped)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('survives the requester keeping its keys in session storage while it waits', async () => {
    const dataKey = await generateDataKey();
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const stored = JSON.parse(JSON.stringify(await exportPairingKeys(requester)));
    const restored = await importPairingKeys(stored);
    const box = await wrapDataKeyForPairing(dataKey, approver, ID, requester.publicKey);
    expect(await exportDataKey(await unwrapPairedDataKey(restored, ID, approver.publicKey, box))).toBe(
      await exportDataKey(dataKey),
    );
  });
});
