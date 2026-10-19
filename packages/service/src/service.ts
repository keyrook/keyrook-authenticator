/**
 * The vault service — the single writer for the vault. Every page's request
 * comes here (`handle`), and every write goes through one queue.
 *
 * The extension runs it in its MV3 service worker, which is terminated
 * aggressively, so no state is assumed to survive between requests:
 * everything is rehydrated from the platform's storage, with the unwrapped
 * data key coming from its memory when the vault is password-protected, or
 * from the device key when it is not. What the platform is, see platform.ts.
 */
import {
  accountPasswordProblem,
  addGroup,
  addItem,
  advanceHotpCounter,
  applyRecoveryState,
  attachRecoveryKit,
  createVault,
  DecryptionError,
  deleteGroup,
  deleteItem,
  deviceKeyring,
  exportDataKey,
  importDataKey,
  isValidBase32,
  keyringForFile,
  moveGroup,
  passphraseKeyring,
  pendingItems,
  hasRecoveryKit,
  readPayload,
  removeRecoveryKit,
  restoreItem,
  rewrapVault,
  sealVault,
  SyncHttpError,
  unlockVault,
  unlockWithRecoveryKey,
  updateGroup,
  updateItem,
  updateSettings,
  verifyPassword,
  type Keyring,
  type OwnerProof,
  type ProviderTicket,
  type SignInProvider,
  type UnlockedVault,
  type VaultData,
  type VaultFile,
} from '@authx/core';
import { AppError, fail } from '@authx/ui/i18n/errors.js';
import { platform, syncEnabled } from './platform.js';
import { createSerialiser } from './serial.js';
import { bringBack, keptArchives, replaceAccountKey, replacementDue } from './keys.js';
import {
  accountAuthHash,
  assertKitIsAccounts,
  changeAccountPassword,
  deleteAccount,
  endSession,
  followLocalRecovery,
  hasAccountPassword,
  isSignedIn,
  listDevices,
  markSignedOutElsewhere,
  prepareSignUp,
  proveAccountPassword,
  publishRecovery,
  recoverAccount,
  revokeDevice,
  runSync,
  signIn,
  signOut,
  signUp,
} from './sync.js';
import {
  acceptPairing,
  approvePairing,
  cancelProviderSignIn,
  createProviderAccount,
  denyPairing,
  joinWithRecoveryKey,
  openPairings,
  ownerProof,
  pendingView,
  pollPairing,
  beginTabFlow,
  providerFlow,
  providerOffer,
  requestPairing,
  setTabOutcome,
  startProviderSignIn,
  takeTabFlow,
  takeTabOutcome,
  ticketFrom,
} from './provider.js';
import { tokenStore } from './tokens.js';
import type {
  Envelope,
  Mutation,
  ProtectionChoice,
  ProviderStartResult,
  Request,
  SignInResult,
  SyncSummary,
  VaultStatus,
} from '@authx/ui/lib/protocol.js';
import {
  clearSessionKey,
  clearVaultFile,
  loadSessionKey,
  loadVaultFile,
  markActive,
  saveSessionKey,
  saveVaultFile,
} from './storage.js';

/**
 * What the service answers: everything a page asks but what only the
 * extension can do with the tab it was opened on, which the extension answers
 * itself.
 */
export type VaultRequest = Exclude<Request, { type: `tab/${string}` }>;

const AUTO_LOCK_ALARM = 'authx.autolock';
const SYNC_ALARM = 'authx.sync';
const SYNC_INTERVAL_MINUTES = 5;

/** Warm cache for the lifetime of this worker instance only. */
let cached: UnlockedVault | null = null;

/**
 * How many times the vault has locked. A lock never waits for the queue:
 * requests to the sync server have no timeout, and "Lock now" must not sit
 * behind one that hangs. So a turn that read the session before a lock can
 * finish after it, and everything that puts a session back first checks that
 * no lock came in between — see `keep`.
 */
let locks = 0;
/** `locks` as the running turn found it. Turns never overlap, so one will do. */
let locksAtTurn = 0;

const queue = createSerialiser();

/**
 * Every write runs through here, one at a time. See createSerialiser: the whole
 * read-modify-write has to be inside, or two of them still race on the snapshot
 * they read before taking their turn.
 */
function serial<T>(run: () => Promise<T>): Promise<T> {
  return queue(() => {
    locksAtTurn = locks;
    return run();
  });
}

function lockedDuringTurn(): boolean {
  return locks !== locksAtTurn;
}

/**
 * Leaves `next` as the open session, for a caller holding the write queue —
 * unless the vault locked while the turn ran. Then its write still reaches the
 * disk, sealed like any other, but nothing reopens what the lock closed, and
 * any session opened since goes too: it may have been read before that write.
 */
function keep(next: UnlockedVault): boolean {
  if (lockedDuringTurn()) {
    cached = null;
    return false;
  }
  cached = next;
  return true;
}

/** Keeps a password-protected vault's data key in session memory, on the same terms. */
async function keepSessionKey(dataKey: CryptoKey): Promise<void> {
  const raw = await exportDataKey(dataKey);
  // Checked after the export, which waits, and just before the write: a lock
  // from here on clears the key after it is stored.
  if (!lockedDuringTurn()) await saveSessionKey(raw);
}

