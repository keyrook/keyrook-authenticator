# Privacy Policy — Keyrook Authenticator

_Last updated: 11 November 2026_

## The short version

Keyrook Authenticator works without an account, and then nothing leaves your
computer or your phone. Sync between your browsers and phones is optional. If
you turn it on, your two-factor accounts are encrypted on your device before
they are uploaded, with a key the server never receives: we store them, but we
cannot read them. We keep your email address and what is needed to run the
account, use it for nothing else, and sell nothing. You can sign in with a
password, or with Google or GitHub, which tell us who you are and nothing more.

Keyrook Authenticator is made by BRICK IT ALL LLC ("we"). It is an extension
for Chrome and Edge, where sync is available from version 0.2.0, and for
Firefox, from version 0.5.0, and an app for Android phones, from its first
version. Everything here applies to all of them; what is different on a phone
is said under "On an Android phone", and what is different in Firefox under
"In Firefox".

## Without an account

### What the extension stores

- **Your two-factor accounts** — the issuer, the account name, the shared
  secret needed to generate codes, and any note or picture you add. These are
  encrypted with AES-256-GCM before they are written to disk, using either that
  device's key or your master password.
- **If you unlock with your fingerprint, face or PIN, or with a security
  key** — the key that opens your accounts, encrypted with a key only a passkey
  on your device or on your security key can make, and only after it has
  checked you; and that passkey's identifier. The passkey stays with your
  device, your passkey manager or your security key. Neither we nor the
  extension ever receive your fingerprint, your face or your PIN, or your
  security key's PIN: your device or your key checks them and answers yes or
  no.
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

### On an Android phone

The app keeps the same things, encrypted the same way, in its own storage on
the phone, which other apps cannot read. What differs:

- **The key that opens a vault without a password** is kept sealed by a key in
  the phone's Android Keystore, which never leaves it — on most phones, its
  secure hardware. Uninstalling the app deletes both.
- **Android's own backup.** If backup is on, Android may copy the app's
  encrypted files to your Google account or to a new phone, as it does for most
  apps. The device key never goes with them, so a vault copied that way opens
  only with its master password, or by signing in to your Keyrook account
  again.
- **The camera, only when you ask it to scan.** Android asks for your
  permission the first time. The app reads each frame on the phone and turns
  the camera off when the scan ends.
- **Pictures and files you pick** in the phone's own picker are read on the
  phone. The app is shown nothing else: not your other apps, your photos,
  your contacts or your location. It asks for no permission but the camera,
  and Android's ordinary one to use the internet, which only sync needs.
- **What you copy and what is on screen.** A code you copy is marked as
  sensitive, so the clipboard's preview hides it, and the app's screens are
  kept out of screenshots, screen recordings and the recent-apps view.
- **A file you save or share** — a backup, an export — goes through the
  phone's share sheet to the place you choose. The copy the app made for it is
  removed before the next one, and whenever the app starts.

## With an account (optional sync)

### What we receive and keep

A Keyrook account can be made in Keyrook Authenticator, in Keyrook's other
apps, or on its own page, account.keyrook.com. Wherever it was made, it holds
what is listed here. The account, for every Keyrook app at once, also has its
own privacy policy at account.keyrook.com/privacy/.

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
- **Your passkeys, if you add one on account.keyrook.com** (from 21 October
  2026). For each: its public key and identifier, the name you give it, whether
  a service copies it to your other devices, a counter it reports, and when it
  was added and last used; and for the account, a random identifier your
  passkeys carry instead of your email address. A passkey's private key stays
  on your device or with your passkey manager, and we never receive it. If it
  can unlock your data, we also keep the key that opens it encrypted under a
  key only that passkey produces on your device, which we never receive either.
- **More than one way to sign in, if you add one.** An account with a password
  can also sign in with Google or GitHub, added on account.keyrook.com with the
  password, and an account made with Google or GitHub can have a password added
  there. For each Google or GitHub account added, we keep what we keep for one:
  the identifier it gives your account and the verified email address it
  reports. It can be removed again while another way to sign in is left.
- **Two-step sign-in, if you turn it on** on account.keyrook.com, once it is
  offered there. The secret your authenticator app shares with us, the last
  30-second period a code was taken for, so that no code works twice, and when
  you set it up and turned it on. The secret is sealed with a key held apart
  from the database, but it is not hidden from the server: checking your codes
  needs it. It tells a right code from a wrong one, and opens none of your
  data. When you sign in, Keyrook Authenticator sends the code you type, or in
  its place a proof made from your recovery key, never the key itself; between
  the two steps we hold for five minutes which device and app the sign-in is
  for. It is off unless you turn it on, and we keep nothing for it until then.
