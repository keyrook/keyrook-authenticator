import { useMemo, useState, type FormEvent } from 'react';
import { scorePassword } from '@authx/core';
import { send, type ProtectionChoice, type VaultStatus } from '../lib/protocol.js';
import { ArrowLeftIcon, LockIcon, Logo } from '../components/icons.js';
import { APP_NAME } from '../lib/name.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { SourceLink } from '../components/SourceLink.js';
import { host } from '../host.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { localise } from '../i18n/error-text.js';

const STRENGTH_COLORS = [
  'bg-red-500',
  'bg-yellow-600',
  'bg-yellow-500',
  'bg-green-400',
  'bg-green-500',
];

export function SetupScreen({
  onCreating,
  onCreated,
}: {
  /**
   * What comes once the vault exists: `signIn` when it is made on the way to
   * signing in. Said before the vault is asked for, not with the answer — the
   * service worker announces a new vault to every open page, this one
   * included, and that can draw the vault first. Told afterwards, the popup
   * would already have opened without its sign-in sheet.
   */
  onCreating: (then?: 'signIn') => void;
  onCreated: (status: VaultStatus) => void;
}) {
  const t = useT();
  const [step, setStep] = useState<'choose' | 'password'>('choose');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(protection: ProtectionChoice, then?: 'signIn') {
    setBusy(true);
    setError(null);
    onCreating(then);
    try {
      onCreated(await send({ type: 'vault/create', protection }));
    } catch (cause) {
      setError(errorText(cause));
      setBusy(false);
    }
  }

  if (step === 'password') {
    return (
      <PasswordStep
        busy={busy}
        error={error}
        onBack={() => {
          setError(null);
          setStep('choose');
        }}
        onSubmit={(password) => create({ mode: 'passphrase', password })}
      />
    );
  }

  return (
    <div className="flex min-h-[480px] app:min-h-(--app-height) flex-col gap-5 p-6">
      <header className="flex flex-col items-center gap-3 pt-2 text-center">
        <Logo className="h-11 w-11" settle />
        <div>
          <h1 className="text-[17px] font-semibold">{APP_NAME}</h1>
          <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">
            {t('setup.prompt')}
          </p>
        </div>
      </header>

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="flex flex-col gap-3">
        <ProtectionOption
          title={t('setup.device.title')}
          badge={t('setup.device.badge')}
          description={t('setup.device.description')}
          footnote={t('setup.device.footnote')}
          busy={busy}
          onClick={() => create({ mode: 'device' })}
        />
        <ProtectionOption
          title={t('setup.password.title')}
          icon={<LockIcon />}
          description={t('setup.password.description')}
          footnote={t('setup.password.footnote')}
          onClick={() => setStep('password')}
        />
      </div>

      {/* Someone on a new browser with an account already wants their codes,
          not a choice about a vault. Signing in still needs one to put them
          in: it opens with this browser's key, and can take a master
          password later like any other. */}
      {host().syncEnabled && (
        <p className="text-center text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t.rich('setup.haveAccount', {}, {
            link: (chunk) => (
              <button
                type="button"
                disabled={busy}
                onClick={() => void create({ mode: 'device' }, 'signIn')}
                className="font-medium text-brand-600 hover:underline disabled:opacity-60 dark:text-brand-400"
              >
                {chunk}
              </button>
            ),
          })}
        </p>
      )}

      <div className="mt-auto flex flex-col items-center gap-1.5 pt-2">
        <p className="kr-explain text-center text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
          {/* Sync is offered only by a build that has a server to sync with. */}
          {t(host().syncEnabled ? 'setup.footer' : 'setup.footer.noSync')}
        </p>
        {/* The first moment someone decides whether to trust this with their
            2FA secrets — the code they would be trusting is one click away. */}
        <SourceLink className="text-[11px]">{t('setup.source')}</SourceLink>
      </div>
    </div>
  );
}

function ProtectionOption({
  title,
  badge,
  icon,
  description,
  footnote,
  busy,
  onClick,
}: {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  description: string;
  footnote: string;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex flex-col gap-1.5 rounded-xl border border-neutral-200 p-3.5 text-start transition hover:border-brand-400 hover:bg-brand-50/40 disabled:opacity-60 dark:border-neutral-800 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
    >
      <span className="flex items-center gap-2">
        {busy ? (
          <Spinner className="h-[1em] w-[1em] text-brand-600" />
        ) : (
          icon && <span className="text-brand-600 dark:text-brand-400">{icon}</span>
        )}
        <span className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-50">{title}</span>
        {badge && (
          <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[13px] leading-snug text-neutral-600 dark:text-neutral-300">
        {description}
      </span>
      <span className="kr-explain text-[11px] leading-snug text-neutral-400 dark:text-neutral-500">{footnote}</span>
    </button>
  );
}

function PasswordStep({
  busy,
  error,
  onBack,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (password: string) => void;
}) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const strength = useMemo(() => scorePassword(password), [password]);
  const mismatch = confirm.length > 0 && confirm !== password;
  const ready = password.length >= 8 && password === confirm;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    onSubmit(password);
  }

  return (
    <form onSubmit={submit} className="flex min-h-[480px] app:min-h-(--app-height) flex-col gap-5 p-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.back')}
          className="rounded-lg p-1.5 text-base text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-[15px] font-semibold">{t('setup.passwordStep.title')}</h1>
      </header>

      <Callout tone="warning">
        {t('setup.passwordStep.warning')}
      </Callout>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Field
            label={t('setup.passwordStep.label')}
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('setup.passwordStep.placeholder')}
          />
          {password.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((index) => (
                  <span
                    key={index}
                    className={cx(
                      'h-1 flex-1 rounded-full transition-colors',
                      index <= strength.score
                        ? STRENGTH_COLORS[strength.score]
                        : 'bg-neutral-200 dark:bg-neutral-800',
                    )}
                  />
                ))}
              </div>
              <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
                {strength.warnings[0]
                  ? t('strength.lineWithWarning', {
                      label: t(`strength.${strength.score}` as 'strength.0'),
                      warning: localise(strength.warnings[0]),
                    })
                  : t('strength.line', { label: t(`strength.${strength.score}` as 'strength.0') })}
              </p>
            </div>
          )}
        </div>

        <Field
          label={t('setup.passwordStep.confirm')}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={mismatch ? t('common.passwordsDiffer') : null}
        />
      </div>

      {error && <p className="text-[13px] text-red-600 dark:text-red-300">{error}</p>}

      <div className="mt-auto flex flex-col gap-2">
        <Button type="submit" variant="primary" disabled={!ready || busy}>
          {busy ? <Spinner /> : null}
          {t('setup.passwordStep.submit')}
        </Button>
        <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500">
          {t('setup.passwordStep.footer')}
        </p>
      </div>
    </form>
  );
}