/** Read the vault, change it, store it — without anything else interleaving. */
async function mutateVault<T>(
  run: (unlocked: UnlockedVault) => Promise<{ data: VaultData; result: T }>,
): Promise<T> {
  return serial(async () => {
    const unlocked = await getUnlocked();
    if (!unlocked) fail('error.vaultLocked');
    const { data, result } = await run(unlocked);
    await persist(data);
    return result;
  });
}

async function keyringFor(choice: ProtectionChoice): Promise<Keyring> {
  return choice.mode === 'device'
    ? deviceKeyring(await platform().deviceKey.getOrCreate())
    : passphraseKeyring(choice.password);
}

/**
 * Device-protected vaults open silently. Password-protected ones open only
 * while the data key is still in session memory.
 */
async function getUnlocked(): Promise<UnlockedVault | null> {
  if (cached) return cached;

  // Often outside the queue — `status` is — so a lock or a turn can land
  // while this reads. A lock wins: start again from what it left, which for a
  // password-protected vault is no key. A session a turn kept meanwhile is
  // newer than the file read here, and stays.
  const before = locks;
  const opened = await openFromStorage();
  if (locks !== before) return getUnlocked();
  cached ??= opened;
  return cached;
}

async function openFromStorage(): Promise<UnlockedVault | null> {
  const file = await loadVaultFile();
  if (!file) return null;

  try {
    if (file.protection.mode === 'device') {
      const deviceKey = await platform().deviceKey.get();
      if (!deviceKey) return null;
      return await unlockVault(file, deviceKeyring(deviceKey));
    }

    const rawKey = await loadSessionKey();
    if (!rawKey) return null;

    const dataKey = await importDataKey(rawKey);
    return { file, dataKey, data: await readPayload(file, dataKey) };
  } catch {
    // A key that no longer opens the file means the vault was replaced or
    // reset elsewhere. Treat it as locked rather than surfacing a crash.
    await clearSessionKey();
    return null;
  }
}

async function status(): Promise<VaultStatus> {
  const file = await loadVaultFile();
  if (!file) return { state: 'uninitialized' };

  const hasRecovery = hasRecoveryKit(file);
  const unlocked = await getUnlocked();
  if (unlocked) return unlockedStatus(unlocked);

  // A device-protected vault whose device key is gone cannot be opened by any
  // password. Say so plainly instead of showing a prompt that cannot work —
  // unless a recovery kit exists, which is exactly the case it is for.
  if (file.protection.mode === 'device' && !(await platform().deviceKey.get())) {
    return { state: 'unrecoverable', hasRecovery };
  }
  return { state: 'locked', hasRecovery };
}

/** Seals and stores `data`, for a caller holding the write queue. */
async function persist(data: VaultData): Promise<UnlockedVault> {
  const unlocked = cached;
  if (!unlocked) fail('error.vaultLocked');

  const file = await sealVault(unlocked.file, unlocked.dataKey, data);
  await saveVaultFile(file);
  const next = { ...unlocked, file, data };
  keep(next);
  broadcastChange();
  return next;
}

function broadcastChange(): void {
  platform().announceChange();
}

async function scheduleAutoLock(file: VaultFile, minutes: number): Promise<void> {
  await platform().timers.clear(AUTO_LOCK_ALARM);
  // There is nothing to lock when the key comes from the device itself.
  if (file.protection.mode !== 'passphrase' || minutes <= 0) return;
  platform().timers.once(AUTO_LOCK_ALARM, minutes);
}

async function lock(): Promise<void> {
  locks += 1;
  cached = null;
  await clearSessionKey();
  await platform().timers.clear(AUTO_LOCK_ALARM);
  await platform().showLocked(true);
  broadcastChange();
}

async function openSession(unlocked: UnlockedVault): Promise<VaultStatus> {
  // A lock that came while this turn opened the vault came after the request
  // to open it, and wins.
  if (!keep(unlocked)) return status();
  if (unlocked.file.protection.mode === 'passphrase') await keepSessionKey(unlocked.dataKey);
  await markActive();
  await scheduleAutoLock(unlocked.file, unlocked.data.settings.autoLockMinutes);
  // Again after those waits, or the toolbar would say unlocked over a lock.
  if (lockedDuringTurn()) return status();
  await platform().showLocked(false);
  // Only the page that asked gets the answer. Any other one open — the
  // Settings tab a new install opens, a locked one left behind — is drawing
  // the setup or unlock screen, and would keep drawing it until reloaded.
  broadcastChange();
  return unlockedStatus(unlocked);
}

function unlockedStatus(unlocked: UnlockedVault): VaultStatus {
  const { file, data } = unlocked;
  return {
    state: 'unlocked',
    data,
    protection: file.protection.mode,
    hasRecovery: hasRecoveryKit(file),
    // The kit on this device is the account's exactly when it is the last one
    // this device published or adopted.
    accountRecovery:
      isSignedIn(data) && file.recovery !== null && file.recovery.createdAt === data.sync.recoveryAt,
  };
}

