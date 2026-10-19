import { useCallback, useEffect, useRef, useState } from 'react';
import { isWellFormedRecoveryKey, type PairingSummary, type SignInProvider } from '@authx/core';
import {
  send,
  type PairingPoll,
  type ProviderOffer,
  type ProviderStartResult,
  type SignInResult,
} from '../lib/protocol.js';
import { PRIVACY_URL } from '../lib/links.js';
import { ACCOUNT_FRAGMENT } from '../lib/deep-link.js';
import { host } from '../host.js';
import { BRAND_ICONS } from '../components/brand-icons.js';
import { PasswordField } from '../components/password.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { Section } from './Section.js';
import { Footnote, FormShell, TextLink, useSubmit } from './auth-ui.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { BackgroundError } from '../lib/protocol.js';

/*
 * Signing in with Google or GitHub: the buttons, the step that creates an
 * account, the screen a new browser waits on until another lets it in, and the
 * prompt on that other browser. The design is keyrook-account's
 * docs/provider-sign-in.md.
 */

export const providerLabel = (provider: SignInProvider) => (provider === 'github' ? 'GitHub' : 'Google');

/** The window closing is not an error worth a red box: the person chose it. */
const cancelled = (cause: unknown) => cause instanceof BackgroundError && cause.key === 'error.signinCancelled';

const message = (cause: unknown) => (errorText(cause));

/**
 * Google's sign-in button has to carry its four-colour mark, not a single-tone
 * one; GitHub's is the monochrome mark, in the text colour.
 */
export function ProviderMark({ provider, className = 'h-[18px] w-[18px]' }: { provider: SignInProvider; className?: string }) {
  if (provider === 'google') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    );
  }
  const icon = BRAND_ICONS.github!;
  return (
    <svg viewBox={icon.viewBox} className={className} aria-hidden="true" fill="currentColor">
      <path d={icon.body} />
    </svg>
  );
}

/**
 * "Continue with …", one per provider the server offers.
 *
 * This tab goes to the provider and comes back, the way a website signs in:
 * the provider's page is where the browser's own accounts are listed, and
 * nothing opens beside it. Only a server that cannot hand the answer back to
 * a tab gets the browser's sign-in window instead, opened by the service
 * worker while this page waits.
 */
