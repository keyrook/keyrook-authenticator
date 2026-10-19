import { useEffect, useState, type ReactNode } from 'react';
import { accountPasswordProblem, isWellFormedRecoveryKey, type SignInProvider } from '@authx/core';
import {
  send,
  type ProviderOffer,
  type ProviderStartResult,
  type SignInResult,
  type SyncSummary,
} from '../lib/protocol.js';
import { AlertIcon, CheckIcon, CloudLockIcon, KeyIcon } from '../components/icons.js';
import { PasswordField } from '../components/password.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { ACCOUNT_PAGE_URL, PRIVACY_URL, SECURITY_MODEL_URL } from '../lib/links.js';
import { SourceLink } from '../components/SourceLink.js';
import { AuthCard, Footnote, FormShell, Mark, TextLink, useSubmit } from './auth-ui.js';
import { JoinAccount, OrDivider, ProviderButtons, ProviderNewAccount, providerLabel } from './ProviderSignIn.js';
import { useT, type Translator } from '../i18n/react.js';
import { localise } from '../i18n/error-text.js';

export { AuthCard } from './auth-ui.js';

type Step = 'intro' | 'create' | 'signIn' | 'recover' | 'providerNew' | 'join';

/** A Google or GitHub sign-in that has got as far as the provider. */
interface ProviderFlow {
  provider: SignInProvider;
  email: string;
  asked: boolean;
}

/**
 * What signing in adds, said plainly. Only what exists today: there is no
 * phone app yet, so this does not promise one. Nothing about limits either —
 * a local vault has none, so an account cannot be sold as lifting one.
 */
const BENEFITS = ['intro.benefit1', 'intro.benefit2', 'intro.benefit3'] as const;

/**
 * What the card holds room for until the server's answer is known — what the
 * official server offers. Drawing the email-only card first and swapping it
 * for this one a moment later looked like two different screens.
 */
const EXPECTED_OFFER: ProviderOffer = { providers: ['google', 'github'], inTab: true };

/**
 * Creating an account, signing in, and recovering one — for a vault that is
 * not signed in.
 *
 * It opens on what sync is for and two plain choices, then one short form per
 * step. The old version put both forms behind tabs in a two-column grid, with
 * a paragraph above, a callout inside and a benefits list below the button;
 * people had to read all of it to find the one field they needed.
 */
