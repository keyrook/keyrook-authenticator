/**
 * The second step at sign-in, on a Keyrook account that has turned one on
 * (keyrook-account's docs/console.md, S21). It is turned on and off on
 * account.keyrook.com alone; this app answers it: at sign-in, after the
 * password or Google or GitHub, and beside the owner's proof where a change
 * asks for one.
 *
 * An answer is the code the person's authenticator app shows, or the recovery
 * key in its place for an app that was lost — sent only as its proof, never
 * the key — or, at sign-in, one of the account's passkeys. A passkey is two
 * steps already, so where it proves the owner it needs no second.
 */
import {
  deriveRecoveryAuthHash,
  finishSecondStep,
  isWellFormedRecoveryKey,
  passkeyCredential,
  secondStepPasskeyOptions,
  type LoginResponse,
  type PasskeySignInOptions,
  type SecondStepProof,
  type SecondStepRequest,
} from '@authx/core';
import { fail } from '@authx/ui/i18n/errors.js';
import type { OwnerSecondStep, SecondStepAnswer } from '@authx/ui/lib/protocol.js';
import { platform } from './platform.js';
import { serverFetch } from './sync.js';

/**
 * The code a sign-in just took. The server takes a code once, and counts one
 * sent again as a wrong one toward the address's lockout, so a change right
 * after signing in waits for the app's next code (keyrook-account's S21, the
 * owner's decision of 23 October 2026). Kept in memory, briefly: spent, it
 * opens nothing.
 */
const SPENT_KEY = 'authx.spentCode';
/** Longer than an app shows one code for, with the server's leeway either side. */
const SPENT_FOR = 2 * 60_000;

/** Six digits, as typed: spaces between the groups are how apps show them. */
function codeOf(typed: string): string {
  const code = typed.replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) fail('error.secondStep.wrongCode');
  return code;
}

async function recoveryProofOf(recoveryKey: string): Promise<string> {
  if (!isWellFormedRecoveryKey(recoveryKey)) fail('error.recoveryKeyMalformed');
  return deriveRecoveryAuthHash(recoveryKey);
}

/** An answer as the server takes it at sign-in. */
async function fieldsOf(answer: SecondStepAnswer): Promise<Omit<SecondStepRequest, 'ticket'>> {
  if ('code' in answer) return { code: codeOf(answer.code) };
  if ('recoveryKey' in answer) return { recoveryAuthHash: await recoveryProofOf(answer.recoveryKey) };
  return { passkey: { challengeId: answer.passkey.challengeId, credential: passkeyCredential(answer.passkey.answer) } };
}

/** Finishes a sign-in stopped at its second step: the session it was waiting for. */
export async function finishSignInStep(ticket: string, answer: SecondStepAnswer): Promise<LoginResponse> {
  const fields = await fieldsOf(answer);
  const session = await finishSecondStep(platform().syncApiUrl, { ticket, ...fields }, serverFetch());
  if (fields.code) await platform().memory.set(SPENT_KEY, { code: fields.code, until: Date.now() + SPENT_FOR });
  return session;
}

/** A challenge for one of the account's passkeys to answer as the second step. */
export function secondStepChallenge(ticket: string): Promise<PasskeySignInOptions> {
  return secondStepPasskeyOptions(platform().syncApiUrl, ticket, serverFetch());
}

/** The second step beside the owner's proof, for a change that asks for one; nothing when none was given. */
export async function ownerSecondStep(answer: OwnerSecondStep | undefined): Promise<SecondStepProof | undefined> {
  if (!answer) return undefined;
  if ('code' in answer) {
    const code = codeOf(answer.code);
    // Typed again from the app before it moved on: never sent.
    const spent = (await platform().memory.get(SPENT_KEY)) as { code: string; until: number } | undefined;
    if (spent?.code === code && Date.now() < spent.until) fail('error.secondStep.used');
    return { code };
  }
  return { recoveryAuthHash: await recoveryProofOf(answer.recoveryKey) };
}
