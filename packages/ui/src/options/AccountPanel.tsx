import { useEffect, useState, type ReactNode } from 'react';
import {
  accountCodeItem,
  liveItems,
  type SignInProvider,
  type VaultData,
} from '@authx/core';
import { host } from '../host.js';
import { send, type KeptArchive, type ProviderToPassword, type SignInResult, type SyncSummary } from '../lib/protocol.js';
import { accountPageUrl, type AccountPageView } from '../lib/links.js';
import { Button, Callout, Field, Spinner } from '../components/primitives.js';
import {
  DevicesIcon,
  DownloadIcon,
  ExternalIcon,
  HistoryIcon,
  MailIcon,
  SignOutIcon,
  SyncIcon,
  TrashIcon,
  UserIcon,
} from '../components/icons.js';
import { RecoveryKeySheet } from './RecoveryKeySheet.js';
import { PasswordField } from '../components/password.js';
import { PageHeader, Row, Section } from './Section.js';
import { FreshRecoveryKey, SignedInWelcome, SyncAuth, type BackupCount } from './SyncAuth.js';
import { askToSend } from './auth-ui.js';
import { PairingRequests, ProviderMark, providerLabel } from './ProviderSignIn.js';
import { RemovedFromAccount } from '../components/RemovedFromAccount.js';
import { StartOverWaiting } from '../components/StartOverWaiting.js';
import { errorKey, errorText, localise } from '../i18n/error-text.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { useT } from '../i18n/react.js';

export function AccountPanel({
  data,
  protectionMode,
  accountRecovery,
  openOn,
  onOpenSecurity,
  onOpenAccounts,
}: {
  data: VaultData;
  protectionMode: 'device' | 'passphrase';
  accountRecovery: boolean;
  /** The email form the popup asked for, if it asked for one. */
  openOn?: 'signIn' | 'create' | 'passkey' | null;
  onOpenSecurity: () => void;
  onOpenAccounts: () => void;
}) {
  const t = useT();
  const signedIn = Boolean(data.account.email) && data.account.plan === 'synced';
  // An address kept with a local plan means the server ended this device's
  // session; a deliberate sign-out forgets the address too.
  const signedOutElsewhere = !signedIn ? data.account.email : null;
  // Signed in with Google or GitHub: no account password exists to ask for.
  const provider = data.account.method === 'provider' ? data.account.provider : undefined;
  // Such an account signed in with a passkey, which does not say which of the two.
  const providerAccount = data.account.method === 'provider';
  // Issued with the account itself. Held here, above the forms, because the
  // sign-up form is gone the moment the account exists.
  const [freshKey, setFreshKey] = useState<string | null>(null);
  // What the first sync after joining did, until the user has seen it.
  const [welcome, setWelcome] = useState<
    (Omit<SignInResult, 'status'> & { how: 'signIn' | 'recover' }) | null
  >(null);
  // A sign-in made in this tab with Google or GitHub, just back from the
  // provider: shown as what it came to, the way a sign-in on this page is.
  // Nothing is drawn until it is known, or the signed-out card would flash
  // before the welcome.
  const [returned, setReturned] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerErrorKey, setProviderErrorKey] = useState<MessageKey | undefined>(undefined);
  // Google or GitHub signed in to an account with a password: its form, next.
  const [toPassword, setToPassword] = useState<ProviderToPassword | null>(null);
  useEffect(() => {
    if (!host().syncEnabled) {
      setReturned(true);
      return;
    }
    void send({ type: 'provider/outcome' })
      .then((outcome) => {
        if (outcome?.kind === 'signedIn') {
          setWelcome({ how: 'signIn', sync: outcome.sync, syncError: outcome.syncError });
        }
        if (outcome?.kind === 'error') {
          setProviderError(localise(outcome.message, outcome.key, outcome.values));
          setProviderErrorKey(outcome.key ?? errorKey(new Error(outcome.message)));
        }
        if (outcome?.kind === 'password') setToPassword(outcome);
      })
      .catch(() => undefined)
      .finally(() => setReturned(true));
  }, []);

  // Read from the vault itself, so the numbers are what this device now holds
  // rather than what one sync call happened to report.
  const live = liveItems(data);
  const backup: BackupCount = {
    total: live.length,
    pending: live.filter((item) => item.rev > item.syncedRev).length,
  };

  if (!returned) return null;

  if (welcome && signedIn) {
    return (
      <SignedInWelcome
        how={welcome.how}
        email={data.account.email!}
        backup={backup}
        sync={welcome.sync}
        syncError={welcome.syncError}
        onRetry={async () => {
          try {
            await askToSend();
            const sync = await send({ type: 'account/sync' });
            setWelcome({ ...welcome, sync, syncError: null });
          } catch (cause) {
            setWelcome({
              ...welcome,
              syncError: errorText(cause),
            });
          }
        }}
        onOpenAccounts={() => {
          setWelcome(null);
          onOpenAccounts();
        }}
        onDone={() => setWelcome(null)}
      />
    );
  }

  if (freshKey) {
    return (
      <FreshRecoveryKey backup={backup} provider={provider}>
        <RecoveryKeySheet
          recoveryKey={freshKey}
          onDone={() => setFreshKey(null)}
          wide
          apart={provider ? 'provider' : 'password'}
        />
      </FreshRecoveryKey>
    );
  }

  if (!signedIn && host().syncEnabled) {
    return (
      <div className="flex flex-col gap-6 pt-2">
        <div className="empty:hidden">
          <RemovedFromAccount />
        </div>
        <SyncAuth
          protectionMode={protectionMode}
          signedOutElsewhere={signedOutElsewhere}
          signedOutProvider={provider}
          initialStep={openOn ?? undefined}
          onSignedUp={(recoveryKey) => setFreshKey(recoveryKey)}
          onSignedIn={({ sync, syncError }, how) => setWelcome({ how, sync, syncError })}
          providerError={providerError}
          providerErrorKey={providerErrorKey}
          providerToPassword={toPassword}
          introFooter={<LocalVaultFacts compact />}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.sync')} description={t('sync.description')} />
      {/* Above everything: the one thing here that cannot wait. */}
      {signedIn && (
        <div className="mb-8 empty:hidden">
          <StartOverWaiting fresh />
        </div>
      )}
      {signedIn && providerAccount && <PairingRequests provider={provider} />}
      <Section title={t('account.title')}>
        <div className="flex flex-col gap-4 p-4">
          {signedIn ? (
            <SignedIn
              data={data}
              provider={provider}
              accountRecovery={accountRecovery}
              onOpenSecurity={onOpenSecurity}
            />
          ) : (
            <NotAvailableYet />
          )}
        </div>
      </Section>

      {signedIn ? (
        <>
          <KeptSection />
          <SecondStepSection data={data} />
          <AccountPageSection rooted={Boolean(data.account.keys)} provider={providerAccount} />
        </>
      ) : (
        <LocalVaultFacts />
      )}
    </>
  );
}

