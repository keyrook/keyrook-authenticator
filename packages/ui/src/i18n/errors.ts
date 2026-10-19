/**
 * Errors, in the language of the page that shows them.
 *
 * The service worker has no language of its own — two pages open in two
 * languages share it — so it throws an `AppError` naming a message key, and
 * the page translates the key. Errors that only have English text, because
 * they come from `@authx/core` or the sync server, are matched against the
 * English they are known to say. `test/i18n.test.ts` reads both sources and
 * fails on any message a person can see that is in neither table.
 */
import type { Values } from './format.js';
import type { MessageKey } from './locales/en.js';

export class AppError extends Error {
  override readonly name: string = 'AppError';
  constructor(
    readonly key: MessageKey,
    readonly values?: Values,
  ) {
    super(key);
  }
}

/** Shorthand for the service worker's many refusals. */
export function fail(key: MessageKey, values?: Values): never {
  throw new AppError(key, values);
}

/**
 * Text that arrives in English from code that cannot know the page's language.
 * Keyed by the exact sentence, so a reworded source shows up as a failing test
 * rather than as English in a German page.
 */
export const KNOWN_MESSAGES: Record<string, MessageKey> = {
  // @authx/core
  'Recovery key is empty': 'error.recoveryKeyMalformed',
  'That does not look like a recovery key.': 'error.recoveryKeyMalformed',
  'This vault does not have a recovery key.': 'error.noRecoveryKit',
  'Master password must be at least 8 characters.': 'error.masterPasswordShort',
  'This vault is not protected by a master password.': 'error.notPassphraseVault',
  'Backup password must be at least 8 characters.': 'error.backupPasswordShort',
  'This file is not a Keyrook Authenticator backup.': 'error.backupNotOurs',
  'This backup was made by a newer version of the app.': 'error.backupNewer',
  'This backup uses an encryption method this version does not know.': 'error.backupUnknownCipher',
  'This backup asks for an unreasonable amount of work to open. Ignoring it.': 'error.backupTooCostly',
  'This backup is malformed.': 'error.backupMalformed',
  'That password does not open this file.': 'error.backupWrongPassword',
  // DecryptionError's own wording, which our backups' wrong password arrives as.
  'Could not decrypt — wrong password or corrupted data.': 'error.backupWrongPassword',
  'Steam Guard codes cannot be imported yet.': 'error.foreign.steam',
  'This export is locked with a password Keyrook Authenticator cannot open. Export it again without a password.':
    'error.foreign.locked',
  'Not an otpauth:// URI': 'error.uriNotOtpauth',
  'Malformed otpauth:// URI': 'error.uriMalformed',
  'URI is missing the "secret" parameter': 'error.uriNoSecret',
  'The "secret" parameter is not valid base32': 'error.uriBadSecret',
  'HOTP URIs must include a "counter" parameter': 'error.uriNoCounter',
  'Secret is empty': 'error.secretEmpty',
  'Secret decoded to zero bytes': 'error.secretEmpty',
  'Not an otpauth-migration:// URI': 'error.migrationNotOurs',
  'Migration URI is missing the "data" parameter': 'error.migrationMalformed',
  'Truncated varint': 'error.migrationMalformed',
  'Varint too long': 'error.migrationMalformed',
  'Truncated length-delimited field': 'error.migrationMalformed',
  'That password is too weak to protect a copy of your vault that leaves this device. Use at least 12 characters mixing upper and lower case, numbers and symbols — or four or five unrelated words.':
    'error.accountPasswordWeak',
  'That approval did not come from the browser whose code you checked.': 'error.pairingForged',
  'A setup key uses only the letters A–Z and the digits 2–7. Check it was copied in full, with nothing extra.':
    'error.badKey',
  'That is a Google Authenticator transfer link, for several accounts at once. Import it instead.':
    'error.quickIsMigration',
  'That is too short to be a setup key.': 'error.keyTooShort',
  'That file is too large to read.': 'error.fileTooLarge',
  // The extension's own scan session, which tests read in English.
  'That QR code is not a 2FA setup code.': 'error.notSetupQr',
  'That account is already in your vault.': 'error.alreadyInVault',
  // Password strength, as @authx/core scores it.
  'Use at least 10 characters — length matters most.': 'strength.tooShort',
  'Digits only is easy to guess.': 'strength.digitsOnly',
  'Avoid repeated characters.': 'strength.repeated',
  // The sync server.
  'That request was not valid JSON.': 'error.server.badRequest',
  'That request is too large.': 'error.server.badRequest',
  'Missing bearer token.': 'error.server.session',
  'That session is no longer valid.': 'error.server.session',
  'That session has expired.': 'error.server.session',
  'That account no longer exists.': 'error.server.accountGone',
  'That recovery key does not match this account.': 'error.recoveryKeyWrong',
  'That sign-up has expired. Sign in again.': 'error.server.signupExpired',
  'That sign-in has expired. Try again.': 'error.server.signinExpired',
  'Too many wrong codes. Ask for a new one.': 'error.server.tooManyCodes',
  'Too many browsers are waiting to join this account. Try again in a few minutes.': 'error.server.tooManyPairings',
  'This device does not hold the account key.': 'error.server.wrongKey',
  'This account signs in with Google or GitHub, not a password.': 'error.server.providerAccount',
  'The email could not be sent. Try again in a minute.': 'error.server.mailFailed',
  'That request has ended.': 'error.pairingEnded',
  'That request has ended. Ask again.': 'error.pairingEnded',
  'That request has ended, or another browser is approving it.': 'error.server.pairingTaken',
  'That password is not correct.': 'error.server.passwordWrong',
  'Email or password is incorrect.': 'error.server.badCredentials',
  'That code is not right, or it has expired. Check the email, or ask for a new one.': 'error.server.badCode',
  'Sign in again with the account you use for Keyrook to confirm this.': 'error.server.reauthMismatch',
  // The server's wording before it was renamed, until every server has been.
  'Sign in again with the account you use for Authenticator X to confirm this.': 'error.server.reauthMismatch',
  'KDF iteration count is below the minimum.': 'error.server.badRequest',
  'Another device changed the recovery key just now.': 'error.server.kitRace',
  // Keys per product (keyrook-account's design, from migration 6).
  'Another device of this product set its key first.': 'error.server.keyRace',
  'Only the old keys can delete what was kept before it expires.': 'error.server.archiveNeedsOldKeys',
  'Sign up with keys: this product has no account key of its own yet.': 'error.server.signupNeedsKeys',
  'That account id is taken. Sign up again.': 'error.server.accountIdTaken',
  'That does not open what was kept.': 'error.server.archiveWrongKey',
  'That has expired. Ask for a new code and start again.': 'error.server.flowExpired',
  'That is no longer kept.': 'error.server.archiveGone',
  'That is not this product’s key.': 'error.server.notProductKey',
  'That record belongs to another Keyrook product.': 'error.server.foreignRecord',
  'The account’s root key is not the one this was sealed to.': 'error.server.rootChanged',
  'This account already has a root key.': 'error.server.rootExists',
  'This account has no root key yet.': 'error.server.noRoot',
  'This device does not hold the account’s root key.': 'error.server.wrongRootKey',
  'This device was signed out because its session was used from somewhere else. Sign in again.':
    'error.server.sessionReplayed',
  'This product has no key on this account yet.': 'error.server.noProductKey',
  'This product’s key changed. Look again.': 'error.server.productKeyChanged',
  'This product’s key was replaced on another device. Sign in again.': 'error.server.productKeyReplaced',
  'Update Keyrook Authenticator to keep using this account.': 'error.server.updateRequired',
  'Older Keyrook Authenticator builds can no longer use this account.': 'error.server.olderBuildsRetired',
  // @keyrook/account's flows.
  'Choose a new password for this account.': 'error.account.chooseNewPassword',
  'Nothing kept for this product opens with that.': 'error.account.archiveNotOpened',
  'The account key is not the one you confirmed. Look again.': 'error.account.keyNotConfirmed',
  // A server answering about some other account, or with a key that did not
  // open: the refusal is the protection, and one sentence covers all four.
  'The server answered for another account.': 'error.account.serverMismatch',
  'The server made the account under another id.': 'error.account.serverMismatch',
  'The server reported an account key other than the one that opened.': 'error.account.serverMismatch',
  'The server says this account has no root key, but this device has seen one.': 'error.account.serverMismatch',
  'This account had no password then.': 'error.account.archiveNoPassword',
  'This account has no password to open its keys with.': 'error.account.noPasswordForKeys',
  'This account has no recovery key yet.': 'error.account.noRecoveryKey',
  // The account page (account.keyrook.com) and what sends a person to it.
  'That account signs in with a password. Sign in here with your email and password.': 'error.server.signInWithPassword',
  'That code is not one the account page is showing. Check it, or start again there.': 'error.server.pageCodeWrong',
  'That request has ended. Start again on the account page.': 'error.server.pageRequestEnded',
  'That request has expired. Start again on the account page.': 'error.server.pageRequestEnded',
  'This Google or GitHub account has no Keyrook account. Make one in Keyrook Authenticator or Passhold.':
    'error.server.noKeyrookAccount',
  'The account’s root key changed. Open this product’s key again before replacing it.': 'error.server.rootChanged',
  'The server reported an account key other than the one just made.': 'error.account.serverMismatch',
  'This account has a password: confirm with it.': 'error.account.confirmWithPassword',
  'This account has no root key yet. Open Keyrook Authenticator to do this.': 'error.server.noRoot',
  'Not found.': 'error.server.unavailable',
  'Account vanished mid-transaction': 'error.server.unavailable',
  'A provider account has no wrapped key to hand out.': 'error.server.providerAccount',
  'This vault was created by a newer version of Keyrook Authenticator. Please update before opening it.':
    'error.vaultNewer',
  'Something went wrong.': 'error.server.unavailable',
  // Google and GitHub, as the server relays their refusal.
  'GitHub refused the sign-in.': 'error.provider.githubRefused',
  'Google did not ask you to sign in again.': 'error.provider.noReauth',
  'Google has not verified that email address.': 'error.provider.unverifiedEmail',
  'Your GitHub account has no verified primary email address.': 'error.provider.githubNoEmail',
  'Expired.': 'error.provider.refused',
  'Malformed ID token.': 'error.provider.refused',
  'No GitHub user id.': 'error.provider.refused',
  'No ID token.': 'error.provider.refused',
  'No subject.': 'error.provider.refused',
  'Not issued by Google.': 'error.provider.refused',
  'Not issued for this server.': 'error.provider.refused',
  'Not this sign-in.': 'error.provider.refused',
  // The browser, when the network or the server is not there.
  'Failed to fetch': 'error.offline',
  'NetworkError when attempting to fetch resource.': 'error.offline',
};

