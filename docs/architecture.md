# Architecture

## Why the core is a separate package

`@authx/core` contains OTP generation, the vault format and the sync engine; the
Keyrook account's half — the crypto, how a password becomes keys, the wire
protocol and the recovery kit — is `@keyrook/account`
(`vendor/keyrook-account`), which every Keyrook product shares and core
re-exports. Neither may reference `chrome.*`, `window` or the DOM. Everything
they need from a platform arrives as an argument.

That constraint is what makes the rest of the roadmap cheap: a Tauri desktop app
and a Capacitor mobile app consume the same package and supply their own key
storage, without a second implementation of the part that must not be wrong
twice.

## Why the pages are a package too

`@authx/ui` holds every screen — the list of codes, setting up, unlocking,
recovering, Settings — with the languages and the stylesheet. It may not
reference `chrome.*` either: its tsconfig has no Chrome types, so a call does
not compile. What a page needs from the platform goes through a `Host` the app
installs before the first render (`packages/ui/src/host.ts`): the vault's
answers, the few preferences kept outside the vault, opening Settings or a
link. The extension's host is `apps/extension/src/lib/host.ts`; a desktop or
mobile app brings its own and shows the same screens.

## The vault format

```
VaultFile                      ← chrome.storage.local, plaintext JSON envelope
├── id, version, timestamps    ← plaintext, deliberately free of anything
│                                 that identifies the user
├── protection
│   ├── mode: 'device' | 'passphrase'
│   ├── kdf                    ← PBKDF2 params, or null in device mode
│   └── wrappedKey             ← the data key, encrypted under the KEK
└── payload                    ← VaultData, encrypted under the data key
```

Two keys, not one:

- The **data key** (DEK) is a random AES-256 key. It encrypts the payload and
  nothing else.
- The **key-encryption key** (KEK) wraps the data key.

Splitting them means changing the master password, or switching protection mode
entirely, rewrites only the small `wrappedKey` blob. Ciphertext is untouched, so
the operation is instant whether the vault holds three accounts or three hundred.
It is also the shape a zero-knowledge sync server needs: the server stores
ciphertext and a wrapped key it cannot unwrap.

Every `seal`/`open` passes `authx.vault:v<version>:<id>` as AEAD associated data.
An attacker who swaps one vault's payload into another's envelope gets an
authentication failure rather than a silent mix-up.

## Where the key-encryption key comes from

### Device mode (the default)

`crypto.subtle.generateKey({ name: 'AES-GCM' }, /* extractable */ false, ['wrapKey', 'unwrapKey'])`,
stored as a live `CryptoKey` object in IndexedDB.

- The raw bytes never enter the JavaScript heap. `exportKey` on it throws
  `InvalidAccessError` — there is no code path, ours or an attacker's, that reads
  it out.
- Copying `chrome.storage.local` gets an attacker ciphertext and nothing else.
- **It is not hardware-bound.** Chrome keeps it in its own on-disk store, and an
  attacker with read access to the profile directory and the right tooling can
  recover it. This is the honest cost of never asking the user to type anything,
  and the reason passphrase mode exists next to it.
- If the profile is wiped, the key is gone and the vault is unopenable. The UI
  says so plainly rather than showing a password box that cannot work.

### Passphrase mode

