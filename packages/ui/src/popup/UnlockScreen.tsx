import { useState, type FormEvent } from 'react';
import { send, type VaultStatus } from '../lib/protocol.js';
import { Logo } from '../components/icons.js';
import { APP_NAME } from '../lib/name.js';
import { Button, Field, Spinner } from '../components/primitives.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';

export function UnlockScreen({
  onUnlocked,
  hasRecovery,
  onUseRecoveryKey,
}: {
  onUnlocked: (status: VaultStatus) => void;
  hasRecovery: boolean;
  onUseRecoveryKey: () => void;
}) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={submit} className="flex min-h-[480px] flex-col justify-center gap-6 p-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <Logo className="h-12 w-12" settle />
        <div>
          <h1 className="text-[17px] font-semibold">{APP_NAME}</h1>
          <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">
            {t('unlock.prompt')}
          </p>
        </div>
      </header>

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
