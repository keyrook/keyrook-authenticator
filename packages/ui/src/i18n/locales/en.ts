/**
 * English: the source every other language translates, and the text any
 * missing translation falls back to. Keys are grouped by where they appear.
 *
 * Written for translators as much as for readers: `{name}` is a value put in,
 * `<b>…</b>` and other tags mark a stretch the page styles, and an object of
 * `one` / `other` forms is a message that depends on `{count}`.
 */
import type { Message, Plural } from '../format.js';

export const en = {
  // --- Errors -----------------------------------------------------------------
  'error.vaultLocked': 'Vault is locked.',
  'error.vaultExists': 'A vault already exists on this device.',
  'error.noVault': 'No vault on this device yet.',
  'error.vaultCorrupt': 'The stored vault is corrupted or was written by another app.',
  'error.wrongMasterPassword': 'Wrong master password.',
  'error.enterCurrentMasterPassword': 'Enter your current master password.',
  'error.currentPasswordWrong': 'Current password is incorrect.',
  'error.masterPasswordShort': 'Master password must be at least 8 characters.',
  'error.notPassphraseVault': 'This vault is not protected by a master password.',
  'error.recoveryKeyMalformed': 'That does not look like a recovery key.',
  'error.recoveryKeyNoMatch': 'That recovery key does not match.',
  'error.recoverOnAccountPage': 'Your recovery key is right, but this account’s password is now reset on the account page, for every Keyrook app at once.',
  'error.kitOnAccountPage': 'This account’s recovery key is now made on the account page, for every Keyrook app at once.',
  'error.restoreEmpty': 'Nothing of this account is left to bring back: it was deleted on another device before this one ever had it.',
  'error.noAccountSheet': 'This account has no recovery key yet. Make one on the account page.',
  'error.recoveryKeyWrong': 'That recovery key does not match this account.',
  'error.noRecoveryKit': 'This vault does not have a recovery key.',
  'error.syncUnavailable': 'Sync is not available in this build.',
  'error.notSignedIn': 'Not signed in.',
  'error.alreadySignedIn': 'Already signed in.',
  'error.signedOutElsewhere':
    'This device was signed out of sync — the password was changed or the device was removed on another one. Sign in again.',
  'error.removedFromAccount':
    'Another device removed this one from your Keyrook account, so the account’s codes were taken off it. Sign in again to bring them back.',
  'error.signOutUnsynced':
    'Some changes on this browser haven’t reached your account yet, and signing out now would lose them. Connect to the internet and try again.',
  'error.enterAccountPassword': 'Enter your account password.',
  'error.accountPasswordWrong': 'That is not your account password.',
  'error.accountPasswordWeak':
    'That password is too weak to protect a copy of your vault that leaves this device. Use at least 12 characters mixing upper and lower case, numbers and symbols — or four or five unrelated words.',
  'error.lockOnlyWithAccountPassword':
    'That is not your account password. While signed in, it is the only password this vault can lock with.',
  'error.signupWrongMasterPassword': 'That is not this vault’s master password. It becomes your account password too.',
  'error.masterPasswordTooWeakForAccount':
    'Your master password is too weak to protect a copy of your vault that leaves this device. Change it under Security first — at least 12 characters with a mix, or four or five unrelated words.',
  'error.passwordsDiverged':
    'Your account password is different from this vault’s. Sign out of sync and back in to bring them together, then try again.',
  'error.kitRace': 'Another of your devices changed the recovery key a moment ago. Nothing was changed here — try again.',
  'error.providerHasNoPassword': 'This account signs in with Google or GitHub, and has no password.',
  'error.noActiveTab': 'No active tab.',
  'error.autofillNotHere': 'Autofill only works on regular web pages.',
  'error.autofillBlocked':
    'Chrome would not let the extension read this page. Open the popup from the page you want to fill.',
  'error.signinCancelled': 'Sign-in was cancelled.',
  'error.signinStateMismatch': 'That sign-in did not come back the way it left. Try again.',
  'error.signinUnfinished': 'Sign-in did not finish. Try again.',
  'error.signupPendingExpired': 'That sign-in has expired. Start again.',
  'error.signInFirst': 'Sign in first.',
  'error.joinNeedsMasterPassword': 'Enter this vault’s master password to finish joining.',
  'error.notThisVaultsPassword': 'That is not this vault’s master password.',
  'error.nothingWaiting': 'Nothing is waiting to be approved.',
  'error.pairingExpired': 'The request ended — it was declined, or ten minutes passed. Ask again.',
  'error.pairingWrongKey':
    'The key that arrived is not this account’s. Nothing was changed. Try again from the other device.',
  'error.pairingForged': 'That approval did not come from the device whose code you checked.',
  'error.pairingForgedAsk':
    'That approval did not come from the device whose code was checked. Nothing was changed. Ask again.',
  'error.pairingEnded': 'That request has ended.',
  'error.approveAgain': 'Start approving that request again.',
  'error.backupPasswordShort': 'Backup password must be at least 8 characters.',
  'error.backupNotOurs': 'This file is not a Keyrook Authenticator backup.',
  'error.backupNewer': 'This backup was made by a newer version of the app.',
  'error.backupUnknownCipher': 'This backup uses an encryption method this version does not know.',
  'error.backupTooCostly': 'This backup asks for an unreasonable amount of work to open. Ignoring it.',
  'error.backupMalformed': 'This backup is malformed.',
  'error.uriNotOtpauth': 'Not an otpauth:// link.',
  'error.uriMalformed': 'That otpauth:// link is malformed.',
  'error.uriNoSecret': 'That link has no secret in it.',
  'error.uriBadSecret': 'The secret in that link is not valid base32.',
  'error.uriNoCounter': 'An HOTP link must include a counter.',
  'error.secretEmpty': 'The setup key is empty.',
  'error.migrationNotOurs': 'Not a Google Authenticator export.',
  'error.migrationMalformed': 'This Google Authenticator export is damaged or incomplete.',
  'error.offline': 'Could not reach the sync server. Check your connection and try again.',
  'error.passkey.wrongOrigin': 'A passkey answers only for Keyrook’s own page and apps.',
  'error.passkey.notOffered': 'Passkeys are not offered here.',
  'error.passkey.unchecked': 'That passkey could not be checked. Try again.',
  'error.passkey.unknown': 'That passkey is not one any Keyrook account knows. It may have been removed.',
  'error.passkey.ended': 'That passkey request has ended. Try again.',
  'error.passkey.noUnlock': 'That passkey does not open this account’s key. Sign in with the password instead.',
  'error.passkey.noUnlockProvider':
    'That passkey does not open this account’s key. Continue with Google or GitHub instead.',
  'error.passkey.masterPassword':
    'A vault that locks with a master password cannot sign in with a passkey. Sign in with the account password, or with Google or GitHub.',
  'error.passkey.permission':
    'Keyrook Authenticator needs Chrome’s permission to use the passkeys of account.keyrook.com. Choose the passkey again and allow it.',
  'error.passkey.cancelled': 'No passkey was used. Try again, or sign in another way.',
  'error.passkey.failed': 'Chrome could not ask for a passkey. Try again, or sign in another way.',
  'error.secondStep.missing': 'Enter the code from your authenticator app too.',
  'error.secondStep.wrongCode': 'That code is not right. Enter the one your authenticator app shows now.',
  'error.secondStep.expired': 'That sign-in has expired. Sign in again.',
  'error.secondStep.used': 'That code was just used to sign in. Wait for your app to show the next one.',
  'error.provider.refusedBy': '{provider} refused the sign-in.',
  'error.provider.unreachable': '{provider} could not be reached. Try again in a moment.',
  'error.provider.refused': 'The sign-in was refused. Try again.',
  'error.provider.githubRefused': 'GitHub refused the sign-in.',
  'error.provider.noReauth': 'Google did not ask you to sign in again.',
  'error.provider.unverifiedEmail': 'Google has not verified that email address.',
  'error.provider.githubNoEmail': 'Your GitHub account has no verified primary email address.',
  'error.server.badRequest': 'The sync server could not read that request.',
  'error.server.session': 'That session is no longer valid.',
  'error.server.accountGone': 'That account no longer exists.',
  'error.server.signupExpired': 'That sign-up has expired. Sign in again.',
  'error.server.signinExpired': 'That sign-in has expired. Try again.',
  'error.server.tooManyCodes': 'Too many wrong codes. Ask for a new one.',
  'error.server.tooManyPairings': 'Too many devices are waiting to join this account. Try again in a few minutes.',
  'error.server.wrongKey': 'This device does not hold the account key.',
  'error.server.providerAccount': 'This account signs in with Google or GitHub, not a password.',
  'error.server.mailFailed': 'The email could not be sent. Try again in a minute.',
  'error.server.pairingTaken': 'That request has ended, or another device is approving it.',
  'error.server.passwordWrong': 'That password is not correct.',
  'error.server.badCredentials': 'Email or password is incorrect.',
  'error.server.badCode': 'That code is not right, or it has expired. Check the email, or ask for a new one.',
  'error.server.reauthMismatch': 'Sign in again with the account you use for Keyrook to confirm this.',
  'error.server.kitRace': 'Another device changed the recovery key just now.',
  'error.server.unavailable': 'The sync server could not do that just now. Try again in a moment.',
  'error.server.lockedOut': {
    one: 'Too many failed attempts. Try again in {count} second.',
    other: 'Too many failed attempts. Try again in {count} seconds.',
  },
  'error.server.rateLimited': {
    one: 'Too many attempts. Try again in {count} second.',
    other: 'Too many attempts. Try again in {count} seconds.',
  },
  'error.server.emailTaken': '{email} already has a Keyrook account.',
  'error.server.recordTooLarge': 'One of your accounts is too large to sync ({id}).',
  'error.server.codeTooSoon': 'A code was sent a moment ago. Wait a little before asking for another.',
  'error.server.keyRace': 'Another device set up the key just now. Try again.',
  'error.server.archiveNeedsOldKeys': 'Only the old password or recovery key can delete what was kept before it expires.',
  'error.server.signupNeedsKeys': 'This account could not be created. Update Keyrook Authenticator and try again.',
  'error.server.accountIdTaken': 'That account id is taken. Sign up again.',
  'error.server.archiveWrongKey': 'That does not open what was kept.',
  'error.server.flowExpired': 'That has expired. Ask for a new code and start again.',
  'error.server.archiveGone': 'That is no longer kept.',
  'error.server.notProductKey': 'That key does not belong to Keyrook Authenticator.',
  'error.server.foreignRecord': 'That record belongs to another Keyrook product.',
  'error.server.rootChanged': 'The account’s keys changed on another device. Try again.',
  'error.server.rootExists': 'This account already has a root key.',
  'error.server.noRoot': 'This account has no root key yet.',
  'error.server.startOverLimit': 'This account has started over too often lately. Try again after {date}.',
  'error.server.wrongRootKey': 'This device does not hold the account’s root key.',
  'error.server.sessionReplayed': 'This device was signed out because its session was used from somewhere else. Sign in again.',
  'error.server.noProductKey': 'Keyrook Authenticator has no key on this account yet.',
  'error.server.productKeyChanged': 'Keyrook Authenticator’s key on this account changed. Try again.',
  'error.server.productKeyReplaced': 'Keyrook Authenticator’s key was replaced on another device. Sign in again.',
  'error.server.updateRequired': 'Update Keyrook Authenticator to keep using this account.',
  'error.server.olderBuildsRetired': 'Older versions of Keyrook Authenticator can no longer use this account.',
  'error.server.emailTakenOtherProvider': '{email} already has a Keyrook account that signs in with another provider.',
  'error.server.emailTakenPassword': '{email} already has a Keyrook account with a password. Sign in with your email and password instead.',
  'error.server.signInWithPassword': 'That account signs in with a password. Sign in here with your email and password.',
  'error.server.pageCodeWrong': 'That code is not one the account page is showing. Check it, or start again there.',
  'error.server.pageRequestEnded': 'That request has expired or ended. Start again on the account page.',
  'error.server.noKeyrookAccount': 'This Google or GitHub account has no Keyrook account. Make one in Keyrook Authenticator or Passhold.',
  'error.account.productKeyMismatch': 'The key of {product} does not open with this account’s root key. Nothing was changed.',
  'error.account.confirmWithPassword': 'This account has a password. Confirm with it.',
  'error.account.chooseNewPassword': 'Choose a new password for this account.',
  'error.account.archiveNotOpened': 'Nothing kept for Keyrook Authenticator opens with that.',
  'error.account.keyNotConfirmed': 'The account key is not the one you confirmed. Look again.',
  'error.account.serverMismatch': 'The sync server’s answer does not match this account. Nothing was opened with it.',
  'error.account.archiveNoPassword': 'This account had no password then.',
  'error.account.noPasswordForKeys': 'This account has no password to open its keys with.',
  'error.account.noRecoveryKey': 'This account has no recovery key yet.',

  // --- Unlock screen -------------------------------------------------------------
  'unlock.prompt': 'Enter your master password to unlock.',
  'unlock.placeholder': 'Master password',
  'unlock.submit': 'Unlock',
  'unlock.forgot': 'Forgotten it? <link>Use your recovery key</link>',
  'platformUnlock.unlock': 'Unlock with fingerprint, face or PIN',
  'platformUnlock.title': 'Fingerprint, face or PIN',
  'platformUnlock.body':
    'Open the vault with this computer’s own check — Touch ID, Windows Hello or its PIN — instead of typing the master password. The password still opens it, and changes still ask for it.',
  'platformUnlock.on': 'The vault also opens with this computer’s own check. Removing the master password turns it off.',
  'passkeyUnlock.turnOn': 'Turn on',
  'passkeyUnlock.turnOff': 'Turn off',
  'platformUnlock.confirm': 'Then your computer asks for your fingerprint, face or PIN.',
  'error.passkeyUnlock.cancelled': 'The check was cancelled or took too long. Try again, or use the master password.',
  'error.platformUnlock.noPrf':
    'Where this passkey was saved cannot hold a key, so it cannot open the vault. Turn this on again and choose another place when asked where to save it — or keep using the master password.',
  'error.passkeyUnlock.failed': 'That did not open the vault. Use the master password, then turn this on again under Security.',
  'securityKey.unlock': 'Unlock with security key',
  'securityKey.title': 'Security key',
  'securityKey.body':
    'Open the vault with a USB security key and its PIN instead of typing the master password. Whoever holds the key and knows its PIN can then open the vault on this computer. If the key is lost, the master password still opens it.',
  'securityKey.on':
    'The vault also opens with your security key and its PIN on this computer. Whoever holds the key and knows its PIN can open it here, so if the key is lost, turn this off. Removing the master password turns it off.',
  'securityKey.confirm': 'Then insert your security key, type its PIN and touch it. Some keys ask twice.',
  'error.securityKey.noPrf':
    'This security key cannot hold a key, so it cannot open the vault. Keys made only for two-step sign-in cannot. Try another key, or keep using the master password.',

  // --- Vault that cannot be opened -----------------------------------------------
  'unrecoverable.title': 'This vault can no longer be opened',
  'unrecoverable.why':
    'Its encryption key lived in this browser profile and is gone — usually because browsing data was cleared, the extension was reinstalled, or this is a different profile. Without that key the stored accounts cannot be decrypted by anyone, including us.',
  'unrecoverable.hasKit':
    'You issued a recovery key for this vault. That key wraps the same data, independently of the missing one — it will open everything.',
  'unrecoverable.useKit': 'Use my recovery key',
  'unrecoverable.noKit':
    'Start again and restore from a backup file if you have one. Otherwise you will need to set up two-factor authentication again on each site, using the recovery codes they gave you.',
  'unrecoverable.confirmErase': 'Yes, erase and start over',
  'common.cancel': 'Cancel',
  'unrecoverable.startOver': 'Start over',

  // --- Password strength ---------------------------------------------------------
  'strength.0': 'very weak',
  'strength.1': 'weak',
  'strength.2': 'fair',
  'strength.3': 'strong',
  'strength.4': 'very strong',
  'strength.line': 'Strength: {label}',
  'strength.lineWithWarning': 'Strength: {label} — {warning}',
  'strength.tooShort': 'Use at least 10 characters — length matters most.',
  'strength.digitsOnly': 'Digits only is easy to guess.',
  'strength.repeated': 'Avoid repeated characters.',

  // --- First run -----------------------------------------------------------------
  'setup.prompt': 'Choose how your 2FA secrets are protected.',
  'setup.device.title': 'Just start',
  'setup.device.badge': 'Recommended',
  'setup.device.description':
    'Your secrets are encrypted with a key this browser holds for you. Nothing to remember, nothing to type.',
  'setup.device.footnote':
    'Protects against anything that can run scripts or read your extension data. Not against malware running as you on this machine.',
  'setup.password.title': 'Add a master password',
  'setup.password.description':
    'One password unlocks the vault, then it locks itself again when you stop using it.',
  'setup.password.footnote':
    'The strongest option: once it locks, nothing on this computer can open the vault without the password.',
  'setup.footer': 'Either way it is AES-256-GCM. Switch any time; sync is optional, in Settings.',
  'setup.footer.noSync': 'Either way it is AES-256-GCM. Switch any time, in Settings.',
  'setup.source': 'Open source — read the code',
  'common.back': 'Back',
  'setup.passwordStep.title': 'Set a master password',
  'setup.passwordStep.warning':
    'Nobody can reset this password. If you forget it, only a recovery key opens the vault — make one in Settings → Security, and write the password down somewhere safe.',
  'setup.passwordStep.label': 'Master password',
  'setup.passwordStep.placeholder': 'At least 8 characters',
  'setup.passwordStep.confirm': 'Confirm password',
  'common.passwordsDiffer': 'Passwords do not match.',
  'setup.passwordStep.submit': 'Create my vault',
  'setup.passwordStep.footer': 'AES-256-GCM · key derived with PBKDF2 (600,000 rounds)',

  // --- Recovery key, opening a vault ---------------------------------------------
  'recover.title': 'Use your recovery key',
  'recover.intro':
    'The 32-character key from the sheet you saved when you set this vault up. Using it replaces how the vault is locked, so pick that below too.',
  'recover.keyLabel': 'Recovery key',
  'recover.hintEmpty': 'Letters and digits only — spacing does not matter.',
  'recover.hintRight': 'That is the right shape.',
  'recover.hintCount': '{count} of 32 characters.',
  'recover.lockQuestion': 'How should this vault lock from now on?',
  'recover.lockPassword': 'Set a new master password',
  'recover.lockDevice': 'No password — let this device hold the key',
  'recover.newPassword': 'New master password',
  'recover.atLeast8': 'At least 8 characters.',
  'recover.submit': 'Unlock and re-lock this vault',

  // --- Password field ------------------------------------------------------------
  'meter.0': 'Too weak',
  'meter.1': 'Weak',
  'meter.2': 'Fair',
  'meter.3': 'Strong',
  'meter.4': 'Very strong',
  'password.show': 'Show password',
  'password.hide': 'Hide password',

  // --- Popup: the list -----------------------------------------------------------
  'vault.search': 'Search accounts',
  'vault.add': 'Add account',
  'vault.settings': 'Settings',
  'vault.lock': 'Lock now',
  'vault.count': { one: '{count} account', other: '{count} accounts' },
  'vault.syncedWith': 'Synced with {email}',
  'vault.syncedAs': 'synced as {email}',
  'vault.changeOrder': 'Change the order',
  'vault.byName': 'By name',
  'vault.orderAdded': 'Order added',
  'vault.joinRequests': {
    one: 'A device is asking to join your account.',
    other: '{count} devices are asking to join your account.',
  },
  'vault.joinRequestsHint': 'Approve only one you are signing in to yourself, right now.',
  'vault.reviewInSettings': 'Review in Settings',
  'vault.noMatch': 'No accounts match “{query}”.',
  'vault.forHost': 'For {host}',
  'vault.fieldDetected': 'code field detected',
  'common.encryptedHere': 'Encrypted on this device',
  'vault.fillWarning':
    '<b>{account}</b> is for <b>{domain}</b>, but this page is <b>{host}</b>. If you did not expect that, the page may be impersonating the site.',
  'vault.dontFill': 'Don’t fill',
  'vault.fillAnyway': 'Fill anyway',
  'vault.empty.title': 'No accounts yet',
  'vault.empty.body':
    'Open the two-factor setup page on any site, then scan its QR code straight from the tab.',
  'vault.empty.add': 'Add your first account',

  // --- Popup: an account ---------------------------------------------------------
  'common.untitled': 'Untitled',
  'row.copyHint': 'Click to copy',
  'row.share': 'Share or move',
  'row.shareHint': 'Send its codes for a while, or move it to another app',
  'row.favouriteAdd': 'Add to favourites',
  'row.favouriteRemove': 'Remove from favourites',
  'row.fillHint': 'Fill this code into the page',
  'row.fill': 'Fill',
  'row.copied': 'Copied',
  'row.copy': 'Copy code',
  'row.next': 'Generate the next code',
  'row.counter': 'Counter: {counter}',

  // --- Popup: asking for a rating ------------------------------------------------
  'rate.region': 'Rate Keyrook Authenticator',
  'rate.body': '<b>Finding Keyrook Authenticator useful?</b> A rating on {store} is how other people find it.',
  'rate.store.chrome': 'the Chrome Web Store',
  'rate.store.edge': 'Edge Add-ons',
  'rate.notNow': 'Not now',
  'rate.rate': 'Rate it',

  // --- Shared bits ---------------------------------------------------------------
  'common.openSource': 'Open source',

  // --- Adding an account ---------------------------------------------------------
  'add.title.manual': 'Enter a setup key',
  'add.title.camera': 'Scan with your camera',
  'add.title.quick': 'Get a code, without saving',
  'add.title.choose': 'Add an account',
  'add.page.title': 'Scan the QR code on this page',
  'add.page.description': 'Takes a screenshot of the visible tab and reads the code from it.',
  'add.camera.title': 'Scan with your camera',
  'add.camera.description': 'For a code on your phone — including a Google Authenticator export.',
  'add.camera.elsewhere':
    'Opens Settings once so Chrome can ask to use the camera. After that it works right here.',
  'add.upload.title': 'Upload a QR image',
  'add.upload.description': 'A screenshot or photo you saved earlier.',
  'add.manual.title': 'Enter a setup key manually',
  'add.manual.description': 'For sites that show a code instead of a QR.',
  'add.quick.title': 'Just get a code',
  'add.quick.description': 'Paste a key and see its code now. Nothing is saved.',
  'add.fromGoogle':
    'Importing from Google Authenticator? Export your accounts there, then scan the code it shows with your camera or upload a screenshot of it. If it shows several, do each one.',
  'common.done': 'Done',
  'add.noNativeReader':
    'Chrome on this computer has no built-in QR reader, so a large code — like a Google Authenticator export — often will not scan from a camera. If yours will not, screenshot it on your phone and use Upload a QR image instead.',
  'add.openScannerInSettings': 'Open the scanner in Settings',
  'add.noneFound': 'No accounts found.',
  'add.noQrOnPage': 'No QR code found on the visible part of the page. Scroll it into view and try again.',
  'add.noQrInImage': 'No QR code found in that image.',
  'add.cannotReadUri': 'Could not read that URI.',
  'add.enterKey': 'Enter the setup key from the site.',
  'add.offeredOn': 'Codes for {domain} will be offered on that site.',
  'add.startTyping': 'Start typing — known services fill in their own details.',
  'add.account': 'Account',
  'add.accountPlaceholder': 'you@example.com',
  'add.setupKey': 'Setup key',
  'add.linkDetected': 'Detected an otpauth:// link — the service and account fields will be filled from it.',
  'add.spacesFine': 'Spaces and lower case are fine.',
  'add.submit': 'Add account',
  'add.summary': { one: 'All {count} code scanned.', other: 'All {count} codes scanned.' },
  'add.summaryAdded': { one: '{count} account added.', other: '{count} accounts added.' },
  'add.summarySkipped': {
    one: '{count} was already in your vault and was left as it was.',
    other: '{count} were already in your vault and were left as they were.',
  },
  'error.badKey':
    'A setup key uses only the letters A–Z and the digits 2–7. Check it was copied in full, with nothing extra.',
  'error.quickIsMigration':
    'That is a Google Authenticator transfer link, for several accounts at once. Import it instead.',
  'error.keyTooShort': 'That is too short to be a setup key.',
  'error.fileTooLarge': 'That file is too large to read.',
  'error.notSetupQr': 'That QR code is not a 2FA setup code.',
  'error.alreadyInVault': 'That account is already in your vault.',
  'error.gaSkipPeriod': 'Google Authenticator only keeps 30-second codes; this one uses {period}.',
  'error.gaSkipDigits': 'Google Authenticator only keeps 6- or 8-digit codes; this one has {digits}.',
  'error.gaSkipSteam': 'Google Authenticator cannot make Steam Guard codes.',

  // --- Camera scanning -----------------------------------------------------------
  'scan.progressBatch': 'Code {seen} of {total} scanned — {accounts}. Show the next code.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} account added', other: '{count} accounts added' },
  'scan.found': { one: '{count} account found', other: '{count} accounts found' },
  'scan.skippedVault': {
    one: '{count} was already in your vault.',
    other: '{count} were already in your vault.',
  },
  'scan.skippedScanned': { one: '{count} was already scanned.', other: '{count} were already scanned.' },
  'camera.noCamera': 'This browser will not give the extension a camera.',
  'camera.preview': 'Camera preview',
  'camera.failedHint':
    'You can still add an account by uploading a photo of the QR code, or by typing the setup key.',
  'camera.hint':
    'Hold the QR code inside the frame. Importing from Google Authenticator? Open its export screen on your phone and point the camera at it — if it shows several codes, show them one after another.',
  'camera.privacy':
    'The picture is read on this device and thrown away. Nothing is recorded and nothing is uploaded.',
  'camera.blocked':
    'Chrome blocked access to the camera. Allow it for this page, or use one of the other ways to add an account.',
  'camera.none': 'No camera found on this computer.',
  'camera.busy': 'The camera is in use by another program.',

  // --- Pictures and QR images ----------------------------------------------------
  'image.unreadable': 'That file could not be read as an image.',
  'image.wrongType': 'Use a PNG, JPEG, WebP, GIF or BMP image.',
  'image.tooBig': 'That image is very large. Try one under 8 MB.',
  'image.cannotPrepare': 'Could not prepare the image.',
  'image.wontCompress':
    'That image would not compress small enough. A simple logo works better than a photograph.',
  'image.wrongScreenshotType': 'Use a PNG, JPEG, WebP, GIF or BMP screenshot.',
  'brand.account': 'Account',
  'brand.unknown': 'Unknown service',

  // --- Service field -------------------------------------------------------------
  'service.label': 'Service',
  'service.matches': 'Matching services',

  // --- Moving an account to another app ------------------------------------------
  'share.intro':
    'Scan it with Google Authenticator, Microsoft Authenticator, 1Password, Authy — any authenticator app — and it makes the same codes as this one.',
  'share.warning':
    'Anyone who sees or photographs this code can make your codes for {account}, for as long as the account exists. Show it only to the app you are moving to.',
  'share.show': 'Show QR code',
  'share.qrLabel': 'Setup QR code for {account}',
  'share.hidesIn': 'Scan with the other app. Hides itself in {seconds}s.',
  'share.linkCopied': 'Link copied',
  'share.copyLink': 'Copy setup link',
  'share.saveImage': 'Save as image',
  'share.linkWarning':
    'The link holds the secret too. Paste it into the other app, then copy something else over it.',
  'share.hideNow': 'Hide now',
  'shareCodes.modeLabel': 'Share or move',
  'shareCodes.modeCodes': 'Send codes',
  'shareCodes.modeMove': 'Move to another app',
  'shareCodes.noSecret': 'This account has no setup key, so it makes no codes and there is nothing to share or move. Delete it, and add the account again from its QR code.',
  'shareCodes.intro': 'Make a link that shows this account’s codes until it ends — never the key that makes them.',
  'shareCodes.lengthLabel': 'Works for',
  'shareCodes.min5': '5 minutes',
  'shareCodes.min15': '15 minutes',
  'shareCodes.hour': '1 hour',
  'shareCodes.cannotRecall': 'A link cannot be taken back. Anyone who has it can use the codes until it ends, so send it only to the person who needs it.',
  'shareCodes.copy': 'Copy link',
  'shareCodes.copied': 'Link copied. It works until {time}.',
  'shareCodes.counter': 'Codes that count up cannot be sent this way: each one is used up when it is made. Move the account instead.',

  // --- Getting a code without saving ---------------------------------------------
  'quick.label': 'Setup key or otpauth:// link',
  'quick.copyHint': 'Click to copy',
  'quick.current': 'Current code',
  'quick.next': 'Next: <code>{code}</code>',
  'quick.notSaved': 'Not saved anywhere. Close this and the key is gone.',
  'quick.save': 'Save it as an account instead',
  'quick.settings': '{digits} digits · every {period} s · {algorithm}',
  'quick.change': 'change',
  'quick.digits': 'Digits',
  'quick.every': 'Every',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hash',

  // --- Settings: frame -----------------------------------------------------------
  'nav.accounts': 'Accounts',
  'nav.backup': 'Backup',
  'nav.security': 'Security',
  'nav.about': 'About',
  'options.count': { one: '{count} account', other: '{count} accounts' },
  'options.sourceOnGithub': 'Open source on GitHub',
  // --- A new recovery key --------------------------------------------------------
  'sheet.once':
    'This is the only time this key is shown. It is not stored anywhere — if you lose it, issue a new one.',
  'sheet.print': 'Print',
  'sheet.apart': 'Keep it apart from your email, and never email it to yourself: with this key and your email address, someone can set a new password and open your codes.',
  'sheet.apartProvider': 'Keep it apart from the Google or GitHub account you sign in with, and never keep it in that account’s mail or drive: with this key and that account, someone can open your codes.',
  'sheet.kept': 'I have saved it',
  'sheet.checkHeading': 'Check that you saved it',
  'sheet.checkLead': 'Type two groups of the key from what you saved. Groups are the blocks of four between the dashes, counted from the left.',
  'sheet.group': 'Group {position}',
  'sheet.check': 'Check',
  'sheet.mismatch': 'That is not what your key says. Look again at what you saved, or show the key again and save it now.',
  'sheet.showAgain': 'Show the key again',
  'sheet.download': 'Download the sheet',
  'sheet.copy': 'Copy',

  // --- Groups --------------------------------------------------------------------
  'groups.title': 'Groups',
  'groups.description':
    'Headings in the list, so a long vault can be read at a glance. Accounts are put into one from the account’s own Edit screen.',
  'groups.new': 'New group',
  'groups.newPlaceholder': 'Work',
  'groups.add': 'Add',
  'groups.none':
    'No groups yet. Everything shows in one list, which is the right answer until there is enough in it to need dividing.',
  'groups.moveUp': 'Move {name} up',
  'groups.moveDown': 'Move {name} down',
  'common.save': 'Save',
  'groups.count': { one: '{count} account', other: '{count} accounts' },
  'groups.removeNote': 'Accounts stay, ungrouped.',
  'common.remove': 'Remove',
  'groups.rename': 'Rename',
  'groups.removeNamed': 'Remove {name}',
  'groups.ungrouped': {
    one: '{count} account is in no group, and appears under “Ungrouped” at the end of the list.',
    other: '{count} accounts are in no group, and appear under “Ungrouped” at the end of the list.',
  },

  // --- About ---------------------------------------------------------------------
  'about.fact.sync.title': 'Your secrets are encrypted before anything leaves this device',
  'about.fact.sync.body':
    'Sync is optional. With it, only ciphertext reaches the server, and it has no way to decrypt it. Codes are always computed locally. There is no telemetry.',
  'about.fact.local.title': 'Your secrets never leave this device',
  'about.fact.local.body':
    'There is no server, no account and no telemetry in this version. Codes are computed locally from secrets stored in an encrypted vault.',
  'about.fact.keys.title': 'Two ways to hold the key, both AES-256-GCM',
  'about.fact.keys.body':
    'Your accounts are encrypted with a data key that is itself wrapped. With a master password, the wrapping key comes from PBKDF2 at 600,000 rounds and exists only in memory while unlocked. Without one, it is a non-extractable key this browser holds — no script can read its bytes, though it is not hardware-backed.',
  'about.fact.access.title': 'No blanket site access',
  'about.fact.access.body':
    'The extension asks for no host permissions. Reading a QR code from a page, or filling a code into one, uses activeTab — a grant Chrome hands out only for the tab you invoked the extension on.',
  'about.fact.standards.title': 'Standards, not lock-in',
  'about.fact.standards.body':
    'RFC 6238 TOTP and RFC 4226 HOTP, with otpauth:// import and export. You can leave for another app at any time and take everything with you.',
  'about.version': 'Version {version}',
  'about.source': 'Source code',
  'about.viewOnGithub': 'View on GitHub',
  'about.securityModel': 'Security model',
  'about.securityModelDescription': 'What the extension guarantees, including against the sync server.',
  'about.readIt': 'Read it',
  'about.rate': 'Rate Keyrook Authenticator',
  'about.rateWhere': 'On {store}. It takes a few seconds.',
  'about.report': 'Report a problem or suggest something',
  'about.reportDescription':
    'On GitHub, where anyone can read it. Never paste a setup key, a code or a backup there.',
  'about.openIssue': 'Open an issue',
  'about.how': 'How this works',
  'about.logos.title': 'Service logos',
  'about.logos.description':
    'Marks are compiled into the extension, never fetched. Asking the network for a logo would tell whoever answered which services you have two-factor authentication on.',
  'about.logos.body':
    '{count} services have a real mark. Artwork from <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons and <fa>Font Awesome Free</fa> (icons, CC BY 4.0). All product names and logos belong to their owners and are used only to identify the service an account belongs to. A service with no mark in either set gets a lettered tile.',
  'about.shortcut.change': 'Change it at chrome://extensions/shortcuts.',
  // --- Settings: accounts --------------------------------------------------------
  'accounts.title': 'Accounts',
  'accounts.description':
    'Everything stored in this vault. Codes are generated on this device, never by a server.',
  'accounts.empty': 'No accounts yet. Add one to get started.',
  'accounts.digits': '{type} {digits} digits',
  'accounts.period': ' · {seconds}s',
  'accounts.counter': ' · counter {counter}',
  'accounts.steam': 'Steam Guard',
  'accounts.moveNamed': 'Share or move {name}',
  'accounts.edit': 'Edit',
  'common.delete': 'Delete',
  'accounts.deleteNamed': 'Delete {name}',
  'accounts.deleted.title': 'Recently deleted',
  'accounts.deleted.description':
    'Kept so other devices learn about the removal once sync is switched on. Restore anything you removed by mistake.',
  'accounts.deleted.on': 'Deleted {date}',
  'accounts.restore': 'Restore',
  'common.close': 'Close',
  'editor.title': 'Edit account',
  'editor.picture': 'Picture',
  'editor.pictureOwn': 'Your own image, used instead of the service mark.',
  'editor.pictureNone': 'Choose one for services that have no logo here, or to tell two accounts apart.',
  'editor.replace': 'Replace',
  'editor.choose': 'Choose image…',
  'editor.websites': 'Websites',
  'editor.websitesHint': 'Comma-separated. Used to suggest this account on matching sites.',
  'editor.note': 'Note',
  'editor.group': 'Group',
  'editor.ungrouped': 'Ungrouped',
  'editor.noGroups': 'Create a group under Accounts first.',
  'editor.setupKey': 'Setup key',
  'editor.setupKeyHint': 'The secret behind this account. Anyone who sees it can generate your codes.',
  'editor.hide': 'Hide',
  'editor.reveal': 'Reveal',
  'editor.revealWarning':
    'Only show this on a screen nobody else can see. Copying this link into another authenticator app is how you move the account to a phone.',
  'editor.save': 'Save changes',

  // --- Settings: import ----------------------------------------------------------
  'import.incomplete': {
    one: 'These screenshots hold {seen} of the {total} codes in this Google Authenticator export, so the accounts in the other one are not here. Choose every screenshot of the export together to bring them all across.',
    other: 'These screenshots hold {seen} of the {total} codes in this Google Authenticator export, so the accounts in the other {count} are not here. Choose every screenshot of the export together to bring them all across.',
  },
  'import.oneOrScreenshots': 'Choose one backup file, or one or more screenshots of QR codes.',
  'import.noQrInThis': 'No QR code found in this image.',
  'import.noAccountsInImages': 'Those images did not contain any accounts.',
  'import.tooLarge': 'That file is too large to be a backup.',
  'import.noAccountsInFile': 'That file did not contain any accounts.',
  'import.description':
    'Bring accounts in from a backup file, from another authenticator’s export — scanned with your camera or chosen as screenshots — or by pasting otpauth:// links.',
  'import.stopAndReview': 'Stop and review {count}',
  'import.noNativeReader':
    'Chrome on this computer has no built-in QR reader, so a large code — like a Google Authenticator export — often will not scan from a camera. If yours will not, screenshot each code on your phone and pick them all with Choose files.',
  'import.encrypted': 'This backup is encrypted. Enter the password it was created with.',
  'import.backupPassword': 'Backup password',
  'import.open': 'Open backup',
  'import.found': { one: 'Found {count} new account', other: 'Found {count} new accounts' },
  'import.skipping': ', skipping {count} already in your vault',
  'import.unreadable': ', and {count} could not be read',
  'import.foundEnd': '.',
  'import.showFailed': 'Show the lines that failed',
  'import.import': 'Import {count}',
  'import.scan': 'Scan with your camera',
  'import.choose': 'Choose files…',
  'import.paste': '…or paste otpauth:// links, one per line',
  'import.read': 'Read links',

  // --- Moving everything to another app ------------------------------------------
  'dest.google.steps':
    'In Google Authenticator: menu → Transfer accounts → Import accounts, then scan the codes in order.',
  'dest.microsoft.steps':
    'Microsoft Authenticator cannot import from another app, so the accounts go one after another. In it: + → Other account, scan, then Next here.',
  'dest.apple.steps':
    'Passwords imports codes only one at a time. In the Passwords app: Codes → +, scan, then Next here.',
  'dest.authy.steps':
    'Authy cannot import from another app, so the accounts go one after another. In Authy: + → Scan QR code, then Next here.',
  'dest.1password.steps':
    '1Password adds codes one login at a time. Open or create the login → Edit → add a one-time password → scan, then Next here. On a computer it can read the code straight off this screen.',
  'dest.bitwarden.steps':
    'Password manager: Import data → file format “Bitwarden (json)” → choose the file. Bitwarden Authenticator app: import from Google Authenticator and scan the transfer codes.',
  'dest.proton.steps':
    'In Proton Authenticator, import from Google Authenticator and scan the transfer codes — or import from Aegis and choose the file.',
  'dest.ente.steps':
    'In Ente Auth, import codes from Google Authenticator and scan the transfer codes — or choose “Plain text” and the .txt file.',
  'dest.aegis.steps': 'In Aegis: Import & Export → Import from file → Aegis, and choose the file.',
  'dest.2fas.steps':
    'In 2FAS, import from Google Authenticator and scan the transfer codes — or import from Aegis and choose the file.',
  'dest.other.steps':
    'Every authenticator scans a setup code, so one after another always works. Many also import Google Authenticator’s transfer codes, or a file of otpauth:// links — look for an import option.',
  'dest.other.name': 'Another app',

  // --- Settings: export ----------------------------------------------------------
  'export.what': 'What to export',
  'export.all': { one: 'All {count} account.', other: 'All {count} accounts.' },
  'export.someChosen': '{chosen} of {total} chosen.',
  'export.choose': 'Choose…',
  'export.chipAll': 'All',
  'export.chipNone': 'None',
  'export.encrypted.description':
    'A file locked with a password you choose here. Keep a copy somewhere safe — if this device dies, this file is how you get your accounts back.',
  'export.encrypted.hint': 'At least 8 characters. Can differ from your master password.',
  'export.encrypted.download': 'Download encrypted backup ({count})',
  'export.move.title': 'Move to another app',
  'export.move.description':
    'Readable exports, for moving to another authenticator or keeping on paper. Unlike a backup, none of them is encrypted.',
  'export.move.danger':
    'These hold your 2FA secrets in the clear. Anyone who sees the codes or opens the files can make your codes for as long as the accounts exist. Delete files, and shred paper, once you are done.',
  'export.move.understood': 'I understand these are not encrypted.',
  'common.continue': 'Continue',
  'export.move.which': 'Which app are you moving to?',
  'export.filesAndPaper': 'Files and paper:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Print sheet',
  'export.closesIn': {
    one: '{accounts}. Closes again in {count} min.',
    other: '{accounts}. Closes again in {count} min.',
  },
  'export.closesSoon': '{accounts}. Closes again soon.',
  'export.accounts': { one: '{count} account', other: '{count} accounts' },
  'export.closeNow': 'Close now',
  'export.method.transfer': 'Show transfer codes',
  'export.method.oneByOne': 'Scan one by one',
  'export.method.aegis': 'Download Aegis file',
  'export.method.bitwarden': 'Download Bitwarden file',
  'export.method.text': 'Download text file',
  'export.allAtOnce': 'All at once',
  'export.oneAtATime': 'One at a time',
  'export.transfer.label': 'Transfer codes for {app}',
  'export.transfer.title': 'Google Authenticator transfer codes',
  'export.moveTo': 'Move to {app}',
  'export.transfer.none': 'None of the chosen accounts can go to Google Authenticator.',
  'export.transfer.codeLabel': 'Transfer code {index} of {total}',
  'export.previous': 'Previous',
  'export.next': 'Next',
  'export.transfer.code': 'Code {index} of {total}',
  'export.transfer.oneHolds': {
    one: 'One code holds all {count} account.',
    other: 'One code holds all {count} accounts.',
  },
  'export.transfer.notIncluded': 'Not included — move these one by one instead:',
  'export.oneByOne.label': 'Setup codes for {app}, one at a time',
  'export.oneByOne.title': 'One account at a time',
  'export.oneByOne.progress': 'Accounts shown',
  'export.oneByOne.position': 'Account {index} of {total}',
  'export.oneByOne.keys': '→ or Space for the next one, Esc to stop',
  'export.steamRefused': '{app} cannot make Steam Guard codes, so it will not take this account.',
  'export.print.label': 'QR codes to print or scan',
  'export.print.title': 'Keyrook Authenticator — setup codes',
  'export.print.body':
    '{accounts}, {date}. Each code sets up the account in any authenticator app. Anyone holding this can make your codes: keep it locked away.',
  'export.print.print': 'Print or save as PDF',

  // --- Settings: security, at the top --------------------------------------------
  'security.locking': 'Locking',
  'security.lockAfter': 'Lock after inactivity',
  'security.lockAfter.passphrase':
    'The decryption key is dropped from memory. Your master password is needed again.',
  'security.lockAfter.device':
    'Only applies with a master password — a device-key vault has nothing to unlock.',
  'security.autoLock': 'Auto-lock delay',
  'security.minutes': { one: '{count} minute', other: '{count} minutes' },
  'security.hour': '1 hour',
  'security.never': 'Never',
  'security.needsPassword': 'Needs a master password',
  'security.blur': 'Blur codes until hovered',
  'security.blurDescription': 'Keeps codes off the screen during screen sharing.',
  'security.blurToggle': 'Blur codes',
  'security.autofill': 'Autofill',
  'security.autofillRow': 'Offer to fill codes on web pages',
  'security.appearance': 'Appearance',
  'security.theme': 'Theme',
  'security.theme.system': 'Match system',
  'security.theme.light': 'Light',
  'security.theme.dark': 'Dark',
  'security.sortBy': 'Sort accounts by',
  'security.sortOrder': 'Sort order',
  'security.sort.added': 'Order added',
  'security.sort.name': 'Name',
  'security.language': 'Language',
  'security.languageBrowser': 'Browser default ({language})',
  // --- Settings: how the vault is protected --------------------------------------
  'protect.msg.removedSignedIn':
    'This device now opens without a password. Your account password has not changed.',
  'protect.msg.removed': 'Master password removed. This vault now unlocks automatically on this device.',
  'protect.msg.setSignedIn': 'This device now locks with your account password.',
  'protect.msg.set': 'Master password set. You will be asked for it after the vault locks.',
  'protect.msg.changedSignedIn':
    'Password changed, for this vault and your account. Your other devices will ask you to sign in again with it.',
  'protect.msg.changed': 'Master password changed.',
  'protect.state.accountPassword': 'Locks with your account password',
  'protect.state.master': 'Master password',
  'protect.state.device': 'Device key (no password)',
  'protect.lockWithAccount': 'Lock with your account password',
  'protect.addMaster': 'Add a master password',
  'protect.changePassword': 'Change password',
  'protect.note.passphrase':
    'This is also your sync account’s password. Changing it here changes it there, and your other devices will ask you to sign in again.',
  'protect.note.device':
    'Your sync account has its own password, which this device does not ask for. You need it on a new device, and to change the account or its recovery key.',
  'protect.removeWarning':
    'The vault stays encrypted, but it will unlock by itself whenever this browser profile is open. Anyone using this computer can then see your codes.',
  'protect.removeWarningSignedIn':
    ' Your account keeps its password — you will still need it on a new device.',
  'protect.currentPassword': 'Current password',
  'protect.currentMaster': 'Current master password',
  'protect.accountPassword': 'Account password',
  'protect.accountPasswordHint':
    'The password you use to sign in to sync. This device will ask for it after it locks.',
  'protect.newPassword': 'New password',
  'protect.hint12': 'At least 12 characters with a mix, or four or five unrelated words.',
  'protect.confirmNew': 'Confirm new password',
  'protect.removePassword': 'Remove password',
  'protect.lockWithIt': 'Lock with it',
  'protect.setPassword': 'Set password',
  'danger.title': 'Delete this vault',
  'danger.description':
    'Removes every account and the encrypted vault from this device. There is no undo, and no copy anywhere else.',
  'danger.open': 'Delete this vault…',
  'danger.warning':
    'Make sure you still have another way into every account first — a backup file, recovery codes, or the same accounts on your phone.',
  'common.typeToConfirm': 'Type {word} to confirm',
  'danger.confirm': 'Delete everything',

  // --- Settings: recovery key ----------------------------------------------------
  'kit.title': 'Recovery key',
  'kit.provider':
    'Your account has no password. A recovery key is the way back if every device signed in to it is lost: it lets a new device into your account without another one to approve it. {provider} cannot do that for you.',
  'kit.signedIn':
    'Nobody can reset your password for you — not even us. A recovery key is the only way back if you forget it: it opens this vault, your other devices, and your account on a new one.',
  'kit.passphrase':
    'Nobody can reset your master password — not even us. That is what stops anyone else opening your vault, and it is also why a recovery key is the only way back if you forget it.',
  'kit.device':
    'This vault unlocks with a key your browser holds. If that key goes — cleared browsing data, a new profile, a reinstall — a recovery key is the only thing that can still open it.',
  'kit.none': 'No recovery key yet',
  'kit.vaultOnly': 'Opens this vault, but not your account',
  'kit.issued': 'A recovery key has been issued',
  'kit.issueNew': 'Issue a new one',
  'kit.create': 'Create a recovery key',
  'kit.beforeSignIn':
    'This key was issued before you signed in, so your account does not have it. It still opens this vault here, but not on a new device. Issue a new one to cover both.',
  'kit.replaces':
    'Issuing a new key makes the previous one stop working, so an old printed sheet is safe to throw away once you have replaced it.',
  'kit.replacesSignedIn':
    'Issuing a new key makes the previous one stop working, here and on your other devices, so an old printed sheet is safe to throw away once you have replaced it.',
  'kit.withoutProvider':
    'Without one, losing every device signed in to your account means every account in this vault is gone for good.',
  'kit.withoutPassword':
    'Without one, forgetting your password means every account in this vault is gone for good.',
  'kit.withoutDevice':
    'Without one, losing the key this browser holds means every account in this vault is gone for good.',
  'kit.noSupport': 'There is no support request that can undo it.',
  'kit.removeProvider':
    'Removing it leaves a device already signed in as the only way to let a new one into your account.',
  'kit.removePassword': 'Removing it leaves your password as the only way in.',
  'kit.removePasswordSignedIn':
    'Removing it leaves your password as the only way in — on this device, your other devices and your account.',
  'kit.reauth':
    'A recovery key can let a device into your account, so {provider} asks you to sign in once more first.',
  'kit.passwordHint': 'A recovery key can reset your account, so changing it takes your password.',
  'kit.removeConfirm': 'Remove the recovery key',
  'kit.createConfirm': 'Create the key',

  // --- Settings: account and sync ------------------------------------------------
  'account.title': 'Account',
  'facts.stored': 'Accounts stored',
  'facts.noLimit': 'No limit',
  'facts.encryption': 'Encryption',
  'facts.autofill': 'Autofill and QR scanning',
  'facts.included': 'Included',
  'facts.backup': 'Encrypted backup file',
  'facts.sync': 'Sync between devices',
  'facts.needsAccount': 'Requires an account',
  'facts.notYet': 'Not available yet',
  'facts.withoutAccount': 'Without an account, on this device',
  'facts.title': 'What a free local vault gets you',
  'facts.description':
    'No account, no email, no server — and no limits on the parts that matter for security.',
  'account.localOnly': 'Local only — not signed in',
  'account.noServer':
    'This build was made without a sync server, so nothing you add here leaves your machine.',
  'account.signedInWith': 'Signed in with {provider} · ',
  'account.lastSynced': 'Last synced {time}',
  'account.notSynced': 'Not synced yet',
  'account.every5': ' · syncs every 5 minutes',
  'account.syncNow': 'Sync now',
  'account.signOut': 'Sign out',
  'account.noKitProvider':
    'Your account has no recovery key. If every device signed in to it is lost, nothing can get your accounts back — not us, and not {provider}.',
  'account.noKit':
    'Your account has no recovery key. If you forget your password and lose this device, nothing can get your accounts back — not us, not anyone.',
  'account.createUnderSecurity': 'Create one under Security',
  'summary.sentReceived': 'Sent {sent}, received {received}',
  'summary.conflicts': ", kept this device's version for {count}",
  'summary.overLimit': ', {count} did not fit — an account holds up to 10,000 — and stayed on this device',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} account was removed on another device — you can restore it under Accounts.',
    other: ' {count} accounts were removed on another device — you can restore them under Accounts.',
  },
  'summary.rejected': {
    one: ' {count} record could not be decrypted and was ignored. If this keeps happening, something is wrong with the stored copy.',
    other: ' {count} records could not be decrypted and were ignored. If this keeps happening, something is wrong with the stored copy.',
  },
  'account.signOutNote':
    'Signing out removes your codes from this browser. They stay in your Keyrook account — sign in again to bring them back.',
  'accountPage.title': 'Your Keyrook account',
  'accountPage.body': 'Its password, its recovery key, starting it over and deleting it are on the account page, for every Keyrook app at once.',
  'accountPage.bodyNoRoot': 'Its password and deleting it are on the account page. Its recovery key is made here, under Security, until another Keyrook app uses the account.',
  'accountPage.bodyProvider': 'Its recovery key, starting it over and deleting it are on the account page, for every Keyrook app at once.',
  'accountPage.bodyNoRootProvider': 'Deleting it is on the account page. Its recovery key is made here, under Security, until another Keyrook app uses the account.',
  'sheetCheck.lead': 'Type the recovery key you saved, once, so this app knows it can bring your codes back. It is checked on this device and sent nowhere.',
  'sheetCheck.submit': 'Check it',
  'sheetCheck.lost': 'Lost it, or never had one? Make a new one on the account page.',
  'accountPage.noSheetYet': 'Nothing yet shows that your recovery key protects Keyrook Authenticator. Without it, a forgotten password can cost you your codes. Type it once under Security, or make a new one on the account page.',
  'account.checkUnderSecurity': 'Check it under Security',
  'accountPage.open': 'Open the account page',
  'accountPage.recoveryKey': 'A signed-in vault’s recovery key is the Keyrook account’s. It is made and changed on the account page.',
  'accountPage.sheetProtects': 'The account’s recovery key protects Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Not yet known to protect Keyrook Authenticator',
  'secondStep.title': 'One more step',
  'secondStep.lead': 'Your Keyrook account asks for a second step. Enter the 6-digit code your authenticator app shows for it.',
  'secondStep.field': 'Code, or recovery key',
  'secondStep.hint': 'Lost that app? Enter your account’s recovery key instead.',
  'secondStep.passkey': 'Use a passkey instead',
  'secondStep.where': 'Two-step sign-in is turned on and off on account.keyrook.com.',
  'secondStep.ownerLead': 'Your account asks for a second step for this too: the code from your authenticator app, or your recovery key.',
  'secondStep.nextCode': 'Each code works once. If you just signed in with one, wait for your app to show the next.',
  'secondStepTip.title': 'Two-step sign-in',
  'secondStepTip.suggest':
    'Ask for a code too whenever this account signs in on another device. Turn it on at account.keyrook.com, and keep the code here: on that page, open Keyrook Authenticator and choose “{scan}”.',
  'secondStepTip.kept': 'This account’s own sign-in code is kept here, on every device signed in to it.',
  'secondStepTip.warning':
    'If every device that keeps it is lost, sign in with your recovery key in place of the code. Keep the recovery key somewhere apart.',
  'secondStepTip.open': 'Turn it on',
  'signin.providerHasPassword': '{provider} confirmed it is you, and {email} has a password too. Enter it to open your codes here.',
  'provider.addOnPage': 'To sign in with Google or GitHub as well, sign in on the account page with your password and add it there.',
  'startOver.title': 'Your Keyrook account will start over on {date}',
  'startOver.lead': 'Someone on “{device}” asked for it on {date}, with the code we emailed: a new password and new keys, and your apps would start empty.',
  'startOver.ifYou': 'If it was you, there is nothing to do. If it was not, cancel it now, then change your email password: whoever asked can read your email.',
  'startOver.cancel': 'It wasn’t me — cancel it',
  'kept.title': 'Kept from before the account started over',
  'kept.body': 'When this account started over, what Keyrook Authenticator had in it was kept, until {date}. Bring it back with the password the account had then, or its recovery key of then.',
  'kept.password': 'Password of then',
  'kept.recoveryKey': 'Recovery key of then',
  'kept.usePassword': 'Use the password of then instead',
  'kept.useRecoveryKey': 'Use the recovery key of then instead',
  'kept.bring': 'Bring it back',
  'kept.done': 'It is back in this vault, and on its way to your other devices.',
  'error.keys.awaitingConfirmation': 'Another Keyrook app replaced this account’s keys, and Keyrook Authenticator’s has not followed yet. Open the account page to check them, then sign in again.',
  'password.changedBoth':
    'Password changed, for your account and this vault. Your other devices will ask you to sign in again with it.',
  'password.changedAccount':
    'Account password changed. Your other devices will ask you to sign in again with it.',
  'password.title': 'Password',
  'password.row': 'Account password',
  'password.rowDescription':
    'What you sign in with on a new device. Nobody can reset it for you — keep your recovery key safe.',
  'password.change': 'Change password…',
  'password.formTitle': 'Change your account password',
  'devices.title': 'Signed-in devices',
  'devices.description':
    'Sign out a device you no longer use or no longer have. If it runs an up-to-date Keyrook Authenticator, it takes this account’s codes off itself the next time it connects, keeping only what it never sent. Until then, or if it never connects again, it keeps what it had, locked behind the same password.',
  'devices.descriptionProvider':
    'Sign out a device you no longer use or no longer have. If it runs an up-to-date Keyrook Authenticator, it takes this account’s codes off itself the next time it connects, keeping only what it never sent. Until then, or if it never connects again, it keeps what it had, locked the way its vault is locked on that device.',
  'devices.this': 'This device',
  'devices.when': 'Signed in {created} · last active {seen}',
  'removed.kept': 'Codes added or changed here that had not reached the account are still here.',
  'delete.row': 'Delete your account',
  'delete.rowDescription':
    'Removes every encrypted copy the server holds. This device keeps its vault exactly as it is; other devices stop syncing.',
  'delete.open': 'Delete account…',
  'delete.warning':
    'There is no undo. If this device is the only place your accounts still exist after this, keep it — or export a backup first.',
  'delete.reauth': '{provider} asks you to sign in once more before anything is deleted.',
  'delete.confirm': 'Delete the account',

  // --- Signing in: the first card ------------------------------------------------
  'intro.benefit1': 'The same codes on every device you sign in on.',
  'intro.benefit2': 'A lost or broken laptop is not a lost vault.',
  'intro.benefit3': 'Free, and optional — everything keeps working on this device without it.',
  'intro.title': 'Sync your vault',
  'intro.subtitle':
    'Encrypted on this device before it leaves. The server stores what it cannot read — and neither can we.',
  'intro.signedOutProvider':
    'This device was signed out of {email} — it was removed from another one. Continue with {provider} to sign in again.',
  'intro.orEmail': 'or use email',
  'intro.create': 'Create an account',
  'intro.signIn': 'Sign in',
  'intro.source': 'Open source — see how your codes are encrypted',

  // --- Signing in: email forms ---------------------------------------------------
  'form.email': 'Email',
  'form.emailPlaceholder': 'you@example.com',
  'create.checkEmail': 'Check your email',
  'create.codeSent': 'We sent a six-digit code to <b>{email}</b>. It works once, for 15 minutes.',
  'create.code': 'Code',
  'create.spam':
    'Not in your inbox? Look in <b>Spam</b> for a message from <b>Keyrook</b>, and mark it <b>Not spam</b>.',
  'create.submit': 'Create account',
  'create.existing':
    'If this address already has an account, the email says so instead — then sign in there.',
  'create.stillNothing': 'Still nothing?',
  'create.resendIn': 'Send a new code in {seconds}s',
  'create.resend': 'Send a new code',
  'create.wrongAddress': '. Wrong address?',
  'create.changeIt': 'Change it',
  'create.title': 'Create your account',
  'create.choosing': 'You will need this password on a new device. This one keeps opening without it.',
  'create.sharing': 'Your master password becomes your account password too — still just one.',
  'create.password': 'Password',
  'create.master': 'Master password',
  'create.next':
    'Next, we email you a code to confirm the address, then you save a recovery key — the only way back if you forget the password.',
  'create.agree': 'Creating an account means agreeing to the <link>privacy policy</link>.',
  'create.haveAccount': 'Already have an account?',
  'signin.subtitle': 'Codes already on this device are added to your account.',
  'signin.signedOut':
    'This device was signed out of {email} — the password was changed or the device was removed from another one. Sign in again to keep syncing.',
  'signin.forgot': 'Forgot password?',
  'signin.locksWithAccount': 'This device will lock with your account password from then on.',
  'signin.keepsOpening': 'This device keeps opening without a password.',
  'signin.newHere': 'New here?',
  'recoverAccount.title': 'Recover your account',
  'recoverAccount.subtitle':
    'Use the recovery key you saved when you created it, then choose a new password.',
  'recoverAccount.keyHint': '32 characters from your printed sheet. Spaces and dashes do not matter.',
  'recoverAccount.submit': 'Recover and sign in',
  'recoverAccount.elsewhere': 'If another Keyrook app uses this account too, its password is reset on the account page.',
  'recoverAccount.note':
    'Every device on the account is signed out and asked for the new password. Your recovery key keeps working.',

  // --- Signing in: after ---------------------------------------------------------
  'ready.empty': 'Your account is ready.',
  'ready.all': {
    one: 'Your account is ready, and the account on this device is backed up to it.',
    other: 'Your account is ready, and all {count} accounts on this device are backed up to it.',
  },
  'ready.some':
    'Your account is ready. {done} of {total} accounts are backed up so far; the rest follow on the next sync.',
  'fresh.title': 'Save your recovery key',
  'fresh.provider':
    'If every device signed in to your account is lost, this key is the only way back in — {provider} cannot restore your vault, and neither can we.',
  'fresh.password':
    'If you forget your password, this key is the only way back in — nobody can reset it for you, not even us.',
  'welcome.fromAccount': '{count} from your account',
  'welcome.fromDevice': '{count} added from this device',
  'welcome.inSync': 'Already in sync.',
  'welcome.nothing': 'Nothing here yet.',
  'welcome.failed': 'Signed in — the first sync did not finish',
  'welcome.back': 'You are back in',
  'welcome.signedIn': 'You are signed in',
  'welcome.nothingLost':
    'Nothing is lost: your codes arrive with the next sync. Try again now, or it happens by itself within five minutes.',
  'welcome.onDevice': { one: 'account on this device', other: 'accounts on this device' },
  'welcome.uploading': {
    one: ' · {count} is still uploading and will follow on the next sync',
    other: ' · {count} are still uploading and will follow on the next sync',
  },
  'welcome.othersSignedOut': 'Every other device was signed out, and will ask for the new password.',
  'welcome.tryAgain': 'Try again',
  'welcome.seeAccounts': 'See your accounts',
  'welcome.toolbar': 'They are also one click away: the Keyrook Authenticator icon in your toolbar.',

  // --- Signing in with Google or GitHub ------------------------------------------
  'provider.continue': 'Continue with {provider}',
  'provider.finishInWindow': 'Finish in the {provider} window that opened.',
  'provider.confirmed': '{provider} confirmed <b>{email}</b>. No account uses it yet.',
  'provider.point1':
    'No password. On a new device you continue with {provider}, and a device already signed in lets it in after you check both show the same code.',
  'provider.point2':
    '{provider} proves it is you. It never sees your codes: they are encrypted here, with a key that stays on your devices.',
  'provider.point3':
    'Next you save a recovery key — the way back if every device signed in to the account is lost. {provider} cannot restore your vault.',
  'provider.notRight': 'Not the right account?',
  'provider.startAgain': 'Start again',
  // The Keyrook account's own passkeys, added on its page: beside Google and GitHub.
  'passkey.continue': 'Continue with a passkey',
  'passkey.where':
    'One you added on <link>the account page</link>, under Passkeys. The first time, Chrome asks to let Keyrook Authenticator use it.',
  'pairing.codeLabel': 'Code {code}',
  'join.title': 'Let this browser in',
  'join.subtitle':
    '<b>{email}</b> already has an account. Approve this browser from a device that is signed in to it.',
  'join.masterPassword': 'This vault’s master password',
  'join.masterHint': 'It keeps locking this vault here; the account itself has no password.',
  'join.ask': 'Ask to join',
  'join.step1':
    'On a device already signed in, open Keyrook Authenticator. The request shows there — above the codes, and in Settings under Sync.',
  'join.step2': 'Check it shows the same code as this page, then approve it.',
  'join.askAgain': 'Ask again',
  'join.compare': 'The other device shows a code too. Approve there only if it is exactly this one.',
  'join.waiting': 'Waiting for another device…',
  'join.noOther': 'No other device left?',
  'join.useKey': 'Use your recovery key',
  'join.wrongAccount': 'Signed in with {provider} as the wrong account?',
  'joinKey.subtitle':
    'The key you saved when the account was made. It lets this browser in without another device.',
  'joinKey.submit': 'Join the account',
  'approve.approved': 'Approved. The other device opens your vault in a moment.',
  'approve.mismatch':
    'Declined. If you were not signing in yourself just now, someone else can sign in to your {provider} account — change its password and check its security settings.',
  'approve.declined': 'Declined. Nothing was sent.',
  'approve.title': 'Devices asking to join',
  'approve.description':
    'Each request comes from someone who just signed in with your {provider} account. Approve only a device you are signing in on yourself, right now.',
  'approve.descriptionAny':
    'Each request comes from someone who just signed in with your Google or GitHub account. Approve only a device you are signing in on yourself, right now.',
  'approve.mismatchAny':
    'Declined. If you were not signing in yourself just now, someone else can sign in to your Google or GitHub account — change its password and check its security settings.',
  'approve.askedAt': 'Asked at {time}',
  'approve.review': 'Review',
  'approve.deny': 'Deny',
  'approve.question':
    'Does the device asking show exactly this code? If it does not, someone else is trying to get in.',
  'approve.matches': 'It matches — let it in',
  'approve.doesNotMatch': 'It does not match',

  // --- Errors, continued ---------------------------------------------------------
  'error.vaultNewer':
    'This vault was created by a newer version of Keyrook Authenticator. Please update before opening it.',
  'error.uriUnsupported': 'That link uses a setting this app cannot read ({value}).',

  // --- Settings: accounts, continued ---------------------------------------------
  'editor.websitesPlaceholder': 'github.com, gist.github.com',

  // --- Errors, last --------------------------------------------------------------
  'error.noWorker': 'The extension did not answer. Close this and open it again.',

  // --- Settings, by job ----------------------------------------------------------
  'nav.sync': 'Sync',
  'nav.general': 'General',
  'nav.needsAttention': 'Needs attention',
  'sync.description': 'The same codes on every device you sign in on, encrypted here before they leave.',
  'backup.description': 'Keep an encrypted copy, bring accounts in, or move them to another app.',
  'backup.choice.backup.title': 'Back up',
  'backup.choice.backup.body': 'An encrypted file, locked with a password you choose.',
  'backup.choice.import.title': 'Import',
  'backup.choice.import.body': 'From a backup, another app’s export, or otpauth:// links.',
  'backup.choice.move.body': 'Transfer codes, a page to print, or a readable file. Not encrypted.',
  'security.description': 'How this vault opens, and your way back in if this browser is lost.',
  'security.deviceKeyHint': 'Nothing to type. It does not stop malware running as you on this computer.',
  'security.passwordHint': 'Asked for whenever the vault has locked.',
  'general.description': 'How the extension looks and behaves, and where it comes from.',
  'general.inBrowser': 'In the browser',
  'general.autofillHint':
    'Opening the popup on a sign-in page offers the matching code. Only that tab is read.',

  // --- Signing in, from the popup ------------------------------------------------
  'vault.signInToSync': 'Sign in to sync',
  'vault.empty.signIn':
    'Using Keyrook Authenticator on another device? <link>Sign in</link> to bring your codes here.',
  'setup.haveAccount': 'Already use Keyrook Authenticator? <link>Sign in</link> to bring your codes here.',
  'popup.signInOpensTab': 'Opens in a new tab, and finishes in Settings.',

  // --- Moving in from another app ------------------------------------------------
  'error.backupWrongPassword': 'That password does not open this file.',
  'error.foreign.steamFolder':
    'Choose every file in Steam Desktop Authenticator’s maFiles folder together: manifest.json and the .maFile files beside it.',
  'error.foreign.locked':
    'This export is locked with a password Keyrook Authenticator cannot open. Export it again without a password.',
  'import.lockedFrom': '{app} locked this export with a password. Enter the one you set there.',
  'import.fromApps':
    'Exports from Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, Steam Desktop Authenticator, the Authenticator extension and Google Authenticator work too — and a CSV from Apple Passwords, 1Password or another password manager.',
  // --- Filling with one key ------------------------------------------------------
  'shortcut.open': 'Open Keyrook Authenticator',
  'shortcut.fill': 'Fill the code for this page',
  'shortcut.fillHint':
    'Fills only where exactly one account belongs to the site; anywhere else it opens the list.',
  'shortcut.notSet': 'Not set',
  'vault.shortcutHint': '{keys} fills it without opening this.',

  // --- Password managers’ spreadsheets -------------------------------------------
  'import.csvWarning':
    'This file holds your passwords in the clear. Only the two-factor keys were read and nothing else is kept — delete the file when you are done.',
  'import.noKeysInCsv': 'That file has no two-factor keys in it — only passwords.',

  // --- A screen that broke -------------------------------------------------------
  'crash.title': 'Something went wrong',
  'crash.body':
    'This screen ran into a problem and stopped. Your saved accounts are not affected. Reloading usually brings it back.',
  'crash.reload': 'Reload',

  // --- The same, said of a phone (i18n/device.ts) ---------------------------------
  'setup.device.description.phone':
    'Your secrets are encrypted with a key this phone keeps for you. Nothing to remember, nothing to type.',
  'setup.device.footnote.phone':
    'Protects against a copy of the app’s files. Not against someone who can unlock this phone.',
  'setup.password.footnote.phone':
    'The strongest option: once it locks, nothing on this phone can open the vault without the password.',
  'unrecoverable.why.phone':
    'Its encryption key was kept by this phone and is gone — usually because the app’s data was cleared, the app was reinstalled, or the vault came from another phone’s backup. Without that key the stored accounts cannot be decrypted by anyone, including us.',
  'vault.empty.body.phone':
    'When a site shows a QR code to set up two-step verification, scan it with this phone’s camera.',
  'add.camera.description.phone': 'For a code on another screen — including a Google Authenticator export.',
  'add.fromGoogle.phone':
    'Moving from Google Authenticator on another phone? Export your accounts there, then scan the code it shows with this phone’s camera. If it shows several, do each one.',
  'camera.noCamera.phone': 'This phone will not give the app a camera.',
  'camera.blocked.phone':
    'The app is not allowed to use the camera. Allow it in the phone’s settings, or use one of the other ways to add an account.',
  'camera.none.phone': 'No camera found on this phone.',
  'security.languageBrowser.phone': 'Phone default ({language})',
  'protect.removeWarning.phone':
    'The vault stays encrypted, but it will unlock by itself whenever the app opens. Anyone who can unlock this phone can then see your codes.',
  'kit.device.phone':
    'This vault unlocks with a key your phone keeps. If that key goes — the app’s data cleared, the app reinstalled, a new phone — a recovery key is the only thing that can still open it.',
  'kit.withoutDevice.phone':
    'Without one, losing the key this phone keeps means every account in this vault is gone for good.',
  'security.description.phone': 'How this vault opens, and your way back in if this phone is lost.',
  'security.deviceKeyHint.phone': 'Nothing to type. Anyone who can unlock this phone can open it.',
  'general.description.phone': 'How the app looks and behaves, and where it comes from.',
  'about.securityModelDescription.phone': 'What the app guarantees, and what it does not.',
  'about.logos.description.phone':
    'Marks are compiled into the app, never fetched. Asking the network for a logo would tell whoever answered which services you have two-factor authentication on.',
  'about.fact.access.title.phone': 'The camera, and only to scan',
  'about.fact.access.body.phone':
    'The app asks for no permission but the camera, and only when you choose to scan a code. What the camera sees never leaves the phone.',
  'about.fact.keys.body.phone':
    'Your accounts are encrypted with a data key that is itself wrapped. With a master password, the wrapping key comes from PBKDF2 at 600,000 rounds and exists only in memory while unlocked. Without one, it is a key sealed by the phone’s own key store, so a copy of the app’s files cannot open the vault.',
  'rate.store.play': 'Google Play',
  'add.noNativeReader.phone':
    'A large code — like a Google Authenticator export — often will not scan from the camera here. If yours will not, take a photo of it with the phone’s camera app and use Upload a QR image instead.',
  'import.noNativeReader.phone':
    'A large code — like a Google Authenticator export — often will not scan from the camera here. If yours will not, take a photo of each code with the phone’s camera app and pick them all with Choose files.',
  'error.signOutUnsynced.phone':
    'Some changes on this phone haven’t reached your account yet, and signing out now would lose them. Connect to the internet and try again.',
  'account.signOutNote.phone':
    'Signing out removes your codes from this phone. They stay in your Keyrook account — sign in again to bring them back.',
  'secondStepTip.suggest.phone':
    'Ask for a code too whenever this account signs in on another device. Turn it on at account.keyrook.com, and keep the code here: add an account in this app and scan the QR code that page shows.',
  'intro.benefit2.phone': 'A lost or broken phone is not a lost vault.',
  'provider.finishInWindow.phone': 'Finish in the {provider} page that opened in your browser.',
  'join.title.phone': 'Let this phone in',
  'join.subtitle.phone':
    '<b>{email}</b> already has an account. Approve this phone from a device that is signed in to it.',
  'joinKey.subtitle.phone':
    'The key you saved when the account was made. It lets this phone in without another device.',
  'facts.autofill.phone': 'QR scanning',

  // @@UI@@
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;

/** What every other language must provide: every key, in the same shape. */
export type Dictionary = { [K in MessageKey]: (typeof en)[K] extends string ? string : Plural };
