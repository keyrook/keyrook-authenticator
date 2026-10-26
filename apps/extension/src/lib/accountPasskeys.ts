import { fromBase64, PASSKEY_PRF_INPUT, toBase64, toBase64Url } from '@authx/core';
import type { AccountPasskeys } from '@authx/ui/host.js';
import { fail } from '@authx/ui/i18n/errors.js';
import { ACCOUNT_RP } from './config.js';

/**
 * The Keyrook account's passkeys, asked from an extension page. They belong
 * to the account's page (`ACCOUNT_RP`), and Chrome lets an extension name
 * another site as a passkey's RP ID only from version 122, and only with the
 * host permission for that site: the manifest's one optional host
 * permission, asked for here on the click that chose a passkey, never at
 * install. It runs nothing on that site and reads nothing from it.
 *
 * The answer goes to the vault service as the browser gave it, with the PRF
 * answer apart. This page keeps neither.
 */
const ORIGINS = [`https://${ACCOUNT_RP}/*`];

/** The first Chrome that lets an extension ask a site's passkeys with that site's host permission. */
const FIRST_CHROME = 122;

/** The Chromium this runs on — Chrome, Edge or Opera alike — from the browser's own word. */
function chromiumVersion(): number {
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string; version: string }[] } })
    .userAgentData?.brands;
  const brand = brands?.find((entry) => entry.brand === 'Chromium');
  if (brand) return Number(brand.version) || 0;
  return Number(/Chrom(?:e|ium)\/(\d+)/.exec(navigator.userAgent)?.[1] ?? 0);
}

type PrfResults = { prf?: { results?: { first?: ArrayBuffer | ArrayBufferView } } };

const text = (buffer: ArrayBuffer) => toBase64Url(new Uint8Array(buffer));

function firstOf(credential: PublicKeyCredential): Uint8Array | null {
  const first = (credential.getClientExtensionResults() as PrfResults).prf?.results?.first;
  if (!first) return null;
  const bytes = first instanceof ArrayBuffer ? new Uint8Array(first) : new Uint8Array(first.buffer, first.byteOffset, first.byteLength);
  return bytes.length === 32 ? bytes : null;
}

const granted = () => chrome.permissions.contains({ origins: ORIGINS });

const chromeAccountPasskeys: AccountPasskeys = {
  granted,

  async touch(challenge) {
    // Asked before anything else is awaited: Chrome asks only while the click
    // still counts. Already given, it answers yes and shows nothing; with no
    // click at all — a page that asks on opening, having seen it given —
    // Chrome refuses to ask, and what is already given is the answer.
    let allowed: boolean;
    try {
      allowed = await chrome.permissions.request({ origins: ORIGINS });
    } catch {
      allowed = await granted();
    }
    if (!allowed) fail('error.passkey.permission');

    const options = await challenge();
    // A server naming any other site is not asking for the account's
    // passkeys, and nothing is asked for it.
    if (options.publicKey.rpId !== ACCOUNT_RP) fail('error.account.serverMismatch');

    let credential: PublicKeyCredential | null;
    try {
      credential = (await navigator.credentials.get({
        publicKey: {
          challenge: fromBase64(options.publicKey.challenge) as BufferSource,
          rpId: options.publicKey.rpId,
          timeout: options.publicKey.timeout,
          userVerification: 'required',
          allowCredentials: options.publicKey.allowCredentials.map((entry) => ({
            type: 'public-key' as const,
            id: fromBase64(entry.id) as BufferSource,
          })),
          // Fixed in @keyrook/account, never taken from the server: what the
          // passkey answers is what opens the account's root.
          extensions: { prf: { eval: { first: PASSKEY_PRF_INPUT as BufferSource } } } as AuthenticationExtensionsClientInputs,
        },
      })) as PublicKeyCredential | null;
    } catch (error) {
      // Cancelled, timed out, or no passkey for the account here: all one to
      // the person, who can try again or sign in another way.
      if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
        fail('error.passkey.cancelled');
      }
      fail('error.passkey.failed');
    }
    if (!credential) fail('error.passkey.cancelled');

    const response = credential.response as AuthenticatorAssertionResponse;
    const prf = firstOf(credential);
    return {
      challengeId: options.challengeId,
      answer: {
        id: credential.id,
        rawId: text(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: text(response.clientDataJSON),
          authenticatorData: text(response.authenticatorData),
          signature: text(response.signature),
          userHandle: response.userHandle ? text(response.userHandle) : null,
        },
      },
      prf: prf ? toBase64(prf) : null,
    };
  },
};

/** Chrome's, where it can ask them; nothing where it cannot, and no page offers a passkey there. */
export const accountPasskeys: AccountPasskeys | undefined =
  ACCOUNT_RP && chromiumVersion() >= FIRST_CHROME ? chromeAccountPasskeys : undefined;
