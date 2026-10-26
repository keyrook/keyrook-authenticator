import { fromBase64, toBase64Url, type PasskeyUnlockKind } from '@authx/core';
import type { PasskeyUnlockHost } from '@authx/ui/host.js';
import { fail } from '@authx/ui/i18n/errors.js';
import { APP_NAME } from '@authx/ui/lib/name.js';

/**
 * Touch ID, Windows Hello and the like, or a security key, through a passkey
 * of this extension's own. Its RP ID is the extension's id — what Chrome takes
 * as an extension page's own — so no site, and no other extension, can ask it;
 * nor is any permission needed to. The passkey stays in its authenticator, and
 * its PRF answer (a security key's hmac-secret, as Chrome asks it) goes to the
 * vault service, which keeps none of it (core's vault/passkey-unlock.ts).
 */
const rpId = () => location.hostname;

/**
 * Where Chrome looks for the passkey. The computer's own authenticator is
 * asked as it always was. A security key is asked as the one that roams, with
 * the hint that sends Chrome straight to "insert your security key" rather
 * than to a phone or the computer's own passkeys.
 */
const WHERE: Record<PasskeyUnlockKind, { attachment: AuthenticatorAttachment; hints?: string[] }> = {
  platform: { attachment: 'platform' },
  securityKey: { attachment: 'cross-platform', hints: ['security-key'] },
};

const NO_PRF = {
  platform: 'error.platformUnlock.noPrf',
  securityKey: 'error.securityKey.noPrf',
} as const satisfies Record<PasskeyUnlockKind, string>;

type PrfResults = { prf?: { enabled?: boolean; results?: { first?: ArrayBuffer | ArrayBufferView } } };

function prfOf(credential: PublicKeyCredential): Uint8Array | null {
  const first = (credential.getClientExtensionResults() as PrfResults).prf?.results?.first;
  if (!first) return null;
  const bytes = first instanceof ArrayBuffer ? new Uint8Array(first) : new Uint8Array(first.buffer, first.byteOffset, first.byteLength);
  return bytes.length === 32 ? bytes : null;
}

const challenge = () => crypto.getRandomValues(new Uint8Array(32)) as BufferSource;
const prfAsked = (input: Uint8Array) => ({ prf: { eval: { first: input as BufferSource } } }) as AuthenticationExtensionsClientInputs;

/** Cancelled, timed out or turned away are one to the person; anything else failed. */
function refused(error: unknown): never {
  if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
    fail('error.passkeyUnlock.cancelled');
  }
  fail('error.passkeyUnlock.failed');
}

async function answer(kind: PasskeyUnlockKind, credentialId: string, prfInput: Uint8Array): Promise<Uint8Array> {
  const { hints } = WHERE[kind];
  let credential: PublicKeyCredential | null;
  try {
    credential = (await navigator.credentials.get({
      publicKey: {
        rpId: rpId(),
        challenge: challenge(),
        allowCredentials: [{ type: 'public-key', id: fromBase64(credentialId) as BufferSource }],
        userVerification: 'required',
        ...(hints ? { hints } : {}),
        extensions: prfAsked(prfInput),
      },
    })) as PublicKeyCredential | null;
  } catch (error) {
    refused(error);
  }
  if (!credential) fail('error.passkeyUnlock.cancelled');
  return prfOf(credential) ?? fail(NO_PRF[kind]);
}

async function forget(credentialId: string): Promise<void> {
  // Chrome 132 and later pass this on to the authenticator, which may drop
  // the passkey; before that there is nobody to tell. A security key keeps
  // nothing to drop: a passkey asked for by id lives inside that id.
  const signal = (PublicKeyCredential as unknown as {
    signalUnknownCredential?: (options: { rpId: string; credentialId: string }) => Promise<void>;
  }).signalUnknownCredential;
  await signal?.({ rpId: rpId(), credentialId }).catch(() => undefined);
}

const chromePasskeyUnlock: PasskeyUnlockHost = {
  async available(kind) {
    // Whether a key is at hand is known only by asking for one.
    if (kind === 'securityKey') return true;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  },

  async create(kind, prfInput) {
    const { attachment, hints } = WHERE[kind];
    let credential: PublicKeyCredential | null;
    try {
      credential = (await navigator.credentials.create({
        publicKey: {
          rp: { id: rpId(), name: APP_NAME },
          user: { id: crypto.getRandomValues(new Uint8Array(16)) as BufferSource, name: APP_NAME, displayName: APP_NAME },
          challenge: challenge(),
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          // The person checked every time — the computer's own check, or the
          // key's PIN — and a passkey that is asked for by id rather than
          // offered in anyone's list. On a security key that also means it
          // takes none of the few places the key has for passkeys.
          authenticatorSelection: { authenticatorAttachment: attachment, residentKey: 'discouraged', userVerification: 'required' },
          ...(hints ? { hints } : {}),
          extensions: prfAsked(prfInput),
        },
      })) as PublicKeyCredential | null;
    } catch (error) {
      refused(error);
    }
    if (!credential) fail('error.passkeyUnlock.cancelled');
    const credentialId = toBase64Url(new Uint8Array(credential.rawId));
    // An authenticator without PRF can check the person but hold no key: a
    // gate in front of the vault, not a lock on it, so nothing is turned on.
    // Only a plain no is taken at its word. Some say nothing at creation —
    // iCloud Keychain through Chrome among them — and answer when asked, so
    // what decides is whether an answer comes.
    if ((credential.getClientExtensionResults() as PrfResults).prf?.enabled === false) {
      await forget(credentialId);
      fail(NO_PRF[kind]);
    }
    try {
      // Some answer at creation; the rest are asked once more. A security key
      // without hmac-secret-mc is one of those: its PIN and a touch again.
      return { credentialId, prf: prfOf(credential) ?? (await answer(kind, credentialId, prfInput)) };
    } catch (error) {
      // A passkey that will not answer opens nothing: not left behind.
      await forget(credentialId);
      throw error;
    }
  },

  answer,
  forget,
};

/** Where pages can ask passkeys at all. */
export const passkeyUnlock: PasskeyUnlockHost | undefined =
  typeof PublicKeyCredential === 'undefined' ? undefined : chromePasskeyUnlock;
