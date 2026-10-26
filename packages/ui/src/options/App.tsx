import { useEffect, useState } from 'react';
import { liveItems } from '@authx/core';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { useActivityPing, useTheme, useVault } from '../components/hooks.js';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ChevronIcon,
  CloudLockIcon,
  KeyIcon,
  Logo,
  SettingsIcon,
  ShieldIcon,
} from '../components/icons.js';
import { APP_NAME } from '../lib/name.js';
import { Spinner, cx } from '../components/primitives.js';
import { RecoveryScreen } from '../popup/RecoveryScreen.js';
import { SetupScreen } from '../popup/SetupScreen.js';
import { UnlockScreen } from '../popup/UnlockScreen.js';
import { AccountPanel } from './AccountPanel.js';
import { AccountsPanel } from './AccountsPanel.js';
import { BackupPanel } from './BackupPanel.js';
import { SecurityPanel } from './SecurityPanel.js';
import { GeneralPanel } from './GeneralPanel.js';
import { BackInHeader } from './Section.js';
import {
  requestAt,
  takeAccountRequest,
  takeScanRequest,
  type AccountRequest,
  type SettingsFragment,
} from '../lib/deep-link.js';
import { goBack, useBack } from '../lib/back.js';
import { SourceLink } from '../components/SourceLink.js';
import { host } from '../host.js';
import { useT } from '../i18n/react.js';

/** Sent here by the popup to scan, which it cannot ask for the camera to do. */
const OPENED_TO_SCAN = takeScanRequest();
/** Sent here by the popup to sign in, or to approve a browser asking to join. */
const OPENED_FOR_ACCOUNT = takeAccountRequest();

/**
 * One tab per job, in the order people need them. It was Accounts, "Backup &
 * import", Security, "Account & sync", About: two tabs both called account,
 * and Security holding the theme, the sort order and the language.
 */
const TABS = [
  { id: 'accounts', label: 'nav.accounts', Icon: KeyIcon },
  { id: 'sync', label: 'nav.sync', Icon: CloudLockIcon },
  { id: 'backup', label: 'nav.backup', Icon: ArchiveIcon },
  { id: 'security', label: 'nav.security', Icon: ShieldIcon },
  { id: 'general', label: 'nav.general', Icon: SettingsIcon },
] as const;

type TabId = (typeof TABS)[number]['id'];

/**
 * Sync only where this build has a server to sync with. Without one, the tab
 * could only describe what this build cannot do — in a browser's words, on a
 * phone that has no sync yet.
 */
const shownTabs = () => TABS.filter(({ id }) => id !== 'sync' || host().syncEnabled);

/**
 * Narrower than this, the tabs are a list and each one a page of its own:
 * a sidebar beside a panel does not fit a phone.
 */
