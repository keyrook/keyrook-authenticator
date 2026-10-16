# Privacy Policy — Keyrook Authenticator

_Last updated: 17 October 2026_

## The short version

Keyrook Authenticator works without an account, and then nothing leaves your
computer. Sync between your browsers is optional. If you turn it on, your
two-factor accounts are encrypted on your device before they are uploaded, with
a key the server never receives: we store them, but we cannot read them. We
keep your email address and what is needed to run the account, use it for
nothing else, and sell nothing. You can sign in with a password, or with Google
or GitHub, which tell us who you are and nothing more.

Keyrook Authenticator is made by BRICK IT ALL LLC ("we"). Sync is available from
version 0.2.0.

## Without an account

### What the extension stores

- **Your two-factor accounts** — the issuer, the account name, the shared
  secret needed to generate codes, and any note or picture you add. These are
  encrypted with AES-256-GCM before they are written to disk, using either that
  device's key or your master password.
- **Your preferences** — theme, sort order, auto-lock delay, and whether
  autofill is enabled.
- **When to ask for a rating** — the time you first used a code and how many
  codes you have copied or filled since, so that the extension asks once,
  after real use, whether you would rate it, and remembers your answer. It
  holds no account names or secrets and is never sent anywhere.

All of this lives in your browser's local extension storage. Without an account
none of it is sent anywhere.

### What the extension can see

- **The page you open the extension on.** When you scan a QR code, the extension
  takes a picture of the visible part of that tab and looks for a QR code in it.
  When you fill a code, it looks for a one-time-code field on that tab and types
  into it. Both use the browser's `activeTab` permission, which is granted only
  for the tab you invoked the extension on, and only until that tab navigates
  away.
- **Your camera, only when you ask it to scan.** The browser asks for your
  permission the first time and remembers your answer. The extension reads each
  frame on your device to find a QR code in it, and switches the camera off as
  soon as the scan finishes or you leave it.
- **Pictures you choose.** A screenshot or photo of a QR code that you pick is
  read on your device to find the code in it.
- The extension declares **no host permissions** and installs **no persistent
  content scripts**, so it has no standing access to any website.

Nothing seen this way is stored or transmitted. Screenshots of the page, camera
frames and the pictures you choose are decoded in memory and discarded — none of
them is recorded, kept or uploaded, with or without an account.

## With an account (optional sync)

### What we receive and keep

- **Your email address**, to identify your account and to send you a code that
  proves the address is yours. If you sign in with Google or GitHub, the address
  comes from them, already verified, and no code is sent.
- **If you sign in with Google or GitHub: who you are there.** The identifier
  that provider gives your account — a number, not your name — and the verified
  email address it reports. We ask Google for `openid email` and GitHub for
  `user:email`, nothing more; we use the answer once to sign you in and keep no
  access token, so we cannot read your mail, your files or your repositories, or
  act for you anywhere. An account made this way has no password, and we store
  nothing that could stand in for one. Our use of information received from
  Google APIs adheres to the
  [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy),
  including the Limited Use requirements.
- **Your two-factor accounts, encrypted.** Each one is encrypted on your device
  with your account's data key before it is uploaded. We store the ciphertext
  and the little we need to keep your devices in step: a random identifier for
  each entry, a revision number, when it last changed, whether it was deleted,
  and which of your devices changed it. We cannot read the issuer, account name,
  secret, note or picture.
- **What Keyrook's other apps keep in the same account, if you use them.** A
  Keyrook account also works in Keyrook's other apps; Passhold, the password
  manager, is the first. If you sign in to one with it, what that app syncs is
  stored in the same account, encrypted on your device before it is uploaded,
  and described by that app's own privacy policy. Keyrook Authenticator does
  not read or change it.
- **What lets you sign in, none of it usable as your password.** If your
  account has a password, it never leaves your device. It is stretched on your device into two
  unrelated keys: one stays there; the other proves your password to us, and we
  store only a salted, slow hash of that proof, mixed with a secret held apart
  from the database. We also store your data key in encrypted form, so a new
  device can open it with your password, and, if you made one, the same for your
  recovery key.
- **Your signed-in devices** — a name such as "Chrome on Mac", when each signed
  in and was last used, and a hash of its session tokens, so you can see the
  list and sign a device out.
