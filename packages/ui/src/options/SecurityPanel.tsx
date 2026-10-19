import { useMemo, useState } from 'react';
import {
  accountPasswordProblem,
  scorePassword,
  type ProtectionMode,
  type SignInProvider,
  type VaultData,
} from '@authx/core';
import { BackgroundError, send, type Mutate } from '../lib/protocol.js';
import { Button, Callout, Field, Spinner } from '../components/primitives.js';
import { RecoveryKeySheet } from './RecoveryKeySheet.js';
import { PageHeader, Row, Section, Select, StateDot, Toggle } from './Section.js';
import { AccountPageLink, sheetProtects } from './AccountPanel.js';
import { providerLabel } from './ProviderSignIn.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { localise } from '../i18n/error-text.js';

export function SecurityPanel({
  data,
  mutate,
  refresh,
  protectionMode,
  hasRecovery,
  signedIn,
  accountRecovery,
}: {
  data: VaultData;
  mutate: Mutate;
  refresh: () => Promise<void>;
  protectionMode: ProtectionMode;
  hasRecovery: boolean;
  signedIn: boolean;
  accountRecovery: boolean;
}) {
  const t = useT();
  const { settings } = data;
  const passwordProtected = protectionMode === 'passphrase';

  const recoveryReady = signedIn ? sheetProtects(data, accountRecovery) : hasRecovery;
  const provider = data.account.method === 'provider' ? data.account.provider : undefined;
  // Decided once, as the tab opens. Moving the group the moment a key is
  // issued would remount it, and the key — shown once, kept nowhere — would
  // vanish from the screen before anyone had written it down.
  const [recoveryFirst] = useState(!recoveryReady);

  // Signed in to an account with a root — another Keyrook app uses it, or the
  // account page gave it one — the recovery key opens the root, and is made
  // and changed on the account page for every app at once. Without a root it
  // is this app's kit, made here: the account page sends such an account back
  // here for it.
  const recovery = signedIn && data.account.keys ? (
    <AccountRecoverySection protects={recoveryReady} />
  ) : (
    <RecoverySection
      mode={protectionMode}
      hasRecovery={hasRecovery}
      signedIn={signedIn}
      accountRecovery={accountRecovery}
      provider={provider}
    />
  );

  return (
    <>
      <PageHeader title={t('nav.security')} description={t('security.description')} />

      {/* The one thing that can still go permanently wrong comes first while
          it is undone, and takes its place below once it is not. */}
      {recoveryFirst && recovery}

      <Section title={t('security.locking')}>
        {/* A Google or GitHub account has no password, so this vault's master
            password is its own: chosen, changed and removed like a local one. */}
        <ProtectionRow mode={protectionMode} signedIn={signedIn && !provider} />
        <Row
          label={t('security.lockAfter')}
          description={
            passwordProtected ? t('security.lockAfter.passphrase') : t('security.lockAfter.device')
          }
          control={
            passwordProtected ? (
              <Select
                label={t('security.autoLock')}
                value={settings.autoLockMinutes}
                onChange={(value) =>
                  void mutate({ op: 'settings/update', patch: { autoLockMinutes: value } })
                }
                options={[
                  { value: 1, label: t('security.minutes', { count: 1 }) },
                  { value: 5, label: t('security.minutes', { count: 5 }) },
                  { value: 15, label: t('security.minutes', { count: 15 }) },
                  { value: 60, label: t('security.hour') },
                  { value: 0, label: t('security.never') },
                ]}
              />
            ) : (
              <span className="text-[12.5px] text-neutral-400 dark:text-neutral-500">{t('security.needsPassword')}</span>
            )
          }
        />
        <Row
          label={t('security.blur')}
          description={t('security.blurDescription')}
          control={
            <Toggle
              label={t('security.blurToggle')}
              checked={settings.hideCodes}
              onChange={(value) => void mutate({ op: 'settings/update', patch: { hideCodes: value } })}
            />
          }
        />
      </Section>

      {!recoveryFirst && recovery}
      <DangerZone onReset={refresh} />
    </>
  );
}