/** Applies a mutation. There is no cap on how many accounts a vault holds. */
function applyMutation(data: VaultData, mutation: Mutation): { data: VaultData } {
  switch (mutation.op) {
    case 'items/add':
      return { data: mutation.items.reduce((acc, item) => addItem(acc, item), data) };
    case 'items/update':
      return { data: updateItem(data, mutation.id, mutation.patch) };
    case 'items/delete':
      return { data: deleteItem(data, mutation.id) };
    case 'items/restore': {
      // An entry with no key is the deletion of an account this vault never
      // had, which builds before 0.4 kept. Restored, it is an account that
      // makes no codes, and the next sync sends it to every device.
      const item = data.items.find((entry) => entry.id === mutation.id);
      if (item && !isValidBase32(item.secret)) fail('error.restoreEmpty');
      return { data: restoreItem(data, mutation.id) };
    }
    case 'items/advanceCounter':
      return { data: advanceHotpCounter(data, mutation.id) };
    case 'groups/add':
      return { data: addGroup(data, mutation.name) };
    case 'groups/rename':
      return { data: updateGroup(data, mutation.id, { name: mutation.name.trim() || 'Untitled group' }) };
    case 'groups/delete':
      return { data: deleteGroup(data, mutation.id) };
    case 'groups/move':
      return { data: moveGroup(data, mutation.id, mutation.direction) };
    case 'settings/update':
      return { data: updateSettings(data, mutation.patch) };
  }
}

async function requireUnlocked(): Promise<UnlockedVault> {
  if (!syncEnabled()) fail('error.syncUnavailable');
  const unlocked = await getUnlocked();
  if (!unlocked) fail('error.vaultLocked');
  return unlocked;
}

async function scheduleSync(): Promise<void> {
  await platform().timers.clear(SYNC_ALARM);
  platform().timers.every(SYNC_ALARM, SYNC_INTERVAL_MINUTES);
}


/**
 * The server has ended this device's session. Recorded in the vault — keeping
 * the address, so the sign-in form can say which account — rather than left as
 * a vault that believes it is signed in with no session behind it. For a
 * caller already holding the write queue.
 */
async function endSessionInTurn(unlocked: UnlockedVault): Promise<void> {
  await platform().timers.clear(SYNC_ALARM);
  if (isSignedIn(unlocked.data)) await persist(await markSignedOutElsewhere(unlocked.data));
}

/**
 * Runs an account call outside the write queue — listing or removing devices —
 * and records a rejected session the same way a sync cycle would. Whichever
 * call meets the 401 first clears the tokens, so every one of them has to.
 */
async function withSession<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (sessionEnded(error)) {
      await serial(async () => {
        const unlocked = await getUnlocked();
        if (unlocked) await endSessionInTurn(unlocked);
      });
      fail('error.signedOutElsewhere');
    }
    throw error;
  }
}

/**
 * The server's word that this device's session is over: ended, or issued
 * under a key another device of this app has since replaced. Either way the
 * device signs in again, and gets the key the account has now.
 */
const KEY_REPLACED = 'This product’s key was replaced on another device. Sign in again.';
function sessionEnded(error: unknown): boolean {
  if (!(error instanceof SyncHttpError)) return false;
  // Only the session's own 401. A 401 for a wrong proof — the password of
  // before a start-over, say — is that answer, not a reason to sign out.
  if (error.status === 401) return error.code === 'unauthorized';
  return error.status === 403 && error.message === KEY_REPLACED;
}

/**
 * One cycle, for a caller already holding the write queue. Installs the
 * account's recovery kit if a newer one arrived, and notices when the server
 * has ended this device's session so the settings page can say so.
 *
 * Then, when the account asks for a new key — its recovery key leaked — a
 * vault that opens with the device key replaces it here, and a second cycle
 * sends everything up under the new one. A vault with a master password
 * waits for the password: sealing it again needs it (see `vault/unlock`).
 */
async function syncInTurn(unlocked: UnlockedVault) {
  // Signed in with no session left: another call already met the 401.
  if (!(await tokenStore.get())) {
    await endSessionInTurn(unlocked);
    fail('error.signedOutElsewhere');
  }

  let done = await cycleInTurn(unlocked);
  if (done.unlocked.file.protection.mode === 'device' && (await replacementDue(done.unlocked.data).catch(() => false))) {
    const replaced = await replaceKeyInTurn(done.unlocked, deviceKeyring(await platform().deviceKey.getOrCreate()));
    done = await cycleInTurn(replaced);
  }
  return done;
}

async function cycleInTurn(unlocked: UnlockedVault) {
  let outcome;
  try {
    outcome = await runSync(unlocked);
  } catch (error) {
    if (sessionEnded(error)) {
      await endSessionInTurn(unlocked);
      fail('error.signedOutElsewhere');
    }
    throw error;
  }

  if (outcome.recovery) {
    keep({ ...unlocked, file: applyRecoveryState(unlocked.file, outcome.recovery) });
  }
  return { unlocked: await persist(outcome.data), summary: outcome.summary };
}

/**
 * Replaces this app's key on the account, in the turn, and keeps the vault
 * sealed under the new one from that moment: the key exists nowhere else.
 */