- **A new browser asking to join.** A browser signed in with Google or GitHub
  gets your entries only when one already signed in approves it. Until then we
  hold its name and a one-time public key; once you approve, your data key
  encrypted for that browser alone, which we cannot open. The request is deleted
  when it is used or declined, and stops working after ten minutes.

### What the service sees in passing

- **Your IP address**, which every connection carries. To limit abuse — someone
  guessing passwords or requesting codes in bulk — the server counts recent
  requests per address. It keeps only a one-way digest of the address, for at
  most an hour.
- **Signing in with Google or GitHub** happens on their site, under their
  privacy policy, and they learn that you signed in to Keyrook. The
  extension takes you to their sign-in page and back, or opens it in the
  browser's own sign-in window to confirm a change to your account.
- Requests pass through a network provider that protects the service and sees
  connection details such as your IP address. It and the server write routine
  access logs (IP address, time, the address requested); we keep no archive of
  them, and we do not combine them with your account.

### Emails we send

Only what the account needs: the code that confirms your address when you sign
up, and a notice if someone tries to sign up with an address that already has an
account. An account made with Google or GitHub gets no email from us at all. No
newsletters, no marketing.

### Who processes it for us

- **A hosting provider** runs the server and its database.
- **A network provider** carries and protects the connections between your
  browser and the server.
- **An email delivery service** sends the emails above.
- **An email provider** holds an off-site copy of each daily database backup.
  The backup is encrypted, and the key to open it is not stored with it.

They handle the data only to provide those services to us. Some of them are in
the United States, so your data may be processed outside your country. To know
which companies they are, write to us.

### How long we keep it

- **Your account and everything synced**: until you delete the account.
  Deleting it (Settings → Account & sync → Delete account, which asks for
  your password, or for you to sign in with Google or GitHub again) removes your email address, your encrypted entries, your devices and
  your recovery data from our database at once — including what any other
  Keyrook app synced to the same account.
- **Backups**: encrypted daily copies of the database are kept for 14 days on
  the server, and the off-site copies are deleted within 60 days. Deleted
  accounts disappear from backups as they expire.
- **Sign-ins in progress**: a Google or GitHub sign-in that has not finished,
  and a request to join from a new browser, stop working after ten minutes and
  are deleted within a day.
- **Sign-up codes**: a code works for 15 minutes. The record of the request,
  with the address it went to, is deleted within a day once its hour has passed.
- **Failed sign-in counts** are forgotten after an hour without failures, and
  deleted within a day after that. **Expired sessions** are deleted within a day.

### How we use it

Only to provide sync and to keep the service and your account secure. We do not
sell your data, use it for advertising, share it except with the processors
above, or use it to decide anyone's creditworthiness. Nobody at BRICK IT ALL LLC
reads your two-factor accounts, because nobody can.

## What Keyrook Authenticator never does

- No analytics, telemetry, crash reporting or usage statistics.
- No advertising, and no advertising identifiers.
- No remotely hosted code. Everything that runs is in the package the browser
  installed, enforced by the extension's Content Security Policy.
- No service logos fetched from the internet: they are built in, so no website
  learns which accounts you keep.

## Data you export yourself

The backup and export features write files to wherever you choose, or show QR
codes on your screen for another app to scan. All of it is made on your device
and sent nowhere. An encrypted backup is protected by the password you set for
it. Everything else — a QR code, a printed sheet of them, an Aegis or Bitwarden
file, a plain-text `otpauth://` export — is **not** encrypted and contains your
secrets in readable form: whoever sees or holds it can generate your codes.
Delete files, and destroy paper copies, as soon as you have finished with them.

## Your choices and rights

- **Use it without an account.** Every feature but sync works without one.
- **See and take your data.** Your entries are in the extension, readable by
  you, and Backup & import exports them. For what we hold about your account,
  write to us.
- **Delete it.** Delete the account in the extension at any time. Settings →
  Security → Delete this vault removes the vault from a device; removing the
  extension also removes its storage.
- **Correct it or ask about it.** Write to us; we answer within 30 days.

By creating an account you agree to this processing for the purposes above; you
can withdraw by deleting the account. If you believe we handle your data
wrongly, you may also complain to the data protection authority where you live.

Keyrook Authenticator is not directed at children under 13, and we do not knowingly
hold data about them.

## Changes

When this policy changes, the date at the top changes with it. A change in what
we collect or who processes it is also named in the extension's release notes
before it takes effect.

## Contact

BRICK IT ALL LLC — brickitall.hi@gmail.com
