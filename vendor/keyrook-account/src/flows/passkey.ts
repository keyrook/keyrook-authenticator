/**
 * Passkeys, as the account page and every product use them: what is sent of
 * a passkey's answer, and what its PRF answer opens.
 *
 * Asking the passkey is the caller's (`navigator.credentials`, with
 * `extensions: { prf: { eval: { first: PASSKEY_PRF_INPUT } } }`), and so is
 * reading `clientExtensionResults.prf.results.first`: this package touches no
 * DOM. What the caller hands here, this sends on without the PRF answer, which
 * opens the root and never leaves the device.
 */
import { DecryptionError } from '../crypto/aead.js';
import { openRootWithPasskey, type AccountRoot } from '../keys/root.js';
import { passkeySignIn } from '../sync/http.js';
import type { PasskeyCredential, PasskeySignInResponse } from '../sync/protocol.js';
import type { AccountServer } from './product-key.js';

/** A passkey's answer as `PublicKeyCredential.toJSON()` writes it. */
export interface PasskeyAnswer {
  id: string;
  rawId: string;
  type: string;
  response: { [field: string]: unknown };
  clientExtensionResults?: unknown;
}

/** A passkey touched just now: its answer to a challenge the server issued, and its PRF answer when it gave one. */
export interface PasskeyTouch {
  challengeId: string;
  answer: PasskeyAnswer;
  /** The 32 bytes the passkey answered to `PASSKEY_PRF_INPUT`; null for one that answers no PRF. */
  prf: Uint8Array | null;
}

const SENT = ['clientDataJSON', 'attestationObject', 'authenticatorData', 'signature'] as const;

/**
 * What is sent of a passkey's answer: the fields the server checks, by name,
 * and nothing else — not the extension results, which hold the PRF answer.
 */
export function passkeyCredential(answer: PasskeyAnswer): PasskeyCredential {
  const response: Record<string, string | null> = {};
  for (const field of SENT) {
    const value = answer.response[field];
    if (typeof value === 'string') response[field] = value;
  }
  const handle = answer.response.userHandle;
  if (typeof handle === 'string' || handle === null) response.userHandle = handle;
  return { id: answer.id, rawId: answer.rawId, type: 'public-key', response };
}

/**
 * Signs in with a passkey touched for a challenge from
 * `passkeySignInOptions`. Returns the session and, when the passkey unlocks
 * the account, the root its PRF answer opened — derived here, never taken
 * from the server, for the caller to check against what it pins.
 */
export async function signInWithPasskey(
  server: AccountServer,
  touch: PasskeyTouch,
  device: { deviceId: string; deviceName: string },
): Promise<{ session: PasskeySignInResponse; root: AccountRoot | null }> {
  const session = await passkeySignIn(
    server.baseUrl,
    { challengeId: touch.challengeId, credential: passkeyCredential(touch.answer), ...device },
    server.fetcher,
  );
  if (session.passkey.id !== touch.answer.id) throw new Error('The server answered for another passkey.');
  if (!session.passkey.rootWrap || !touch.prf) return { session, root: null };
  try {
    return { session, root: await openRootWithPasskey(session.passkey.rootWrap, touch.prf, session.account.id, session.passkey.id) };
  } catch (error) {
    if (error instanceof DecryptionError) throw new Error('That passkey does not open this account’s key. Sign in with the password instead.');
    throw error;
  }
}
