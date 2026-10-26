import { useState, type FormEvent } from 'react';
import { fromBase64, toBase64, PASSKEY_UNLOCK_KINDS, type PasskeyUnlockKind } from '@authx/core';
import { host } from '../host.js';
import { send, type PasskeyAsks, type VaultStatus } from '../lib/protocol.js';
import { Logo } from '../components/icons.js';
import { APP_NAME } from '../lib/name.js';
import { Button, Field, Spinner } from '../components/primitives.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';

const UNLOCK_WITH: Record<PasskeyUnlockKind, MessageKey> = {
  platform: 'platformUnlock.unlock',
  securityKey: 'securityKey.unlock',
};

export function UnlockScreen({
  onUnlocked,
  hasRecovery,
  onUseRecoveryKey,
  passkeys,
}: {
  onUnlocked: (status: VaultStatus) => void;
  hasRecovery: boolean;
  onUseRecoveryKey: () => void;
  /** The passkeys that open this vault instead of the password, where any was turned on. */
  passkeys?: PasskeyAsks | undefined;
}) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const device = host().passkeyUnlock;
  const offered = device ? PASSKEY_UNLOCK_KINDS.filter((kind) => passkeys?.[kind]) : [];

  // Asked on the press, never on opening: the device's prompt is the person's
  // to start, and a popup that opened onto one would be hard to read. With
  // both turned on, it is the person who says which is at hand.
  async function unlockWithPasskey(kind: PasskeyUnlockKind) {
    const asked = passkeys?.[kind];
    if (!asked || !device || busy) return;
    setBusy(true);
    setError(null);
    try {
      const prf = await device.answer(kind, asked.credentialId, fromBase64(asked.prfInput));
      onUnlocked(await send({ type: 'vault/unlockWithPasskey', kind, prf: toBase64(prf) }));
    } catch (cause) {
      setError(errorText(cause));
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    // Guarded here rather than by disabling the button: a disabled default
    // button stops the browser submitting the form on Enter, and Enter is how
    // most people unlock.
    if (!password || busy) return;

    setBusy(true);
    setError(null);
    try {
      onUnlocked(await send({ type: 'vault/unlock', password }));
    } catch (cause) {
      setError(errorText(cause));
      setPassword('');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex min-h-[480px] app:min-h-(--app-height) flex-col justify-center gap-6 p-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <Logo className="h-12 w-12" settle />
        <div>
          <h1 className="text-[17px] font-semibold">{APP_NAME}</h1>
          <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">
            {t('unlock.prompt')}
          </p>
        </div>
      </header>

      {offered.length > 0 && (
        <div className="flex flex-col gap-2">
          {offered.map((kind) => (
            <Button key={kind} type="button" disabled={busy} onClick={() => void unlockWithPasskey(kind)}>
              {t(UNLOCK_WITH[kind])}
            </Button>
          ))}
        </div>
      )}

      <Field
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t('unlock.placeholder')}
        error={error}
      />

      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? <Spinner /> : null}
        {t('unlock.submit')}
      </Button>

      {hasRecovery && (
        // The way back for someone locked out of their vault, so it has to
        // look like something to press before the pointer finds it — not
        // grey text that only admits to being a link on hover.
        <button
          type="button"
          onClick={onUseRecoveryKey}
          className="group text-[12px] text-neutral-600 dark:text-neutral-400"
        >
          {t.rich('unlock.forgot', {}, {
            link: (chunk) => (
              <span className="font-medium text-brand-600 underline-offset-2 group-hover:underline dark:text-brand-400">
                {chunk}
              </span>
            ),
          })}
        </button>
      )}
    </form>
  );
}