export function SyncAuth({
  protectionMode,
  signedOutElsewhere,
  signedOutProvider,
  onSignedUp,
  onSignedIn,
  providerError,
  initialStep,
  introFooter,
}: {
  protectionMode: 'device' | 'passphrase';
  /** The account this device was signed out of by the server, if any. */
  signedOutElsewhere: string | null;
  /** How that account signs in, when it is with Google or GitHub. */
  signedOutProvider?: SignInProvider | undefined;
  onSignedUp: (recoveryKey: string | null) => void;
  /** Joined an account, by password or by recovery key. */
  onSignedIn: (result: SignInResult, how: 'signIn' | 'recover') => void;
  /** Where to open, when the popup sent someone straight to a form. */
  initialStep?: 'signIn' | 'create' | undefined;
  /** Why a sign-in made in this tab did not work, said on coming back. */
  providerError?: string | null | undefined;
  /** Shown under the card on the first step only. */
  introFooter?: ReactNode;
}) {
  // Someone who was signed out by the server wants back in, not a sales pitch.
  // A provider account has no form to go back to: its button is on the intro.
  const [step, setStep] = useState<Step>(
    signedOutElsewhere && !signedOutProvider ? 'signIn' : (initialStep ?? 'intro'),
  );
  const [email, setEmail] = useState(signedOutElsewhere ?? '');
  // Null until the service worker says, which is at once after the first
  // time; an empty list hides the buttons.
  const [offer, setOffer] = useState<ProviderOffer | null>(null);
  const [flow, setFlow] = useState<ProviderFlow | null>(null);
  // Hidden until it is known whether a sign-in is half done: the intro shown
  // for an instant and then replaced reads as a glitch.
  const [resumed, setResumed] = useState(false);

  useEffect(() => {
    void send({ type: 'provider/offered' })
      .then(setOffer)
      .catch(() => setOffer({ providers: [], inTab: false }));
    // A sign-in this browser started and has not finished — the tab just came
    // back from the provider, or was closed while waiting for approval —
    // picks up where it was.
    void send({ type: 'provider/pending' })
      .then((pending) => {
        if (!pending) return;
        setFlow({ provider: pending.provider, email: pending.email, asked: pending.asked });
        setStep(pending.kind === 'signup' ? 'providerNew' : 'join');
      })
      .catch(() => undefined)
      .finally(() => setResumed(true));
  }, []);

  const go = (next: Step) => setStep(next);

  function started(provider: SignInProvider, result: ProviderStartResult) {
    if (result.kind === 'signedIn') {
      onSignedIn(result, 'signIn');
      return;
    }
    setFlow({ provider, email: result.email, asked: false });
    go(result.kind === 'new' ? 'providerNew' : 'join');
  }

  const restart = () => {
    setFlow(null);
    go('intro');
  };

  return (
    <div className={cx('flex flex-col gap-8', !resumed && 'invisible')}>
      <AuthCard>
        {step === 'intro' && (
          <Intro
            offer={offer}
            error={providerError ?? null}
            signedOutElsewhere={signedOutProvider ? signedOutElsewhere : null}
            signedOutProvider={signedOutProvider}
            onProvider={started}
            onCreate={() => go('create')}
            onSignIn={() => go('signIn')}
          />
        )}
        {step === 'providerNew' && flow && (
          <ProviderNewAccount
            provider={flow.provider}
            email={flow.email}
            onCreated={(recoveryKey) => onSignedUp(recoveryKey)}
            onCancel={() => {
              void send({ type: 'provider/cancel' }).catch(() => undefined);
              restart();
            }}
          />
        )}
        {step === 'join' && flow && (
          <JoinAccount
            provider={flow.provider}
            email={flow.email}
            protectionMode={protectionMode}
            asked={flow.asked}
            onJoined={(result) => onSignedIn(result, 'signIn')}
            onCancel={restart}
          />
        )}
        {step === 'create' && (
          <CreateForm
            protectionMode={protectionMode}
            offer={offer}
            onProvider={started}
            email={email}
            onEmail={setEmail}
            onBack={() => go('intro')}
            onSignIn={() => go('signIn')}
            onSignedUp={onSignedUp}
          />
        )}
        {step === 'signIn' && (
          <SignInForm
            protectionMode={protectionMode}
            offer={signedOutElsewhere && !signedOutProvider ? null : offer}
            onProvider={started}
            email={email}
            onEmail={setEmail}
            signedOutElsewhere={signedOutElsewhere}
            onBack={() => go('intro')}
            onCreate={() => go('create')}
            onForgot={() => go('recover')}
            onSignedIn={(result) => onSignedIn(result, 'signIn')}
          />
        )}
        {step === 'recover' && (
          <RecoverForm
            email={email}
            onEmail={setEmail}
            onBack={() => go('signIn')}
            onSignedIn={(result) => onSignedIn(result, 'recover')}
          />
        )}
      </AuthCard>
      {step === 'intro' && introFooter}
    </div>
  );
}

