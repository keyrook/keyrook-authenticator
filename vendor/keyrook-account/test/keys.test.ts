import { describe, expect, it } from 'vitest';
import {
  AUTHENTICATOR,
  DecryptionError,
  deriveAccountKeys,
  deriveKeyCheck,
  deriveProductKeyCheck,
  deriveRootCheck,
  exportDataKey,
  generateDataKey,
  generateRecoveryKey,
  newAccountKdfParams,
  newAccountRoot,
  newPairingKeys,
  openProductBox,
  openRootPin,
  openRootWithPassword,
  openRootWithRecoveryKey,
  pairingCode,
  PASSHOLD,
  productPairingCode,
  rootConfirmCode,
  seal,
  sealJson,
  sealProductBox,
  sealRootPin,
  unwrapPairedDataKey,
  unwrapPairedProductKey,
  wrapDataKeyForPairing,
  wrapProductKeyForPairing,
  wrapRootUnderPassword,
  wrapRootUnderRecoveryKey,
  type ProductBox,
} from '../src/index.js';

const ACCOUNT = 'acc-1';
const OTHER_ACCOUNT = 'acc-2';
const PASSWORD = 'correct horse battery staple';
const KDF = newAccountKdfParams(100_000);

const keysFor = (password: string) => deriveAccountKeys(password, KDF);
const sameKey = async (a: CryptoKey, b: CryptoKey) => (await exportDataKey(a)) === (await exportDataKey(b));