/** The few that carry a value, matched by shape. */
export const KNOWN_PATTERNS: [RegExp, MessageKey, string[]][] = [
  [/^Too many failed attempts\. Try again in (\d+) seconds\.$/, 'error.server.lockedOut', ['count']],
  [/^Too many attempts\. Try again in (\d+) seconds\.$/, 'error.server.rateLimited', ['count']],
  [/^(.+) already has (?:a Keyrook|an Authenticator X) account\.$/, 'error.server.emailTaken', ['email']],
  [/^Record (.+) exceeds the size limit\.$/, 'error.server.recordTooLarge', ['id']],
  // The wait is a few seconds at most; the page says so without a count.
  [/^A code was sent a moment ago\. You can ask for another in \d+ seconds\.$/, 'error.server.codeTooSoon', []],
  [/^This account has started over too often lately\. Try again after (\S+)\.$/, 'error.server.startOverLimit', ['date']],
  [/^(.+) already has a Keyrook account that signs in with another provider\.$/, 'error.server.emailTakenOtherProvider', ['email']],
  [
    /^(.+) already has a Keyrook account with a password\. Sign in with your email and password instead\.$/,
    'error.server.emailTakenPassword',
    ['email'],
  ],
  [/^The key of (.+) does not open with this account’s root\. Nothing was changed\.$/, 'error.account.productKeyMismatch', ['product']],
  [/^(\S+) answered (\d+)\.$/, 'error.provider.unreachable', ['provider', 'status']],
  [/^(?:Unsupported algorithm|Unsupported OTP type|Invalid digits|Invalid period|Invalid \w+): (.+)$/, 'error.uriUnsupported', ['value']],
  [/^Invalid base32 character: "(.+)"$/, 'error.uriBadSecret', ['value']],
  [/^"(.+)" is not part of a recovery key$/, 'error.recoveryKeyMalformed', ['value']],
  [/^Unsupported protobuf wire type: (\d+)$/, 'error.migrationMalformed', ['value']],
  [/^Google Authenticator only keeps 30-second codes; this one uses (\d+)\.$/, 'error.gaSkipPeriod', ['period']],
  [/^Google Authenticator only keeps 6- or 8-digit codes; this one has (\d+)\.$/, 'error.gaSkipDigits', ['digits']],
];

/** The key and values for an English message, if it is one this app knows. */
export function knownMessage(message: string): { key: MessageKey; values?: Values } | null {
  const key = KNOWN_MESSAGES[message];
  if (key) return { key };
  for (const [pattern, patternKey, names] of KNOWN_PATTERNS) {
    const match = pattern.exec(message);
    if (!match) continue;
    const values: Values = {};
    names.forEach((name, index) => {
      const raw = match[index + 1]!;
      values[name] = /^\d+$/.test(raw) ? Number(raw) : raw;
    });
    return { key: patternKey, values };
  }
  return null;
}