PBKDF2-SHA256 at 600,000 rounds (OWASP's 2023 floor) over a 16-byte random salt,
producing a non-extractable AES-GCM key. The KDF is described in the file itself,
so a future Argon2id upgrade opens today's vaults without a migration.

While unlocked, the *data key* — not the password, not the KEK — is held in
`chrome.storage.session`: memory-only, wiped when the browser exits, unreachable
from content scripts. Auto-lock is a `chrome.alarms` timer that clears it.

### The recovery kit

A third, independent wrapping of the same data key, under a 160-bit secret the
user keeps on paper (`vendor/keyrook-account/src/sync/kit.ts`, held in the vault
file by `packages/core/src/vault/recovery.ts`). It is what makes a
forgotten master password survivable without giving anyone else a way in.

The key is encoded in Crockford base32 — no I, L, O or U — because it has to be
copied off a screen and typed back months later, and decoding folds the
confusable letters back to the digits people meant. Its KDF runs at 100,000
rounds rather than the master password's 600,000: the secret has full CSPRNG
entropy, so stretching buys nothing measurable. That reasoning is in the source,
because otherwise it reads like an oversight someone should "fix".

Wrapping the data key rather than the password is what lets the kit survive a
password change and a switch of protection mode untouched.

### Filling a code into the wrong site

`shouldWarnBeforeFilling` is a pure function, tested, rather than a condition
inside a component — it is a security decision.

It relies only on the domains an account actually records, never on
`itemMatchesHost`. That looser check exists to order a list and will match a
decorated *issuer* ("Google Workspace" on google.com); it must never match a
decorated *domain*. An earlier version tested whether the hostname contained the
issuer, which made `github-login.com` look like GitHub — floating the right
account to the top of the list on a phishing page, which is worse than ignoring
the page altogether.

### Importing a file somebody else wrote

A backup is the one thing a user is invited to accept from outside, and it is
read before any password is typed — so every field in it is attacker-chosen.

The file is size-checked before `file.text()` pulls it into memory, and
`assertUsableBackup` validates the parts used up front. The important one is the
iteration count: it lives *inside the file*, so a hostile backup can ask for a
billion rounds and the tab spends the afternoon on it. The cap is ten million,
far above the 600,000 this app writes.

Decrypted contents are not trusted either. Being encrypted says who wrote the
file, not that what they wrote is well formed: `sanitiseImportedItems` drops
accounts whose secret could never produce a code, repairs values the OTP code
would throw on, gives colliding ids new ones, strips a picture that is not a
raster this app made, and resets sync bookkeeping — an import is a local change
this device has never pushed, whatever the file claimed.

### Other apps' exports

Aegis, 2FAS, andOTP, Bitwarden, FreeOTP+, Proton Authenticator, Ente Auth and
the Authenticator extension each write their own format, and moving here should
take one of their files rather than every account typed again
(`vault/foreign.ts`). The same rules hold as for our own backups, and harder:
these files are another program's idea of well formed.

- Key-derivation settings come from the file, so they are bounded before
  anything runs — Aegis's scrypt to 256 MiB and p ≤ 16, andOTP's PBKDF2 to the
  same ten million rounds as ours. scrypt itself is ours (`crypto/scrypt.ts`;
  Web Crypto has none and the core takes no dependencies), checked against
  RFC 7914 and Node's own.
- Every entry goes through the checks a pasted otpauth:// link does. One that
  cannot become a working account — a Steam Guard code, an unknown hash, a key
  that is not base32 — is listed as skipped with the reason, and costs only
  itself.
- A file locked with Argon2 (Proton's and Ente's locked exports, the
  Authenticator extension's) is recognised and refused by name: none of this
  code implements Argon2, and misreading is worse than saying so.
- FreeOTP stores the HOTP counter of the code it last showed; read as it is,
  the first code here would be one the service already spent, so it is read one
  on.

The tests use the files Aegis keeps for its own importers (GPL-3.0), which hold
the same accounts in every format, so each must read into exactly those.

Password managers — Apple Passwords, 1Password, Bitwarden, KeePassXC, Proton
Pass, LastPass, Dashlane — export a spreadsheet with a column for the code
beside the passwords (`vault/csv.ts`). Only that column is read: a row with no
key is a password, not an account, and is left out without a word; the
passwords themselves are never read into anything this app keeps, and the page
says to delete the file. The login's address becomes the account's one recorded
site, so its code is offered there and the fill shortcut can use it.

### Filling with one key

`Alt+Shift+F` fills the code for the page without opening anything. A command
grants `activeTab` for that tab exactly as clicking the icon does, so it adds no
permission. Because nobody is looking when it fills, it fills only where it is
certain (`itemForShortcutFill`): exactly one time-based account whose recorded
domains — or, when it records none, its service's own domains from the
catalogue — contain the host. Never the issuer guess that orders the popup's
list. Anything less certain opens the popup, which shows what it is about to do
and warns before filling somewhere unexpected.

### Pictures the user supplies

An account can carry its own image (`VaultItem.icon`), which is the answer for
the services no bundled icon set has.

The original file is never stored. It is decoded, redrawn onto a 128px canvas,
and what gets saved is the canvas's output — pixels this app produced. That is
what makes it safe to put in an `<img src>`: nothing script-shaped survives
being rasterised. SVG is refused before the decoder rather than relied upon to
rasterise harmlessly, and `isStoredIcon` re-checks the value on the way out of a
vault too, because a vault can arrive from a backup or another device.

Size is capped at 24 KB. The sync server rejects a record whose encrypted box
passes 64 KB, and that rejection would otherwise surface weeks later as an
account that quietly stopped syncing — so the encoder compresses until it fits
and fails loudly if it cannot.

## Process model

The vault service (`@authx/service`) is the only writer, and it writes one
thing at a time. The extension runs it in its service worker, on Chrome's
storage, alarms and sign-in window (`apps/extension/src/lib/platform.ts`); the
service itself references no `chrome.*`, so another app runs the same rules on
its own platform. What stays in the worker is what only an extension can do:
the tab the popup was opened on, the fill shortcut, the toolbar.

Every vault change is read-modify-write: load the data, apply the change,
re-encrypt the whole payload, store it. Requests arrive concurrently —
`chrome.runtime.onMessage` delivers them so — and without a queue two of those
interleave — both read the same
snapshot and whichever finishes last discards the other's change. No attacker is
needed: a popup and a settings tab open together will do it, and so will the
five-minute sync alarm firing while somebody is editing. A sync is the worst
case, because it takes as long as the network does.

`createSerialiser` runs them in turn, and the *read* happens inside the turn —
queueing only the write would leave the same race. A failed write must not wedge
the queue, so the next one runs whether the previous resolved or threw.

The end-to-end test for this fails without the queue, which is the only way to
know a concurrency fix is doing anything. Pages describe a mutation
(`{ op: 'items/add', items }`) and the worker applies, re-seals, persists and
broadcasts. Two open surfaces — popup and options tab — therefore cannot
overwrite each other.

MV3 workers are killed aggressively, so nothing is assumed to survive between
messages: state is rehydrated from storage on every request, with an in-memory
cache that is only an optimisation.

## Languages

The pages speak fifty languages: every language Chrome gives a store page in,
less the regional variants of English, Spanish and Portuguese, which share a
file. `LOCALES` in `packages/ui/src/i18n/locales.ts` lists them in the
order the picker shows. Each is one file in
`packages/ui/src/i18n/locales/`; English (`en.ts`) is the source, and the
compiler holds every other file to its keys. A message is plain text with
`{values}`, `<tags>` the page decides how to draw, and plural forms picked by
`Intl.PluralRules` — never HTML, so a translation cannot inject markup.

English, German, French, Spanish, Brazilian Portuguese, Italian, Dutch,
Japanese, Korean, Traditional Chinese, Vietnamese and Arabic came first. The
other thirty-eight were written in October 2026 without a native speaker
reading them; they follow the same terms throughout and pass every test, but
a report from someone who speaks one is worth more than another pass by us.

The language follows the browser's, unless one is chosen under General →
Appearance. Every Portuguese reader gets the Brazilian file. Chinese goes by
region or script: `zh-TW`, `zh-HK`, `zh-MO` and `zh-Hant` get Traditional,
plain `zh`, `zh-CN`, `zh-SG` and `zh-Hans` get Simplified. The older tags some
browsers still send — `iw`, `in`, `nb`, `nn`, `tl` — find Hebrew, Indonesian,
Norwegian and Filipino.

Arabic, Hebrew and Persian are read right to left, so the page is mirrored,
not only translated:
`<html dir>` follows the language, layout uses logical sides (`ms-`, `pe-`,
`start-`, `text-start`) rather than left and right, and arrows that point
"back" or "onward" flip. Names people typed keep their own direction
(`dir="auto"`), so an English service name inside an Arabic page keeps its
brackets and its beginning.

Messages that count carry the forms their language uses — Arabic all six,
Slovenian its dual, Latvian a "zero" form that also covers 10 to 20 — and the
test refuses one without `one` and `other` where the language has them; a
missing form falls back to `other`. Counts are written by `Intl.NumberFormat`,
so Persian, Bengali and Marathi show their own digits, and the numbers written
into those translations use the same ones.

The choice of language lives in the host's preferences — `chrome.storage.local`
in the extension — outside the vault, because the screens that need it most
come before the vault is open; it says nothing about anyone's accounts. Every open page follows a change at once.

The vault service has no language: two pages in two languages share it. It
throws an `AppError` naming a message key, and the page translates the key.
English that cannot carry a key — from `@authx/core`, `@keyrook/account` or the sync server —
is matched by its exact sentence in `i18n/errors.ts`. `packages/ui/test/i18n.test.ts` reads
the core and the server and fails on a sentence a person could see that has no
translation, and reads the pages and fails on text written into them.

The store listing's name and summary come from `_locales/`, written at build
time from `apps/extension/scripts/store-locales.mjs`; Chrome picks those by the
browser's language, not by the choice in Settings.
`apps/extension/test/store-listing.test.ts` refuses a
store page in a language the extension does not speak, and a description whose
count of languages is out of date. Why each language's listing reads the way
it does is in `docs/store-listing.md`.

## Content Security Policy

Two invariants that would otherwise rest on everyone remembering are written
into the policy instead, so a mistake is refused by the browser rather than
shipped:

- `img-src 'self' data:` — bundled artwork and the user's own re-encoded
  pictures. A favicon fetched from a service would tell whoever served it every
  place the user has two-factor authentication.
- `connect-src` — the configured sync origin and nothing else, so a bug cannot
  become an exfiltration path. With no server configured, nowhere at all. The
  build writes the same origin into the bundle and the policy, or every sync
  call would be blocked.

`style-src` needs `'unsafe-inline'` because React writes inline style
attributes, which that directive governs; `script-src` stays locked to `'self'`.
`form-action 'none'`, `frame-src 'none'` and `object-src 'none'` close the quiet
ways data leaves a page.

## Who may drive the vault

`isTrustedSender` gates every message. Checking `sender.id` alone is not enough:
a content script carries the extension's own id, so that leaves the whole vault
API reachable from whatever page the script was last injected into.

The discriminator is the **origin** — an extension page reports
`chrome-extension://<id>`, a content script reports the page's own. Not
`sender.tab`: the options page is an extension page that lives in a tab, and
gating on that locks the settings screen out of its own vault. That mistake was
made and caught here by the tests.

## Permissions, and what was deliberately not asked for

Declared: `storage`, `alarms`, `activeTab`, `scripting`, `clipboardWrite`.

Not declared: any `host_permissions`, any `content_scripts`. Reading a QR from a
page (`tabs.captureVisibleTab`) and filling a code into one
(`scripting.executeScript`) both run under `activeTab`, which Chrome grants only
for the tab the user explicitly invoked the extension on, and only until that tab
navigates.

The practical effect: the store listing carries no "read and change all your data
on all websites" warning, and there is no standing script on any page.

## Sync, designed but not shipped

`VaultItem` already carries `rev`, `syncedRev`, `updatedAt` and a `deletedAt`
tombstone, and `VaultData` carries a `deviceId` and a `serverRev`. Retrofitting
tombstones and revisions onto a live user base is the painful kind of migration,
so they are there from the first release.

`SyncAdapter` in `vendor/keyrook-account/src/sync/adapter.ts` is the contract the backend
will implement: `pull(sinceServerRev)` and `push(records)`, where every record is
an encrypted blob plus the minimum plaintext metadata a server needs to order and
deduplicate changes. Conflict policy is last-write-wins on `updatedAt`, except
that a deletion always beats an edit — removing a compromised account on one
device must not be undone by a stale edit on another.

`LocalOnlyAdapter` is what v1 uses. It does nothing.

## No tiers

A vault holds as many accounts as its owner has, signed in or not, and sync is
free. An earlier plan capped signed-out vaults at five accounts to sell sign-in;
it was dropped before it ever shipped. Every serious competitor syncs for free
and without a cap, and a limit on a 2FA vault pushes people to them rather than
to an account. Vaults written while the plan existed carry a
`grandfatheredItems` field, which `migrateVaultData` now ignores.
