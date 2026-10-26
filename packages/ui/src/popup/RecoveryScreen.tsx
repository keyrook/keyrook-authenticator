import { useMemo, useState, type FormEvent } from 'react';
import { group, isWellFormedRecoveryKey, scorePassword } from '@authx/core';
import { send, type ProtectionChoice, type VaultStatus } from '../lib/protocol.js';
import { ArrowLeftIcon, Logo } from '../components/icons.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';

/**
 * Formats as the user types, the way a recovery key is printed. Confusable
 * letters are folded to the digits they were written for, so someone copying
 * an O off paper still gets in.
 */
function formatAsTyped(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0')
    .replace(/[^0-9A-HJKMNP-TV-Z]/g, '')
    .slice(0, 32);
  return group(cleaned);
}

export function RecoveryScreen({
  onRecovered,
  onCancel,
}: {
  onRecovered: (status: VaultStatus) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [recoveryKey, setRecoveryKey] = useState('');
  const [mode, setMode] = useState<'passphrase' | 'device'>('passphrase');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyLooksRight = isWellFormedRecoveryKey(recoveryKey);
  const strength = useMemo(() => scorePassword(password), [password]);
  const passwordReady = mode === 'device' || (password.length >= 8 && password === confirm);
  const ready = keyLooksRight && passwordReady;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;

    setBusy(true);
    setError(null);
    try {
      const next: ProtectionChoice =
        mode === 'device' ? { mode: 'device' } : { mode: 'passphrase', password };
      onRecovered(await send({ type: 'vault/recover', recoveryKey, next }));
    } catch (cause) {
      setError(errorText(cause));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex min-h-[480px] app:min-h-(--app-height) flex-col gap-4 p-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('common.back')}
          className="rounded-lg p-1.5 text-base text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <ArrowLeftIcon />
        </button>
        <Logo className="h-5 w-5" compact />
        <h1 className="text-[15px] font-semibold">{t('recover.title')}</h1>
      </header>

      <Callout>
        {t('recover.intro')}
      </Callout>

      <Field
        label={t('recover.keyLabel')}
        value={recoveryKey}
        onChange={(event) => setRecoveryKey(formatAsTyped(event.target.value))}
        placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
        autoFocus
        spellCheck={false}
        autoCapitalize="characters"
        autoComplete="off"
        // 39 characters with the dashes. At 13px with code-digits' tracking
        // they ran ~30px past the popup's field, cutting the placeholder off
        // mid-group and scrolling the key under the user's own typing. The
        // utility layer outranks code-digits', so the tracking reset holds.
        className="code-digits text-[12px] tracking-normal"
        hint={
          recoveryKey.length === 0
            ? t('recover.hintEmpty')
            : keyLooksRight
              ? t('recover.hintRight')
              : t('recover.hintCount', { count: recoveryKey.replace(/-/g, '').length })
        }
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {t('recover.lockQuestion')}
        </legend>
        {(
          [
            ['passphrase', t('recover.lockPassword')],
            ['device', t('recover.lockDevice')],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className={cx(
              'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] transition',
              mode === value
                ? 'border-brand-400 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-500/5'
                : 'border-neutral-200 dark:border-neutral-800',
            )}
          >
            <input
              type="radio"
              name="protection"
              value={value}
              checked={mode === value}
              onChange={() => setMode(value)}
              className="h-4 w-4 accent-brand-600"
            />
            {label}
          </label>
        ))}
      </fieldset>

      {mode === 'passphrase' && (
        <div className="flex flex-col gap-3">
          <Field
            label={t('recover.newPassword')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint={
              password
                ? t('strength.line', { label: t(`strength.${strength.score}` as 'strength.0') })
                : t('recover.atLeast8')
            }
          />
          <Field
            label={t('setup.passwordStep.confirm')}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            error={confirm && confirm !== password ? t('common.passwordsDiffer') : null}
          />
        </div>
      )}

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="mt-auto pt-2">
        <Button type="submit" variant="primary" disabled={!ready || busy} className="w-full">
          {busy ? <Spinner /> : null}
          {t('recover.submit')}
        </Button>
      </div>
    </form>
  );
}
