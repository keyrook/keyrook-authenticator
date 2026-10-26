/**
 * Proof that a device was removed from the account by someone who holds the
 * product's key.
 *
 * Removing a device ends its session (`DELETE /account/devices/:id`); a
 * product may also take the account's data off a device it hears was removed.
 * The server is untrusted, so hearing it from the server is not enough: a
 * server that could say so on its own could empty every device at once. The
 * remover makes this proof with the product's key, the server keeps it as
 * sent, and the removed device checks it with the same key before it acts.
 * Without a proof that checks out, a device treats the answer as an ordinary
 * sign-out.
 *
 * A MAC, not a signature: every device of the product holds the key, and any
 * of them could already seal records that replace or delete the account's
 * data. The proof gives a key holder nothing it did not have; it denies the
 * server something it never had.
 */
import type { DeviceRemovalProof } from '../sync/protocol.js';
import { fromBase64, toBase64, utf8, wipe } from '../util/bytes.js';
import { assertAccountId, assertProductName } from './product.js';

/** HKDF info for the MAC key, from the product's key. Frozen. */
const REMOVAL_INFO = 'keyrook:v1:device-removed';

/** As the server caps a device id at sign-in. */
const MAX_DEVICE_ID = 128;

/** The device a proof is about, as the removed device knows itself. */
export interface RemovedDevice {
  accountId: string;
  /** The removed session's product. Its key makes and checks the proof; no other product's does. */
  product: string;
  /** The id the device chose and sends at sign-in (`DeviceSummary.deviceId`), not its session's id. */
  deviceId: string;
}

function assertDevice(device: RemovedDevice): void {
  assertAccountId(device.accountId);
  assertProductName(device.product);
  if (typeof device.deviceId !== 'string' || device.deviceId.length === 0 || device.deviceId.length > MAX_DEVICE_ID) {
    throw new Error('Malformed device id.');
  }
}

/**
 * What the MAC covers. The account id and the product name hold no colon
 * (`assertAccountId`, `assertProductName`) and the time is digits, so with the
 * device id last, whatever it holds, the string reads one way only. Frozen.
 */
const removalInput = (device: RemovedDevice, removedAt: number) =>
  utf8(`keyrook.device-removed:v1:${device.accountId}:${device.product}:${removedAt}:${device.deviceId}`);

async function removalKey(productKey: CryptoKey): Promise<CryptoKey> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', productKey));
  try {
    const base = await crypto.subtle.importKey('raw', raw as BufferSource, 'HKDF', false, ['deriveKey']);
    return await crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0) as BufferSource, info: utf8(REMOVAL_INFO) as BufferSource },
      base,
      { name: 'HMAC', hash: 'SHA-256', length: 256 },
      false,
      ['sign', 'verify'],
    );
  } finally {
    wipe(raw);
  }
}

const isTime = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

/**
 * The proof to send with `revokeDevice`, made with the key of the removed
 * session's product: Keyrook Authenticator's is the key its records are
 * sealed under, with or without a root. A product without that key sends no
 * proof, and the device is only signed out.
 */
export async function makeDeviceRemovalProof(
  productKey: CryptoKey,
  device: RemovedDevice,
  removedAt: number = Date.now(),
): Promise<DeviceRemovalProof> {
  assertDevice(device);
  if (!isTime(removedAt)) throw new Error('Malformed removal time.');
  const mac = await crypto.subtle.sign('HMAC', await removalKey(productKey), removalInput(device, removedAt) as BufferSource);
  return { removedAt, mac: toBase64(new Uint8Array(mac)) };
}

/**
 * Whether `proof` — `SyncHttpError.proof` on `device_removed`, untrusted —
 * says the holder of this product's key removed this device, in this
 * session. Never throws for anything the server sent: a proof that is
 * missing, malformed, for another account, product or device, or made under
 * another key answers false, and the device keeps what it holds.
 *
 * `signedInAt` is when this device's session began, by its own clock. A
 * proof made before then is refused: the device id outlives a session, so a
 * proof from an earlier removal would otherwise be the server's to replay
 * after the device signs in again. A remover whose clock is far behind can
 * make a proof the device refuses; it is then only signed out.
 */
export async function checkDeviceRemovalProof(
  productKey: CryptoKey,
  device: RemovedDevice & { signedInAt: number },
  proof: unknown,
): Promise<boolean> {
  assertDevice(device);
  if (!Number.isSafeInteger(device.signedInAt) || device.signedInAt < 0) throw new Error('Malformed sign-in time.');
  if (proof === null || typeof proof !== 'object') return false;
  const { removedAt, mac } = proof as Partial<Record<keyof DeviceRemovalProof, unknown>>;
  if (!isTime(removedAt) || removedAt < device.signedInAt) return false;
  if (typeof mac !== 'string' || mac.length > 64) return false;
  let presented: Uint8Array;
  try {
    presented = fromBase64(mac);
  } catch {
    return false;
  }
  if (presented.length !== 32) return false;
  return crypto.subtle.verify('HMAC', await removalKey(productKey), presented as BufferSource, removalInput(device, removedAt) as BufferSource);
}