async function replaceKeyInTurn(unlocked: UnlockedVault, keyring: Keyring): Promise<UnlockedVault> {
  const replaced = await replaceAccountKey(unlocked, keyring);
  await saveVaultFile(replaced.file);
  const next: UnlockedVault = { file: replaced.file, dataKey: replaced.dataKey, data: replaced.data };
  keep(next);
  if (replaced.file.protection.mode === 'passphrase') await keepSessionKey(replaced.dataKey);
  broadcastChange();
  return next;
}

/**
 * Runs one cycle if there is an account to run it against. Returns null rather
 * than throwing when there is not, so the periodic alarm stays quiet.
 */
async function syncNow() {
  if (!syncEnabled()) return null;

  // Inside the same queue as every other write. A cycle takes as long as the
  // network does, and anything the user changes meanwhile would otherwise be
  // overwritten by the snapshot the sync started from.
  return serial(async () => {
    const unlocked = await getUnlocked();
    if (!unlocked || !isSignedIn(unlocked.data)) return null;
    return (await syncInTurn(unlocked)).summary;
  });
}

/**
 * The first cycle after joining an account. Its outcome is reported beside the
 * sign-in, never instead of it: by now the device *is* signed in, and a network
 * hiccup here once surfaced as "sign-in failed" on a device that had succeeded.
 */
