import { useEffect, useMemo, useState } from 'react';
import {
  isValidBase32,
  itemForShortcutFill,
  itemMatchesHost,
  liveItems,
  shouldWarnBeforeFilling,
  sectionItems,
  sortItems,
  type ProtectionMode,
  type VaultData,
  type VaultItem,
} from '@authx/core';
import { send, type FieldDetection, type Mutate, type TabContext } from '../lib/protocol.js';
import { useCodes, useCopy, useNow } from '../components/hooks.js';
import { LockIcon, Logo, PlusIcon, SearchIcon, SettingsIcon, ShieldIcon } from '../components/icons.js';
import { Button, Callout, cx } from '../components/primitives.js';
import { AccountRow } from './AccountRow.js';
import { AddSheet } from './AddSheet.js';
import { RatePrompt } from './RatePrompt.js';
import { RemovedFromAccount } from '../components/RemovedFromAccount.js';
import { StartOverWaiting } from '../components/StartOverWaiting.js';
import { ShareSheet } from './ShareSheet.js';
import { SignInSheet } from './SignInSheet.js';
import { FILL_COMMAND } from '../lib/commands.js';
import { Keys, useShortcuts } from '../components/shortcuts.js';
import { loadRating, recordUse, shouldAsk, updateRating } from '../lib/rating.js';
import { ACCOUNT_FRAGMENT, SCAN_FRAGMENT } from '../lib/deep-link.js';
import { host } from '../host.js';
import { SourceLink } from '../components/SourceLink.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { titleOf } from '../i18n/titles.js';