- **Your signed-in devices** — a name such as "Chrome on Mac" or "Keyrook
  Authenticator on Android", which Keyrook app it is, when each signed
  in and was last used, and a hash of its session tokens, so you can see the
  list and sign a device out.
- **Devices you remove** (from 26 October 2026). When you remove a device from
  your account — under Signed-in devices in Keyrook Authenticator, or on
  account.keyrook.com — we keep a record of it for 180 days: which app it was,
  its device identifier, when it was removed, the proof your app's key made (we
  can neither make nor read it), and scrambled forms of that device's session
  tokens, so that it can be told when it next connects. Keyrook Authenticator
  on that device checks the proof with its own key and then takes your
  account's codes off it, keeping only those added there that never reached
  your account. A device that never connects again keeps what it had.
- **Recent activity** (from 27 October 2026). For each sign-in, and each
  change to how your account is reached or opened (a password, a passkey, a
  way to sign in, your recovery key, two-step sign-in, a device removed, your
  address, a start over): what it was, when, the app and the device's name,
  how a sign-in was made, and the country the request came from, as our
  network provider reports it. Never the network address. You see it on
  account.keyrook.com, under Recent activity.
- **A new browser or phone asking to join.** One signed in with Google or GitHub
  gets your entries only when one already signed in approves it. Until then we
  hold its name and a one-time public key; once you approve, your data key
  encrypted for it alone, which we cannot open. The request is deleted
  when it is used or declined, and stops working after ten minutes.
- **What an account kept when it started over.** An account whose password and
  recovery key are both lost can start over with its email address alone. What
  it held before is kept, still encrypted under the keys of then, so that the
  old password or recovery key can bring it back. We cannot open it.
- **A start over asked for, while it waits** (from 21 October 2026). Starting
  over with the email address alone takes effect a week after it is asked
  for. Until then nothing changes, and we keep what the request brings,
  sealed: the new password's proof, the new keys, and the name the asking
  device gave itself. Every device still signed in, Keyrook Authenticator
  among them, shows the day it takes effect and can cancel it.
- **When your recovery key last proved it still works** (from 21 October
  2026): the date it last opened your account's key, typed whole under
  Settings → Security or on account.keyrook.com, or used to set a new
  password. The key itself never leaves your device. Only so that you can be
  reminded to look for it; we decide nothing by it.

### In Firefox

