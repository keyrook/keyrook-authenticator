/**
 * Signing in with Google or GitHub, from the service worker's side. The design
 * is keyrook-account's docs/provider-sign-in.md; the crypto is
 * @keyrook/account's `sync/pairing.ts`.
 *
 * A provider account has no password. The provider proves who is signing in;
 * the vault key reaches a new browser only from one already signed in (after
 * the person checks both show the same code) or from the recovery key. So
 * after a provider sign-in this browser is in one of three places:
 *
 * - **new**: no account has this identity. Creating one keeps this vault's
 *   data key and issues the recovery key in the same step.
 * - **signed in**: it already holds the account's key — it was in the account
 *   before and signed out — and simply resumes.
 * - **joining**: it holds a session but not the key, and waits for approval or
 *   for the recovery key. What it is waiting with lives in session storage, so
 *   a service worker stopped mid-wait loses nothing.
 *
 * Two more since an account may sign in more than one way (keyrook-account's
 * S20, S21). An account with a second step answers with a ticket before any
 * session, kept here like the rest until the code comes. And Google or GitHub
 * may sign in to an account that has a password: they say who is signing in,
 * and the password opens the key, so that session is ended and the person
 * signs in with the password — never asked to wait for another browser.
 */
import {
  adoptDataKey,
  attachRecoveryKit,
  deriveKeyCheck,
  deriveRecoveryAuthHash,
  deviceKeyring,
  exportPairingKeys,
  importPairingKeys,
  logout,
  newPairingKeys,
  openRecoveryState,
  pairingCode,
  passphraseKeyring,
  providerRegister,
  providerSession,
  sealRecoveryState,
  sealVault,
  signInOptions,
  SyncHttpError,
  unwrapPairedDataKey,
  unwrapRecoveryWrap,
  updateAccount,
  verifyPassword,
  wrapDataKeyForPairing,
  DecryptionError,
  type LoginResponse,
  type OwnerProof,
  type PairingSummary,
  type ProviderTicket,
  type SignInProvider,
  type UnlockedVault,
  type VaultData,
  type VaultFile,
} from '@authx/core';
import { platform } from './platform.js';
import { fail } from '@authx/ui/i18n/errors.js';
import type {
  ProviderOffer,
  ProviderOutcome,
  ProviderPending as ProviderPendingView,
  SecondStepAnswer,
} from '@authx/ui/lib/protocol.js';
import { finishSignInStep } from './second-step.js';
import { adapter, deviceName, markEverythingPending, serverFetch, storeSession } from './sync.js';

const PENDING_KEY = 'authx.providerPending';
const APPROVING_KEY = 'authx.approving';
/** A sign-in that left for the provider in the options tab, until it comes back. */
const TAB_FLOW_KEY = 'authx.providerTabFlow';
/**
 * What the server last said it offers. Server settings, nothing of the
 * person's: kept on disk so the sign-in card is drawn whole the first time,
 * not as the email-only card that becomes another one when the answer comes.
 */
const OFFER_KEY = 'authx.providerOffer';

type StoredKeys = Awaited<ReturnType<typeof exportPairingKeys>>;

/** A provider sign-in that has not finished: an account to create, or one to join. */
export type ProviderPending =
  | { kind: 'signup'; provider: SignInProvider; email: string; signupToken: string }
  | {
      kind: 'join';
      provider: SignInProvider;
      email: string;
      pairing?: { id: string; keys: StoredKeys };
    }
  /** No session yet: the account asks for a second step, which `ticket` finishes within five minutes. */
  | { kind: 'secondStep'; provider: SignInProvider; ticket: string; passkeys: boolean };

export async function pendingView(): Promise<ProviderPendingView | null> {
  const pending = await pendingProvider();
  if (!pending) return null;
  return {
    kind: pending.kind,
    provider: pending.provider,
    // The address is the account's to say, once there is a session.
    email: pending.kind === 'secondStep' ? '' : pending.email,
    asked: pending.kind === 'join' && Boolean(pending.pairing),
    ...(pending.kind === 'secondStep' ? { passkeys: pending.passkeys } : {}),
  };
}