const NARROW = '(max-width: 767px)';

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => matchMedia(NARROW).matches);
  useEffect(() => {
    const query = matchMedia(NARROW);
    const update = () => setNarrow(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

/** Settings, with a way back if one of its screens throws while drawing. */
export function App({
  openAt,
  onClose,
}: {
  /**
   * Where to open, in an app whose Settings opens over its codes on the same
   * page. The extension's comes in the address, read once as the page loads.
   */
  openAt?: SettingsFragment | undefined;
  /** Back to the codes, in such an app. A tab of its own has nowhere to go back to. */
  onClose?: (() => void) | undefined;
} = {}) {
  const opened = onClose
    ? requestAt(openAt)
    : { scan: OPENED_TO_SCAN, account: OPENED_FOR_ACCOUNT };
  return (
    <ErrorBoundary className="min-h-screen">
      <Settings opened={opened} onClose={onClose} />
    </ErrorBoundary>
  );
}

function Settings({
  opened,
  onClose,
}: {
  opened: { scan: boolean; account: AccountRequest | null };
  onClose: (() => void) | undefined;
}) {
  const t = useT();
  const { status, data, protection, error, refresh, mutate, setStatus } = useVault();
  const narrow = useNarrow();
  // Null is the list of tabs, which only a narrow window shows; a wide one
  // opens on Accounts beside it.
  const [chosen, setTab] = useState<TabId | null>(
    opened.account && host().syncEnabled ? 'sync' : opened.scan ? 'accounts' : null,
  );
  const tab = chosen ?? (narrow ? null : 'accounts');
  const [recovering, setRecovering] = useState(false);
  // Bumped on every click in the sidebar, so choosing the tab already open
  // goes back to its first page — out of Backup's import, say.
  const [visit, setVisit] = useState(0);
  const go = (next: TabId) => {
    setTab(next);
    setVisit((count) => count + 1);
  };
  // State rather than the constant: the Accounts panel remounts every time
  // its tab is chosen, and would otherwise open the camera again each time.
  const [scanPending, setScanPending] = useState(opened.scan);
  // Out of a tab to the list, in a narrow window; then out of Settings.
  const leaveTab = narrow && chosen !== null;
  useBack(leaveTab || onClose !== undefined, () => (leaveTab ? setTab(null) : onClose?.()));

  useTheme(data?.settings.theme);
  useActivityPing(status?.state === 'unlocked');

  // Opened from the popup while this tab sat on the recovery form: there is
  // nothing left to recover, and the next lock should ask for the password,
  // not bring the form back.
  useEffect(() => {
    if (status?.state === 'unlocked') setRecovering(false);
  }, [status?.state]);

  if (error) {
    return (
      <Shell>
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      </Shell>
    );
  }

  if (!status) {
    return (
      <Shell>
        <Spinner className="h-5 w-5 text-neutral-400" />
      </Shell>
    );
  }

  if (status.state !== 'unlocked' || !data || !protection) {
    const hasRecovery = status.state === 'uninitialized' ? false : status.hasRecovery;
    const authenticated = (next: typeof status) => {
      setRecovering(false);
      setStatus(next);
    };

    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 app:min-h-(--app-height)">
        <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800">
          {recovering ? (
            <RecoveryScreen onRecovered={authenticated} onCancel={() => setRecovering(false)} />
          ) : status.state === 'uninitialized' ? (
            <SetupScreen
              onCreating={(then) => {
                if (then === 'signIn') setTab('sync');
              }}
              onCreated={authenticated}
            />
          ) : (
            <UnlockScreen
              onUnlocked={authenticated}
              hasRecovery={hasRecovery}
              onUseRecoveryKey={() => setRecovering(true)}
              passkeys={status.state === 'locked' ? status.passkeys : undefined}
            />
          )}
        </div>
      </div>
    );
  }

  const count = liveItems(data).length;
  const signedIn = Boolean(data.account.email) && data.account.plan === 'synced';
  // The one thing that can still go permanently wrong, marked where it is fixed.
  const recoveryReady = status.hasRecovery && (!signedIn || status.accountRecovery);

  const identity = (
    <div className="flex items-center gap-3 px-3">
      <Logo className="h-8 w-8" />
      <div className="leading-tight">
        <p className="text-[14.5px] font-semibold tracking-[-0.01em]">{APP_NAME}</p>
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('options.count', { count })}</p>
      </div>
    </div>
  );

  // Said beside the name, not in it: the tab is still "Security".
  const attention = (id: TabId) =>
    id === 'security' && !recoveryReady ? t('nav.needsAttention') : undefined;
  const dot = <span className="ms-auto h-2 w-2 shrink-0 rounded-full bg-yellow-500" aria-hidden="true" />;

  // What someone deciding whether to trust this with their codes wants to
  // know, where they can always see it — one line, not a card.
  const trust = (
    <div className="flex flex-col gap-1.5 px-3 text-[12px] text-neutral-600 dark:text-neutral-400">
      <p className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
        <ShieldIcon className="h-4 w-4 text-green-700 dark:text-green-300" />
        {t('common.encryptedHere')}
      </p>
      <SourceLink>{t('options.sourceOnGithub')}</SourceLink>
    </div>
  );

  const panel = (
    <>
      {tab === 'accounts' && (
        <AccountsPanel
          data={data}
          mutate={mutate}
          scanOnOpen={scanPending}
          onScanOpened={() => setScanPending(false)}
        />
      )}
      {tab === 'backup' && <BackupPanel data={data} mutate={mutate} protectionMode={protection} />}
      {tab === 'security' && (
        <SecurityPanel
          data={data}
          mutate={mutate}
          refresh={refresh}
          protectionMode={protection}
          hasRecovery={status.hasRecovery}
          signedIn={signedIn}
          accountRecovery={status.accountRecovery}
          passkeys={status.passkeys}
        />
      )}
      {tab === 'sync' && (
        <AccountPanel
          data={data}
          protectionMode={protection}
          // Only on the first visit: coming back to the tab later starts on its card.
          openOn={visit === 0 && opened.account !== 'account' ? opened.account : null}
          accountRecovery={status.accountRecovery}
          onOpenSecurity={() => go('security')}
          onOpenAccounts={() => go('accounts')}
        />
      )}
      {tab === 'general' && <GeneralPanel data={data} mutate={mutate} />}
    </>
  );

  if (narrow) {
    // A phone's Settings: the tabs as a list, each one a page with the way
    // back to it, and the list with the way back to the codes when there are
    // codes under it. Inside a tab the arrow is the phone's back: it leaves
    // whatever was opened last — a page of the tab before the tab itself.
    const back = tab !== null ? goBack : onClose;
    return (
      <div className="min-h-screen bg-neutral-50 app:min-h-(--app-height) dark:bg-neutral-950">
        <header className="sticky top-0 z-10 flex min-h-12 items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-3 py-2 dark:border-neutral-900 dark:bg-neutral-950">
          {back && (
            <button
              type="button"
              onClick={back}
              aria-label={t('common.back')}
              className="rounded-lg p-1.5 text-base text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              <ArrowLeftIcon />
            </button>
          )}
          <p className={cx('text-[15px] font-semibold', !back && 'px-1.5')}>{t('vault.settings')}</p>
        </header>

        {tab === null ? (
          <div className="flex flex-col gap-6 py-6">
            {identity}
            <nav className="mx-3 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900/60">
              {shownTabs().map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  aria-description={attention(id)}
                  className="flex w-full items-center gap-3 border-b border-neutral-100 px-4 py-3.5 text-start text-[14.5px] font-medium last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-900"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <span className="min-w-0 flex-1">{t(label)}</span>
                  {attention(id) && dot}
                  <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                </button>
              ))}
            </nav>
            {trust}
          </div>
        ) : (
          <main key={visit} className="min-w-0 px-4 pb-16 pt-6">
            <BackInHeader.Provider value={true}>{panel}</BackInHeader.Provider>
          </main>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-5xl gap-12 px-6 py-10">
        <aside className="sticky top-10 flex h-[calc(100vh-5rem)] w-56 shrink-0 flex-col">
          <div className="mb-8">{identity}</div>

          <nav className="flex flex-col gap-1">
            {shownTabs().map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={tab === id ? 'page' : undefined}
                aria-description={attention(id)}
                className={cx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[14px] font-medium transition-colors',
                  tab === id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200',
                )}
              >
                <Icon
                  className={cx(
                    'h-[18px] w-[18px] shrink-0',
                    tab === id ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400 dark:text-neutral-500',
                  )}
                />
                {t(label)}
                {attention(id) && dot}
              </button>
            ))}
          </nav>

          <div className="mt-auto">{trust}</div>
        </aside>

        <main key={visit} className="min-w-0 max-w-[720px] flex-1 pb-16">
          {panel}
        </main>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 app:min-h-(--app-height)">
      <Logo className="h-9 w-9 opacity-90" />
      {children}
    </div>
  );
}