export function ProviderButtons({
  offer,
  onStarted,
  inNewTab = false,
}: {
  offer: ProviderOffer;
  onStarted?: (provider: SignInProvider, result: ProviderStartResult) => void;
  /**
   * From the popup, which cannot leave for the provider and come back: the
   * sign-in opens in a tab of its own, and ends on Settings → Sync there.
   */
  inNewTab?: boolean;
}) {
  const t = useT();
  const [busy, setBusy] = useState<SignInProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Back from the provider's page, the browser can show this page as it
    // was left — busy, with every button disabled.
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) setBusy(null);
    };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);

  async function start(provider: SignInProvider) {
    if (busy) return;
    setBusy(provider);
    setError(null);
    try {
      if (inNewTab) {
        // A server that only hands sign-ins to the browser's window: that
        // window would outlive the popup, so Settings starts it instead.
        if (offer.inTab) await host().openUrl((await send({ type: 'provider/begin', provider })).url);
        else await host().openSettings(ACCOUNT_FRAGMENT);
        window.close();
        return;
      }
      if (offer.inTab) {
        const { url } = await send({ type: 'provider/begin', provider });
        // Busy until the page is gone.
        window.location.assign(url);
        return;
      }
      onStarted?.(provider, await send({ type: 'provider/start', provider }));
    } catch (cause) {
      if (!cancelled(cause)) setError(message(cause));
    }
    setBusy(null);
  }

  return (
    <div className="flex flex-col gap-2">
      {offer.providers.map((provider) => (
        <button
          key={provider}
          type="button"
          disabled={busy !== null}
          onClick={() => void start(provider)}
          className={cx(
            'relative inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-colors select-none',
            'border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
            'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {busy === provider ? <Spinner /> : <ProviderMark provider={provider} />}
          {t('provider.continue', { provider: providerLabel(provider) })}
        </button>
      ))}
      {busy && !offer.inTab && !inNewTab && (
        <p className="text-center text-[12px] text-neutral-600 dark:text-neutral-400">
          {t('provider.finishInWindow', { provider: providerLabel(busy) })}
        </p>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
    </div>
  );
}

/** A line between the providers and the email forms. */
export function OrDivider({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 text-[12px] text-neutral-400 dark:text-neutral-500">
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      {children}
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

/**
 * No account has this identity yet. Said before it is made, because it is the
 * moment to know there is no password, and what replaces it.
 */
export function ProviderNewAccount({
  provider,
  email,
  onCreated,
  onCancel,
}: {
  provider: SignInProvider;
  email: string;
  onCreated: (recoveryKey: string) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const { busy, error, run } = useSubmit();
  const name = providerLabel(provider);

  return (
    <FormShell
      onBack={onCancel}
      title={t('create.title')}
      subtitle={t.rich(
        'provider.confirmed',
        { provider: name, email },
        { b: (chunk) => <span className="font-medium text-neutral-700 dark:text-neutral-200">{chunk}</span> },
      )}
      onSubmit={() =>
        void run(async () => {
          const { recoveryKey } = await send({ type: 'provider/create' });
          onCreated(recoveryKey!);
        })
      }
    >
      <ul className="flex flex-col gap-3 text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">
        <li className="flex gap-2.5">
          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          <span>
            {t('provider.point1', { provider: name })}
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          <span>
            {t('provider.point2', { provider: name })}
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          <span>
            {t('provider.point3', { provider: name })}
          </span>
        </li>
      </ul>

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? <Spinner /> : null} {t('create.submit')}
        </Button>
        <Footnote>
          {t.rich('create.agree', {}, {
            link: (chunk) => (
              <a
                href={PRIVACY_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                {chunk}
              </a>
            ),
          })}
        </Footnote>
      </div>

      <Footnote>
        {t('provider.notRight')} <TextLink onClick={onCancel}>{t('provider.startAgain')}</TextLink>
      </Footnote>
    </FormShell>
  );
}

/** Five, five, five: easier to compare across two screens than fifteen in a row. */
export function PairingCode({ code }: { code: string }) {
  // Arrives grouped with dashes; shown with spaces, which read as gaps.
  const t = useT();
  const groups = code.split('-');
  return (
    <p
      aria-label={t('pairing.codeLabel', { code: groups.join(' ') })}
      className="rounded-2xl bg-neutral-50 px-4 py-4 text-center font-mono text-[22px] font-semibold tracking-[0.12em] text-neutral-900 tabular-nums dark:bg-neutral-900 dark:text-neutral-50"
      data-pairing-code={code}
    >
      {groups.join(' ')}
    </p>
  );
}

const POLL_MS = 2000;

/**
 * A browser signed in to the account but without its key. It asks the
 * account's other browsers, and waits; or takes the recovery key instead.
 */
export function JoinAccount({
  provider,
  email,
  protectionMode,
  asked: askedBefore,
  onJoined,
  onCancel,
}: {
  provider: SignInProvider;
  email: string;
  protectionMode: 'device' | 'passphrase';
  /** Already asked, before this page was opened. */
  asked: boolean;
  onJoined: (result: SignInResult) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const locks = protectionMode === 'passphrase';
  const [password, setPassword] = useState('');
  // A vault with a master password needs it before asking: it is what takes
  // the account's key when it arrives, and the key arrives only once.
  const [asked, setAsked] = useState(askedBefore && !locks);
  const [progress, setProgress] = useState<Exclude<PairingPoll, { state: 'joined' }>>({ state: 'waiting' });
  const [failure, setFailure] = useState<string | null>(null);
  const [useKey, setUseKey] = useState(false);
  const asking = useSubmit();
  // Held in a ref so a parent re-rendering does not restart the polling.
  const joined = useRef(onJoined);
  joined.current = onJoined;

  const ask = () =>
    asking.run(async () => {
      setFailure(null);
      await send({ type: 'pairing/request', ...(locks ? { password } : {}) });
      setProgress({ state: 'waiting' });
      setAsked(true);
    });

  // A device-key vault has nothing to type: ask straight away. Once, on
  // arrival — `ask` is a new function every render.
  const askOnArrival = useRef(!locks && !askedBefore);
  useEffect(() => {
    if (!askOnArrival.current) return;
    askOnArrival.current = false;
    void ask();
  });

  useEffect(() => {
    if (!asked || failure || useKey) return;
    let stopped = false;
    const tick = async () => {
      try {
        const next = await send({ type: 'pairing/poll', ...(locks ? { password } : {}) });
        // Reported even after this screen is gone: joining signs the vault in,
        // and the page swaps this form out before the answer gets here.
        if (next.state === 'joined') {
          stopped = true;
          joined.current(next);
          return;
        }
        if (!stopped) setProgress(next);
      } catch (cause) {
        if (!stopped) setFailure(message(cause));
      }
    };
    void tick();
    const timer = setInterval(() => {
      if (!stopped) void tick();
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [asked, failure, useKey, locks, password]);

  async function cancel() {
    await send({ type: 'provider/cancel' }).catch(() => undefined);
    onCancel();
  }

  if (useKey) {
    return (
      <JoinWithRecoveryKey
        locks={locks}
        knownPassword={asked ? password : ''}
        onBack={() => setUseKey(false)}
        onJoined={onJoined}
      />
    );
  }

  const name = providerLabel(provider);

  return (
    <FormShell
      onBack={() => void cancel()}
      title={t('join.title')}
      subtitle={t.rich(
        'join.subtitle',
        { email },
        { b: (chunk) => <span className="font-medium text-neutral-700 dark:text-neutral-200">{chunk}</span> },
      )}
      onSubmit={() => {
        if (!asked && password) void ask();
      }}
    >
      {!asked && locks ? (
        <>
          <PasswordField
            label={t('join.masterPassword')}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            autoFocus
            hint={t('join.masterHint')}
          />
          {asking.error && <Callout tone="danger">{asking.error}</Callout>}
          <Button type="submit" variant="primary" className="w-full" disabled={!password || asking.busy}>
            {asking.busy ? <Spinner /> : null} {t('join.ask')}
          </Button>
        </>
      ) : (
        <>
          <ol className="flex flex-col gap-2.5 text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">
            <li className="flex gap-2.5">
              <Step n={1} />
              <span>{t('join.step1')}</span>
            </li>
            <li className="flex gap-2.5">
              <Step n={2} />
              <span>{t('join.step2')}</span>
            </li>
          </ol>

          {failure || asking.error ? (
            <>
              <Callout tone="danger">{failure ?? asking.error}</Callout>
              <Button variant="primary" className="w-full" disabled={asking.busy} onClick={() => void ask()}>
                {asking.busy ? <Spinner /> : null} {t('join.askAgain')}
              </Button>
            </>
          ) : progress.state === 'compare' ? (
            <div className="flex flex-col gap-2.5">
              <PairingCode code={progress.code} />
              <p className="text-center text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t('join.compare')}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-50 px-4 py-4 text-[13px] text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
              <Spinner className="h-4 w-4" /> {t('join.waiting')}
            </div>
          )}
        </>
      )}

      <Footnote>
        {t('join.noOther')} <TextLink onClick={() => setUseKey(true)}>{t('join.useKey')}</TextLink>
      </Footnote>
      <Footnote>
        {t('join.wrongAccount', { provider: name })}{' '}
        <TextLink onClick={() => void cancel()}>{t('common.cancel')}</TextLink>
      </Footnote>
    </FormShell>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
      {n}
    </span>
  );
}

function JoinWithRecoveryKey({
  locks,
  knownPassword,
  onBack,
  onJoined,
}: {
  locks: boolean;
  knownPassword: string;
  onBack: () => void;
  onJoined: (result: SignInResult) => void;
}) {
  const t = useT();
  const [recoveryKey, setRecoveryKey] = useState('');
  const [password, setPassword] = useState(knownPassword);
  const { busy, error, run } = useSubmit();
  const ready = isWellFormedRecoveryKey(recoveryKey) && (!locks || password.length > 0);

  return (
    <FormShell
      onBack={onBack}
      title={t('recover.title')}
      subtitle={t('joinKey.subtitle')}
      onSubmit={() =>
        void run(async () => {
          if (!ready) return;
          onJoined(await send({ type: 'pairing/recover', recoveryKey, ...(locks ? { password } : {}) }));
        })
      }
    >
      <div className="flex flex-col gap-4">
        <Field
          label={t('recover.keyLabel')}
          autoComplete="off"
          spellCheck={false}
          autoFocus
          placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
          value={recoveryKey}
          onChange={(event) => setRecoveryKey(event.target.value)}
          className="font-mono text-[13px] uppercase"
          hint={
            recoveryKey && !isWellFormedRecoveryKey(recoveryKey)
              ? t('recoverAccount.keyHint')
              : undefined
          }
        />
        {locks && !knownPassword && (
          <PasswordField
            label={t('join.masterPassword')}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        )}
      </div>
      {error && <Callout tone="danger">{error}</Callout>}
      <Button type="submit" variant="primary" className="w-full" disabled={!ready || busy}>
        {busy ? <Spinner /> : null} {t('joinKey.submit')}
      </Button>
    </FormShell>
  );
}

/**
 * The approving side: browsers asking to join this account. Each one comes
 * from someone who has just signed in to the account's Google or GitHub, so a
 * request nobody here made means that account is someone else's to use too —
 * the code check is what keeps them out of the vault.
 */
export function PairingRequests({ provider }: { provider: SignInProvider }) {
  const t = useT();
  const [requests, setRequests] = useState<PairingSummary[]>([]);
  const [reviewing, setReviewing] = useState<{ id: string; code: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'info' | 'danger' | 'warning'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await send({ type: 'pairing/list' }));
    } catch {
      // A network blip; the next look will do.
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 3000);
    return () => clearInterval(timer);
  }, [load]);

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
    } catch (cause) {
      setNotice({ tone: 'danger', text: message(cause) });
    } finally {
      setBusy(false);
      await load();
    }
  }

  const review = (id: string) =>
    act(async () => {
      const { code } = await send({ type: 'pairing/accept', id });
      setReviewing({ id, code });
    });

  const approve = (id: string) =>
    act(async () => {
      await send({ type: 'pairing/approve', id });
      setReviewing(null);
      setNotice({ tone: 'info', text: t('approve.approved') });
    });

  const deny = (id: string, mismatch: boolean) =>
    act(async () => {
      await send({ type: 'pairing/deny', id });
      setReviewing(null);
      setNotice(
        mismatch
          ? {
              tone: 'warning',
              text: t('approve.mismatch', { provider: providerLabel(provider) }),
            }
          : { tone: 'info', text: t('approve.declined') },
      );
    });

  const open = requests.filter((request) => request.id === reviewing?.id || request.approverKey === null);
  if (open.length === 0 && !notice) return null;

  return (
    <Section
      title={t('approve.title')}
      description={t('approve.description', { provider: providerLabel(provider) })}
    >
      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
        {notice && (
          <div className="p-4">
            <Callout tone={notice.tone}>{notice.text}</Callout>
          </div>
        )}
        {open.map((request) => (
          <div key={request.id} className="flex flex-col gap-3 px-4 py-3" data-pairing-request={request.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">{request.deviceName}</p>
                <p className="mt-0.5 text-[12px] text-neutral-600 dark:text-neutral-400">
                  {t('approve.askedAt', { time: new Date(request.createdAt).toLocaleTimeString(t.locale) })}
                </p>
              </div>
              {reviewing?.id !== request.id && (
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" disabled={busy} onClick={() => void review(request.id)}>
                    {t('approve.review')}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => void deny(request.id, false)}>
                    {t('approve.deny')}
                  </Button>
                </div>
              )}
            </div>
            {reviewing?.id === request.id && (
              <div className="flex max-w-md flex-col gap-3">
                <PairingCode code={reviewing.code} />
                <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t('approve.question')}
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" disabled={busy} onClick={() => void approve(request.id)}>
                    {busy ? <Spinner /> : null} {t('approve.matches')}
                  </Button>
                  <Button disabled={busy} onClick={() => void deny(request.id, true)}>
                    {t('approve.doesNotMatch')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