Firefox asks you before Keyrook Authenticator sends anything to your account,
and nothing is allowed when you install it. The first time you sign in, create
an account, recover it or sync, Firefox shows you what the account needs, in
its own words: authentication information (the proof made from your password,
or Google's or GitHub's answer), personally identifying information (your
email address), and technical information (the device's name, such as
"Firefox on Mac", and the extension's version). Until you allow it, nothing is
sent to us — not even a question about which ways to sign in are offered. You
can take it back at any time in Firefox, at about:addons → Keyrook
Authenticator → Permissions and data. From then on nothing more is sent: the
browser stays signed in, keeps what you change, and asks again when you press
Sync now. What we keep once you allow it is what this section lists, as on any
other browser.

### What the service sees in passing

- **Your IP address**, which every connection carries. To limit abuse — someone
  guessing passwords or requesting codes in bulk — the server counts recent
  requests per address. It keeps only a one-way digest of the address, for at
  most an hour.
- **Signing in with Google or GitHub** happens on their site, under their
  privacy policy, and they learn that you signed in to Keyrook. The
  extension takes you to their sign-in page and back, or opens it in the
  browser's own sign-in window to confirm a change to your account; in
  Firefox, always in that window. The Android app opens it in the phone's
  browser, which hands the answer back to the app.
- Requests pass through a network provider that protects the service and sees
  connection details such as your IP address. It and the server write routine
  access logs (IP address, time, the address requested); we keep no archive of
  them, and we do not combine them with your account.

### Emails we send

Only what the account needs: a code that confirms it is you when you sign up,
reset a forgotten password, start the account over or replace its keys; a notice
when someone tries to sign up with an address that already has an account, when
the account's keys were replaced, when its recovery key was changed, or when
it was started over; from 21 October 2026, a notice when a start over is asked
for, a reminder the day before it takes effect, and a notice if it is
cancelled, and a notice when a passkey is added to the account or removed; a
notice when Google or GitHub is added to the account or removed, and when a
password is added; with two-step sign-in, a notice when it is turned on or off,
and when the recovery key is used in place of a code; from 26 October 2026,
a notice when a device is removed from your account with a proof that lets its
app take your data off it; from 27 October 2026, a notice of each new sign-in,
naming the app, the device, how and the country, so that one you do not know
does not go unseen; and a reminder a week before what it kept from
before starting over is deleted. No newsletters, no
marketing.

### Who processes it for us

- **A hosting provider** runs the server and its database.
- **A network provider** carries and protects the connections between your
  browser or phone and the server.
- **An email delivery service** sends the emails above.
- **An email provider** holds an off-site copy of each daily database backup.
  The backup is encrypted, and the key to open it is not stored with it.

They handle the data only to provide those services to us. Some of them are in
the United States, so your data may be processed outside your country. To know
which companies they are, write to us.

### How long we keep it

- **Your account and everything synced**: until you delete the account.
  Deleting it on its page, account.keyrook.com (which asks for your password,
  or for you to sign in with Google or GitHub again), removes your email address, your encrypted entries, your devices and
  your recovery data from our database at once — including what any other
  Keyrook app synced to the same account.
- **What an account kept when it started over**: 90 days from the day it
  started over, then deleted. A week before, we email the address to say so.
- **A start over asked for**: until it takes effect a week later, or is
  cancelled.
- **Recent activity**: 90 days, and at once when you delete the account.
- **Your passkeys**: until you remove one, delete the account, or it starts
  over.
- **Two-step sign-in**: until you turn it off, delete the account, or it
  starts over. One set up but never confirmed with a code is deleted within a
  day.
- **When your recovery key last proved it works**: until you delete the
  account.
- **A device you removed** (from 26 October 2026): 180 days, or until you
  delete the account or it starts over.
- **Backups**: encrypted daily copies of the database are kept for 14 days on
  the server, and the off-site copies are deleted within 60 days. Deleted
  accounts disappear from backups as they expire.
- **Sign-ins in progress**: a Google or GitHub sign-in that has not finished,
  and a request to join from a new browser, stop working after ten minutes; a
  sign-in waiting for its second step, after five. Each is deleted within a
  day.
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
  or Google Play installed, enforced by its Content Security Policy.
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

A **link that shares an account's codes for a while** holds those codes and
the account's name, never its secret, and ends when its time is up. The codes
travel after the `#` in the address, a part browsers do not send to any server:
opening the link fetches the page from keyrook.com and nothing else, and that
page shows the codes without sending or keeping them. Until it ends, anyone who
has the link can use its codes, and it cannot be taken back.

## Your choices and rights

- **Use it without an account.** Every feature but sync works without one.
- **See and take your data.** Your entries are in the extension and the app, readable by
  you, and Backup & import exports them. For what we hold about your account,
  write to us.
- **Delete it.** Delete the account at any time on its page,
  account.keyrook.com, which Settings → Sync opens: see "Deleting your
  Keyrook account" below. Settings → Security → Delete this vault removes the
  vault from a device; removing the extension, or uninstalling the app, also
  removes its storage.
- **Correct it or ask about it.** Write to us; we answer within 30 days.

By creating an account you agree to this processing for the purposes above; you
can withdraw by deleting the account. If you believe we handle your data
wrongly, you may also complain to the data protection authority where you live.

Keyrook Authenticator is not directed at children under 13, and we do not knowingly
hold data about them.

## Deleting your Keyrook account

You can delete your Keyrook account, and everything our server holds for it,
at any time, from any browser, without the app:

- **Open account.keyrook.com and sign in**, with your password, or with Google
  or GitHub. In Keyrook Authenticator, Settings → Sync → Delete your account
  (on a phone) or Open the account page (in the extension) takes you there.
- **Choose Your data, then Delete account.** Type the account's email address
  and confirm with your password, or by signing in with Google or GitHub once
  more.

It is deleted at once: your email address, your encrypted entries, your
devices, your passkeys and your recovery data, including what any other
Keyrook app synced to the same account. Our encrypted backups of the database
expire within 14 days on the server and 60 days off-site. The codes on your
devices stay there, each until you delete its vault. If you can no longer sign
in, write to us from the account's address.

## Changes

When this policy changes, the date at the top changes with it. A change in what
we collect or who processes it is also named in the release notes before it
takes effect.

## Contact

BRICK IT ALL LLC — brickitall.hi@gmail.com