/**
 * Switching protection mode, and changing the password within passphrase mode.
 * Both go through the same `vault/setProtection` call, which re-wraps the data
 * key without touching a byte of the encrypted payload.
 *
 * Signed in, there is no free choice of password: a vault opens either with
 * the device key or with the account password. So "adding" a password means
 * locking with the account's, and changing it changes the account's.
 */
function ProtectionRow({ mode, signedIn }: { mode: ProtectionMode; signedIn: boolean }) {
  const t = useT();
  const [intent, setIntent] = useState<'idle' | 'set' | 'change' | 'remove'>('idle');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'info' | 'danger'; text: string } | null>(null);

  // Locking a signed-in device-key vault takes the existing account password:
  // nothing new to choose, so nothing to confirm or score.
  const usesAccountPassword = signedIn && intent === 'set';
  const strength = useMemo(() => scorePassword(next), [next]);
  // A new password on a signed-in vault is a new account password, and has to
  // be strong enough to protect a copy that lives on a server.
  const tooWeak =
    signedIn && intent === 'change' && next.length > 0 ? accountPasswordProblem(next) : null;
  const needsCurrent = mode === 'passphrase';
  const needsNext = intent === 'set' || intent === 'change';
  const ready =
    (!needsCurrent || current.length > 0) &&
    (!needsNext ||
      (usesAccountPassword ? next.length > 0 : next.length >= 8 && next === confirm && !tooWeak));

  function reset() {
    setIntent('idle');
    setCurrent('');
    setNext('');
    setConfirm('');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;

    setBusy(true);
    setMessage(null);
    try {
      await send({
        type: 'vault/setProtection',
        next: needsNext ? { mode: 'passphrase', password: next } : { mode: 'device' },
        ...(needsCurrent ? { currentPassword: current } : {}),
      });
      reset();
      setMessage({
        tone: 'info',
        text:
          intent === 'remove'
            ? t(signedIn ? 'protect.msg.removedSignedIn' : 'protect.msg.removed')
            : intent === 'set'
              ? t(signedIn ? 'protect.msg.setSignedIn' : 'protect.msg.set')
              : t(signedIn ? 'protect.msg.changedSignedIn' : 'protect.msg.changed'),
      });
    } catch (cause) {
      setMessage({ tone: 'danger', text: errorText(cause) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={mode === 'passphrase'} />
          {mode === 'passphrase'
            ? t(signedIn ? 'protect.state.accountPassword' : 'protect.state.master')
            : t('protect.state.device')}
        </span>
      }
      description={
        <>
          {mode === 'passphrase' ? t('security.passwordHint') : t('security.deviceKeyHint')}
          {signedIn && intent === 'idle' && (
            <> {mode === 'passphrase' ? t('protect.note.passphrase') : t('protect.note.device')}</>
          )}
        </>
      }
      control={
        intent === 'idle' && (
          <div className="flex gap-2">
            {mode === 'device' ? (
              <Button variant="primary" size="sm" onClick={() => setIntent('set')}>
                {t(signedIn ? 'protect.lockWithAccount' : 'protect.addMaster')}
              </Button>
            ) : (
              <>
                <Button size="sm" onClick={() => setIntent('change')}>
                  {t('protect.changePassword')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIntent('remove')}>
                  {t('common.remove')}
                </Button>
              </>
            )}
          </div>
        )
      }
    >
      {(message || intent !== 'idle') && (
        <div className="flex flex-col gap-4">
          {message && <Callout tone={message.tone}>{message.text}</Callout>}

          {intent !== 'idle' && (
            <form onSubmit={submit} className="flex flex-col gap-4">
              {intent === 'remove' && (
                <Callout tone="warning">
                  {t('protect.removeWarning')}
                  {signedIn && t('protect.removeWarningSignedIn')}
                </Callout>
              )}

              {needsCurrent && (
                <Field
                  label={t(signedIn ? 'protect.currentPassword' : 'protect.currentMaster')}
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                />
              )}

              {usesAccountPassword ? (
                <Field
                  label={t('protect.accountPassword')}
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={next}
                  onChange={(event) => setNext(event.target.value)}
                  hint={t('protect.accountPasswordHint')}
                />
              ) : (
                needsNext && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={t('protect.newPassword')}
                      type="password"
                      autoComplete="new-password"
                      autoFocus={!needsCurrent}
                      value={next}
                      onChange={(event) => setNext(event.target.value)}
                      hint={
                        next
                          ? t('strength.line', { label: t(`strength.${strength.score}` as 'strength.0') })
                          : signedIn
                            ? t('protect.hint12')
                            : t('recover.atLeast8')
                      }
                      error={tooWeak && localise(tooWeak)}
                    />
                    <Field
                      label={t('protect.confirmNew')}
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      error={confirm && confirm !== next ? t('common.passwordsDiffer') : null}
                    />
                  </div>
                )
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant={intent === 'remove' ? 'danger' : 'primary'}
                  disabled={!ready || busy}
                >
                  {busy ? <Spinner /> : null}
                  {intent === 'remove'
                    ? t('protect.removePassword')
                    : intent === 'set'
                      ? usesAccountPassword
                        ? t('protect.lockWithIt')
                        : t('protect.setPassword')
                      : t('protect.changePassword')}
                </Button>
                <Button onClick={reset}>{t('common.cancel')}</Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Row>
  );
}

function DangerZone({ onReset }: { onReset: () => Promise<void> }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const armed = confirmation === 'DELETE';

  // Folded until asked for: a red box with a text field, always on show at the
  // foot of every visit, made the whole page feel like a warning.
  return (
    <Section tone="danger">
      <Row
        label={t('danger.title')}
        description={t('danger.description')}
        control={
          open ? null : (
            <Button variant="ghost" size="sm" className="text-red-600! dark:text-red-300!" onClick={() => setOpen(true)}>
              {t('danger.open')}
            </Button>
          )
        }
      >
        {open && (
          <div className="flex flex-col gap-4">
            <Callout tone="danger">{t('danger.warning')}</Callout>
            <Field
              label={t('common.typeToConfirm', { word: 'DELETE' })}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex gap-2">
              <Button
                variant="danger"
                disabled={!armed || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await send({ type: 'vault/reset' });
                    await onReset();
                  } finally {
                    setBusy(false);
                    setConfirmation('');
                  }
                }}
              >
                {busy ? <Spinner /> : null} {t('danger.confirm')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setConfirmation('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Row>
    </Section>
  );
}

/** The recovery key of an account with a root, which lives on the account page. */
function AccountRecoverySection({ protects }: { protects: boolean }) {
  const t = useT();
  return (
    <Section title={t('kit.title')} description={t('accountPage.recoveryKey')}>
      <Row
        label={
          <span className="flex items-center">
            <StateDot good={protects} />
            {protects ? t('accountPage.sheetProtects') : t('accountPage.sheetUnknown')}
          </span>
        }
        control={<AccountPageLink>{t('accountPage.open')}</AccountPageLink>}
      />
    </Section>
  );
}

/**
 * The recovery kit: a second wrapping of the same data key under a key the user
 * keeps on paper. It is the only thing standing between a forgotten password
 * and a permanently unopenable vault, so the section says that outright rather
 * than filing it under "advanced".
 *
 * Signed in, the kit is also a way to reset the account, so issuing or removing
 * one asks for the account password — someone at an unlocked vault holds
 * everything else it would take.
 */
function RecoverySection({
  mode,
  hasRecovery,
  signedIn,
  accountRecovery,
  provider,
}: {
  mode: ProtectionMode;
  hasRecovery: boolean;
  signedIn: boolean;
  accountRecovery: boolean;
  /** Signed in with Google or GitHub: a fresh sign-in there stands in for the password. */
  provider: SignInProvider | undefined;
}) {
  const t = useT();
  const reauth = signedIn && provider !== undefined;
  const [issued, setIssued] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState<'issue' | 'remove' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Another Keyrook app gave the account a root since this page opened: its
  // recovery key is the account page's now, and the refusal says where.
  const [onPage, setOnPage] = useState(false);

  function close() {
    setAsking(null);
    setPassword('');
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setOnPage(false);
    try {
      await action();
      close();
    } catch (cause) {
      setError(errorText(cause));
      setOnPage(cause instanceof BackgroundError && cause.key === 'error.kitOnAccountPage');
    } finally {
      setBusy(false);
    }
  }

  const issue = () =>
    run(async () => {
      const { recoveryKey } = await send({
        type: 'vault/createRecoveryKit',
        ...(signedIn && !reauth ? { password } : {}),
      });
      setIssued(recoveryKey);
    });

  const remove = () =>
    run(async () => {
      await send({ type: 'vault/removeRecoveryKit', ...(signedIn && !reauth ? { password } : {}) });
    });

  const ready = hasRecovery && (!signedIn || accountRecovery);

  return (
    <Section
      title={t('kit.title')}
      description={
        reauth
          ? t('kit.provider', { provider: providerLabel(provider!) })
          : signedIn
            ? t('kit.signedIn')
            : mode === 'passphrase'
              ? t('kit.passphrase')
              : t('kit.device')
      }
    >
      {issued ? (
        <div className="p-4">
          <RecoveryKeySheet recoveryKey={issued} onDone={() => setIssued(null)} />
        </div>
      ) : (
        <Row
          label={
            <span className="flex items-center">
              <StateDot good={ready} />
              {!hasRecovery ? t('kit.none') : signedIn && !accountRecovery ? t('kit.vaultOnly') : t('kit.issued')}
            </span>
          }
          description={hasRecovery && asking === null ? t(signedIn ? 'kit.replacesSignedIn' : 'kit.replaces') : undefined}
          control={
            asking === null && (
              <div className="flex gap-2">
                <Button
                  variant={hasRecovery ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={busy}
                  onClick={() => (signedIn ? setAsking('issue') : void issue())}
                >
                  {busy ? <Spinner /> : null}
                  {hasRecovery ? t('kit.issueNew') : t('kit.create')}
                </Button>
                {hasRecovery && (
                  <Button variant="ghost" size="sm" onClick={() => setAsking('remove')}>
                    {t('common.remove')}
                  </Button>
                )}
              </div>
            )
          }
        >
          {(error || (hasRecovery && signedIn && !accountRecovery) || (!hasRecovery && asking === null) || asking !== null) && (
            <div className="flex flex-col gap-3">
              {error && (
                <Callout tone="danger">
                  <p>{error}</p>
                  {onPage && (
                    <div className="mt-2">
                      <AccountPageLink>{t('accountPage.open')}</AccountPageLink>
                    </div>
                  )}
                </Callout>
              )}

              {hasRecovery && signedIn && !accountRecovery && (
                // Issued before signing up. Its key was shown once and kept
                // nowhere, so it cannot be uploaded after the fact.
                <Callout tone="warning">{t('kit.beforeSignIn')}</Callout>
              )}

              {!hasRecovery && asking === null && (
                // The loss to warn about depends on the mode, as the description
                // above already knows: a device-key vault has no password to
                // forget, and telling its owner they might forget one points
                // them at the wrong risk.
                <Callout tone="warning">
                  {reauth
                    ? t('kit.withoutProvider')
                    : signedIn || mode === 'passphrase'
                      ? t('kit.withoutPassword')
                      : t('kit.withoutDevice')}{' '}
                  {t('kit.noSupport')}
                </Callout>
              )}

              {asking !== null && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void (asking === 'issue' ? issue() : remove());
                  }}
                  className="flex flex-col gap-3"
                >
                  {asking === 'remove' && (
                    <Callout tone="danger">
                      {reauth
                        ? t('kit.removeProvider')
                        : t(signedIn ? 'kit.removePasswordSignedIn' : 'kit.removePassword')}
                    </Callout>
                  )}
                  {reauth && (
                    <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {t('kit.reauth', { provider: providerLabel(provider!) })}
                    </p>
                  )}
                  {signedIn && !reauth && (
                    <Field
                      label={t('protect.accountPassword')}
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      hint={t('kit.passwordHint')}
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant={asking === 'remove' ? 'danger' : 'primary'}
                      disabled={busy || (signedIn && !reauth && password.length === 0)}
                    >
                      {busy ? <Spinner /> : null}
                      {asking === 'remove' ? t('kit.removeConfirm') : t('kit.createConfirm')}
                    </Button>
                    <Button onClick={close}>{t('common.cancel')}</Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Row>
      )}
    </Section>
  );
}
