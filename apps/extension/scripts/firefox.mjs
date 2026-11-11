/**
 * The Firefox build's manifest, made from the Chrome one so the two cannot
 * drift: the same pages, policy, commands and permissions, with only what
 * Firefox does differently changed. `npm run build:firefox` writes it;
 * check-release holds a Firefox release to it.
 */

/**
 * The add-on's id on addons.mozilla.org, chosen by the owner on 10 November
 * 2026. Firefox names the extension by it (`runtime.id`), signs it under it,
 * and derives the address its sign-in window returns to from it, so it never
 * changes once a version is uploaded. It only looks like an email address:
 * there is no mailbox behind it.
 */
export const GECKO_ID = 'authenticator@keyrook.com';

/**
 * 140 is the first Firefox with the built-in data consent addons.mozilla.org
 * requires of a new listing, and an ESR. It is past everything else the
 * extension leans on: `storage.session` (115), module background scripts
 * (112), and `captureVisibleTab` and `MessageSender.origin` under activeTab
 * (126).
 */
export const FIREFOX_MIN_VERSION = '140.0';

/**
 * What a Keyrook account sends, in Firefox's words: the email and password
 * (as a key derived from it) or the Google or GitHub sign-in that stands in
 * for them, the address, and the device's name and the build's version. The
 * codes themselves leave only sealed, which Firefox's categories do not
 * describe. Optional: Firefox grants none of it at install, the click that
 * starts a sign-in asks for it (src/lib/consent.ts), and nothing is sent
 * before it is given. Changing this list is a change to the privacy policy.
 */
export const ACCOUNT_DATA = ['authenticationInfo', 'personallyIdentifyingInfo', 'technicalAndInteraction'];

/**
 * What the add-on declares it collects, required of every new listing and
 * shown by Firefox at install: nothing it must have, and, in a build with a
 * sync server, the account's data as optional.
 */
export function dataCollection(syncOrigin) {
  return syncOrigin ? { required: ['none'], optional: ACCOUNT_DATA } : { required: ['none'] };
}

export function firefoxManifest(manifest, { syncOrigin }) {
  const {
    // Chrome's alone.
    minimum_chrome_version: _chromeOnly,
    // Firefox lets no web page message an extension, so a sign-in made in the
    // options tab cannot come back that way: Google and GitHub sign in by the
    // browser's window. The key would only be warned about.
    externally_connectable: _noWebPages,
    // The account's passkeys, which this build does not ask (src/lib/host.ts).
    optional_host_permissions: _noAccountPasskeys,
    background,
    ...shared
  } = manifest;
  return {
    ...shared,
    // Firefox runs no service worker for an extension: the same file runs as
    // an event page, stopped when idle and started by an event, as the worker is.
    background: { scripts: [background.service_worker], type: background.type },
    // Signing in with Google or GitHub is the one use of `identity`. Without a
    // sync server there is nothing to sign in to.
    permissions: syncOrigin ? shared.permissions : shared.permissions.filter((name) => name !== 'identity'),
    browser_specific_settings: {
      gecko: {
        id: GECKO_ID,
        strict_min_version: FIREFOX_MIN_VERSION,
        data_collection_permissions: dataCollection(syncOrigin),
      },
    },
  };
}
