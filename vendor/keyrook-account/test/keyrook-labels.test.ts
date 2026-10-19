import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CURVE, publicPointOf } from '../src/crypto/ecdh.js';
import {
  DecryptionError,
  deriveAccountKeys,
  deriveKeyCheck,
  deriveProductKeyCheck,
  deriveRootCheck,
  exportDataKey,
  fromBase64,
  importDataKey,
  importPairingKeys,
  openProductBox,
  openRootPin,
  openRootWithPassword,
  openRootWithRecoveryKey,
  productPairingCode,
  rootConfirmCode,
  unwrapPairedProductKey,
  type AccountRoot,
} from '../src/index.js';

/**
 * The keyrook: labels of keys per product — the account's root, each
 * product's box and pin, the product key checks, pairing bound to a product,
 * the root confirm code — frozen before any product stores anything under
 * them. These fixtures were made once, by the code at keyrook-account 8a003eb,
 * and are never regenerated: this package must keep deriving the same values
 * and keep opening the same boxes.
 *
 * A failure here means a label, a parameter or a format changed, and every
 * root, box and pin made since would stop opening. Put it back. A new format
 * is a new label beside the old one, never a replacement for it.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/keyrook-labels.json', import.meta.url), 'utf8'));
const { PASSWORD, ACCOUNT_KDF, ACCOUNT_ID, PRODUCT, PRODUCT_KEY, RECOVERY_KEY, PAIRING_ID, SHEET_VERIFIED_AT, ROOT_PKCS8 } =
  fixture.inputs;

async function fixtureRoot(): Promise<AccountRoot> {
  const privateKey = await crypto.subtle.importKey('pkcs8', fromBase64(ROOT_PKCS8) as BufferSource, CURVE, true, ['deriveBits']);
  return { privateKey, publicKey: await publicPointOf(privateKey) };
}

describe('the account’s root', () => {
  it('opens under the password (keyrook:v1:root-wrap, keyrook.root:v1:<account>:password)', async () => {
    const keys = await deriveAccountKeys(PASSWORD, ACCOUNT_KDF);
    expect((await openRootWithPassword(fixture.rootPasswordWrap, keys, ACCOUNT_ID)).publicKey).toBe(fixture.rootPublicKey);
  });

  it('opens under the recovery key (keyrook:v1:root-recovery, keyrook.root:v1:<account>:recovery)', async () => {
    expect((await openRootWithRecoveryKey(fixture.rootRecoveryWrap, RECOVERY_KEY, ACCOUNT_ID)).publicKey).toBe(fixture.rootPublicKey);
  });

  it('proves itself the same way (keyrook:v1:root-check)', async () => {
    expect(await deriveRootCheck(await fixtureRoot())).toBe(fixture.rootCheck);
  });

  it('shows the same confirm code on both screens (keyrook:v1:root-confirm)', async () => {
    expect(await rootConfirmCode(ACCOUNT_ID, fixture.rootPublicKey, 'join')).toBe(fixture.rootConfirmCode.join);
    expect(await rootConfirmCode(ACCOUNT_ID, fixture.rootPublicKey, 'rotate')).toBe(fixture.rootConfirmCode.rotate);
  });
});

describe('a product’s key', () => {
  it('opens from its box with the root (keyrook:v1:product-box, keyrook.product-box:v1:<account>:<product>)', async () => {
    expect(await exportDataKey(await openProductBox(fixture.productBox, await fixtureRoot(), ACCOUNT_ID, PRODUCT))).toBe(PRODUCT_KEY);
  });

  it('opens its pin (keyrook.root-pin:v1:<account>:<product>)', async () => {
    expect(await openRootPin(await importDataKey(PRODUCT_KEY), fixture.pin, ACCOUNT_ID, PRODUCT)).toEqual({
      root: fixture.rootPublicKey,
      sheetVerifiedAt: SHEET_VERIFIED_AT,
    });
  });

  it('proves itself the same way (keyrook:v1:key-check:<product>), and Keyrook Authenticator’s as it always has', async () => {
    const key = await importDataKey(PRODUCT_KEY);
    expect(await deriveProductKeyCheck('passhold', key)).toBe(fixture.productKeyCheck.passhold);
    expect(await deriveProductKeyCheck('authenticator', key)).toBe(fixture.productKeyCheck.authenticator);
    expect(fixture.productKeyCheck.authenticator).toBe(await deriveKeyCheck(key));
  });
});

describe('moving a product’s key to a new browser', () => {
  it('shows the same code on both screens (keyrook:v1:pairing-code)', async () => {
    const { requester, approverPublicKey, code } = fixture.pairing;
    expect(await productPairingCode(PRODUCT, ACCOUNT_ID, PAIRING_ID, requester.publicKey, approverPublicKey)).toBe(code);
  });

  it('opens the wrap the approving browser made (keyrook:v1:pairing-wrap, keyrook.pairing:v1)', async () => {
    const { requester, approverPublicKey, wrap } = fixture.pairing;
    const keys = await importPairingKeys(requester);
    expect(await exportDataKey(await unwrapPairedProductKey(PRODUCT, ACCOUNT_ID, keys, PAIRING_ID, approverPublicKey, wrap))).toBe(
      PRODUCT_KEY,
    );
  });
});

describe('these fixtures notice a change', () => {
  it('because each box opens only for its own account and product', async () => {
    const root = await fixtureRoot();
    const other = '00000000-0000-4000-8000-000000000000';
    await expect(openProductBox(fixture.productBox, root, ACCOUNT_ID, 'authenticator')).rejects.toBeInstanceOf(DecryptionError);
    await expect(openProductBox(fixture.productBox, root, other, PRODUCT)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootPin(await importDataKey(PRODUCT_KEY), fixture.pin, ACCOUNT_ID, 'authenticator')).rejects.toBeInstanceOf(
      DecryptionError,
    );
    const keys = await deriveAccountKeys(PASSWORD, ACCOUNT_KDF);
    await expect(openRootWithPassword(fixture.rootPasswordWrap, keys, other)).rejects.toBeInstanceOf(DecryptionError);
    const { requester, approverPublicKey, wrap } = fixture.pairing;
    await expect(
      unwrapPairedProductKey('authenticator', ACCOUNT_ID, await importPairingKeys(requester), PAIRING_ID, approverPublicKey, wrap),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it('because a derived value moves with any change to its input', async () => {
    expect(await rootConfirmCode(ACCOUNT_ID, fixture.rootPublicKey, 'join')).not.toBe(fixture.rootConfirmCode.rotate);
    const { requester, approverPublicKey, code } = fixture.pairing;
    expect(await productPairingCode('authenticator', ACCOUNT_ID, PAIRING_ID, requester.publicKey, approverPublicKey)).not.toBe(code);
    expect(fixture.productKeyCheck.passhold).not.toBe(fixture.productKeyCheck.authenticator);
  });
});