function Intro({
  offer,
  error,
  signedOutElsewhere,
  signedOutProvider,
  onProvider,
  onCreate,
  onSignIn,
}: {
  offer: ProviderOffer | null;
  error: string | null;
  signedOutElsewhere: string | null;
  signedOutProvider: SignInProvider | undefined;
  onProvider: (provider: SignInProvider, result: ProviderStartResult) => void;
  onCreate: () => void;
  onSignIn: () => void;
}) {
  const t = useT();
  const shown = offer ?? EXPECTED_OFFER;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Mark icon={<CloudLockIcon />} />
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight">{t('intro.title')}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t('intro.subtitle')}
          </p>
        </div>
      </div>

      {signedOutElsewhere && signedOutProvider ? (
        <Callout tone="warning">
          {t('intro.signedOutProvider', { email: signedOutElsewhere, provider: providerLabel(signedOutProvider) })}
        </Callout>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2.5 text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">
              <CheckIcon className="mt-px shrink-0 text-[15px] text-brand-600 dark:text-brand-400" />
              {t(benefit)}
            </li>
          ))}
        </ul>
      )}

      {error && <Callout tone="danger">{error}</Callout>}

      {/* Google and GitHub first: no password to invent, and no email code to
          wait for. The email forms stay for anyone who would rather. */}
      <div className={offer ? undefined : 'invisible'} aria-hidden={offer ? undefined : true}>
        {shown.providers.length > 0 ? (
          <div className="flex flex-col gap-4">
            <ProviderButtons offer={shown} onStarted={onProvider} />
            <OrDivider>{t('intro.orEmail')}</OrDivider>
            <div className="grid grid-cols-2 gap-2">
              <Button className="w-full" onClick={onCreate}>
                {t('intro.create')}
              </Button>
              <Button className="w-full" onClick={onSignIn}>
                {t('intro.signIn')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="primary" className="w-full" onClick={onCreate}>
              {t('intro.create')}
            </Button>
            <Button className="w-full" onClick={onSignIn}>
              {t('intro.signIn')}
            </Button>
          </div>
        )}
      </div>

      {/* The moment someone decides whether to hand their codes to a server
          is the moment to show them exactly what leaves the device. */}
      <div className="flex justify-center text-[12px]">
        <SourceLink href={SECURITY_MODEL_URL}>{t('intro.source')}</SourceLink>
      </div>
    </div>
  );
}


/**
 * Google and GitHub above an email form too: someone who chose "Create
 * account" is looking for how to make one, and these are two of the ways.
 */
function ProvidersAbove({
  offer,
  onProvider,
}: {
  offer: ProviderOffer | null;
  onProvider: (provider: SignInProvider, result: ProviderStartResult) => void;
}) {
  const t = useT();
  if (!offer || offer.providers.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <ProviderButtons offer={offer} onStarted={onProvider} />
      <OrDivider>{t('intro.orEmail')}</OrDivider>
    </div>
  );
}

function EmailField({
  email,
  onEmail,
  autoFocus,
}: {
  email: string;
  onEmail: (email: string) => void;
  autoFocus?: boolean;
}) {
  const t = useT();
  return (
    <Field
      label={t('form.email')}
      type="email"
      autoComplete="username"
      placeholder={t('form.emailPlaceholder')}
      autoFocus={autoFocus}
      value={email}
      onChange={(event) => onEmail(event.target.value)}
    />
  );
}

