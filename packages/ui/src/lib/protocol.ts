import type {
  DeviceSummary,
  PairingSummary,
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

/** What the popup/options pages know about the vault at any moment. */
export type VaultStatus =
  | { state: 'uninitialized' }
  | { state: 'locked'; hasRecovery: boolean }
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
  | { type: 'vault/createRecoveryKit'; password?: string }
  | { type: 'vault/removeRecoveryKit'; password?: string }
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
  | { type: 'account/signIn'; email: string; password: string }
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
  /** Brings what was kept back into this vault, with the password or recovery key of then. */
  | { type: 'account/bringBack'; archiveId: string; password?: string; recoveryKey?: string }
  | { type: 'account/revokeDevice'; id: string }
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
  kind: 'signup' | 'join';
  provider: SignInProvider;
  email: string;
  /** Joining, and the account's other browsers have been asked. */
  asked: boolean;
}

/** How this server signs people in besides a password, and how it hands a sign-in back. */
export interface ProviderOffer {
  providers: SignInProvider[];
  /** In this tab. Otherwise in the browser's sign-in window. */
  inTab: boolean;
}

/**
 * A sign-in made in the tab, as the account page finds it on coming back. A
 * new account or a join is not here: those are `provider/pending`.
 */
export type ProviderOutcome =
  | ({ kind: 'signedIn' } & SignInResult)
  | { kind: 'error'; message: string; key?: MessageKey | undefined; values?: Values | undefined };

export type ProviderStartResult =
  | { kind: 'new' | 'join'; email: string }
  | ({ kind: 'signedIn' } & SignInResult);

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
    : R extends { type: 'provider/start' }
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
      : R extends { type: 'account/signIn' } | { type: 'account/recover' }
        ? SignInResult
      : R extends
            | { type: 'vault/create' }
            | { type: 'vault/unlock' }
            | { type: 'vault/recover' }
        ? VaultStatus
        : R extends { type: 'account/devices' }
          ? DeviceSummary[]
          : R extends { type: 'account/archives' }
            ? KeptArchive[]
            : R extends { type: 'account/bringBack' }
              ? { brought: number }
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
