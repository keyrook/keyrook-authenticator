/**
 * Single source of truth for manifest.json.
 *
 * Permission policy: no `host_permissions` and no declarative content scripts.
 * Autofill runs through `activeTab` + `scripting`, which Chrome grants only for
 * the tab the user explicitly invoked the extension on. That keeps the store
 * listing free of the "read and change all your data on all websites" warning
 * and keeps review turnaround short. One optional host permission, the
 * Keyrook account's page, is asked for only when someone chooses to sign in
 * with one of its passkeys: nothing at install.
 */
/**
 * Content Security Policy.
 *
 * Two of this project's invariants are otherwise held only by convention —
 * that no service logo is ever fetched, and that the extension talks to
 * nothing but its own sync server. Writing them into the policy means a
 * future mistake is refused by the browser instead of shipping quietly.
 *
 * - `img-src 'self' data:` — bundled artwork and the user's own re-encoded
 *   pictures. A favicon pulled from a service would tell whoever served it
 *   every place the user has two-factor authentication.
 * - `connect-src` — the sync origin and nothing else, so a bug cannot become
 *   an exfiltration path. Absent a configured server, nowhere at all.
 * - `style-src` needs `'unsafe-inline'`: React writes inline style attributes,
 *   which this directive governs. Style injection is a far smaller problem
 *   than script injection, which stays locked to `'self'`.
 * - `frame-src`/`object-src` none-ish and `form-action 'none'`: nothing here
 *   frames anything or submits a form the old-fashioned way, and both are
 *   quiet ways for data to leave.
 */
function contentSecurityPolicy(syncOrigin) {
  const connect = ["'self'", syncOrigin].filter(Boolean).join(' ');
  return [
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `connect-src ${connect}`,
    "frame-src 'none'",
    "child-src 'none'",
    "form-action 'none'",
  ].join('; ');
}

export function buildManifest({ version, name, description, defaultLocale, syncOrigin, accountRp = '' }) {
  return {
    manifest_version: 3,
    name,
    version,
    description,
    ...(defaultLocale ? { default_locale: defaultLocale } : {}),
    minimum_chrome_version: '116',

    action: {
      default_title: name,
      default_popup: 'popup.html',
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png',
      },
    },

    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },

    background: {
      service_worker: 'background.js',
      type: 'module',
    },

    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },

    // `identity` is for `launchWebAuthFlow` alone — the browser's own sign-in
    // window, for Google and GitHub — and carries no install warning.
    // `identity.email`, which would ("Know your email address"), is not asked for.
    permissions: ['storage', 'alarms', 'activeTab', 'scripting', 'clipboardWrite', 'identity'],

    // Signing in with one of the Keyrook account's passkeys: they belong to
    // the account's page, and Chrome lets an extension ask a site's passkeys
    // only with the host permission for that site (release.mjs,
    // accountRpFor). Optional, so nothing at install; asked for on the click
    // that chooses a passkey, and used for nothing else — no script runs
    // there, and connect-src below still reaches the sync server alone. A
    // build against the kit on this machine has it already: the end-to-end
    // suite cannot answer Chrome's question. check-release refuses that.
    ...(accountRp ? { optional_host_permissions: [`https://${accountRp}/*`] } : {}),
    ...(accountRp === 'localhost' ? { host_permissions: ['https://localhost/*'] } : {}),

    content_security_policy: {
      extension_pages: contentSecurityPolicy(syncOrigin),
    },

    // A sign-in with Google or GitHub made in the options tab comes back as a
    // message from the sync server's return page. That one origin may send
    // one; no other web page can, and no other extension either — declaring
    // this key at all shuts out the extensions that could message it before.
    // It carries no install warning.
    ...(syncOrigin ? { externally_connectable: { matches: [`${syncOrigin}/*`] } } : {}),

    commands: {
      _execute_action: {
        suggested_key: { default: 'Alt+Shift+A', mac: 'Alt+Shift+A' },
        description: 'Open Keyrook Authenticator',
      },
      // Fills the code for the page, where exactly one account belongs to it;
      // otherwise opens the popup. Grants activeTab like the icon does — no
      // permission of its own.
      'fill-code': {
        suggested_key: { default: 'Alt+Shift+F', mac: 'Alt+Shift+F' },
        description: defaultLocale ? '__MSG_commandFill__' : 'Fill the code for this page',
      },
    },
  };
}