function CreateForm({
  protectionMode,
  offer,
  onProvider,
  email,
  onEmail,
  onBack,
  onSignIn,
  onSignedUp,
}: {
  protectionMode: 'device' | 'passphrase';
  offer: ProviderOffer | null;
  onProvider: (provider: SignInProvider, result: ProviderStartResult) => void;
  email: string;
  onEmail: (email: string) => void;
  onBack: () => void;
  onSignIn: () => void;
  onSignedUp: (recoveryKey: string | null) => void;
}) {
  const t = useT();
  const [stage, setStage] = useState<'details' | 'code'>('details');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const { busy, error, run } = useSubmit();

  // A vault with a master password signs up with it — one password, not two.
  // One that opens with the device key chooses a password for the account.
  const choosing = protectionMode === 'device';
  const tooWeak = choosing && password.length > 0 && accountPasswordProblem(password) !== null;
  const ready =
    email.includes('@') &&
    password.length >= 8 &&
    (!choosing || (!tooWeak && password === confirm));

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const askForCode = () =>
    run(async () => {
      await send({ type: 'account/startSignUp', email, password });
      setCode('');
      setStage('code');
      // The server allows one email a minute per address; say so on the
      // button rather than letting a second click fail.
      setResendIn(60);
    });

  if (stage === 'code') {
    return (
      <FormShell
        onBack={() => setStage('details')}
        title={t('create.checkEmail')}
        subtitle={t.rich(
          'create.codeSent',
          { email },
          { b: (chunk) => <span className="font-medium text-neutral-700 dark:text-neutral-200">{chunk}</span> },
        )}
        onSubmit={() =>
          void run(async () => {
            if (!/^\d{6}$/.test(code)) return;
            const { recoveryKey } = await send({ type: 'account/signUp', email, password, code });
            onSignedUp(recoveryKey);
          })
        }
      >
        <Field
          label={t('create.code')}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="000000"
          value={code}
          // Pasted codes often arrive with a space or a dash in them.
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center font-mono text-[20px] tracking-[0.4em]"
        />

        {/* A new sender often lands in spam at first. Saying where to look
            keeps people from stalling here, and each "Not spam" teaches the
            mail provider to deliver the next code properly. */}
        <Callout tone="info">
          {t.rich('create.spam', {}, { b: (chunk) => <strong>{chunk}</strong> })}
        </Callout>

        {error && <Callout tone="danger">{error}</Callout>}

        <div className="flex flex-col gap-3">
          <Button type="submit" variant="primary" className="w-full" disabled={code.length !== 6 || busy}>
            {busy ? <Spinner /> : null} {t('create.submit')}
          </Button>
          <Footnote>{t('create.existing')}</Footnote>
        </div>

        <Footnote>
          {t('create.stillNothing')}{' '}
          {resendIn > 0 ? (
            <span>{t('create.resendIn', { seconds: resendIn })}</span>
          ) : (
            <TextLink onClick={() => void askForCode()}>{t('create.resend')}</TextLink>
          )}
          {t('create.wrongAddress')} <TextLink onClick={() => setStage('details')}>{t('create.changeIt')}</TextLink>
        </Footnote>
      </FormShell>
    );
  }

  const aboutPassword = choosing ? t('create.choosing') : t('create.sharing');
  // It is about the password, so with Google and GitHub above the fields it
  // sits with the fields, not over two buttons that need none.
  const withProviders = offer !== null && offer.providers.length > 0;

  return (
    <FormShell
      onBack={onBack}
      title={t('create.title')}
      subtitle={withProviders ? undefined : aboutPassword}
      onSubmit={() => {
        if (ready) void askForCode();
      }}
    >
      <ProvidersAbove offer={offer} onProvider={onProvider} />
      <div className="flex flex-col gap-4">
        {withProviders && (
          <p className="-mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{aboutPassword}</p>
        )}
        <EmailField email={email} onEmail={onEmail} autoFocus />
        {choosing ? (
          <>
            <PasswordField
              label={t('create.password')}
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              meter
              hint={tooWeak ? t('protect.hint12') : undefined}
            />
            <PasswordField
              label={t('setup.passwordStep.confirm')}
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              error={confirm && confirm !== password ? t('common.passwordsDiffer') : null}
            />
          </>
        ) : (
          <PasswordField
            label={t('create.master')}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        )}
      </div>

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="primary" className="w-full" disabled={!ready || busy}>
          {busy ? <Spinner /> : null} {t('common.continue')}
        </Button>
        <Footnote>{t('create.next')}</Footnote>
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
        {t('create.haveAccount')} <TextLink onClick={onSignIn}>{t('intro.signIn')}</TextLink>
      </Footnote>
    </FormShell>
  );
}