export async function pendingProvider(): Promise<ProviderPending | null> {
  return ((await platform().memory.get(PENDING_KEY)) as ProviderPending | undefined) ?? null;
}

async function setPending(pending: ProviderPending | null): Promise<void> {
  if (pending) await platform().memory.set(PENDING_KEY, pending);
  else await platform().memory.remove(PENDING_KEY);
}

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const isOffer = (value: unknown): value is ProviderOffer =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as ProviderOffer).providers) &&
  typeof (value as ProviderOffer).inTab === 'boolean';

/** An answer kept by a build from before passkeys says nothing of them, which is no. */
const asOffer = (known: ProviderOffer): ProviderOffer => ({
  ...known,
  passkeys: known.passkeys === true,
  secondStep: known.secondStep === true,
});

/** Asks the server, and remembers the answer for next time. */
export async function refreshProviderOffer(): Promise<ProviderOffer> {
  // Briefly: a server that does not answer should leave the email forms, not
  // a card waiting on it.
  const named = serverFetch();
  const { providers, byMessage, byApp, passkeys, secondStep } = await signInOptions(platform().syncApiUrl, (input, init) =>
    named(input, { ...init, signal: AbortSignal.timeout(5_000) }),
  );
  // An app has no tab to come back to, and a server that cannot hand the
  // answer back to it offers the app no provider at all: the browser it would
  // end in is not the app.
  const offer: ProviderOffer =
    platform().signInReturn === 'app'
      ? { providers: byApp ? providers : [], inTab: false, passkeys, secondStep }
      : { providers, inTab: byMessage, passkeys, secondStep };
  await platform().disk.set(OFFER_KEY, offer);
  return offer;
}

/**
 * The last answer at once, while a fresh one is fetched for next time; the
 * server's answer only the first time, when there is no last one.
 */
export async function providerOffer(): Promise<ProviderOffer> {
  const known = await platform().disk.get(OFFER_KEY);
  const fresh = refreshProviderOffer();
  if (isOffer(known)) {
    void fresh.catch(() => undefined);
    return asOffer(known);
  }
  return fresh.catch(() => ({ providers: [], inTab: false, passkeys: false }));
}

/** Where a sign-in starts: our server, which sends the person on to the provider. */
async function flowStart(
  provider: SignInProvider,
  purpose: 'signin' | 'reauth',
  returnBy: 'redirect' | 'message',
): Promise<{ url: string; state: string; verifier: string }> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)));
  const back: Record<string, string> =
    platform().signInReturn === 'app'
      ? { return: 'app', app: platform().clientId }
      : { ext: platform().clientId, ...(returnBy === 'message' ? { return: 'message' } : {}) };
  const url = `${platform().syncApiUrl}/oauth/${provider}/start?${new URLSearchParams({
    ...back,
    challenge,
    state,
    purpose,
  })}`;
  return { url, state, verifier };
}

/**
 * The browser's own sign-in window, through our server, back to this
 * extension's `chromiumapp.org` address with a ticket. The verifier never
 * leaves this function except to redeem that ticket.
 *
 * Re-authenticating uses it always: the change that asked for it is waiting
 * on the page. Signing in uses it only with a server that cannot hand the
 * answer back to a tab.
 */
export async function providerFlow(provider: SignInProvider, purpose: 'signin' | 'reauth'): Promise<ProviderTicket> {
  const { url, state, verifier } = await flowStart(provider, purpose, 'redirect');

  let redirect: string | undefined;
  try {
    redirect = await platform().signInWindow(url);
  } catch {
    // Closing the window is the common case, and the browser's message for it
    // ("The user did not approve access") reads like a failure. It is not one.
    fail('error.signinCancelled');
  }
  const answer = new URLSearchParams(new URL(redirect ?? 'about:blank').hash.slice(1));
  if (answer.get('state') !== state) fail('error.signinStateMismatch');
  return ticketFrom(answer, provider, verifier);
}

