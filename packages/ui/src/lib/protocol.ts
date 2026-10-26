import type {
  DeviceSummary,
  PairingSummary,
  PasskeyAnswer,
  PasskeyUnlockKind,
  PasskeySignInOptions,
  PendingStartOver,
  ProtectionMode,
  SignInProvider,
  VaultData,
  VaultItem,
  VaultSettings,
} from '@authx/core';
import type { Values } from '../i18n/format.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { host } from '../host.js';

/*
 * What the pages ask of the vault and what comes back: the contract between
 * these screens and the vault's one writer, which in the extension is the
 * service worker. The pages reach it only through their host (host.ts).
 */

/**
 * Each passkey that opens a locked vault instead of the password, by kind, and
 * what it is asked: both safe to show, since only the passkey's answer opens
 * anything.
 */
export type PasskeyAsks = Partial<Record<PasskeyUnlockKind, { credentialId: string; prfInput: string }>>;

/** What the popup/options pages know about the vault at any moment. */
export type VaultStatus =
  | { state: 'uninitialized' }
  | {
      state: 'locked';
      hasRecovery: boolean;
      /** Absent when no passkey opens it. */
      passkeys?: PasskeyAsks;
    }
  /**
   * The vault is protected by a device key that is no longer in this browser
   * profile — cleared site data, a new profile, or a reinstall. Without a
   * recovery key nothing can open it, and the only way forward is to reset.
   */
  | { state: 'unrecoverable'; hasRecovery: boolean }
  | {
      state: 'unlocked';
      data: VaultData;
      protection: ProtectionMode;
      hasRecovery: boolean;
      /**
       * Signed in, and the account holds this device's recovery kit — so the
       * printed key also recovers the account on a new device.
       */
      accountRecovery: boolean;
      /**
       * It also opens with a passkey: the computer's own check of the person
       * (Touch ID, Windows Hello), a security key, or both.
       */
      passkeys: Record<PasskeyUnlockKind, boolean>;
    };

/** How a new vault should be protected. */
export type ProtectionChoice =
  | { mode: 'device' }
  | { mode: 'passphrase'; password: string };

/**
 * Mutations are described rather than applied by the caller: the service worker
 * is the only writer, which keeps the popup and the options tab from clobbering
 * each other when both are open.
 */
export type Mutation =
  | { op: 'items/add'; items: VaultItem[] }
  | { op: 'items/update'; id: string; patch: Partial<VaultItem> }
  | { op: 'items/delete'; id: string }
  | { op: 'items/restore'; id: string }
  | { op: 'items/advanceCounter'; id: string }
  | { op: 'groups/add'; name: string }
  | { op: 'groups/rename'; id: string; name: string }
  | { op: 'groups/delete'; id: string }
  | { op: 'groups/move'; id: string; direction: -1 | 1 }
  | { op: 'settings/update'; patch: Partial<VaultSettings> };

