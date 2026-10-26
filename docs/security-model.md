# Security model

What the code in this repository guarantees, and how you can check it. Nothing
here depends on trusting the sync server: the client is written as if the
server were hostile, so every claim below is about code you can read.

## On the device

- Accounts are encrypted with AES-256-GCM under a random data key. The vault on
  disk is a plaintext envelope around that ciphertext, and the envelope is kept
  free of anything that identifies you or your accounts.
- The data key is never stored in the clear. It is wrapped either by a
  non-extractable key the browser holds for this installation, or by a key
  derived from your master password with PBKDF2-SHA256 at 600,000 rounds.
  Switching between the two re-wraps the key; nothing is re-encrypted.
- The recovery key is 160 random bits. It wraps the same data key a second time,
  so it survives a password change.
- The extension asks for no host permissions at install. Reading a QR code from
  a page and filling a code into one both run under `activeTab`, which the
  browser grants only for the tab you invoked the extension on. Signing in with
  one of your Keyrook account's passkeys asks, when you choose it, for access to
  account.keyrook.com, the site those passkeys belong to; nothing runs there. Only the extension's own pages
  can drive the vault; a page the autofill script runs in cannot.
- Nothing is fetched to display a service's logo. The artwork is compiled in.

## When sync is on

- Everything is encrypted on the device before it is uploaded. The server stores
  ciphertext and the small amount of plaintext it needs to order changes:
  record ids, revision numbers, timestamps and whether a record was deleted.
- Your account password is stretched on the device and split into two
  unrelated keys. One wraps the data key and never leaves the device. The other
  proves the password to the server, which never receives the password itself.
- The client refuses weak key-derivation parameters from the server, so a
  server cannot make your password cheaper to attack.
- Each record's ciphertext is bound to its id and revision. A server that moves
  a record under another id, or replays an old revision as a new one, produces
  something that will not open.
- A record that will not open is skipped, not trusted, and the sync summary says
  so. Deletions are always reported and stay restorable on the device, because
  a deletion carries no ciphertext to authenticate.
- The recovery key's state is sealed under the data key, so a server cannot
  forge one, and a device never goes back to an older one — a retired recovery
  sheet cannot be brought back to life.
- Changing the account password, deleting the account, and changing its
  recovery key all require the account password, not just a signed-in session.
  On an account made with Google or GitHub they require signing in there again
  instead, as the same person: a session token alone is never enough.
- A server restored from a backup says so, and each device then sends back what
  the server lost. Saying so falsely gains a server nothing: a device still
  never replaces its copy with an older one, and sends only what it already had.

`packages/core/test/hostile-server.test.ts` plays a server that tries each of
these, and the tests next to it cover the rest.

## Signing in with Google or GitHub

- An account made this way has no password, and nothing Google, GitHub or our
  server holds can open the vault. The provider proves who is signing in; the
  data key reaches a new browser only from a browser already signed in, or from
  the recovery key.
- A browser already signed in approves a new one after the person checks both
  show the same 15-character code. The code is a hash over both browsers'
  one-time ECDH keys, so a server that swaps either key shows two different
  codes; at 75 bits it cannot search for a pair of keys that collide. The data
  key then travels wrapped under a key only those two browsers can derive, and
  the new browser takes it only if it opens the account's sealed recovery-kit
  state. `vendor/keyrook-account/test/pairing.test.ts` tries the swaps.
- The provider's answer comes back to the extension as a two-minute, one-use
  ticket that is worthless without a verifier the extension never sent, so a
  ticket read from a URL or a log buys nothing.
- Google is asked to sign the person in again (`prompt=login`, `max_age=0`)
  before any change to the account, and the server checks that it did. GitHub
  has no such request: in a browser already signed in to GitHub, confirming
  can take one click. It still proves control of that GitHub account.
- Someone who controls the Google or GitHub account can sign in and ask to
  join, but gets nothing until a browser already in approves the request — and
  the request shows on every one of them, saying it came from that sign-in.

## What a server operator can still see

Encryption hides the contents, not the fact of an account. Whoever runs the
server can see your email address, the addresses and times you connect from,
how many items your vault holds, when each changed, and how many devices you
use and what they are called. They cannot see issuers, account names, secrets,
notes or pictures.

## Known limits

- The device-key mode does not protect against malware running as you on the
  same machine. The settings page says so.
- Whoever controls the Google or GitHub account behind a provider account, and
  persuades its owner to approve a browser, has the vault. The approval screen
  says so; the code check is there for a swapped key, not for a person who
  approves a stranger.
- A device that has never seen any recovery-key state accepts the first
  authentic one it is given. A server cannot forge one, but could hand a newly
  joined device an older one it kept.

## Reporting a problem

Email brickitall.hi@gmail.com with "Security" in the subject line, rather than
opening a public issue.