async function firstSync(): Promise<{ sync: SyncSummary | null; syncError: string | null }> {
  try {
    return { sync: await syncNow(), syncError: null };
  } catch (error) {
    return { sync: null, syncError: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Redeems a provider's ticket in the write queue, and says where that left
 * this browser: signed in, or with an account to create or one to join.
 */
async function completeProviderSignIn(provider: SignInProvider, ticket: ProviderTicket): Promise<ProviderStartResult> {
  const outcome = await serial(async () => {
    const unlocked = await requireUnlocked();
    if (isSignedIn(unlocked.data)) fail('error.alreadySignedIn');
    const started = await startProviderSignIn(unlocked, provider, ticket);
    if (started.kind === 'signedIn') {
      await saveVaultFile(started.file);
      keep({ ...unlocked, file: started.file, data: started.data });
      broadcastChange();
      await scheduleSync();
    }
    return started;
  });
  if (outcome.kind !== 'signedIn') {
    broadcastChange();
    return { kind: outcome.kind, email: outcome.email };
  }
  return { kind: 'signedIn', status: await status(), ...(await firstSync()) };
}

/**
 * Takes the account's data key, for a caller holding the write queue. Like a
 * password sign-in, the key changes: a vault with a master password keeps it
 * in session memory, and one with a device key reads it through that.
 */
async function adoptInTurn(joined: { file: VaultFile; dataKey: CryptoKey; data: VaultData }): Promise<void> {
  await saveVaultFile(joined.file);
  keep({ file: joined.file, dataKey: joined.dataKey, data: joined.data });
  if (joined.file.protection.mode === 'passphrase') await keepSessionKey(joined.dataKey);
  broadcastChange();
  await scheduleSync();
}

async function joinedResult(): Promise<SignInResult> {
  return { status: await status(), ...(await firstSync()) };
}

/**
 * Publishes a change to the account's recovery kit and applies it here. Syncs
 * first, so the change is ordered after any another device already made. The
 * caller brings proof of the account password: see `publishRecovery`.
 */
async function changeAccountKit(
  current: UnlockedVault,
  proof: OwnerProof,
  change: (
    unlocked: UnlockedVault,
    issuedAt: number,
  ) => Promise<{ file: VaultFile; recoveryKey: string | null }>,
): Promise<string | null> {
  const { unlocked } = await syncInTurn(current);
  await assertKitIsAccounts(unlocked.data);
  // Never behind the newest state this device has seen, whatever its clock.
  const issuedAt = Math.max(Date.now(), (unlocked.data.sync.recoveryAt ?? 0) + 1);
  const { file, recoveryKey } = await change(unlocked, issuedAt);

  await publishRecovery(unlocked.dataKey, proof, file.recovery, recoveryKey, issuedAt);

  const data = { ...unlocked.data, sync: { ...unlocked.data.sync, recoveryAt: issuedAt } };
  const sealed = await sealVault(file, unlocked.dataKey, data);
  await saveVaultFile(sealed);
  keep({ ...unlocked, file: sealed, data });
  broadcastChange();
  return recoveryKey;
}

/**
 * What a change to the signed-in account needs, worked out before any
 * serialised turn: the account password's proof, or for a provider account a
 * fresh sign-in in the provider's window. Null when not signed in.
 */
async function accountProofIfSignedIn(password: string | undefined): Promise<OwnerProof | null> {
  const unlocked = await getUnlocked();
  if (!unlocked) fail('error.vaultLocked');
  if (!isSignedIn(unlocked.data)) return null;
  return ownerProof(unlocked.data, async () => {
    if (!password) fail('error.enterAccountPassword');
    return accountAuthHash(unlocked.data, password);
  });
}

/** Issues a kit whose `createdAt` is the account state's `issuedAt`. */
async function issueKit(synced: UnlockedVault, issuedAt: number) {
  const issued = await attachRecoveryKit(synced.file, synced.dataKey);
  return {
    file: { ...issued.file, recovery: { ...issued.file.recovery!, createdAt: issuedAt } },
    recoveryKey: issued.recoveryKey,
  };
}

/** A password-protected vault's new password takes effect here, at once. */
async function relockWith(unlocked: UnlockedVault, password: string): Promise<void> {
  const file = await rewrapVault(unlocked.file, unlocked.dataKey, await passphraseKeyring(password));
  await saveVaultFile(file);
  keep({ ...unlocked, file });
  await keepSessionKey(unlocked.dataKey);
  await scheduleAutoLock(file, unlocked.data.settings.autoLockMinutes);
}

// --- Request routing --------------------------------------------------------

export async function handle(request: VaultRequest): Promise<unknown> {
  switch (request.type) {
    case 'vault/status':
      return status();

    // The check that no vault exists is in the turn too. Two surfaces pressing
    // "Just start" together would otherwise both find none and both make one,
    // each with a device key of its own: the key store keeps one key, storage
    // keeps one vault, and when they are not a pair the vault opens only until
    // this worker stops.
    case 'vault/create':
      return serial(async () => {
        if (await loadVaultFile()) fail('error.vaultExists');
        const unlocked = await createVault(await keyringFor(request.protection));
        await saveVaultFile(unlocked.file);
        return openSession(unlocked);
      });

    // Nothing is written, but the file read here is the one every later write
    // seals over. Read outside the queue, a recovery finishing in another
    // surface meanwhile — its new password, its new kit — would be put back by
    // the next write.
    case 'vault/unlock': {
      let replaced = false;
      const opened = await serial(async () => {
        const file = await loadVaultFile();
        if (!file) fail('error.noVault');
        let keyring: Keyring;
        let unlocked: UnlockedVault;
        try {
          keyring = await keyringForFile(file, request.password);
          unlocked = await unlockVault(file, keyring);
        } catch (error) {
          if (error instanceof DecryptionError) fail('error.wrongMasterPassword');
          throw error;
        }
        const shown = await openSession(unlocked);
        // The password is here, so a key the account asked to replace can be:
        // the vault has to be sealed again under the new one. Not reaching the
        // server is no reason to keep anyone from their codes; it waits.
        if (shown.state === 'unlocked' && isSignedIn(unlocked.data) && cached === unlocked) {
          try {
            if (await replacementDue(unlocked.data)) {
              await replaceKeyInTurn(unlocked, keyring);
              replaced = true;
            }
          } catch {
            // Tried again the next time the password opens the vault.
          }
        }
        return replaced ? status() : shown;
      });
      // Everything goes up again under the new key.
      if (replaced) void syncNow().catch(() => undefined);
      return opened;
    }

    // Read-only: the stored file is opened with the password and thrown away.
    // Nothing is written and no session changes, so it needs no turn in the
    // serialiser.
    case 'vault/confirmPassword': {
      const file = await loadVaultFile();
      if (!file) fail('error.noVault');
      try {
        await unlockVault(file, await keyringForFile(file, request.password));
        return undefined;
      } catch (error) {
        if (error instanceof DecryptionError) fail('error.wrongMasterPassword');
        throw error;
      }
    }

    case 'vault/lock':
      return lock();

    case 'vault/mutate':
      return mutateVault(async (unlocked) => {
        const { data } = applyMutation(unlocked.data, request.mutation);
        if (request.mutation.op === 'settings/update') {
          await scheduleAutoLock(unlocked.file, data.settings.autoLockMinutes);
        }
        return { data, result: undefined };
      });

    case 'vault/setProtection':
      return serial(async () => {
      const unlocked = await getUnlocked();
      if (!unlocked) fail('error.vaultLocked');
      // A Google or GitHub account has no password for this one to equal.
      const signedIn = hasAccountPassword(unlocked.data);

      // Proving knowledge of the current password is required before it can be
      // replaced or removed — otherwise anyone at an unlocked screen could
      // silently downgrade the vault's protection.
      if (unlocked.file.protection.mode === 'passphrase') {
        if (!request.currentPassword) fail('error.enterCurrentMasterPassword');
        if (!(await verifyPassword(unlocked.file, request.currentPassword))) {
          fail('error.currentPasswordWrong');
        }
      }

      // Signed in, a vault either opens with the device key or with the account
      // password — never a third one.
      if (signedIn && request.next.mode === 'passphrase') {
        if (unlocked.file.protection.mode === 'passphrase') {
          // A new password here is a new account password. The account first:
          // if the server refuses, nothing has changed here either.
          await changeAccountPassword(unlocked, request.currentPassword!, request.next.password);
        } else {
          // Starting to lock a device-key vault: only with the account password.
          await proveAccountPassword(unlocked.data, request.next.password);
        }
      }

      const file = await rewrapVault(unlocked.file, unlocked.dataKey, await keyringFor(request.next));
      await saveVaultFile(file);
      keep({ ...unlocked, file });

      if (request.next.mode === 'passphrase') {
        await keepSessionKey(unlocked.dataKey);
      } else {
        await clearSessionKey();
      }
      await scheduleAutoLock(file, unlocked.data.settings.autoLockMinutes);
      broadcastChange();
      return undefined;
      });

    case 'vault/createRecoveryKit': {
      // Proved before the turn, not in it: a provider's sign-in window can be
      // open for minutes, and the vault must not wait on it.
      const proof = await accountProofIfSignedIn(request.password);
      return serial(async () => {
        const unlocked = await getUnlocked();
        if (!unlocked) fail('error.vaultLocked');

        // Signed in, the kit is the account's: the server gets it first, and
        // if it cannot, no key is shown that would only half work. It takes the
        // account password — a kit is a way to reset the account.
        if (isSignedIn(unlocked.data)) {
          const recoveryKey = await changeAccountKit(unlocked, proof!, issueKit);
          return { recoveryKey: recoveryKey! };
        }

        // Reissuing replaces any previous kit, so an old printed sheet stops
        // working the moment a new one is made.
        const { file, recoveryKey } = await attachRecoveryKit(unlocked.file, unlocked.dataKey);
        await saveVaultFile(file);
        keep({ ...unlocked, file });
        broadcastChange();
        return { recoveryKey };
      });
    }

    case 'vault/removeRecoveryKit': {
      const proof = await accountProofIfSignedIn(request.password);
      return serial(async () => {
        const unlocked = await getUnlocked();
        if (!unlocked) fail('error.vaultLocked');

        // Removed from the account too, and so from every other device: the
        // usual reason to remove a kit is that the sheet has gone missing.
        if (isSignedIn(unlocked.data)) {
          await changeAccountKit(unlocked, proof!, async (synced) => ({
            file: removeRecoveryKit(synced.file),
            recoveryKey: null,
          }));
          return undefined;
        }

        const file = removeRecoveryKit(unlocked.file);
        await saveVaultFile(file);
        keep({ ...unlocked, file });
        broadcastChange();
        return undefined;
      });
    }

    case 'vault/recover':
      return serial(async () => {
        const file = await loadVaultFile();
        if (!file) fail('error.noVault');

        let opened;
        try {
          opened = await unlockWithRecoveryKey(file, request.recoveryKey);
        } catch (error) {
          if (error instanceof DecryptionError) fail('error.recoveryKeyNoMatch');
          throw error;
        }

        // A signed-in vault's new password becomes the account's too, so it has
        // to be strong enough to leave the device. Choosing the device key
        // instead leaves the account's password as it was.
        const signedIn = hasAccountPassword(opened.data);
        if (signedIn && request.next.mode === 'passphrase') {
          const problem = accountPasswordProblem(request.next.password);
          if (problem) fail('error.accountPasswordWeak');
        }

        // Re-protect before handing back a session. Leaving the vault opened but
        // still wrapped by the key its owner lost would put them right back where
        // they started on the next lock.
        let reprotected = await rewrapVault(
          opened.file,
          opened.dataKey,
          await keyringFor(request.next),
        );

        // Bring the account along. If the kit used here is not the account's,
        // the account keeps its old password — so this device signs out rather
        // than carry on under a password that no longer matches it.
        let data = opened.data;
        if (signedIn && request.next.mode === 'passphrase') {
          const followed = await followLocalRecovery(
            opened.data,
            request.recoveryKey,
            opened.dataKey,
            request.next.password,
          );
          if (!followed) {
            await platform().timers.clear(SYNC_ALARM);
            data = await markSignedOutElsewhere(opened.data);
            reprotected = await sealVault(reprotected, opened.dataKey, data);
          }
        }

        await saveVaultFile(reprotected);
        return openSession({ file: reprotected, dataKey: opened.dataKey, data });
      });

    // After whatever write is under way, not beside it. A sync or another
    // surface's change finishing after the erase would save the vault back, on
    // a browser its owner was told now holds nothing — and, for a vault that
    // opens with the device key, under a key already destroyed.
    case 'vault/reset':
      return serial(async () => {
        await clearVaultFile();
        await platform().deviceKey.destroy();
        await tokenStore.clear();
        await platform().timers.clear(SYNC_ALARM);
        await lock();
        return undefined;
      });

    case 'account/startSignUp':
      return prepareSignUp(await requireUnlocked(), request.email, request.password);

    case 'account/signUp': {
      let recoveryKey: string | null = null;
      await serial(async () => {
        const unlocked = await requireUnlocked();
        const result = await signUp(unlocked, request.email, request.password, request.code);
        await saveVaultFile(result.file);
        const signedUp = { ...unlocked, file: result.file, data: result.data };
        keep(signedUp);
        // Said now, not left to the first sync's save: if that sync fails,
        // every open page would otherwise still show a signed-out vault.
        broadcastChange();
        await scheduleSync();

        // The recovery key belongs to the moment the account is made: the
        // password was just typed, and an account without one is a forgotten
        // password away from gone. A failure here costs the account nothing —
        // Settings keeps asking until a key exists.
        try {
          recoveryKey = await changeAccountKit(signedUp, { authHash: result.authHash }, issueKit);
        } catch {
          recoveryKey = null;
        }
      });
      const first = await firstSync();
      return { status: await status(), recoveryKey, ...first };
    }

    case 'account/signIn': {
      await serial(async () => {
        const unlocked = await requireUnlocked();
        const result = await signIn(unlocked, request.email, request.password);
        await saveVaultFile(result.file);
        keep({ file: result.file, dataKey: result.dataKey, data: result.data });
        // The data key changed. A password-protected vault keeps it in session
        // memory; a device-key vault reads it through the device key instead.
        if (result.file.protection.mode === 'passphrase') await keepSessionKey(result.dataKey);
        // Said now, not left to the first sync's save: if that sync fails,
        // every open page would otherwise still show a signed-out vault.
        broadcastChange();
        await scheduleSync();
      });
      const first = await firstSync();
      return { status: await status(), ...first };
    }

    case 'account/recover': {
      await serial(async () => {
        const unlocked = await requireUnlocked();
        const result = await recoverAccount(unlocked, request.email, request.recoveryKey, request.password);
        await saveVaultFile(result.file);
        keep({ file: result.file, dataKey: result.dataKey, data: result.data });
        // As with joining: the data key changed, and a password-protected vault
        // now opens with the new account password.
        if (result.file.protection.mode === 'passphrase') await keepSessionKey(result.dataKey);
        // Said now, not left to the first sync's save: if that sync fails,
        // every open page would otherwise still show a signed-out vault.
        broadcastChange();
        await scheduleSync();
      });
      const first = await firstSync();
      return { status: await status(), ...first };
    }

    case 'account/changePassword':
      return serial(async () => {
        const unlocked = await getUnlocked();
        if (!unlocked) fail('error.vaultLocked');
        if (!isSignedIn(unlocked.data)) fail('error.notSignedIn');
        if (!hasAccountPassword(unlocked.data)) fail('error.providerHasNoPassword');
        const locksWithPassword = unlocked.file.protection.mode === 'passphrase';
        if (locksWithPassword && !(await verifyPassword(unlocked.file, request.currentPassword))) {
          fail('error.currentPasswordWrong');
        }
        // The account first, so a refusal leaves both exactly as they were.
        await changeAccountPassword(unlocked, request.currentPassword, request.nextPassword);
        // A vault that locks with the account password locks with the new one.
        if (locksWithPassword) await relockWith(unlocked, request.nextPassword);
        broadcastChange();
        return undefined;
      });

    case 'account/signOut':
      // Signing out takes the codes off this browser, so whatever it changed
      // must reach the account first: one cycle to send it, and no sign-out
      // while anything is still waiting — offline, or past the account's
      // ceiling — or the only copy of that change goes with the rest.
      return serial(async () => {
        let unlocked = await requireUnlocked();
        if (isSignedIn(unlocked.data) && pendingItems(unlocked.data).length > 0) {
          try {
            unlocked = (await syncInTurn(unlocked)).unlocked;
          } catch (error) {
            // Signed out elsewhere already: the vault keeps everything, and
            // that is what the page should say.
            if (error instanceof AppError && error.key === 'error.signedOutElsewhere') throw error;
            fail('error.signOutUnsynced');
          }
        }
        if (pendingItems(unlocked.data).length > 0) fail('error.signOutUnsynced');
        await platform().timers.clear(SYNC_ALARM);
        await persist(await signOut(unlocked.data));
      });

    case 'account/devices':
      await requireUnlocked();
      return withSession(listDevices);

    case 'account/revokeDevice':
      await requireUnlocked();
      return withSession(() => revokeDevice(request.id));

    case 'account/delete': {
      const proof = await accountProofIfSignedIn(request.password);
      return withSession(() =>
        mutateVault(async (unlocked) => {
          const data = await deleteAccount(unlocked.data, proof!);
          await platform().timers.clear(SYNC_ALARM);
          return { data, result: undefined };
        }),
      );
    }

    case 'provider/offered':
      return syncEnabled() ? providerOffer() : { providers: [], inTab: false };

    case 'provider/pending': {
      const unlocked = await getUnlocked();
      return unlocked && !isSignedIn(unlocked.data) ? pendingView() : null;
    }

    case 'provider/begin':
      if (isSignedIn((await requireUnlocked()).data)) fail('error.alreadySignedIn');
      return { url: await beginTabFlow(request.provider) };

    case 'provider/outcome':
      return takeTabOutcome();

    case 'provider/start':
      if (isSignedIn((await requireUnlocked()).data)) fail('error.alreadySignedIn');
      // The provider's window first, outside the queue: it can stay open for
      // minutes, and nothing else may wait on it.
      return completeProviderSignIn(request.provider, await providerFlow(request.provider, 'signin'));

    case 'provider/create': {
      const recoveryKey = await serial(async () => {
        const unlocked = await requireUnlocked();
        if (isSignedIn(unlocked.data)) fail('error.alreadySignedIn');
        const result = await createProviderAccount(unlocked);
        await saveVaultFile(result.file);
        keep({ ...unlocked, file: result.file, data: result.data });
        // Said now, not left to the first sync's save: if that sync fails,
        // every open page would otherwise still show a signed-out vault.
        broadcastChange();
        await scheduleSync();
        return result.recoveryKey;
      });
      return { status: await status(), recoveryKey, ...(await firstSync()) };
    }

    case 'provider/cancel':
      await serial(async () => {
        // A browser that was joining holds a session it never used. One that
        // signed in some other way meanwhile keeps the session it has.
        const joining = await cancelProviderSignIn();
        const unlocked = await getUnlocked();
        if (joining && unlocked && !isSignedIn(unlocked.data)) await endSession();
      });
      broadcastChange();
      return undefined;

    case 'pairing/request':
      return requestPairing(await requireUnlocked(), request.password);

    case 'pairing/poll': {
      // In the queue: an approval replaces this vault's key with the account's.
      const progress = await serial(async () => {
        const unlocked = await requireUnlocked();
        const polled = await pollPairing(unlocked, request.password);
        if (polled.state === 'joined') await adoptInTurn(polled);
        return polled;
      });
      if (progress.state !== 'joined') return progress;
      return { state: 'joined', ...(await joinedResult()) };
    }

    case 'pairing/recover':
      await serial(async () => {
        const unlocked = await requireUnlocked();
        await adoptInTurn(await joinWithRecoveryKey(unlocked, request.recoveryKey, request.password));
      });
      return joinedResult();

    case 'pairing/list': {
      const unlocked = await requireUnlocked();
      // Only a provider account's browsers join by approval; a password
      // account's type the password.
      if (!isSignedIn(unlocked.data) || unlocked.data.account.method !== 'provider') return [];
      return withSession(openPairings);
    }

    case 'pairing/accept':
      await requireUnlocked();
      return withSession(() => acceptPairing(request.id));

    case 'pairing/approve': {
      const unlocked = await requireUnlocked();
      if (!isSignedIn(unlocked.data)) fail('error.notSignedIn');
      return withSession(() => approvePairing(unlocked, request.id));
    }

    case 'pairing/deny':
      await requireUnlocked();
      return withSession(() => denyPairing(request.id));

    case 'account/archives':
      return withSession(() => keptArchives());

    case 'account/bringBack':
      return withSession(() =>
        mutateVault(async (unlocked) => {
          if (!isSignedIn(unlocked.data)) fail('error.notSignedIn');
          const proof = request.password !== undefined ? { password: request.password } : request.recoveryKey !== undefined ? { recoveryKey: request.recoveryKey } : fail('error.recoveryKeyMalformed');
          const { data, brought } = await bringBack(unlocked.data, request.archiveId, proof);
          return { data, result: { brought } };
        }),
      ).then(async (result) => {
        // Sent now, rather than at the next alarm.
        await syncNow().catch(() => undefined);
        return result;
      });

    case 'account/sync': {
      const summary = await syncNow();
      if (!summary) fail('error.notSignedIn');
      return summary;
    }

    case 'activity/ping': {
      const unlocked = await getUnlocked();
      if (!unlocked) return undefined;
      await markActive();
      await scheduleAutoLock(unlocked.file, unlocked.data.settings.autoLockMinutes);
      return undefined;
    }
  }
}

// --- What the platform calls --------------------------------------------------

/**
 * A request's outcome as it crosses to the page: the value, or why not, with
 * the key the page translates — the service has no language of its own.
 */
export async function toEnvelope(work: Promise<unknown>): Promise<Envelope<unknown>> {
  try {
    return { ok: true, value: await work };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      // The page says it in its own language; see i18n/errors.ts.
      ...(error instanceof AppError ? { key: error.key, values: error.values } : {}),
    };
  }
}

/** A timer the service set has fired. */
export function onTimer(name: string): void {
  if (name === AUTO_LOCK_ALARM) void lock();
  if (name === SYNC_ALARM) {
    // A failed background sync is not worth surfacing: the next tick retries,
    // and an offline laptop should not produce an error the user cannot act on.
    void syncNow().catch(() => undefined);
  }
}

/**
 * A sign-in made in a tab has come back with the sync server's answer, which
 * is worth nothing without the verifier kept here. Finishes the sign-in this
 * browser is waiting for and keeps what it came to for the account page;
 * false, with nothing touched, for any other.
 */
export async function finishTabSignIn(answer: URLSearchParams): Promise<boolean> {
  const flow = await takeTabFlow(answer);
  if (!flow) return false;
  try {
    const result = await completeProviderSignIn(flow.provider, ticketFrom(answer, flow.provider, flow.verifier));
    // A new account or a join is what `provider/pending` already says.
    if (result.kind === 'signedIn') await setTabOutcome(result);
  } catch (error) {
    // Backing out at the provider is a choice, not something to report.
    if (!(error instanceof AppError && error.key === 'error.signinCancelled')) {
      await setTabOutcome({
        kind: 'error',
        message: error instanceof Error ? error.message : String(error),
        ...(error instanceof AppError ? { key: error.key, values: error.values } : {}),
      });
    }
  }
  return true;
}

/** The open vault's data, for the platform's own shortcuts; null while it is locked. */
export async function unlockedData(): Promise<VaultData | null> {
  return (await getUnlocked())?.data ?? null;
}
