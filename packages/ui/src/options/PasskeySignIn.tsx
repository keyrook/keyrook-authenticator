import { useEffect, useRef, useState } from 'react';
import { send, BackgroundError, type ProviderOffer, type SignInResult } from '../lib/protocol.js';
import { accountPageUrl } from '../lib/links.js';
import { host } from '../host.js';
import { KeyIcon } from '../components/icons.js';
import { Callout, Spinner } from '../components/primitives.js';
import { CONTINUE_BUTTON } from './ProviderSignIn.js';
import { AppError } from '../i18n/errors.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';

/*
 * Signing in with one of the Keyrook account's passkeys — added on the
 * account's page, never here — beside Google and GitHub. The design is
 * keyrook-account's docs/console.md, S17; the vault service's side is
 * packages/service/src/passkey.ts.
 */

/**
 * Whether to offer a passkey at all: the server signs in with them, this
 * platform can ask the account page's (Chrome 122 and later), and the vault
 * opens with the device key — one with a master password signs in with the
 * account password, which a touch cannot stand in for.
 */
export function offersPasskey(offer: ProviderOffer | null, protectionMode: 'device' | 'passphrase'): boolean {
  return Boolean(offer?.passkeys && host().accountPasskeys && protectionMode === 'device');
}

/** The way back for a passkey that signs in but does not open the account's key here: the password, for that address. */
export interface PasskeyFallback {
  email: string | null;
  message: string;
}

const keyOf = (cause: unknown) =>
  cause instanceof AppError || cause instanceof BackgroundError ? cause.key : undefined;
const valuesOf = (cause: unknown) =>
  cause instanceof AppError || cause instanceof BackgroundError ? cause.values : undefined;

export function PasskeyButton({
  onSignedIn,
  onFallback,
  autoStart = false,
  onAutoStarted,
}: {
  onSignedIn: (result: SignInResult) => void;
  /** It signed in to an account with a password, and opened nothing: that form, with the address. */
  onFallback?: (fallback: PasskeyFallback) => void;
  /**
   * Asks the passkey once this turns true, when Chrome already lets this app
   * use the account page's: the popup's button sent the person here for
   * exactly that. Otherwise the button waits for its click, which Chrome's
   * question needs.
   */
  autoStart?: boolean;
  /** Said as it is asked, so no other button on the page asks again. */
  onAutoStarted?: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  function start() {
    const passkeys = host().accountPasskeys;
    if (busy || !passkeys) return;
    setBusy(true);
    setError(null);
    // Nothing awaited before `touch`: Chrome asks for its permission only
    // while the click is fresh.
    void passkeys
      .touch(() => send({ type: 'account/passkeyChallenge' }))
      .then((touch) => send({ type: 'account/passkeySignIn', touch }))
      .then(onSignedIn, (cause: unknown) => {
        const message = errorText(cause);
        if (keyOf(cause) === 'error.passkey.noUnlock' && onFallback) {
          const email = valuesOf(cause)?.email;
          onFallback({ email: typeof email === 'string' ? email : null, message });
        } else {
          setError(message);
        }
        setBusy(false);
      });
  }

  useEffect(() => {
    if (!autoStart || started.current) return;
    started.current = true;
    onAutoStarted?.();
    void host()
      .accountPasskeys?.granted()
      .then((granted) => {
        if (granted) start();
      })
      .catch(() => undefined);
    // Once: a second ask would be a second passkey sheet.
  }, [autoStart]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={start}
        className={CONTINUE_BUTTON}
      >
        {busy ? <Spinner /> : <KeyIcon className="text-[17px] text-neutral-600 dark:text-neutral-300" />}
        {t('passkey.continue')}
      </button>
      <PasskeyHint />
      {error && <Callout tone="danger">{error}</Callout>}
    </div>
  );
}

/** Where the passkeys come from: the account page, which alone adds them. */
export function PasskeyHint() {
  const t = useT();
  return (
    <p className="text-center text-[11.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
      {t.rich('passkey.where', {}, {
        link: (chunk) => (
          <a
            href={accountPageUrl('passkeys')}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {chunk}
          </a>
        ),
      })}
    </p>
  );
}