export type Request =
  | { type: 'vault/status' }
  | { type: 'vault/create'; protection: ProtectionChoice }
  | { type: 'vault/unlock'; password: string }
  /** Opens with a passkey's PRF answer (base64), asked by the page: vault/passkey-unlock.ts in core. */
  | { type: 'vault/unlockWithPasskey'; kind: PasskeyUnlockKind; prf: string }
  /**
   * Adds that way in, for a passkey the page just made, beside the other
   * kind's. The master password first: someone at an unlocked vault must not
   * add a way in of their own.
   */
  | {
      type: 'vault/enablePasskeyUnlock';
      kind: PasskeyUnlockKind;
      password: string;
      credentialId: string;
      prfInput: string;
      prf: string;
    }
  | { type: 'vault/disablePasskeyUnlock'; kind: PasskeyUnlockKind }
  | { type: 'vault/lock' }
  /** Checks the master password without changing anything: a gate, not an unlock. */
  | { type: 'vault/confirmPassword'; password: string }
  | { type: 'vault/mutate'; mutation: Mutation }
  /** Switch between device and passphrase protection, or change the password. */
  | { type: 'vault/setProtection'; next: ProtectionChoice; currentPassword?: string }
  /**
   * Issue a recovery kit. The key is returned once and stored nowhere. Signed
   * in, the kit is also the account's, and changing it needs the account
   * password — it is a way to reset the account.
   */
  | { type: 'vault/createRecoveryKit'; password?: string; secondStep?: OwnerSecondStep }
  | { type: 'vault/removeRecoveryKit'; password?: string; secondStep?: OwnerSecondStep }
  /**
   * The way back in when the password is gone. Re-protection happens in the
   * same call: there must be no moment where the vault is open but still locked
   * behind the key its owner has lost.
   */
  | { type: 'vault/recover'; recoveryKey: string; next: ProtectionChoice }
  | { type: 'vault/reset' }
  /**
   * Step one of creating the account: checks the password here, then asks for
   * a code to be emailed to the address.
   */
  | { type: 'account/startSignUp'; email: string; password: string }
  /**
   * Create the sync account, keeping this device's data key and how it opens.
   * `password` is the vault's master password if it has one, which then serves
   * as the account's too; otherwise it is a new password for the account alone.
   * `code` is the one emailed by `account/startSignUp`.
   */
  | { type: 'account/signUp'; email: string; password: string; code: string }
  /** Join an existing account; this device adopts the account's data key. */
  /**
   * On an account with a second step, the first answer is `SecondStepAsked`:
   * the same request again with `secondStep` finishes it. The password comes
   * again with it, since only the password opens the key; the ticket is the
   * page's to hold, and lasts five minutes.
   */
  | { type: 'account/signIn'; email: string; password: string; secondStep?: { ticket: string; answer: SecondStepAnswer } }
  /**
   * A challenge for one of the account's passkeys to answer as a sign-in's
   * second step: the password sign-in's `ticket`, or without one the Google or
   * GitHub sign-in waiting here.
   */
  | { type: 'account/secondStepChallenge'; ticket?: string }
  /** A challenge to sign in with one of the account's passkeys, from the server. */
  | { type: 'account/passkeyChallenge' }
  /**
   * Join an account with one of its passkeys, touched for that challenge: one
   * that unlocks opens the account's root, and the root this app's key. Only
   * a vault that opens with the device key, which goes on doing so.
   */
  | { type: 'account/passkeySignIn'; touch: PasskeyTouchSent }
  /**
   * Join an account whose password is forgotten, with its recovery key. The
   * password given becomes the account's, and this vault's.
   */
  | { type: 'account/recover'; email: string; recoveryKey: string; password: string }
  /** A new account password; also this vault's, if it locks with one. */
  | { type: 'account/changePassword'; currentPassword: string; nextPassword: string }
  | { type: 'account/signOut' }
  | { type: 'account/sync' }
  | { type: 'account/devices' }
  /** What the account kept from before it started over, for this app. */
  | { type: 'account/archives' }
  | { type: 'account/confirmRecoveryKey'; recoveryKey: string }
  /**
   * A start over asked for with the account's email alone, still waiting its
   * week; null when none is. Asked of the server at most hourly, unless
   * `fresh`.
   */
  | { type: 'account/startOverWaiting'; fresh?: boolean }
  /** Cancels it: any device signed in may, and the account page. */
  | { type: 'account/cancelStartOver' }
  /** Brings what was kept back into this vault, with the password or recovery key of then. */
  | { type: 'account/bringBack'; archiveId: string; password?: string; recoveryKey?: string }
  /**
   * Removes a device from the account. One of this app's is sent a proof
   * made with this vault's key, and takes the account's codes off itself when
   * it next connects; another app's is only signed out.
   */
  | { type: 'account/revokeDevice'; id: string }
  /** Whether this browser was removed from its account, until the person closes the notice. */
  | { type: 'account/removedNotice' }
  | { type: 'account/dismissRemovedNotice' }
  /**
   * Deletes the account on the server. The vault on this device stays. A
   * provider account proves it is its owner by signing in again instead.
   */
  | { type: 'account/delete'; password?: string }
  /** The providers this server signs in with; empty when it has none. */
  | { type: 'provider/offered' }
  | { type: 'provider/pending' }
  /**
   * The address to take this tab to, to sign in with the provider there. The
   * answer comes back to the service worker, which brings the tab back to
   * the account page; `provider/outcome` then says how it went.
   */
  | { type: 'provider/begin'; provider: SignInProvider }
  /** What a sign-in made in the tab came to, once; null when there is nothing to say. */
  | { type: 'provider/outcome' }
  /**
   * Opens the provider's sign-in window, for a server that cannot hand the
   * answer back to a tab. Signs straight in when this vault already holds the
   * account's key; otherwise says whether there is an account to create or
   * one to join.
   */
  | { type: 'provider/start'; provider: SignInProvider }
  /** Creates the account a provider sign-in found missing, and its recovery key. */
  | { type: 'provider/create' }
  | { type: 'provider/cancel' }
  /** Finishes the Google or GitHub sign-in waiting at its second step. */
  | { type: 'provider/secondStep'; answer: SecondStepAnswer }
  /**
   * Joining: asks the account's browsers to let this one in. `password` is
   * this vault's master password, when it locks with one: taking the
   * account's key needs it.
   */
  | { type: 'pairing/request'; password?: string }
  | { type: 'pairing/poll'; password?: string }
  /** Joining with the recovery key, when no other browser is left. */
  | { type: 'pairing/recover'; recoveryKey: string; password?: string }
  /** Approving: the browsers asking to join this account. */
  | { type: 'pairing/list' }
  /** Shows a code; nothing is sent until `pairing/approve`. */
  | { type: 'pairing/accept'; id: string }
  | { type: 'pairing/approve'; id: string }
  | { type: 'pairing/deny'; id: string }
  | { type: 'activity/ping' }
  | { type: 'tab/context' }
  | { type: 'tab/captureQr' }
  | { type: 'tab/detectFields' }
  | { type: 'tab/fill'; code: string };