/**
 * Signing in in the options tab itself: the tab goes to the provider — whose
 * own page lists the accounts already signed in to this browser — and comes
 * back. The verifier waits in session memory, since this worker may well be
 * stopped while the person chooses.
 */
export async function beginTabFlow(provider: SignInProvider): Promise<string> {
  const { url, state, verifier } = await flowStart(provider, 'signin', 'message');
  await platform().memory.set(TAB_FLOW_KEY, { provider, state, verifier });
  return url;
}

/**
 * The sign-in an answer from the server's return page belongs to, taken so it
 * cannot be answered twice; null — and nothing taken — when it is not the one
 * this browser is waiting for.
 */
export async function takeTabFlow(
  answer: URLSearchParams,
): Promise<{ provider: SignInProvider; verifier: string } | null> {
  const flow = (await platform().memory.get(TAB_FLOW_KEY)) as
    | { provider: SignInProvider; state: string; verifier: string }
    | undefined;
  if (!flow || answer.get('state') !== flow.state) return null;
  await platform().memory.remove(TAB_FLOW_KEY);
  return { provider: flow.provider, verifier: flow.verifier };
}

const OUTCOME_KEY = 'authx.providerOutcome';

/** Kept for the account page the tab comes back to. */
export async function setTabOutcome(outcome: ProviderOutcome): Promise<void> {
  await platform().memory.set(OUTCOME_KEY, outcome);
}

/** Said once: a page opened later has nothing to report. */
export async function takeTabOutcome(): Promise<ProviderOutcome | null> {
  const outcome = (await platform().memory.get(OUTCOME_KEY)) as ProviderOutcome | undefined;
  if (!outcome) return null;
  await platform().memory.remove(OUTCOME_KEY);
  return outcome;
}

/** The ticket in a provider's answer, or why there is none. */
export function ticketFrom(answer: URLSearchParams, provider: SignInProvider, verifier: string): ProviderTicket {
  const error = answer.get('error');
  if (error === 'refused') {
    // The server relays the provider's reason in English; the page translates
    // the ones it knows.
    const reason = answer.get('message');
    if (reason) throw new Error(reason);
    fail('error.provider.refusedBy', { provider: label(provider) });
  }
  if (error === 'denied') fail('error.signinCancelled');
  if (error) fail('error.provider.unreachable', { provider: label(provider) });
  const ticket = answer.get('ticket');
  if (!ticket) fail('error.signinUnfinished');
  return { ticket, verifier };
}

export const label = (provider: SignInProvider) => (provider === 'github' ? 'GitHub' : 'Google');

/** Opens the account's sealed kit state with a key: the proof it is the account's. */
async function opensAccountKit(dataKey: CryptoKey): Promise<boolean> {
  const head = await adapter().pull(0);
  if (!head.recovery) return false;
  try {
    await openRecoveryState(dataKey, head.recovery);
    return true;
  } catch {
    return false;
  }
}

function signedInData(data: VaultData, email: string, provider: SignInProvider): VaultData {
  return updateAccount(markEverythingPending(data, email), { method: 'provider', provider });
}

export type ProviderStart =
  | { kind: 'new'; email: string }
  | { kind: 'signedIn'; file: VaultFile; data: VaultData }
  | { kind: 'join'; email: string }
  | { kind: 'password'; provider: SignInProvider; email: string }
  | { kind: 'secondStep'; passkeys: boolean };

/**
 * Redeems a sign-in's ticket. For the vault's write queue: the provider's
 * window, which can stay open for minutes, is `providerFlow` and comes first.
 */
