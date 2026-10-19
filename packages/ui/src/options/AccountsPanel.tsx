import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildOtpUri,
  isValidBase32,
  liveGroups,
  liveItems,
  sortItems,
  type Group,
  type VaultData,
  type VaultItem,
} from '@authx/core';
import type { Mutate } from '../lib/protocol.js';
import { AddSheet } from '../popup/AddSheet.js';
import { BrandMark } from '../components/BrandMark.js';
import { ICON_ACCEPT, prepareIcon } from '../components/icon-upload.js';
import { ServiceField } from '../components/ServiceField.js';
import { PlusIcon, QrIcon, SearchIcon, TrashIcon } from '../components/icons.js';
import { ShareOrMove } from '../components/ShareCodes.js';
import { Button, Callout, Field, cx } from '../components/primitives.js';
import { GroupsPanel } from './GroupsPanel.js';
import { PageHeader, Section } from './Section.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { titleOf } from '../i18n/titles.js';

export function AccountsPanel({
  data,
  mutate,
  scanOnOpen = false,
  onScanOpened,
}: {
  data: VaultData;
  mutate: Mutate;
  /** Open straight onto the camera: the popup sent the user here to grant it. */
  scanOnOpen?: boolean;
  onScanOpened?: () => void;
}) {
  const t = useT();
  const [adding, setAdding] = useState<'choose' | 'camera' | null>(scanOnOpen ? 'camera' : null);

  useEffect(() => {
    if (scanOnOpen) onScanOpened?.();
    // Mount only: the request is taken the first time this panel appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [editing, setEditing] = useState<VaultItem | null>(null);
  const [sharing, setSharing] = useState<VaultItem | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const items = useMemo(() => sortItems(liveItems(data), data.settings.sortBy), [data]);
  const [query, setQuery] = useState('');
  // The same match as the popup's search, so an account found there is found here.
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.issuer} ${item.label} ${item.note}`.toLowerCase().includes(needle));
  }, [items, query]);
  // An entry with no key is the deletion of an account this vault never had,
  // which builds before 0.4 kept: nothing in it to bring back, so it is not
  // offered — restoring one made an account with no codes on every device.
  const deleted = useMemo(
    () =>
      data.items
        .filter((item) => item.deletedAt !== null && isValidBase32(item.secret))
        .sort((a, b) => b.deletedAt! - a.deletedAt!),
    [data.items],
  );

  return (
    <>
      <PageHeader
        title={t('accounts.title')}
        description={t('accounts.description')}
        action={
          <Button variant="primary" onClick={() => setAdding('choose')}>
            <PlusIcon /> {t('add.submit')}
          </Button>
        }
      />

      {/* Only once there is enough to search: an empty box over three
          accounts is clutter. */}
      {items.length > 5 && (
        <div className="relative mb-3">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[16px] text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('vault.search')}
            aria-label={t('vault.search')}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white ps-9 pe-3 text-[13.5px] placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
          />
        </div>
      )}

      <Section>
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-neutral-400">
            {t('accounts.empty')}
          </p>
        ) : shown.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-neutral-400">{t('vault.noMatch', { query })}</p>
        ) : (
          <ul>
            {shown.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3.5 border-b border-neutral-100 px-4 py-3 last:border-b-0 dark:border-neutral-900"
              >
                <BrandMark
                  issuer={item.issuer}
                  label={item.label}
                  domains={item.domains}
                  icon={item.icon}
                  size={30}
                />
                <div className="min-w-0 flex-1">
                  <p dir="auto" className="truncate text-[13px] font-medium rtl:text-right">
                    {titleOf(item)}
                  </p>
                  <p className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">
                    {/* With no issuer the title already is the label; saying
                        it again underneath is noise, as the popup knows. */}
                    {titleOf(item) !== item.label && (
                      <>
                        {item.label || '—'}
                        <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
                      </>
                    )}
                    {t('accounts.digits', { type: item.type.toUpperCase(), digits: item.digits })}
                    {item.type === 'totp'
                      ? t('accounts.period', { seconds: item.period })
                      : t('accounts.counter', { counter: String(item.counter) })}
                    {item.algorithm !== 'SHA1' && ` · ${item.algorithm}`}
                  </p>
                </div>

                {item.domains.length > 0 && (
                  <span className="hidden shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600 sm:inline dark:bg-neutral-900 dark:text-neutral-400">
                    {item.domains[0]}
                    {item.domains.length > 1 && ` +${item.domains.length - 1}`}
                  </span>
                )}

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSharing(item)}
                    aria-label={t('accounts.moveNamed', { name: titleOf(item) })}
                    title={t('row.shareHint')}
                  >
                    <QrIcon />
                  </Button>
                  <Button size="sm" onClick={() => setEditing(item)}>
                    {t('accounts.edit')}
                  </Button>
                  {confirmingDelete === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          await mutate({ op: 'items/delete', id: item.id });
                          setConfirmingDelete(null);
                        }}
                      >
                        {t('common.delete')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(null)}>
                        {t('common.cancel')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t('accounts.deleteNamed', { name: titleOf(item) })}
                      onClick={() => setConfirmingDelete(item.id)}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {deleted.length > 0 && (
        <Section
          title={t('accounts.deleted.title')}
          description={t('accounts.deleted.description')}
        >
          <ul>
            {deleted.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 border-b border-neutral-100 px-4 py-3 last:border-b-0 dark:border-neutral-900"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-600 line-through dark:text-neutral-400">
                    {titleOf(item)}
                  </p>
                  <p className="text-[12px] text-neutral-400 dark:text-neutral-500">
                    {t('accounts.deleted.on', { date: new Date(item.deletedAt!).toLocaleDateString(t.locale) })}
                  </p>
                </div>
                <Button size="sm" onClick={() => void mutate({ op: 'items/restore', id: item.id })}>
                  {t('accounts.restore')}
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <GroupsPanel data={data} mutate={mutate} />

      {adding && (
        <Modal onClose={() => setAdding(null)}>
          <AddSheet
            hostname={null}
            onAdd={(newItems) => mutate({ op: 'items/add', items: newItems })}
            onClose={() => setAdding(null)}
            initialMode={adding}
            // Options is a real tab, so it survives the camera permission
            // prompt stealing focus. The popup does not, and does not ask.
            camera
            pageScan={false}
            existing={data.items}
          />
        </Modal>
      )}

      {sharing && (
        <Modal size="fit" onClose={() => setSharing(null)}>
          <div className="p-6">
            <h2 className="text-[16px] font-semibold">{t('accounts.moveNamed', { name: titleOf(sharing) })}</h2>
            {sharing.issuer && sharing.label && (
              <p className="mt-0.5 mb-4 text-[12.5px] text-neutral-600 dark:text-neutral-400">{sharing.label}</p>
            )}
            <div className={sharing.issuer && sharing.label ? '' : 'mt-4'}>
              <ShareOrMove item={sharing} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => setSharing(null)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal size="form" onClose={() => setEditing(null)}>
          <ItemEditor
            item={editing}
            groups={liveGroups(data)}
            onSave={async (patch) => {
              await mutate({ op: 'items/update', id: editing.id, patch });
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}

/**
 * The height is fixed, not fitted to content, because the add sheet lays itself
 * out absolutely inside it. So it comes in two sizes. The account editor needs
 * about 820px to show every field; at the add sheet's 560px it was cut off at
 * "Note", its Group and setup key below with no scrollbar on macOS to say so.
 * Its own size fits it whole on most screens, and a smaller screen still
 * scrolls.
 */
const MODAL_HEIGHT = {
  sheet: 'h-[min(640px,calc(100vh-3rem))]',
  form: 'h-[min(840px,calc(100vh-3rem))]',
  // As tall as its content: a QR code and a few buttons.
  fit: 'max-h-[calc(100vh-3rem)] overflow-y-auto',
} as const;

function Modal({
  children,
  onClose,
  size = 'sheet',
}: {
  children: React.ReactNode;
  onClose: () => void;
  size?: keyof typeof MODAL_HEIGHT;
}) {
  return (
    // A dialog is cut paper laid on the page: an ink line round it and a hard
    // shadow down and to the right. In dark mode the shadow is black on night
    // and separates nothing, so a heavier scrim and a lighter line do.
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6 animate-fade-in dark:bg-black/70"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cx(
          'relative w-[420px] overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-neutral-900 dark:bg-neutral-900 dark:ring-neutral-600',
          MODAL_HEIGHT[size],
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

function ItemEditor({
  item,
  groups,
  onSave,
  onCancel,
}: {
  item: VaultItem;
  groups: Group[];
  onSave: (patch: Partial<VaultItem>) => Promise<void>;
  onCancel: () => void;
}) {
  const t = useT();
  const [issuer, setIssuer] = useState(item.issuer);
  const [label, setLabel] = useState(item.label);
  const [note, setNote] = useState(item.note);
  const [groupId, setGroupId] = useState(item.groupId);
  const [domains, setDomains] = useState(item.domains.join(', '));
  const [icon, setIcon] = useState(item.icon);
  const [iconError, setIconError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const pickIcon = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave({
          issuer: issuer.trim(),
          label: label.trim(),
          note: note.trim(),
          groupId,
          icon,
          domains: domains
            .split(',')
            .map((entry) => entry.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
            .filter(Boolean),
        });
      }}
    >
      <header className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-900">
        <h2 className="text-[15px] font-semibold">{t('editor.title')}</h2>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 scrollarea">
        <div className="flex items-center gap-4">
          <BrandMark
            issuer={issuer}
            label={label}
            domains={item.domains}
            icon={icon}
            size={52}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">{t('editor.picture')}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {icon ? t('editor.pictureOwn') : t('editor.pictureNone')}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" onClick={() => pickIcon.current?.click()}>
              {icon ? t('editor.replace') : t('editor.choose')}
            </Button>
            {icon && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIcon(null);
                  setIconError(null);
                }}
              >
                {t('common.remove')}
              </Button>
            )}
          </div>
          <input
            ref={pickIcon}
            type="file"
            accept={ICON_ACCEPT}
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              setIconError(null);
              try {
                setIcon(await prepareIcon(file));
              } catch (cause) {
                setIconError(errorText(cause));
              }
            }}
          />
        </div>

        {iconError && <Callout tone="danger">{iconError}</Callout>}

        <ServiceField
          value={issuer}
          onChange={(next) => setIssuer(next)}
          onPick={(brand) => {
            // Only fill the websites field if the user has not curated it.
            if (domains.trim().length === 0) setDomains(brand.domains.slice(0, 2).join(', '));
          }}
        />
        <Field label={t('add.account')} value={label} onChange={(event) => setLabel(event.target.value)} />
        <Field
          label={t('editor.websites')}
          value={domains}
          onChange={(event) => setDomains(event.target.value)}
          placeholder={t('editor.websitesPlaceholder')}
          hint={t('editor.websitesHint')}
        />
        <Field label={t('editor.note')} value={note} onChange={(event) => setNote(event.target.value)} />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="item-group"
            className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300"
          >
            {t('editor.group')}
          </label>
          <select
            id="item-group"
            value={groupId ?? ''}
            onChange={(event) => setGroupId(event.target.value || null)}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <option value="">{t('editor.ungrouped')}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {groups.length === 0 && (
            <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
              {t('editor.noGroups')}
            </p>
          )}
        </div>

        {/* "Setup key", the name the add sheet gives the same secret. This
            was once titled "Recovery key" — which is what Security calls the
            key that opens the whole vault. Two of the app's most sensitive
            things shared one name, and someone looking for the vault's could
            reveal this instead. */}
        <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">{t('editor.setupKey')}</p>
              <p className="mt-0.5 text-[12px] text-neutral-600 dark:text-neutral-400">
                {t('editor.setupKeyHint')}
              </p>
            </div>
            <Button size="sm" onClick={() => setRevealed((value) => !value)}>
              {revealed ? t('editor.hide') : t('editor.reveal')}
            </Button>
          </div>
          {revealed && (
            <div className="mt-3 flex flex-col gap-2">
              <code className="block break-all rounded-lg bg-neutral-100 px-3 py-2 text-[12px] dark:bg-neutral-900">
                {item.secret}
              </code>
              {/* No link can be made without a key; trying threw, and the page went blank. */}
              {isValidBase32(item.secret) && (
                <code className="block break-all rounded-lg bg-neutral-100 px-3 py-2 text-[11px] text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                  {buildOtpUri(item)}
                </code>
              )}
              <Callout tone="warning">
                {t('editor.revealWarning')}
              </Callout>
            </div>
          )}
        </div>
      </div>

      {/* The shadow casts upward over the fields: on a screen too short for
          the whole form, it is the only sign — macOS hides scrollbars until
          they move — that there is more above the buttons. Hard, like every
          shadow in the brand. */}
      <footer
        className={cx(
          'relative flex justify-end gap-2 border-t border-neutral-200 px-5 py-4',
          'shadow-[0_-3px_0_var(--kr-neutral-100)] dark:border-neutral-700 dark:shadow-[0_-3px_0_var(--kr-neutral-800)]',
        )}
      >
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="primary">
          {t('editor.save')}
        </Button>
      </footer>
    </form>
  );
}
