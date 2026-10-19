import { useEffect, useState } from 'react';
import { liveItems } from '@authx/core';
import { useActivityPing, useTheme, useVault } from '../components/hooks.js';
import { ArchiveIcon, CloudLockIcon, KeyIcon, Logo, SettingsIcon, ShieldIcon } from '../components/icons.js';
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
import { takeAccountRequest, takeScanRequest } from '../lib/deep-link.js';
import { SourceLink } from '../components/SourceLink.js';
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

export function App() {
  const t = useT();
  const { status, data, protection, error, refresh, mutate, setStatus } = useVault();
  const [tab, setTab] = useState<TabId>(OPENED_FOR_ACCOUNT ? 'sync' : 'accounts');
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
  const [scanPending, setScanPending] = useState(OPENED_TO_SCAN);

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
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <div className="mx-auto flex w-full max-w-5xl gap-12 px-6 py-10">
      <aside className="sticky top-10 flex h-[calc(100vh-5rem)] w-56 shrink-0 flex-col">
        <div className="mb-8 flex items-center gap-3 px-3">
          <Logo className="h-8 w-8" />
          <div className="leading-tight">
            <p className="text-[14.5px] font-semibold tracking-[-0.01em]">{APP_NAME}</p>
            <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
              {t('options.count', { count })}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              aria-current={tab === id ? 'page' : undefined}
              // Said beside the name, not in it: the tab is still "Security".
              aria-description={id === 'security' && !recoveryReady ? t('nav.needsAttention') : undefined}
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
              {id === 'security' && !recoveryReady && (
                <span className="ms-auto h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true" />
              )}
            </button>
          ))}
        </nav>

        {/* What someone deciding whether to trust this with their codes wants
            to know, where they can always see it — one line, not a card. */}
        <div className="mt-auto flex flex-col gap-1.5 px-3 text-[12px] text-neutral-600 dark:text-neutral-400">
          <p className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
            <ShieldIcon className="h-4 w-4 text-green-700 dark:text-green-300" />
            {t('common.encryptedHere')}
          </p>
          <SourceLink>{t('options.sourceOnGithub')}</SourceLink>
        </div>
      </aside>

      <main key={visit} className="min-w-0 max-w-[720px] flex-1 pb-16">
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
          />
        )}
        {tab === 'sync' && (
          <AccountPanel
            data={data}
            protectionMode={protection}
            // Only on the first visit: coming back to the tab later starts on its card.
            openOn={visit === 0 && OPENED_FOR_ACCOUNT !== 'account' ? OPENED_FOR_ACCOUNT : null}
            accountRecovery={status.accountRecovery}
            onOpenSecurity={() => go('security')}
            onOpenAccounts={() => go('accounts')}
          />
        )}
        {tab === 'general' && <GeneralPanel data={data} mutate={mutate} />}
      </main>
    </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo className="h-9 w-9 opacity-90" />
      {children}
    </div>
  );
}