describe('the root, under the password', () => {
  it('opens with the password, and takes its public half from the key it opened', async () => {
    const root = await newAccountRoot();
    const box = await wrapRootUnderPassword(root, await keysFor(PASSWORD), ACCOUNT);
    const opened = await openRootWithPassword(box, await keysFor(PASSWORD), ACCOUNT);
    expect(opened.publicKey).toBe(root.publicKey);
  });

  it('does not open with another password', async () => {
    const box = await wrapRootUnderPassword(await newAccountRoot(), await keysFor(PASSWORD), ACCOUNT);
    await expect(openRootWithPassword(box, await keysFor(`${PASSWORD}!`), ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('does not open for another account, or as the recovery key’s wrap', async () => {
    const keys = await keysFor(PASSWORD);
    const box = await wrapRootUnderPassword(await newAccountRoot(), keys, ACCOUNT);
    await expect(openRootWithPassword(box, keys, OTHER_ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootWithRecoveryKey(box, generateRecoveryKey(), ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('cannot be a root of the server’s choosing: it has no key to seal one under', async () => {
    // A hostile server seals its own root under a key it made up. Without the
    // password it cannot make a box the password opens, so no root of its
    // choosing ever reaches a product as the account's.
    const theirs = await newAccountRoot();
    const madeUp = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', theirs.privateKey));
    const forged = await seal(madeUp, pkcs8, new TextEncoder().encode(`keyrook.root:v1:${ACCOUNT}:password`));
    await expect(openRootWithPassword(forged, await keysFor(PASSWORD), ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('survives a password change: the same root, wrapped again', async () => {
    const root = await newAccountRoot();
    const old = await keysFor(PASSWORD);
    const opened = await openRootWithPassword(await wrapRootUnderPassword(root, old, ACCOUNT), old, ACCOUNT);
    const next = await keysFor('an entirely different long passphrase');
    const rewrapped = await wrapRootUnderPassword(opened, next, ACCOUNT);
    expect((await openRootWithPassword(rewrapped, next, ACCOUNT)).publicKey).toBe(root.publicKey);
    await expect(openRootWithPassword(rewrapped, old, ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('keeps the password’s three keys apart: the auth hash sent to the server opens nothing', async () => {
    const keys = await keysFor(PASSWORD);
    const box = await wrapRootUnderPassword(await newAccountRoot(), keys, ACCOUNT);
    const asKey = await crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(keys.authHash), (c) => c.charCodeAt(0)) as BufferSource,
      'AES-GCM',
      false,
      ['decrypt'],
    );
    await expect(openRootWithPassword(box, { ...keys, rootWrapKey: asKey }, ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootWithPassword(box, { ...keys, rootWrapKey: keys.stretchedKey }, ACCOUNT)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });
});

describe('proof of holding the root', () => {
  it('is the same however the root was opened, and another root’s differs', async () => {
    const root = await newAccountRoot();
    const keys = await keysFor(PASSWORD);
    const reopened = await openRootWithPassword(await wrapRootUnderPassword(root, keys, ACCOUNT), keys, ACCOUNT);
    expect(await deriveRootCheck(reopened)).toBe(await deriveRootCheck(root));
    expect(await deriveRootCheck(await newAccountRoot())).not.toBe(await deriveRootCheck(root));
  });

  it('needs the private half: the public half wearing another key proves nothing', async () => {
    const root = await newAccountRoot();
    const other = await newAccountRoot();
    expect(await deriveRootCheck({ ...other, publicKey: root.publicKey })).not.toBe(await deriveRootCheck(root));
  });
});

describe('the root, under the recovery key', () => {
  it('opens with the printed key, however it is typed', async () => {
    const root = await newAccountRoot();
    const recoveryKey = generateRecoveryKey();
    const box = await wrapRootUnderRecoveryKey(root, recoveryKey, ACCOUNT);
    const typed = recoveryKey.toLowerCase().replaceAll('-', ' ');
    expect((await openRootWithRecoveryKey(box, typed, ACCOUNT)).publicKey).toBe(root.publicKey);
  });

  it('does not open with another key, and says when the input is no key at all', async () => {
    const box = await wrapRootUnderRecoveryKey(await newAccountRoot(), generateRecoveryKey(), ACCOUNT);
    await expect(openRootWithRecoveryKey(box, generateRecoveryKey(), ACCOUNT)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootWithRecoveryKey(box, PASSWORD, ACCOUNT)).rejects.toThrow(/does not look like a recovery key/);
  });
});

describe("a product's box", () => {
  it('opens to the same key, with the root it was sealed to', async () => {
    const root = await newAccountRoot();
    const productKey = await generateDataKey();
    const box = await sealProductBox(productKey, root.publicKey, ACCOUNT, PASSHOLD);
    expect(await sameKey(await openProductBox(box, root, ACCOUNT, PASSHOLD), productKey)).toBe(true);
  });

  it('opens only with the root’s private half: not another root’s, not one wearing this root’s public half', async () => {
    const root = await newAccountRoot();
    const box = await sealProductBox(await generateDataKey(), root.publicKey, ACCOUNT, PASSHOLD);
    const other = await newAccountRoot();
    await expect(openProductBox(box, other, ACCOUNT, PASSHOLD)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openProductBox(box, { ...other, publicKey: root.publicKey }, ACCOUNT, PASSHOLD)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('cannot be handed to another product, or to another account', async () => {
    const root = await newAccountRoot();
    const authenticatorBox = await sealProductBox(await generateDataKey(), root.publicKey, ACCOUNT, AUTHENTICATOR);
    await expect(openProductBox(authenticatorBox, root, ACCOUNT, PASSHOLD)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openProductBox(authenticatorBox, root, OTHER_ACCOUNT, AUTHENTICATOR)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('refuses a box tampered with anywhere', async () => {
    const root = await newAccountRoot();
    const box = await sealProductBox(await generateDataKey(), root.publicKey, ACCOUNT, PASSHOLD);
    const another = await sealProductBox(await generateDataKey(), root.publicKey, ACCOUNT, PASSHOLD);
    const flip = (value: string) => (value[0] === 'A' ? 'B' : 'A') + value.slice(1);
    const tampered: ProductBox[] = [
      { ...box, epk: another.epk },
      { ...box, iv: another.iv },
      { ...box, ct: flip(box.ct) },
      { ...box, epk: 'not a point' },
    ];
    for (const bad of tampered) {
      await expect(openProductBox(bad, root, ACCOUNT, PASSHOLD)).rejects.toBeInstanceOf(DecryptionError);
    }
  });

  it('leaves one product holding nothing that opens another’s', async () => {
    // The whole point of keys per product. A Passhold device holds its own
    // key, its pin and the root's public half, and every box the server will
    // hand it. None of that opens Authenticator's box; only the root's private
    // half does, and that exists only while a person types the password or
    // the recovery key.
    const root = await newAccountRoot();
    const authenticatorKey = await generateDataKey();
    const passholdKey = await generateDataKey();
    const authenticatorBox = await sealProductBox(authenticatorKey, root.publicKey, ACCOUNT, AUTHENTICATOR);
    const passholdBox = await sealProductBox(passholdKey, root.publicKey, ACCOUNT, PASSHOLD);

    // What a Passhold device can build from what it holds: a root made of its
    // own key material, wearing the account root's public half.
    const fromItsKey = { ...(await newAccountRoot()), publicKey: root.publicKey };
    await expect(openProductBox(authenticatorBox, fromItsKey, ACCOUNT, AUTHENTICATOR)).rejects.toBeInstanceOf(
      DecryptionError,
    );
    // And the keys themselves share nothing.
    expect(await sameKey(await openProductBox(passholdBox, root, ACCOUNT, PASSHOLD), authenticatorKey)).toBe(false);
  });
});

describe("a product's pin", () => {
  it('remembers the root and when the recovery key last opened it here', async () => {
    const productKey = await generateDataKey();
    const root = await newAccountRoot();
    const pin = { root: root.publicKey, sheetVerifiedAt: 1_760_000_000_000 };
    const box = await sealRootPin(productKey, pin, ACCOUNT, PASSHOLD);
    expect(await openRootPin(productKey, box, ACCOUNT, PASSHOLD)).toEqual(pin);
  });

  it('cannot be written by the server, or moved to another product or account', async () => {
    const productKey = await generateDataKey();
    const pin = { root: (await newAccountRoot()).publicKey, sheetVerifiedAt: null };
    const forged = await sealRootPin(await generateDataKey(), pin, ACCOUNT, PASSHOLD);
    await expect(openRootPin(productKey, forged, ACCOUNT, PASSHOLD)).rejects.toBeInstanceOf(DecryptionError);

    const real = await sealRootPin(productKey, pin, ACCOUNT, PASSHOLD);
    await expect(openRootPin(productKey, real, ACCOUNT, AUTHENTICATOR)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootPin(productKey, real, OTHER_ACCOUNT, PASSHOLD)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('refuses a pin that names no real root, even one its own product wrote', async () => {
    const productKey = await generateDataKey();
    const bad = await sealJson(
      productKey,
      { root: 'not a point', sheetVerifiedAt: null },
      new TextEncoder().encode(`keyrook.root-pin:v1:${ACCOUNT}:${PASSHOLD}`),
    );
    await expect(openRootPin(productKey, bad, ACCOUNT, PASSHOLD)).rejects.toThrow(/Malformed account key/);
  });
});

describe('proof of holding a product’s key', () => {
  it('is the one every server already checks, for Keyrook Authenticator', async () => {
    const key = await generateDataKey();
    expect(await deriveProductKeyCheck(AUTHENTICATOR, key)).toBe(await deriveKeyCheck(key));
  });

  it('is its own for every other product', async () => {
    const key = await generateDataKey();
    const passhold = await deriveProductKeyCheck(PASSHOLD, key);
    expect(passhold).toBe(await deriveProductKeyCheck(PASSHOLD, key));
    expect(passhold).not.toBe(await deriveKeyCheck(key));
    expect(passhold).not.toBe(await deriveProductKeyCheck('another-product', key));
  });

  it('takes no name that could be read two ways', async () => {
    const key = await generateDataKey();
    for (const name of ['', 'Passhold', 'pass:hold', 'pass hold', '1password']) {
      await expect(deriveProductKeyCheck(name, key)).rejects.toThrow(/Not a Keyrook product name/);
    }
  });
});

describe('moving a product’s key to a new browser', () => {
  async function pair() {
    return { requester: await newPairingKeys(), approver: await newPairingKeys(), pairingId: 'pairing-1' };
  }

  it('shows the same code on both screens of one product', async () => {
    const { requester, approver, pairingId } = await pair();
    const seenByRequester = await productPairingCode(PASSHOLD, ACCOUNT, pairingId, requester.publicKey, approver.publicKey);
    const seenByApprover = await productPairingCode(PASSHOLD, ACCOUNT, pairingId, requester.publicKey, approver.publicKey);
    expect(seenByRequester).toBe(seenByApprover);
  });

  it('shows two codes when the server routes one product’s request to another’s browser', async () => {
    const { requester, approver, pairingId } = await pair();
    const passhold = await productPairingCode(PASSHOLD, ACCOUNT, pairingId, requester.publicKey, approver.publicKey);
    const authenticator = await productPairingCode(AUTHENTICATOR, ACCOUNT, pairingId, requester.publicKey, approver.publicKey);
    expect(passhold).not.toBe(authenticator);
    expect(passhold).not.toBe(await pairingCode(pairingId, requester.publicKey, approver.publicKey));
    expect(passhold).not.toBe(
      await productPairingCode(PASSHOLD, OTHER_ACCOUNT, pairingId, requester.publicKey, approver.publicKey),
    );
  });

  it('carries the key to the browser of the same product and account', async () => {
    const { requester, approver, pairingId } = await pair();
    const key = await generateDataKey();
    const box = await wrapProductKeyForPairing(PASSHOLD, ACCOUNT, key, approver, pairingId, requester.publicKey);
    expect(await sameKey(await unwrapPairedProductKey(PASSHOLD, ACCOUNT, requester, pairingId, approver.publicKey, box), key)).toBe(
      true,
    );
  });

  it('delivers no byte of Authenticator’s key to a Passhold browser', async () => {
    // The server pairs a Passhold browser with an Authenticator browser. Even
    // if a person approves anyway, the wrap opens only as Authenticator's.
    const { requester, approver, pairingId } = await pair();
    const authenticatorKey = await generateDataKey();
    const box = await wrapProductKeyForPairing(AUTHENTICATOR, ACCOUNT, authenticatorKey, approver, pairingId, requester.publicKey);
    await expect(
      unwrapPairedProductKey(PASSHOLD, ACCOUNT, requester, pairingId, approver.publicKey, box),
    ).rejects.toBeInstanceOf(DecryptionError);
    await expect(
      unwrapPairedProductKey(AUTHENTICATOR, OTHER_ACCOUNT, requester, pairingId, approver.publicKey, box),
    ).rejects.toBeInstanceOf(DecryptionError);
    await expect(
      unwrapPairedProductKey(AUTHENTICATOR, ACCOUNT, requester, 'pairing-2', approver.publicKey, box),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it('keeps the two versions apart: neither wrap opens as the other', async () => {
    const { requester, approver, pairingId } = await pair();
    const key = await generateDataKey();
    const v1 = await wrapDataKeyForPairing(key, approver, pairingId, requester.publicKey);
    await expect(
      unwrapPairedProductKey(AUTHENTICATOR, ACCOUNT, requester, pairingId, approver.publicKey, v1),
    ).rejects.toBeInstanceOf(DecryptionError);
    const v2 = await wrapProductKeyForPairing(AUTHENTICATOR, ACCOUNT, key, approver, pairingId, requester.publicKey);
    await expect(unwrapPairedDataKey(requester, pairingId, approver.publicKey, v2)).rejects.toBeInstanceOf(DecryptionError);
  });
});

describe('the code that vouches for a root', () => {
  it('is the same on both screens, and moves with the account, the root and the purpose', async () => {
    const root = await newAccountRoot();
    const code = await rootConfirmCode(ACCOUNT, root.publicKey, 'join');
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(await rootConfirmCode(ACCOUNT, root.publicKey, 'join')).toBe(code);
    expect(await rootConfirmCode(OTHER_ACCOUNT, root.publicKey, 'join')).not.toBe(code);
    expect(await rootConfirmCode(ACCOUNT, (await newAccountRoot()).publicKey, 'join')).not.toBe(code);
    expect(await rootConfirmCode(ACCOUNT, root.publicKey, 'rotate')).not.toBe(code);
  });

  it('refuses a root that is not a point on the curve', async () => {
    await expect(rootConfirmCode(ACCOUNT, 'not a point', 'join')).rejects.toThrow(/Malformed account key/);
  });
});