function LocalVaultFacts({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const facts = (
    <dl className="divide-y divide-neutral-100 text-[13px] dark:divide-neutral-900">
      {/* Every line here states what *this build* does, read from the same
          flags that govern it. The table once printed a five-account cap
          the build did not enforce — shown beside a vault holding seven,
          and in a store screenshot, where it could only put people off a
          limit that did not exist. */}
      <Fact term={t('facts.stored')} detail={t('facts.noLimit')} />
      <Fact term={t('facts.encryption')} detail="AES-256-GCM" />
      <Fact term={t('facts.autofill')} detail={t('facts.included')} />
      <Fact term={t('facts.backup')} detail={t('facts.included')} />
      <Fact term={t('facts.sync')} detail={host().syncEnabled ? t('facts.needsAccount') : t('facts.notYet')} />
    </dl>
  );

  // Under the sign-up card it keeps to the card's column: a full-width table
  // beneath a centred card reads as two unrelated pages.
  if (compact) {
    return (
      <div className="kr-explain mx-auto w-full max-w-[400px]">
        <p className="mb-2 px-1 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
          {t('facts.withoutAccount')}
        </p>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800">{facts}</div>
      </div>
    );
  }

  return (
    <Section
      title={t('facts.title')}
      description={t('facts.description')}
    >
      {facts}
    </Section>
  );
}

/** Only in a build made with sync switched off: the store's builds have it. */
function NotAvailableYet() {
  const t = useT();
  return (
    <div>
      <p className="text-[13px] font-medium">{t('account.localOnly')}</p>
      <p className="mt-0.5 text-[12px] text-neutral-600 dark:text-neutral-400">{t('account.noServer')}</p>
    </div>
  );
}

function SignedIn({
  data,
  provider,
  accountRecovery,
  onOpenSecurity,
}: {
  data: VaultData;
  provider: SignInProvider | undefined;
  accountRecovery: boolean;
  onOpenSecurity: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<SyncSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSync = data.sync.lastSyncAt;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Wraps: in a narrow window, or on a phone set to large text, the
          buttons were pushed past the card's edge, out of reach. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-2.5 app:w-full app:gap-4">
          {/* On a phone, whose account it is, as an app shows it: its initial. */}
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-500 text-[20px] font-medium text-white uppercase app:grid">
            {data.account.email?.slice(0, 1)}
          </span>
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-500 app:hidden" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="truncate text-[13px] font-medium app:text-[14.5px]" title={data.account.email ?? undefined}>
                {data.account.email}
              </p>
              {/* Beside the address, where someone looks to change it. A
                  phone lists it with the page's other views below instead,
                  as an item a finger can hit. */}
              <a
                href={accountPageUrl('profile')}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-[12px] font-medium text-brand-600 hover:underline app:hidden dark:text-brand-400"
              >
                {t('accountPage.changeAddress')}
              </a>
            </div>
            <p className="mt-0.5 text-[12px] text-neutral-600 dark:text-neutral-400">
              <span className="me-1.5 hidden h-2 w-2 rounded-full bg-green-500 align-middle app:inline-block" aria-hidden="true" />
              {provider && (
                <>
                  <ProviderMark provider={provider} className="me-1 inline h-3 w-3 align-[-1px]" />
                  {t('account.signedInWith', { provider: providerLabel(provider) })}
                </>
              )}
              {lastSync
                ? t('account.lastSynced', { time: new Date(lastSync).toLocaleTimeString(t.locale) })
                : t('account.notSynced')}
              {t('account.every5')}
            </p>
          </div>
        </div>
        {/* Side by side while both fit whole, one under the other once a
            phone's text is too large for that. */}
        <div className="flex flex-wrap gap-2 app:w-full">
          <Button
            disabled={busy}
            className="app:flex-1 app:basis-36 app:rounded-full app:whitespace-nowrap!"
            // Firefox asks again here if its leave was taken back in about:addons.
            onClick={() =>
              run(async () => {
                await askToSend();
                setSummary(await send({ type: 'account/sync' }));
              })
            }
          >
            {busy ? <Spinner /> : <SyncIcon className="hidden app:inline" />} {t('account.syncNow')}
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            className="app:flex-1 app:basis-36 app:rounded-full app:whitespace-nowrap! app:text-red-600 app:ring-1 app:ring-neutral-300 dark:app:text-red-300 dark:app:ring-neutral-700"
            onClick={() => run(() => send({ type: 'account/signOut' }))}
          >
            <SignOutIcon className="hidden app:inline" /> {t('account.signOut')}
          </Button>
        </div>
      </div>

      {error && <Callout tone="danger">{error}</Callout>}

      {!sheetProtects(data, accountRecovery) && (
        // The one thing that can still go permanently wrong for a synced
        // vault, so it sits on this page and not only under Security. An
        // account with a root makes its recovery key on the account page; one
        // without makes it here, and the page would only send it back.
        <Callout tone="warning">
          {data.account.keys ? (
            // Only this app can record that the key protects it, so the way
            // to settle it is here, under Security; the page makes a new one.
            <>
              <p>{t('accountPage.noSheetYet')}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button type="button" onClick={onOpenSecurity} className="font-medium underline underline-offset-2">
                  {t('account.checkUnderSecurity')}
                </button>
                <AccountPageLink view="recovery">{t('accountPage.open')}</AccountPageLink>
              </div>
            </>
          ) : (
            <>
              <p>
                {provider
                  ? t('account.noKitProvider', { provider: providerLabel(provider) })
                  : t('account.noKit')}
              </p>
              <button
                type="button"
                onClick={onOpenSecurity}
                className="mt-1.5 font-medium underline underline-offset-2"
              >
                {t('account.createUnderSecurity')}
              </button>
            </>
          )}
        </Callout>
      )}

      {summary && (
        <Callout tone={summary.rejectedRecords > 0 ? 'warning' : 'info'}>
          {t('summary.sentReceived', { sent: summary.pushed, received: summary.pulled })}
          {summary.conflicts > 0 && t('summary.conflicts', { count: summary.conflicts })}
          {summary.rejectedForLimit > 0 && t('summary.overLimit', { count: summary.rejectedForLimit })}
          {t('summary.end')}
          {/* A mass deletion arriving from the server should never be silent.
              Everything removed is restorable from Recently deleted. */}
          {summary.deleted > 0 && t('summary.deleted', { count: summary.deleted })}
          {summary.rejectedRecords > 0 && t('summary.rejected', { count: summary.rejectedRecords })}
        </Callout>
      )}

      <p className="kr-explain text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t('account.signOutNote')}
      </p>
    </div>
  );
}

/**
 * Whether the account's recovery key is known to protect this app. On an
 * account with keys per product, this device has seen it do so — made here,
 * or typed here — or the pin says so; before them, the kit this device holds
 * is the account's.
 */
export function sheetProtects(data: VaultData, accountRecovery: boolean): boolean {
  const keys = data.account.keys;
  return keys ? keys.sheetVerifiedAt !== null : accountRecovery;
}

/**
 * The account itself — its address, its password, its recovery key, its
 * recent activity, a download of what the server holds, starting it over,
 * deleting it — is managed on the account page, for every Keyrook app at
 * once. This app keeps signing in, and what only it can do; it links to the
 * rest and never makes those requests itself. An account without a root is
 * the exception: the page changes its password, if it has one, and deletes
 * it, and its recovery key is this app's, under Security.
 */
function AccountPageSection({ rooted, provider }: { rooted: boolean; provider: boolean }) {
  const t = useT();
  if (host().device === 'phone') {
    return (
      <Section>
        <AccountPageItem view="profile" icon={<MailIcon />}>
          {t('accountPage.address')}
        </AccountPageItem>
        <AccountPageItem view="devices" icon={<DevicesIcon />}>
          {t('devices.title')}
        </AccountPageItem>
        <AccountPageItem view="activity" icon={<HistoryIcon />}>
          {t('accountPage.activity')}
        </AccountPageItem>
        <AccountPageItem view="data" icon={<DownloadIcon />}>
          {t('accountPage.data')}
        </AccountPageItem>
        <AccountPageItem icon={<UserIcon />}>{t('accountPage.title')}</AccountPageItem>
        {/* Google Play asks every app that makes accounts for a way to delete
            one from inside it. The phone hides the sentence that says the
            page does it, so the way is a row of its own: Your data, where the
            page keeps deleting the account. */}
        <AccountPageItem view="data" icon={<TrashIcon />}>
          {t('delete.row')}
        </AccountPageItem>
      </Section>
    );
  }
  // A Google or GitHub account has no password to point to.
  const body = provider
    ? rooted ? t('accountPage.bodyProvider') : t('accountPage.bodyNoRootProvider')
    : rooted ? t('accountPage.body') : t('accountPage.bodyNoRoot');
  // Every row's button has the same words, so each row names its group.
  return (
    <Section>
      {/* Listed, signed out and removed there, for every Keyrook app at once:
          a list of its own here was a second place to do the same thing. */}
      <Row
        label={t('devices.title')}
        name={t('devices.title')}
        description={t('devices.onAccountPage')}
        control={<AccountPageLink view="devices">{t('accountPage.open')}</AccountPageLink>}
      />
      <Row
        label={t('accountPage.activity')}
        name={t('accountPage.activity')}
        description={t('accountPage.activityBody')}
        control={<AccountPageLink view="activity">{t('accountPage.open')}</AccountPageLink>}
      />
      {/* Not this app's export: the server's download holds no codes and no
          keys, which is said here so nobody takes it for a backup. */}
      <Row
        label={t('accountPage.data')}
        name={t('accountPage.data')}
        description={t('accountPage.dataBody')}
        control={<AccountPageLink view="data">{t('accountPage.open')}</AccountPageLink>}
      />
      <Row
        label={t('accountPage.title')}
        name={t('accountPage.title')}
        description={body}
        control={<AccountPageLink>{t('accountPage.open')}</AccountPageLink>}
      />
    </Section>
  );
}

/** On a phone, a page of the account page as an item of the list, marked as leaving the app. */
function AccountPageItem({ children, icon, view }: { children: ReactNode; icon: ReactNode; view?: AccountPageView }) {
  return (
    <a
      href={accountPageUrl(view)}
      target="_blank"
      rel="noreferrer"
      className="my-0 flex items-center gap-4 border-b border-neutral-100 px-4 py-3 last:border-b-0 active:bg-neutral-100 dark:border-neutral-800 dark:active:bg-neutral-800"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-[20px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-[14.5px]">{children}</span>
      <ExternalIcon className="shrink-0 text-[20px] text-neutral-400 dark:text-neutral-500" />
    </a>
  );
}

export function AccountPageLink({ children, view }: { children: ReactNode; view?: AccountPageView }) {
  return (
    <a
      href={accountPageUrl(view)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-8 shrink-0 items-center rounded-lg bg-neutral-100 px-3 py-1.5 text-[13px] font-medium app:min-h-11 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
    >
      {children}
    </a>
  );
}

/**
 * Two-step sign-in, where this app can help: keeping the code that signs in
 * to this very account. Shown once the server offers it, or once that code is
 * kept here — and always with what keeping it here means. It lives where the
 * account opens it, on every browser signed in and nowhere else, so losing
 * them all leaves the recovery key as the way back in.
 */
function SecondStepSection({ data }: { data: VaultData }) {
  const t = useT();
  const [offered, setOffered] = useState(false);
  useEffect(() => {
    void send({ type: 'provider/offered' })
      .then((offer) => setOffered(offer.secondStep === true))
      .catch(() => undefined);
  }, []);
  const kept = accountCodeItem(data) !== null;
  if (!offered && !kept) return null;
  return (
    <Section title={t('secondStepTip.title')}>
      <div className="flex flex-col gap-3 p-4">
        <p className="kr-explain max-w-[68ch] text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
          {kept ? t('secondStepTip.kept') : t('secondStepTip.suggest', { scan: t('add.page.title') })}
        </p>
        {/* On a phone, said once the code is kept here and there is something to lose. */}
        <div className={kept ? undefined : 'kr-explain'}>
          <Callout tone="warning">{t('secondStepTip.warning')}</Callout>
        </div>
        {!kept && (
          <div>
            <AccountPageLink view="signin">{t('secondStepTip.open')}</AccountPageLink>
          </div>
        )}
      </div>
    </Section>
  );
}

/**
 * What the account kept of this app's when it started over with its email
 * alone. Only the password or the recovery key of then opens it, so it is
 * asked for here, and what opens comes back into this vault.
 */
function KeptSection() {
  const t = useT();
  const [kept, setKept] = useState<KeptArchive[]>([]);
  const [with_, setWith] = useState<'password' | 'recoveryKey'>('password');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void send({ type: 'account/archives' })
      .then((archives) => {
        setKept(archives);
        if (archives[0] && !archives[0].byPassword) setWith('recoveryKey');
      })
      .catch(() => undefined);
  }, []);

  const archive = kept[0];
  if (!archive && !done) return null;

  async function bring() {
    if (!archive) return;
    setBusy(true);
    setError(null);
    try {
      await send({
        type: 'account/bringBack',
        archiveId: archive.id,
        ...(with_ === 'password' ? { password: secret } : { recoveryKey: secret }),
      });
      setDone(true);
      setKept((current) => current.filter((candidate) => candidate.id !== archive.id));
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
      setSecret('');
    }
  }

  return (
    <Section title={t('kept.title')}>
      <div className="flex max-w-md flex-col gap-3 p-4">
        {done ? (
          <Callout tone="info">{t('kept.done')}</Callout>
        ) : (
          archive && (
            <>
              <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t('kept.body', { date: new Date(archive.expiresAt).toLocaleDateString(t.locale) })}
              </p>
              {with_ === 'password' ? (
                <PasswordField label={t('kept.password')} value={secret} onChange={setSecret} autoComplete="current-password" />
              ) : (
                <Field
                  label={t('kept.recoveryKey')}
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono"
                />
              )}
              {archive.byPassword && archive.byRecoveryKey && (
                <button
                  type="button"
                  onClick={() => {
                    setWith(with_ === 'password' ? 'recoveryKey' : 'password');
                    setSecret('');
                  }}
                  className="self-start text-[12px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {with_ === 'password' ? t('kept.useRecoveryKey') : t('kept.usePassword')}
                </button>
              )}
              {error && <Callout tone="danger">{error}</Callout>}
              <Button variant="primary" disabled={busy || secret.length === 0} onClick={() => void bring()} className="self-start">
                {busy ? <Spinner /> : null} {t('kept.bring')}
              </Button>
            </>
          )
        )}
      </div>
    </Section>
  );
}

function Fact({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="font-medium">{term}</dt>
      <dd className="text-end text-neutral-600 dark:text-neutral-400">{detail}</dd>
    </div>
  );
}