function SignInForm({
  protectionMode,
  offer,
  onProvider,
  email,
  onEmail,
  signedOutElsewhere,
  onBack,
  onCreate,
  onForgot,
  onSignedIn,
}: {
  protectionMode: 'device' | 'passphrase';
  offer: ProviderOffer | null;
  onProvider: (provider: SignInProvider, result: ProviderStartResult) => void;
  email: string;
  onEmail: (email: string) => void;
  signedOutElsewhere: string | null;
  onBack: () => void;
  onCreate: () => void;
  onForgot: () => void;
  onSignedIn: (result: SignInResult) => void;
}) {
  const t = useT();
  const [password, setPassword] = useState('');
  const { busy, error, run } = useSubmit();
  const ready = email.includes('@') && password.length > 0;

  return (
    <FormShell
      onBack={onBack}
      title={t('intro.signIn')}
      subtitle={t('signin.subtitle')}
      onSubmit={() =>
        void run(async () => {
          if (!ready) return;
          onSignedIn(await send({ type: 'account/signIn', email, password }));
        })
      }
    >
      {signedOutElsewhere && (
        <Callout tone="warning">
          {t('signin.signedOut', { email: signedOutElsewhere })}
        </Callout>
      )}

      <ProvidersAbove offer={offer} onProvider={onProvider} />
      <div className="flex flex-col gap-4">
        <EmailField email={email} onEmail={onEmail} autoFocus={!email} />
        <PasswordField
          label={t('create.password')}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          autoFocus={Boolean(email)}
          labelAction={
            <span className="text-[12px]">
              <TextLink onClick={onForgot}>{t('signin.forgot')}</TextLink>
            </span>
          }
        />
      </div>

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="primary" className="w-full" disabled={!ready || busy}>
          {busy ? <Spinner /> : null} {t('intro.signIn')}
        </Button>
        <Footnote>
          {protectionMode === 'passphrase' ? t('signin.locksWithAccount') : t('signin.keepsOpening')}
        </Footnote>
      </div>

      <Footnote>
        {t('signin.newHere')} <TextLink onClick={onCreate}>{t('intro.create')}</TextLink>
      </Footnote>
    </FormShell>
  );
}

/**
 * A forgotten password, with the recovery key this app gave out. That is the
 * way back for an account only this app uses: it has no root, and the account
 * page resets a password only through one. An account another Keyrook app uses
 * resets it there, so the way to the page is on this form too.
 */
