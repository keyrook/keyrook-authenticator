import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkDeviceRemovalProof, importDataKey, makeDeviceRemovalProof } from '../src/index.js';

/**
 * The labels of a removal proof — the HKDF info `keyrook:v1:device-removed`
 * and the input `keyrook.device-removed:v1:<account>:<product>:<removedAt>:<deviceId>`
 * — frozen before any server keeps a proof made under them. These fixtures
 * were made once, by the code at keyrook-account 07fc86d, and are never
 * regenerated: a proof the account page or one product made must keep
 * checking out on a device that copied another version of this package.
 *
 * Any HKDF-SHA256 (empty salt) and HMAC-SHA256 makes the same values from
 * `inputs`; that is how the fixture was checked when it was made.
 *
 * A failure here means a label, a parameter or a format changed. Put it back;
 * a new format is a new label beside the old one.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/device-removed-labels.json', import.meta.url), 'utf8'));
const { ACCOUNT_ID, AUTHENTICATOR_KEY, PASSHOLD_KEY, DEVICE_ID, REMOVED_AT } = fixture.inputs;
const device = (product: string) => ({ accountId: ACCOUNT_ID, product, deviceId: DEVICE_ID });
const signedIn = (product: string) => ({ ...device(product), signedInAt: REMOVED_AT });

describe('a removal proof', () => {
  it('is made the same way (keyrook:v1:device-removed, keyrook.device-removed:v1:…)', async () => {
    expect(await makeDeviceRemovalProof(await importDataKey(AUTHENTICATOR_KEY), device('authenticator'), REMOVED_AT)).toEqual(fixture.authenticator);
    expect(await makeDeviceRemovalProof(await importDataKey(PASSHOLD_KEY), device('passhold'), REMOVED_AT)).toEqual(fixture.passhold);
  });

  it('checks out the same way', async () => {
    expect(await checkDeviceRemovalProof(await importDataKey(AUTHENTICATOR_KEY), signedIn('authenticator'), fixture.authenticator)).toBe(true);
    expect(await checkDeviceRemovalProof(await importDataKey(PASSHOLD_KEY), signedIn('passhold'), fixture.passhold)).toBe(true);
  });
});

describe('these fixtures notice a change', () => {
  it('because a proof checks out only for its own product, under its own key', async () => {
    expect(await checkDeviceRemovalProof(await importDataKey(PASSHOLD_KEY), signedIn('passhold'), fixture.authenticator)).toBe(false);
    expect(await checkDeviceRemovalProof(await importDataKey(AUTHENTICATOR_KEY), signedIn('passhold'), fixture.authenticator)).toBe(false);
    expect(await checkDeviceRemovalProof(await importDataKey(PASSHOLD_KEY), signedIn('authenticator'), fixture.passhold)).toBe(false);
  });

  it('because the time is part of what it covers', async () => {
    const later = { ...fixture.authenticator, removedAt: REMOVED_AT + 1 };
    expect(await checkDeviceRemovalProof(await importDataKey(AUTHENTICATOR_KEY), signedIn('authenticator'), later)).toBe(false);
  });
});