export function VaultScreen({
  data,
  protection,
  mutate,
  refresh,
  startWithSignIn = false,
}: {
  data: VaultData;
  protection: ProtectionMode;
  mutate: Mutate;
  refresh: () => Promise<void>;
  /** Made a moment ago by "Already use Keyrook Authenticator? Sign in". */
  startWithSignIn?: boolean;
}) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  // The popup cannot hold a sign-in, which leaves for the provider's page and
  // comes back: it shows the choices and sends the person on to Settings. An
  // app's window holds Settings itself, so its sign-in goes straight there.
  const [signingIn, setSigningIn] = useState(startWithSignIn && host().overPage);
  const signIn = () => (host().overPage ? setSigningIn(true) : void host().openSettings(ACCOUNT_FRAGMENT));
  useEffect(() => {
    if (startWithSignIn && !host().overPage) void host().openSettings(ACCOUNT_FRAGMENT);
  }, []);
  const [sharing, setSharing] = useState<VaultItem | null>(null);
  const [tab, setTab] = useState<TabContext | null>(null);
  const [fields, setFields] = useState<FieldDetection | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmFill, setConfirmFill] = useState<VaultItem | null>(null);

  const now = useNow();
  const { copiedId, copy } = useCopy();

  const all = useMemo(() => sortItems(liveItems(data), data.settings.sortBy), [data]);
  const codes = useCodes(all, now);

  // An app's codes screen sits over no page: no site to sort by or fill into.
  useEffect(() => {
    if (host().overPage) void send({ type: 'tab/context' }).then(setTab);
  }, []);

  // A browser waiting on this one to let it into the account. Looked for
  // only on a Google or GitHub account: a password account's browsers join
  // with the password, and never ask.
  const [joinRequests, setJoinRequests] = useState(0);
  const approves = data.account.method === 'provider' && data.account.plan === 'synced';
  useEffect(() => {
    if (!approves) return;
    void send({ type: 'pairing/list' })
      .then((requests) => setJoinRequests(requests.filter((request) => request.approverKey === null).length))
      .catch(() => undefined);
  }, [approves]);

  // Decided once, as the popup opens: a prompt that appeared mid-copy would
  // move the list under the pointer.
  const [askRating, setAskRating] = useState(false);
  useEffect(() => {
    void loadRating().then((state) => setAskRating(shouldAsk(state, Date.now())));
  }, []);
  const countUse = () => updateRating((state) => recordUse(state, Date.now()));

  // Probing for OTP fields injects the content script, so it only happens when
  // autofill is switched on and only for the tab the user opened the popup on.
  useEffect(() => {
    if (!data.settings.autofillEnabled || !tab?.hostname) return;
    void send({ type: 'tab/detectFields' })
      .then(setFields)
      .catch(() => setFields(null));
  }, [data.settings.autofillEnabled, tab?.hostname]);

  const suggested = useMemo(
    () => (tab?.hostname ? all.filter((item) => itemMatchesHost(item, tab.hostname!)) : []),
    [all, tab?.hostname],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((item) =>
      `${item.issuer} ${item.label} ${item.note}`.toLowerCase().includes(needle),
    );
  }, [all, query]);

  const suggestedIds = new Set(suggested.map((item) => item.id));
  const rest = query ? filtered : filtered.filter((item) => !suggestedIds.has(item.id));
  // Searching flattens the groups: when someone is hunting for one account,
  // headings are in the way rather than helping.
  const sections = useMemo(
    () => (query ? [{ id: null, name: '', color: null, items: rest }] : sectionItems(data, rest)),
    [data, rest, query],
  );
  const canFill = Boolean(fields?.found) && data.settings.autofillEnabled;
  // Taught where it would have worked: this page, this account, one key.
  const shortcuts = useShortcuts();
  const fillKeys = shortcuts?.[FILL_COMMAND] ?? '';
  const shortcutWouldFill = canFill && fillKeys !== '' && itemForShortcutFill(all, tab?.hostname ?? null) !== null;
  const sortedByName = data.settings.sortBy === 'name';
  // Shown where people look every day, not only in Settings: a vault signed in
  // to an account its owner does not recognise should be hard to miss.
  const syncedAs = data.account.plan === 'synced' ? data.account.email : null;
  // Not signed in, in a build that can be: the way in is offered where the
  // sync state would otherwise say who this vault syncs as.
  const canSignIn = host().syncEnabled && !syncedAs;

  async function fill(item: VaultItem, confirmed = false) {
    const code = codes[item.id];
    if (!code) return;

    if (!confirmed && shouldWarnBeforeFilling(item, tab?.hostname ?? null)) {
      setConfirmFill(item);
      return;
    }

    setConfirmFill(null);
    try {
      await send({ type: 'tab/fill', code });
      await countUse();
      window.close();
    } catch (cause) {
      setNotice(errorText(cause));
    }
  }

  function rowProps(item: VaultItem) {
    return {
      item,
      code: codes[item.id],
      now,
      hideCodes: data.settings.hideCodes,
      copied: copiedId === item.id,
      canFill,
      onCopy: () => {
        const code = codes[item.id];
        // An account with no key shows dashes, which are not worth a clipboard.
        if (code && isValidBase32(item.secret)) void copy(item.id, code).then(countUse);
      },
      onFill: () => void fill(item),
      onToggleFavorite: () =>
        void mutate({ op: 'items/update', id: item.id, patch: { favorite: !item.favorite } }),
      onAdvanceCounter: () => void mutate({ op: 'items/advanceCounter', id: item.id }),
      onShare: () => setSharing(item),
    };
  }

  return (
    <div className="relative flex h-[520px] flex-col app:h-(--app-height)">
      <header className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5 dark:border-neutral-900">
        <Logo className="h-6 w-6 shrink-0" compact />
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 start-2.5 -translate-y-1/2 text-[15px] text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('vault.search')}
            aria-label={t('vault.search')}
            className="h-8 w-full rounded-lg border border-transparent bg-neutral-100 pe-2 ps-8 text-[13px] placeholder:text-neutral-400 focus:border-brand-400 focus:bg-white dark:bg-neutral-900 dark:focus:bg-neutral-900"
          />
        </div>
        <IconButton label={t('vault.add')} onClick={() => setAdding(true)}>
          <PlusIcon />
        </IconButton>
        <IconButton label={t('vault.settings')} onClick={() => void host().openSettings()}>
          <SettingsIcon />
        </IconButton>
        {/* Nothing to lock when the key comes from the device itself. */}
        {protection === 'passphrase' && (
          <IconButton
            label={t('vault.lock')}
            onClick={async () => {
              await send({ type: 'vault/lock' });
              await refresh();
            }}
          >
            <LockIcon />
          </IconButton>
        )}
      </header>

      {(all.length > 1 || syncedAs || (canSignIn && all.length > 0)) && (
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-3.5 py-1.5 text-[11px] dark:border-neutral-900">
          {/* Each part truncates on its own: one truncating line swallowed the
              sign-in link whole wherever its words ran longer than English's,
              leaving "3 accounts · …" and nothing to press. */}
          <span className="flex min-w-0 items-baseline text-neutral-400 dark:text-neutral-500">
            <span className="shrink-0">{t('vault.count', { count: all.length })}</span>
            {syncedAs && (
              <span className="min-w-0 truncate" title={t('vault.syncedWith', { email: syncedAs })}>
                <span className="whitespace-pre">{' · '}</span>
                {t('vault.syncedAs', { email: syncedAs })}
              </span>
            )}
            {canSignIn && (
              <>
                <span className="shrink-0 whitespace-pre">{' · '}</span>
                <button
                  type="button"
                  onClick={signIn}
                  title={t('vault.signInToSync')}
                  className="min-w-0 truncate font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {t('vault.signInToSync')}
                </button>
              </>
            )}
          </span>
          {all.length > 1 && (
            <button
              type="button"
              onClick={() =>
                void mutate({
                  op: 'settings/update',
                  patch: { sortBy: sortedByName ? 'added' : 'name' },
                })
              }
              title={t('vault.changeOrder')}
              // Never squeezed: a long "synced as" address is what gives way.
              className="shrink-0 whitespace-nowrap font-medium text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
            >
              {sortedByName ? t('vault.byName') : t('vault.orderAdded')}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 scrollarea">
        {notice && (
          <div className="mb-2 px-1">
            <Callout tone="warning">{notice}</Callout>
          </div>
        )}

        {/* Where the codes were, until it is closed. */}
        {!syncedAs && (
          <div className="mb-2 px-1 empty:hidden">
            <RemovedFromAccount />
          </div>
        )}

        {/* Asked of the server at most hourly: the popup opens all day. */}
        {syncedAs && (
          <div className="mb-2 px-1 empty:hidden">
            <StartOverWaiting />
          </div>
        )}

        {joinRequests > 0 && (
          <div className="mb-2 px-1">
            <Callout tone="info">
              <p className="font-medium">
                {t('vault.joinRequests', { count: joinRequests })}
              </p>
              <p className="mt-0.5">{t('vault.joinRequestsHint')}</p>
              <button
                type="button"
                onClick={() => void host().openSettings(ACCOUNT_FRAGMENT)}
                className="mt-1.5 font-medium underline underline-offset-2"
              >
                {t('vault.reviewInSettings')}
              </button>
            </Callout>
          </div>
        )}

        {all.length === 0 ? (
          <EmptyState onAdd={() => setAdding(true)} onSignIn={canSignIn ? signIn : undefined} />
        ) : filtered.length === 0 ? (
          <p className="px-3 py-10 text-center text-[13px] text-neutral-400">
            {t('vault.noMatch', { query })}
          </p>
        ) : (
          <>
            {!query && suggested.length > 0 && (
              <section className="mb-1">
                <SectionLabel>
                  {t('vault.forHost', { host: tab?.hostname ?? '' })}
                  {canFill && (
                    <span className="ms-1.5 inline-block rounded-full bg-brand-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-700 first-letter:uppercase dark:bg-brand-500/15 dark:text-brand-300">
                      {t('vault.fieldDetected')}
                    </span>
                  )}
                </SectionLabel>
                <ul>
                  {suggested.map((item) => (
                    <AccountRow key={item.id} {...rowProps(item)} />
                  ))}
                </ul>
                {shortcutWouldFill && (
                  <p className="px-3 pt-0.5 pb-1.5 text-[11.5px] text-neutral-400 dark:text-neutral-500">
                    {t.rich('vault.shortcutHint', { keys: <Keys shortcut={fillKeys} /> })}
                  </p>
                )}
              </section>
            )}

            {sections.map((section) => (
              <section key={section.id ?? 'ungrouped'}>
                {/* One unnamed heap of accounts needs no heading — and no empty
                    one either: emptying the text left the label's padding,
                    which printed as a blank band above the first account. */}
                {section.name &&
                  !(sections.length === 1 && suggested.length === 0 && section.id === null) && (
                    <SectionLabel>
                      {section.color && (
                        <span
                          className="me-1.5 inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: section.color }}
                        />
                      )}
                      {section.name}
                    </SectionLabel>
                  )}
                <ul>
                  {section.items.map((item) => (
                    <AccountRow key={item.id} {...rowProps(item)} />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>

      {askRating && !query && all.length > 0 && joinRequests === 0 && <RatePrompt onClose={() => setAskRating(false)} />}

      {/* Always on screen: the claim and the way to check it, side by side. */}
      <footer className="flex items-center justify-between gap-3 border-t border-neutral-100 px-3.5 py-1.5 text-[11px] dark:border-neutral-900">
        <span className="inline-flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400">
          <ShieldIcon className="h-3.5 w-3.5 text-green-700 dark:text-green-300" />
          {t('common.encryptedHere')}
        </span>
        <SourceLink />
      </footer>

      {confirmFill && (
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-yellow-200 bg-yellow-50 p-3.5 animate-slide-up dark:border-yellow-500/30 dark:bg-yellow-500/10">
          <p className="text-[13px] leading-relaxed text-yellow-900 dark:text-yellow-200">
            {t.rich('vault.fillWarning', {
              account: titleOf(confirmFill),
              domain: confirmFill.domains[0],
              host: tab?.hostname,
            })}
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setConfirmFill(null)}>
              {t('vault.dontFill')}
            </Button>
            <Button size="sm" variant="danger" onClick={() => void fill(confirmFill, true)}>
              {t('vault.fillAnyway')}
            </Button>
          </div>
        </div>
      )}

      {sharing && <ShareSheet item={sharing} onClose={() => setSharing(null)} />}

      {signingIn && <SignInSheet protection={protection} onClose={() => setSigningIn(false)} />}

      {adding && (
        <AddSheet
          hostname={tab?.hostname ?? null}
          onAdd={(items) => mutate({ op: 'items/add', items })}
          onClose={() => setAdding(false)}
          existing={data.items}
          {...(host().overPage
            ? {
                // Settings, opened at the scanner rather than on a list the user
                // then has to navigate. Opening it moves focus, which closes the
                // popup anyway; closing it here just does so without the flicker.
                onCameraElsewhere: () => {
                  void host().openSettings(SCAN_FRAGMENT);
                  window.close();
                },
              }
            : // A window of the app's own asks for the camera itself, and has no page to read.
              { camera: true, pageScan: false })}
        />
      )}
    </div>
  );
}

// Sentence case, never capitals: half the languages this speaks have none,
// and a heading in capitals in the rest reads as shouting.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center px-3 pt-2 pb-1 text-[12px] font-semibold text-neutral-600 dark:text-neutral-400">
      {children}
    </h2>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        'shrink-0 rounded-lg p-1.5 text-base text-neutral-600 transition',
        'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100',
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onAdd, onSignIn }: { onAdd: () => void; onSignIn?: (() => void) | undefined }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
      <Logo className="h-10 w-10 opacity-90" />
      <div>
        <h2 className="text-[15px] font-semibold">{t('vault.empty.title')}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t('vault.empty.body')}
        </p>
      </div>
      <Button variant="primary" onClick={onAdd}>
        <PlusIcon /> {t('vault.empty.add')}
      </Button>
      {/* A new browser is the likeliest place to find an empty vault — and its
          owner, more often than not, has the codes somewhere already. */}
      {onSignIn && (
        <p className="text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t.rich('vault.empty.signIn', {}, {
            link: (chunk) => (
              <button
                type="button"
                onClick={onSignIn}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                {chunk}
              </button>
            ),
          })}
        </p>
      )}
    </div>
  );
}