function RecoverForm({
  email,
  onEmail,
  onBack,
  onSignedIn,
}: {
  email: string;
  onEmail: (email: string) => void;
  onBack: () => void;
  onSignedIn: (result: SignInResult) => void;
}) {
  const t = useT();
  const [recoveryKey, setRecoveryKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { busy, error, run } = useSubmit();

  const tooWeak = password.length > 0 && accountPasswordProblem(password) !== null;
  const ready =
    email.includes('@') &&
    isWellFormedRecoveryKey(recoveryKey) &&
    password.length >= 8 &&
    !tooWeak &&
    password === confirm;

  return (
    <FormShell
      onBack={onBack}
      title={t('recoverAccount.title')}
      subtitle={t('recoverAccount.subtitle')}
      onSubmit={() =>
        void run(async () => {
          if (!ready) return;
          onSignedIn(await send({ type: 'account/recover', email, recoveryKey, password }));
        })
      }
    >
      <div className="flex flex-col gap-4">
        <EmailField email={email} onEmail={onEmail} autoFocus={!email} />
        <Field
          label={t('recover.keyLabel')}
          autoComplete="off"
          spellCheck={false}
          autoFocus={Boolean(email)}
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
        <PasswordField
          label={t('protect.newPassword')}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          meter
          hint={tooWeak ? t('protect.hint12') : undefined}
        />
        <PasswordField
          label={t('protect.confirmNew')}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={confirm && confirm !== password ? t('common.passwordsDiffer') : null}
        />
      </div>

      {error && <Callout tone="danger">{error}</Callout>}

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="primary" className="w-full" disabled={!ready || busy}>
          {busy ? <Spinner /> : null} {t('recoverAccount.submit')}
        </Button>
        <Footnote>{t('recoverAccount.note')}</Footnote>
        <Footnote>
          {t('recoverAccount.elsewhere')}{' '}
          <a
            href={ACCOUNT_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('accountPage.open')}
          </a>
        </Footnote>
      </div>
    </FormShell>
  );
}

/** How much of this device's vault the account now holds. */
export interface BackupCount {
  total: number;
  pending: number;
}

function backedUpLine({ total, pending }: BackupCount, t: Translator): string {
  if (total === 0) return t('ready.empty');
  if (pending === 0) return t('ready.all', { count: total });
  return t('ready.some', { done: total - pending, total });
}

/** Shown once, straight after the account is made. */
export function FreshRecoveryKey({
  backup,
  provider,
  children,
}: {
  backup: BackupCount;
  /** A Google or GitHub account, which has no password to forget. */
  provider?: SignInProvider | undefined;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mark icon={<KeyIcon />} />
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">{t('fresh.title')}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {backedUpLine(backup, t)}{' '}
              {provider ? t('fresh.provider', { provider: providerLabel(provider) }) : t('fresh.password')}
            </p>
          </div>
        </div>
        {children}
      </div>
    </AuthCard>
  );
}

/** Where the codes came from, in the words a person would use. */
function breakdown(sync: SyncSummary, total: number, t: Translator): string {
  const parts = [
    sync.pulled > 0 ? t('welcome.fromAccount', { count: sync.pulled }) : null,
    sync.pushed > 0 ? t('welcome.fromDevice', { count: sync.pushed }) : null,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(' · ');
  return total > 0 ? t('welcome.inSync') : t('welcome.nothing');
}

/**
 * The moment after joining an account: what arrived, and where to find it.
 *
 * Without it, signing in synced every code in the background and then showed
 * a settings page — nothing said the codes had arrived, or how many, or where
 * to look. A first sync that failed is said here too, as what it is: the
 * sign-in worked, the sync did not yet.
 */
export function SignedInWelcome({
  how,
  email,
  backup,
  sync,
  syncError,
  onRetry,
  onOpenAccounts,
  onDone,
}: {
  how: 'signIn' | 'recover';
  email: string;
  backup: BackupCount;
  sync: SyncSummary | null;
  syncError: string | null;
  onRetry: () => Promise<void>;
  onOpenAccounts: () => void;
  onDone: () => void;
}) {
  const t = useT();
  const [retrying, setRetrying] = useState(false);
  const failed = syncError !== null;

  async function retry() {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <AuthCard>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mark icon={failed ? <AlertIcon /> : <CheckIcon />} tone={failed ? 'warning' : 'success'} />
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">
              {failed ? t('welcome.failed') : how === 'recover' ? t('welcome.back') : t('welcome.signedIn')}
            </h2>
            <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">{email}</p>
          </div>
        </div>

        {failed ? (
          <Callout tone="warning">
            <p className="font-medium">{localise(syncError)}</p>
            <p className="mt-1">{t('welcome.nothingLost')}</p>
          </Callout>
        ) : (
          <div className="rounded-2xl bg-neutral-50 px-5 py-4 text-center dark:bg-neutral-900">
            <p className="text-[30px] leading-none font-semibold tracking-tight tabular-nums">
              {backup.total}
            </p>
            <p className="mt-1.5 text-[13px] font-medium">
              {t('welcome.onDevice', { count: backup.total })}
            </p>
            <p className="mt-1 text-[12px] text-neutral-600 dark:text-neutral-400">
              {sync ? breakdown(sync, backup.total, t) : null}
              {backup.pending > 0 && t('welcome.uploading', { count: backup.pending })}
            </p>
          </div>
        )}

        {how === 'recover' && !failed && (
          <p className="text-center text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t('welcome.othersSignedOut')}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {failed ? (
            <Button variant="primary" className="w-full" disabled={retrying} onClick={() => void retry()}>
              {retrying ? <Spinner /> : null} {t('welcome.tryAgain')}
            </Button>
          ) : (
            <Button variant="primary" className="w-full" onClick={onOpenAccounts}>
              {t('welcome.seeAccounts')}
            </Button>
          )}
          <Button className="w-full" onClick={onDone}>
            {t('common.done')}
          </Button>
        </div>

        {!failed && backup.total > 0 && (
          <Footnote>{t('welcome.toolbar')}</Footnote>
        )}
      </div>
    </AuthCard>
  );
}