export async function startProviderSignIn(
  unlocked: UnlockedVault,
  provider: SignInProvider,
  ticket: ProviderTicket,
): Promise<ProviderStart> {
  const answer = await providerSession(
    platform().syncApiUrl,
    { ...ticket, secondStep: true, deviceId: unlocked.data.sync.deviceId, deviceName: deviceName() },
    serverFetch(),
  ).catch((error: unknown) => {
    if (error instanceof SyncHttpError && error.code === 'email_taken') throw new Error(error.message);
    throw error;
  });

  if (answer.status === 'new') {
    await setPending({ kind: 'signup', provider, email: answer.email, signupToken: answer.signupToken });
    return { kind: 'new', email: answer.email };
  }
  if (answer.status === 'second_step') {
    await setPending({ kind: 'secondStep', provider, ticket: answer.secondStep.ticket, passkeys: answer.secondStep.passkeys });
    return { kind: 'secondStep', passkeys: answer.secondStep.passkeys };
  }
  // Adding this identity to an account with a password is the account page's;
  // the server answers so to that page alone, but a product is told the same.
  if (answer.status === 'link') fail('error.server.emailTakenPassword', { email: answer.email });
  return withProviderSession(unlocked, provider, answer.session);
}

/** The server's word that a second step's ticket is gone. */
const STEP_EXPIRED = 'That sign-in has expired. Sign in again.';

/** Finishes the sign-in waiting at its second step, then goes on as any provider sign-in does. */
export async function finishProviderStep(unlocked: UnlockedVault, answer: SecondStepAnswer): Promise<ProviderStart> {
  const pending = await pendingProvider();
  if (pending?.kind !== 'secondStep') fail('error.secondStep.expired');
  const session = await finishSignInStep(pending.ticket, answer).catch(async (error: unknown) => {
    // Its ticket is spent or past its five minutes: the sign-in starts again.
    // A wrong code leaves it, for the few tries the server allows.
    if (error instanceof SyncHttpError && error.message === STEP_EXPIRED) await setPending(null);
    throw error;
  });
  return withProviderSession(unlocked, pending.provider, session);
}

/** The ticket of the Google or GitHub sign-in waiting at its second step. */
export async function providerStepTicket(): Promise<string> {
  const pending = await pendingProvider();
  if (pending?.kind !== 'secondStep') fail('error.secondStep.expired');
  return pending.ticket;
}

/** Where a session from Google or GitHub leaves this browser. */
async function withProviderSession(
  unlocked: UnlockedVault,
  provider: SignInProvider,
  session: Pick<LoginResponse, 'accessToken' | 'refreshToken' | 'account'>,
): Promise<ProviderStart> {
  const email = session.account.email;
  if (session.account.method === 'password') {
    // Who is signing in is proved; what opens the key is the password, and a
    // vault signed in to a password account opens with it or its device key.
    // So this session is ended unused, and the password signs in.
    await setPending(null);
    await logout(platform().syncApiUrl, session.refreshToken, serverFetch()).catch(() => undefined);
    return { kind: 'password', provider, email };
  }
  await storeSession(session);
  // Signed in here before, then out: this vault already has the key.
  if (await opensAccountKit(unlocked.dataKey)) {
    await setPending(null);
    const data = signedInData(unlocked.data, email, provider);
    return { kind: 'signedIn', file: await sealVault(unlocked.file, unlocked.dataKey, data), data };
  }
  await setPending({ kind: 'join', provider, email });
  return { kind: 'join', email };
}

/**
 * Creates the provider account with this vault's data key. The recovery key
 * is issued here and nowhere later: for an account with no password it is the
 * only way back once every browser is gone.
 */
export async function createProviderAccount(
  unlocked: UnlockedVault,
): Promise<{ file: VaultFile; data: VaultData; recoveryKey: string }> {
  const pending = await pendingProvider();
  if (pending?.kind !== 'signup') fail('error.signupPendingExpired');

  const issuedAt = Math.max(Date.now(), (unlocked.data.sync.recoveryAt ?? 0) + 1);
  const issued = await attachRecoveryKit(unlocked.file, unlocked.dataKey);
  const wrap = { ...issued.file.recovery!, createdAt: issuedAt };
  const session = await providerRegister(
    platform().syncApiUrl,
    {
      signupToken: pending.signupToken,
      keyCheck: await deriveKeyCheck(unlocked.dataKey),
      recovery: {
        issuedAt,
        state: await sealRecoveryState(unlocked.dataKey, { wrap, issuedAt }),
        wrap,
        recoveryAuthHash: await deriveRecoveryAuthHash(issued.recoveryKey),
      },
      deviceId: unlocked.data.sync.deviceId,
      deviceName: deviceName(),
    },
    serverFetch(),
  ).catch((error: unknown) => {
    if (error instanceof SyncHttpError && error.code === 'email_taken') throw new Error(error.message);
    throw error;
  });
  await storeSession(session);
  await setPending(null);

  const signed = signedInData(unlocked.data, pending.email, pending.provider);
  const data = { ...signed, sync: { ...signed.sync, recoveryAt: issuedAt } };
  return {
    file: await sealVault({ ...issued.file, recovery: wrap }, unlocked.dataKey, data),
    data,
    recoveryKey: issued.recoveryKey,
  };
}