export interface TabContext {
  tabId: number | null;
  url: string | null;
  hostname: string | null;
  title: string | null;
}

export interface FieldDetection {
  found: boolean;
  count: number;
}

/** What one sync cycle did, for the status line in Settings. */
export interface SyncSummary {
  pulled: number;
  pushed: number;
  conflicts: number;
  rejectedForLimit: number;
  /** Records that would not open — corrupt, or forged by whoever served them. */
  rejectedRecords: number;
  /** Accounts the pull removed. Surfaced so a mass deletion is never silent. */
  deleted: number;
  at: number;
}

/**
 * Signed in, and what the first sync did. `syncError` is set when that sync
 * failed: the sign-in itself still succeeded, and the UI should say so.
 */
export interface SignInResult {
  status: VaultStatus;
  sync: SyncSummary | null;
  syncError: string | null;
}

/**
 * A new account, and the recovery key issued with it — null if issuing failed,
 * which leaves the account fine and Settings asking for a key.
 */
export interface SignUpResult extends SignInResult {
  recoveryKey: string | null;
}

/** What a page may know about a provider sign-in in progress: never its tokens or keys. */
export interface ProviderPending {
  /** `secondStep`: the account asks for one before there is a session. */
  kind: 'signup' | 'join' | 'secondStep';
  provider: SignInProvider;
  email: string;
  /** Joining, and the account's other browsers have been asked. */
  asked: boolean;
  /** At the second step: the account has passkeys, and one may answer it. */
  passkeys?: boolean;
}

/** How this server signs people in besides a password, and how it hands a sign-in back. */
export interface ProviderOffer {
  providers: SignInProvider[];
  /** In this tab. Otherwise in the browser's sign-in window. */
  inTab: boolean;
  /** It signs in with the account's passkeys. Whether this browser can ask one is the host's to say. */
  passkeys: boolean;
  /** An account may turn on a second step at sign-in. An answer kept from before says nothing, which is no. */
  secondStep?: boolean;
}

/**
 * One of the account's passkeys, touched in a page for a challenge from
 * `account/passkeyChallenge`, on its way to the vault service: the answer as
 * the browser gave it, and apart from it the PRF answer, base64, or null for a
 * passkey that gave none. The service sends the server what it checks of the
 * answer and nothing else, and keeps the PRF answer to open the root with.
 */
export interface PasskeyTouchSent {
  challengeId: string;
  answer: PasskeyAnswer;
  prf: string | null;
}

/**
 * A sign-in made in the tab, as the account page finds it on coming back. A
 * new account or a join is not here: those are `provider/pending`.
 */
export type ProviderOutcome =
  | ({ kind: 'signedIn' } & SignInResult)
  | ProviderToPassword
  | { kind: 'error'; message: string; key?: MessageKey | undefined; values?: Values | undefined };

/**
 * Google or GitHub signed in to an account that has a password too: they say
 * who is signing in, and only the password opens the account's key here. The
 * session they gave is ended, and the person signs in with the password.
 */
export interface ProviderToPassword {
  kind: 'password';
  provider: SignInProvider;
  email: string;
}

export type ProviderStartResult =
  | { kind: 'new' | 'join'; email: string }
  | ({ kind: 'signedIn' } & SignInResult)
  | ProviderToPassword
  /** The account asks for a second step; `provider/secondStep` finishes it. */
  | { kind: 'secondStep'; passkeys: boolean };

/**
 * The second step of a sign-in, on an account that has one (keyrook-account's
 * docs/console.md, S21): the code the person's authenticator app shows, the
 * recovery key in its place for an app that was lost, or one of the account's
 * passkeys, touched for `account/secondStepChallenge`.
 */
export type SecondStepAnswer = { code: string } | { recoveryKey: string } | { passkey: PasskeyTouchSent };

/** The second step a change asks of the owner, beside the password or a fresh sign-in: no passkey there. */
export type OwnerSecondStep = { code: string } | { recoveryKey: string };

/** A sign-in stopped at its second step: no session yet. */
export interface SecondStepAsked {
  secondStep: { ticket: string; passkeys: boolean };
}

