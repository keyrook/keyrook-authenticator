/**
 * Starting over with nothing left but the email, and bringing back what the
 * account held before (the key design, section 6). The inbox gets the
 * account back, never the data: what was kept opens only with the old
 * password, the old recovery key or an old device's key.
 */
import { generateDataKey, unwrapDataKey } from '../crypto/aead.js';
import { openProductBox, sealProductBox } from '../keys/box.js';
import { sealRootPin } from '../keys/pin.js';
import { AUTHENTICATOR, assertProductName, deriveProductKeyCheck } from '../keys/product.js';
import {
  deriveRootCheck,
  newAccountRoot,
  openRootWithPassword,
  openRootWithRecoveryKey,
  wrapRootUnderPassword,
  wrapRootUnderRecoveryKey,
  type AccountRoot,
} from '../keys/root.js';
import {
  accountPasswordProblem,
  assertAcceptableAccountKdf,
  deriveAccountKeys,
  newAccountKdfParams,
  type AccountKdfParams,
  type AccountKeys,
} from '../sync/account.js';
import { generateRecoveryKey, unwrapRecoveryWrap } from '../sync/kit.js';
import { beginStartOver, startOver, type HttpSyncAdapter } from '../sync/http.js';
import type { RemoteRecord } from '../sync/adapter.js';
import type { AccountArchive, LoginResponse } from '../sync/protocol.js';
import { deriveRecoveryAuthHash } from '../sync/recovery.js';
import type { AccountServer, ProductKey } from './product-key.js';

/**
 * Asks to start the account over with the code emailed by
 * `requestStartOverCode`: a new root, this product's new key, a new recovery
 * key and, on an account with a password, a new password. It takes effect at
 * `executesAt`, a week on, unless a device still signed in cancels it; until
 * then the account is as it was, and no session is issued. Show the recovery
 * key now: it is the one that works afterwards. From `executesAt`, sign in
 * with the new password (or Google or GitHub); this product's key is then in
 * its box, opened as at any sign-in.
 */
export async function startAccountOver(
  server: AccountServer,
  input: {
    email: string;
    code: string;
    /** Required on an account with a password; an account without one starts over without one. */
    newPassword?: string;
    product: string;
    deviceId: string;
    deviceName: string;
    kdf?: AccountKdfParams;
  },
): Promise<{ executesAt: number; recoveryKey: string }> {
  assertProductName(input.product);
  const begun = await beginStartOver(server.baseUrl, { email: input.email, code: input.code }, server.fetcher);
  const { accountId } = begun;
  let password: { kdf: AccountKdfParams; keys: AccountKeys } | undefined;
  if (begun.method === 'password') {
    if (input.newPassword === undefined) throw new Error('Choose a new password for this account.');
    const problem = accountPasswordProblem(input.newPassword);
    if (problem) throw new Error(problem);
    const kdf = input.kdf ?? newAccountKdfParams();
    password = { kdf, keys: await deriveAccountKeys(input.newPassword, kdf) };
  }

  const root = await newAccountRoot();
  const key = await generateDataKey();
  const recoveryKey = generateRecoveryKey();
  const { executesAt } = await startOver(
    server.baseUrl,
    {
      schedule: true,
      email: input.email,
      ticket: begun.ticket,
      ...(password ? { authHash: password.keys.authHash, kdf: password.kdf } : {}),
      keys: {
        accountId,
        root: {
          publicKey: root.publicKey,
          rootCheck: await deriveRootCheck(root),
          passwordWrap: password ? await wrapRootUnderPassword(root, password.keys, accountId) : null,
          recoveryWrap: await wrapRootUnderRecoveryKey(root, recoveryKey, accountId),
          recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey),
        },
        box: await sealProductBox(key, root.publicKey, accountId, input.product),
        pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt: Date.now() }, accountId, input.product),
        keyCheck: await deriveProductKeyCheck(input.product, key),
      },
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    },
    server.fetcher,
  );
  return { executesAt, recoveryKey };
}

/**
 * This product's key as it was before the account started over, opened with
 * the old password or the old recovery key. Keyrook Authenticator's, on an
 * account it had before keys per product, comes from its old wrap or kit.
 */
export async function openArchivedKey(
  api: HttpSyncAdapter,
  input: {
    archive: AccountArchive;
    accountId: string;
    product: string;
    with: { password: string } | { recoveryKey: string };
  },
): Promise<CryptoKey> {
  const { archive, accountId, product } = input;
  assertProductName(product);
  let root: AccountRoot | null = null;
  if ('password' in input.with) {
    if (!archive.kdf) throw new Error('This account had no password then.');
    // From the server, like prelogin's: a weaker count would make the proof
    // sent below cheaper to attack.
    assertAcceptableAccountKdf(archive.kdf);
    const old = await deriveAccountKeys(input.with.password, archive.kdf);
    const opened = await api.openArchive(archive.id, { authHash: old.authHash });
    if (opened.rootPasswordWrap && archive.box) {
      root = await openRootWithPassword(opened.rootPasswordWrap, old, accountId);
    } else if (product === AUTHENTICATOR && opened.protectedKey) {
      return unwrapDataKey(old.stretchedKey, opened.protectedKey);
    }
  } else {
    const opened = await api.openArchive(archive.id, { recoveryAuthHash: await deriveRecoveryAuthHash(input.with.recoveryKey) });
    if (opened.rootRecoveryWrap && archive.box) {
      root = await openRootWithRecoveryKey(opened.rootRecoveryWrap, input.with.recoveryKey, accountId);
    } else if (product === AUTHENTICATOR && opened.legacyRecoveryWrap) {
      return unwrapRecoveryWrap(opened.legacyRecoveryWrap, input.with.recoveryKey);
    }
  }
  if (!root || !archive.box) throw new Error('Nothing kept for this product opens with that.');
  // The box opens only with the root it was sealed to, under this account
  // and this product: a box the server moved from elsewhere does not.
  return openProductBox(archive.box.box, root, accountId, product);
}

/** Every record of this product an archive holds, a page at a time, oldest change first. */
export async function* readArchivedRecords(api: HttpSyncAdapter, archiveId: string): AsyncGenerator<RemoteRecord[]> {
  let after = 0;
  for (;;) {
    const page = await api.archivedRecords(archiveId, after);
    if (page.records.length > 0) yield page.records;
    if (page.next === null) return;
    after = page.next;
  }
}
