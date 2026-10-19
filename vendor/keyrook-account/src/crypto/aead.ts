import { toBase64, fromBase64, utf8, fromUtf8 } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';

/** AES-256-GCM ciphertext with its nonce. Both fields are base64. */
export interface SealedBox {
  iv: string;
  ct: string;
}

const IV_LENGTH = 12; // 96-bit nonce, the size AES-GCM is specified for.

export async function generateDataKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function seal(
  key: CryptoKey,
  plaintext: Uint8Array,
  additionalData?: Uint8Array,
): Promise<SealedBox> {
  const iv = randomBytes(IV_LENGTH);
  const params: AesGcmParams = { name: 'AES-GCM', iv: iv as BufferSource, tagLength: 128 };
  if (additionalData) params.additionalData = additionalData as BufferSource;

  const ct = await crypto.subtle.encrypt(params, key, plaintext as BufferSource);
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(ct)) };
}

export async function open(
  key: CryptoKey,
  box: SealedBox,
  additionalData?: Uint8Array,
): Promise<Uint8Array> {
  const params: AesGcmParams = {
    name: 'AES-GCM',
    iv: fromBase64(box.iv) as BufferSource,
    tagLength: 128,
  };
  if (additionalData) params.additionalData = additionalData as BufferSource;

  try {
    const plaintext = await crypto.subtle.decrypt(params, key, fromBase64(box.ct) as BufferSource);
    return new Uint8Array(plaintext);
  } catch {
    // GCM authentication failure. The overwhelmingly common cause is a wrong
    // password, so say that rather than leaking a crypto-level message.
    throw new DecryptionError();
  }
}

export class DecryptionError extends Error {
  override readonly name = 'DecryptionError';
  constructor(message = 'Could not decrypt — wrong password or corrupted data.') {
    super(message);
  }
}

export async function sealJson<T>(key: CryptoKey, value: T, aad?: Uint8Array): Promise<SealedBox> {
  return seal(key, utf8(JSON.stringify(value)), aad);
}

export async function openJson<T>(key: CryptoKey, box: SealedBox, aad?: Uint8Array): Promise<T> {
  return JSON.parse(fromUtf8(await open(key, box, aad))) as T;
}

/** Wrap the data key with the password-derived key so the password can change cheaply. */
export async function wrapDataKey(kek: CryptoKey, dataKey: CryptoKey): Promise<SealedBox> {
  const iv = randomBytes(IV_LENGTH);
  const wrapped = await crypto.subtle.wrapKey('raw', dataKey, kek, {
    name: 'AES-GCM',
    iv: iv as BufferSource,
    tagLength: 128,
  });
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(wrapped)) };
}

export async function unwrapDataKey(kek: CryptoKey, box: SealedBox): Promise<CryptoKey> {
  try {
    return await crypto.subtle.unwrapKey(
      'raw',
      fromBase64(box.ct) as BufferSource,
      kek,
      { name: 'AES-GCM', iv: fromBase64(box.iv) as BufferSource, tagLength: 128 },
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  } catch {
    throw new DecryptionError();
  }
}

/** Export the data key so it can be held in memory across a service-worker restart. */
export async function exportDataKey(key: CryptoKey): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', key)));
}

export async function importDataKey(raw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromBase64(raw) as BufferSource, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);
}