export type PairingPoll =
  | { state: 'waiting' }
  /** Accepted on the other browser: both now show this code. */
  | { state: 'compare'; code: string }
  | ({ state: 'joined' } & SignInResult);

type PairingResponseFor<R extends Request> = R extends { type: 'provider/offered' }
  ? ProviderOffer
  : R extends { type: 'provider/pending' }
    ? ProviderPending | null
    : R extends { type: 'provider/begin' }
      ? { url: string }
    : R extends { type: 'provider/outcome' }
      ? ProviderOutcome | null
    : R extends { type: 'provider/start' } | { type: 'provider/secondStep' }
      ? ProviderStartResult
      : R extends { type: 'provider/create' }
        ? SignUpResult
        : R extends { type: 'pairing/request' }
          ? { id: string }
          : R extends { type: 'pairing/poll' }
            ? PairingPoll
            : R extends { type: 'pairing/recover' }
              ? SignInResult
              : R extends { type: 'pairing/list' }
                ? PairingSummary[]
                : R extends { type: 'pairing/accept' }
                  ? { code: string }
                  : void;

export type ResponseFor<R extends Request> = R extends { type: `provider/${string}` | `pairing/${string}` }
  ? PairingResponseFor<R>
  : R extends { type: 'vault/status' }
  ? VaultStatus
  : R extends { type: 'vault/createRecoveryKit' }
    ? { recoveryKey: string }
    : R extends { type: 'account/sync' }
      ? SyncSummary
      : R extends { type: 'account/signUp' }
        ? SignUpResult
      : R extends { type: 'account/signIn' }
        ? SignInResult | SecondStepAsked
      : R extends { type: 'account/recover' } | { type: 'account/passkeySignIn' }
        ? SignInResult
      : R extends { type: 'account/secondStepChallenge' }
        ? PasskeySignInOptions
      : R extends { type: 'account/passkeyChallenge' }
        ? PasskeySignInOptions
      : R extends
            | { type: 'vault/create' }
            | { type: 'vault/unlock' }
            | { type: 'vault/unlockWithPasskey' }
            | { type: 'vault/recover' }
        ? VaultStatus
        : R extends { type: 'vault/enablePasskeyUnlock' } | { type: 'vault/disablePasskeyUnlock' }
          ? { credentialId: string } | null
        : R extends { type: 'account/devices' }
          ? DeviceSummary[]
          : R extends { type: 'account/archives' }
            ? KeptArchive[]
            : R extends { type: 'account/bringBack' }
              ? { brought: number }
            : R extends { type: 'account/startOverWaiting' }
              ? PendingStartOver | null
            : R extends { type: 'account/removedNotice' }
              ? RemovedNotice | null
          : R extends { type: 'tab/context' }
              ? TabContext
              : R extends { type: 'tab/captureQr' }
                ? { dataUrl: string }
                : R extends { type: 'tab/detectFields' }
                  ? FieldDetection
                  : void;

/**
 * What an account kept of this app's when it started over: its records,
 * sealed under the key of then, until `expiresAt`.
 */
/**
 * This browser was removed from its account by the account's owner, with a
 * proof it checked, and the account's codes came off it.
 */
export interface RemovedNotice {
  at: number;
  /** Accounts added or changed here that never reached the account, still here. */
  kept: boolean;
}

export interface KeptArchive {
  id: string;
  archivedAt: number;
  expiresAt: number;
  /** How many of this app's records it holds. */
  records: number;
  /** What opens it: the password of then, the recovery key of then. */
  byPassword: boolean;
  byRecoveryKey: boolean;
}

/** The single write path handed down to every panel. */
export type Mutate = (mutation: Mutation) => Promise<void>;

export type Envelope<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; key?: MessageKey | undefined; values?: Values | undefined };

/**
 * A refusal from the service worker. Its `key` is what the page translates —
 * see `errorText` — and its message the English, or the key, for logs.
 */
export class BackgroundError extends Error {
  override readonly name = 'BackgroundError';
  constructor(
    message: string,
    readonly key?: MessageKey,
    readonly values?: Values,
  ) {
    super(message);
  }
}

/** Typed wrapper around the host's `request`. Throws on failure. */
export async function send<R extends Request>(request: R): Promise<ResponseFor<R>> {
  const response = (await host().request(request)) as Envelope<ResponseFor<R>> | undefined;

  if (!response) {
    throw new BackgroundError('No response from the background service worker.', 'error.noWorker');
  }
  if (!response.ok) throw new BackgroundError(response.error, response.key, response.values);
  return response.value;
}

/** Subscribe to vault-changed broadcasts; returns an unsubscribe function. */
export function onVaultChanged(handler: () => void): () => void {
  return host().onVaultChanged(handler);
}

export type { ProtectionMode };