/** Gives up on a sign-in in progress; a joining browser's session goes too. */
export async function cancelProviderSignIn(): Promise<boolean> {
  const pending = await pendingProvider();
  await setPending(null);
  if (pending?.kind === 'join' && pending.pairing) {
    await adapter().denyPairing(pending.pairing.id).catch(() => {});
  }
  return pending?.kind === 'join';
}

/**
 * Adopts the account's key once it is proved to be the account's. The device
 * keeps opening as it did: with its device key, or with its own master
 * password, which for a provider account is local alone — there is no account
 * password for it to equal.
 */
async function adopt(
  unlocked: UnlockedVault,
  pending: Extract<ProviderPending, { kind: 'join' }>,
  dataKey: CryptoKey,
  password: string | undefined,
) {
  if (!(await opensAccountKit(dataKey))) {
    fail('error.pairingWrongKey');
  }
  let keyring;
  if (unlocked.file.protection.mode === 'passphrase') {
    if (!password || !(await verifyPassword(unlocked.file, password))) {
      fail('error.joinNeedsMasterPassword');
    }
    keyring = await passphraseKeyring(password);
  } else {
    keyring = deviceKeyring(await platform().deviceKey.getOrCreate());
  }
  const data = signedInData(unlocked.data, pending.email, pending.provider);
  const file = await adoptDataKey(unlocked.file, keyring, dataKey, data);
  await setPending(null);
  return { file, dataKey, data };
}

// --- The browser that asks --------------------------------------------------

/**
 * Asks the account's other browsers to let this one in. A vault that locks
 * with a master password needs it to take the account's key, so it is checked
 * here, before anyone is asked to approve.
 */
export async function requestPairing(unlocked: UnlockedVault, password?: string): Promise<{ id: string }> {
  const pending = await pendingProvider();
  if (pending?.kind !== 'join') fail('error.signInFirst');
  if (unlocked.file.protection.mode === 'passphrase' && !(password && (await verifyPassword(unlocked.file, password)))) {
    fail('error.notThisVaultsPassword');
  }
  // One request at a time: asking again replaces the last one on the server too.
  const keys = await newPairingKeys();
  const { id } = await adapter().requestPairing({ publicKey: keys.publicKey, deviceName: deviceName() });
  await setPending({ ...pending, pairing: { id, keys: await exportPairingKeys(keys) } });
  return { id };
}

export type PairingProgress =
  | { state: 'waiting' }
  | { state: 'compare'; code: string }
  | { state: 'joined'; file: VaultFile; dataKey: CryptoKey; data: VaultData };

export async function pollPairing(unlocked: UnlockedVault, password?: string): Promise<PairingProgress> {
  const pending = await pendingProvider();
  if (pending?.kind !== 'join' || !pending.pairing) fail('error.nothingWaiting');
  // Before asking: the server hands the approved key over once, and a vault
  // that then could not take it would have to ask the other browser again.
  if (unlocked.file.protection.mode === 'passphrase' && !password) {
    fail('error.joinNeedsMasterPassword');
  }
  const { id } = pending.pairing;
  const keys = await importPairingKeys(pending.pairing.keys);

  let status;
  try {
    status = await adapter().pairingStatus(id);
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'not_found') {
      await setPending({ ...pending, pairing: undefined });
      fail('error.pairingExpired');
    }
    throw error;
  }
  if (status.status === 'waiting' || !status.approverKey) return { state: 'waiting' };
  const code = await pairingCode(id, keys.publicKey, status.approverKey);
  if (status.status === 'accepted' || !status.wrap) return { state: 'compare', code };

  let dataKey: CryptoKey;
  try {
    dataKey = await unwrapPairedDataKey(keys, id, status.approverKey, status.wrap);
  } catch (error) {
    if (error instanceof DecryptionError) {
      await setPending({ ...pending, pairing: undefined });
      fail('error.pairingForgedAsk');
    }
    throw error;
  }
  return { state: 'joined', ...(await adopt(unlocked, pending, dataKey, password)) };
}

/** Joining with the recovery key instead, when no other browser is left. */
export async function joinWithRecoveryKey(unlocked: UnlockedVault, recoveryKey: string, password?: string) {
  const pending = await pendingProvider();
  if (pending?.kind !== 'join') fail('error.signInFirst');
  let dataKey: CryptoKey;
  try {
    const { wrap } = await adapter().recoveryWrap({ recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) });
    dataKey = await unwrapRecoveryWrap(wrap, recoveryKey);
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'forbidden') fail('error.recoveryKeyWrong');
    if (error instanceof DecryptionError) fail('error.recoveryKeyWrong');
    throw error;
  }
  if (pending.pairing) await adapter().denyPairing(pending.pairing.id).catch(() => {});
  return adopt(unlocked, pending, dataKey, password);
}

// --- The browser that approves ----------------------------------------------

type Approving = Record<string, { keys: StoredKeys; requesterKey: string }>;

async function approving(): Promise<Approving> {
  return ((await platform().memory.get(APPROVING_KEY)) as Approving | undefined) ?? {};
}

export function openPairings(): Promise<PairingSummary[]> {
  return adapter().openPairings();
}

/**
 * Starts approving a request: sends this browser's key, and returns the code
 * computed over both. The requester's key is kept as it was when the code was
 * shown, so approving later wraps for exactly that key — a key swapped in
 * between would be a different code.
 */
export async function acceptPairing(id: string): Promise<{ code: string }> {
  const request = (await openPairings()).find((pairing) => pairing.id === id);
  if (!request) fail('error.pairingEnded');
  const keys = await newPairingKeys();
  const code = await pairingCode(id, request.requesterKey, keys.publicKey);
  await adapter().acceptPairing(id, keys.publicKey);
  await platform().memory.set(APPROVING_KEY, {
    ...(await approving()),
    [id]: { keys: await exportPairingKeys(keys), requesterKey: request.requesterKey },
  });
  return { code };
}

/** The person said the codes match: send the data key, wrapped for that browser alone. */
export async function approvePairing(unlocked: UnlockedVault, id: string): Promise<void> {
  const all = await approving();
  const held = all[id];
  if (!held) fail('error.approveAgain');
  const wrap = await wrapDataKeyForPairing(unlocked.dataKey, await importPairingKeys(held.keys), id, held.requesterKey);
  await adapter().approvePairing(id, wrap);
  delete all[id];
  await platform().memory.set(APPROVING_KEY, all);
}

export async function denyPairing(id: string): Promise<void> {
  await adapter().denyPairing(id);
  const all = await approving();
  delete all[id];
  await platform().memory.set(APPROVING_KEY, all);
}

// --- Proving the owner --------------------------------------------------------

/**
 * What a change to the account needs: the password on a password account, a
 * fresh sign-in with the provider on a provider account.
 */
export async function ownerProof(data: VaultData, authHash: () => Promise<string>): Promise<OwnerProof> {
  if (data.account.method === 'provider') {
    // Signed in with a passkey, which does not say whose sign-in the account
    // is: there is no password to ask for, and no provider to ask either.
    if (!data.account.provider) fail('error.providerHasNoPassword');
    return { reauth: await providerFlow(data.account.provider, 'reauth') };
  }
  return { authHash: await authHash() };
}
