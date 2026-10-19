import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  buildOtpUri,
  encodeMigrationUris,
  exportAegisJson,
  exportBitwardenJson,
  exportEncryptedBackup,
  exportPlainUris,
  type ProtectionMode,
  type VaultData,
  type VaultItem,
} from '@authx/core';
import { send } from '../lib/protocol.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { BrandMark } from '../components/BrandMark.js';
import { QrIcon } from '../components/icons.js';
import { QrCode } from '../components/QrCode.js';
import { DESTINATIONS, type Destination, type Method } from './destinations.js';
import { Section } from './Section.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { localise } from '../i18n/error-text.js';
import { translate } from '../i18n/runtime.js';
import { titleOf } from '../i18n/titles.js';
import type { MessageKey } from '../i18n/locales/en.js';

export function download(filename: string, contents: string | Blob, mime: string) {
  const url = URL.createObjectURL(typeof contents === 'string' ? new Blob([contents], { type: mime }) : contents);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** Which accounts an export takes: every one unless some are chosen. */
export type ExportSelection = 'all' | Set<string>;

export function chosenItems(items: VaultItem[], selection: ExportSelection): VaultItem[] {
  // 'all' rather than every id: an account added while this page is open is
  // in an export of everything, as the count above the button says.
  return selection === 'all' ? items : items.filter((item) => selection.has(item.id));
}

export function AccountPicker({
  items,
  groups,
  chosen,
  onChange,
}: {
  items: VaultItem[];
  groups: VaultData['groups'];
  chosen: VaultItem[];
  onChange: (next: 'all' | Set<string>) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const selected = new Set(chosen.map((item) => item.id));
  const usedGroups = groups.filter(
    (group) => group.deletedAt === null && items.some((item) => item.groupId === group.id),
  );
  const all = chosen.length === items.length;

  return (
    <Section
      title={t('export.what')}
      description={
        all
          ? t('export.all', { count: items.length })
          : t('export.someChosen', { chosen: chosen.length, total: items.length })
      }
      action={
        <Button size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? t('common.done') : t('export.choose')}
        </Button>
      }
    >
      {open && (
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Chip active={all} onClick={() => onChange('all')}>
              {t('export.chipAll')}
            </Chip>
            <Chip active={chosen.length === 0} onClick={() => onChange(new Set())}>
              {t('export.chipNone')}
            </Chip>
            {usedGroups.map((group) => {
              const members = items.filter((item) => item.groupId === group.id).map((item) => item.id);
              const only = !all && members.length === selected.size && members.every((id) => selected.has(id));
              return (
                <Chip key={group.id} active={only} onClick={() => onChange(new Set(members))}>
                  {group.name}
                </Chip>
              );
            })}
          </div>
          <ul className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 scrollarea dark:border-neutral-800">
            {items.map((item) => (
              <li key={item.id} className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800/80">
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={(event) => {
                      const next = new Set(selected);
                      if (event.target.checked) next.add(item.id);
                      else next.delete(item.id);
                      onChange(next);
                    }}
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{titleOf(item)}</span>
                  {item.issuer && item.label && (
                    <span className="max-w-[45%] truncate text-[12px] text-neutral-600 dark:text-neutral-400">
                      {item.label}
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-7 rounded-full border px-3 text-[12px] font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300'
          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300',
      )}
    >
      {children}
    </button>
  );
}

export function EncryptedBackup({ chosen, data }: { chosen: VaultItem[]; data: VaultData }) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = password.length >= 8 && password === confirm && chosen.length > 0;

  async function exportEncrypted() {
    setBusy(true);
    setError(null);
    try {
      const backup = await exportEncryptedBackup(chosen, data.groups, password);
      download(`keyrook-${stamp()}.authx`, JSON.stringify(backup, null, 2), 'application/json');
      setPassword('');
      setConfirm('');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('import.backupPassword')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint={t('export.encrypted.hint')}
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
        {error && <Callout tone="danger">{error}</Callout>}
        <div>
          <Button variant="primary" disabled={!ready || busy} onClick={exportEncrypted}>
            {busy ? <Spinner /> : null}
            {t('export.encrypted.download', { count: chosen.length })}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/** How long readable exports stay open after the gate, before it closes again. */
const OPEN_FOR_MS = 5 * 60_000;

/**
 * Everything readable — transfer codes, printed codes, plain files — sits
 * behind one gate: the warning, a box to tick, and with a master password, the
 * password again. Holding an unlocked vault is not the same as being the
 * person who should walk away with every secret in it at once.
 */
export function MoveToAnotherApp({
  chosen,
  data,
  protectionMode,
}: {
  chosen: VaultItem[];
  data: VaultData;
  protectionMode: ProtectionMode;
}) {
  const t = useT();
  const [openUntil, setOpenUntil] = useState<number | null>(null);
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'transfer' | 'one-by-one' | 'print' | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [, tick] = useState(0);
  const needsPassword = protectionMode === 'passphrase';
  const open = openUntil !== null && Date.now() < openUntil;

  useEffect(() => {
    if (openUntil === null) return;
    const timer = setInterval(() => {
      if (Date.now() >= openUntil) {
        setOpenUntil(null);
        setView(null);
      }
      tick((value) => value + 1);
    }, 5_000);
    return () => clearInterval(timer);
  }, [openUntil]);

  /** Moving through codes is use: it keeps the readable exports open. */
  const touch = () => setOpenUntil(Date.now() + OPEN_FOR_MS);

  function saveFile(format: 'aegis' | 'bitwarden' | 'text') {
    touch();
    if (format === 'aegis') {
      download(`keyrook-aegis-${stamp()}.json`, exportAegisJson(chosen, data.groups), 'application/json');
    } else if (format === 'bitwarden') {
      download(`keyrook-bitwarden-${stamp()}.json`, exportBitwardenJson(chosen, data.groups), 'application/json');
    } else {
      download(`keyrook-${stamp()}.txt`, exportPlainUris(chosen), 'text/plain');
    }
  }

  async function unlock() {
    setBusy(true);
    setError(null);
    try {
      if (needsPassword) await send({ type: 'vault/confirmPassword', password });
      setOpenUntil(Date.now() + OPEN_FOR_MS);
      setPassword('');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section>
      {!open ? (
        <div className="flex flex-col gap-3 p-4">
          <Callout tone="danger">
            {t('export.move.danger')}
          </Callout>
          <label className="flex items-start gap-2.5 text-[13px] text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={understood}
              onChange={(event) => setUnderstood(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
            />
            {t('export.move.understood')}
          </label>
          {needsPassword && (
            <Field
              label={t('setup.passwordStep.label')}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
          {error && <Callout tone="danger">{error}</Callout>}
          <div>
            <Button
              variant="danger"
              disabled={!understood || (needsPassword && !password) || busy || chosen.length === 0}
              onClick={() => void unlock()}
            >
              {busy ? <Spinner /> : null} {t('common.continue')}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-4">
            <p id="destination-label" className="text-[13px] font-medium">
              {t('export.move.which')}
            </p>
            <div role="radiogroup" aria-labelledby="destination-label" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DESTINATIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={destination?.id === option.id}
                  onClick={() => setDestination(option)}
                  className={cx(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start text-[13px] font-medium transition-colors',
                    destination?.id === option.id
                      ? 'border-brand-600 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-200'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-900',
                  )}
                >
                  {option.brand ? (
                    <BrandMark issuer={option.brand} size={24} />
                  ) : (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      <QrIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="min-w-0 truncate">{appName(option)}</span>
                </button>
              ))}
            </div>
            {destination && (
              <DestinationPanel
                destination={destination}
                count={chosen.length}
                onMethod={(method) => {
                  touch();
                  if (method === 'transfer' || method === 'one-by-one') setView(method);
                  else saveFile(method);
                }}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800/80">
            <span className="me-1 text-[12px] text-neutral-600 dark:text-neutral-400">{t('export.filesAndPaper')}</span>
            <Button size="sm" onClick={() => saveFile('aegis')}>
              {t('export.aegis')}
            </Button>
            <Button size="sm" onClick={() => saveFile('bitwarden')}>
              {t('export.bitwarden')}
            </Button>
            <Button size="sm" onClick={() => saveFile('text')}>
              {t('export.text')}
            </Button>
            <Button size="sm" onClick={() => setView('print')}>
              {t('export.print')}
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-[12px] text-neutral-600 dark:border-neutral-800/80 dark:text-neutral-400">
            <span>
              {openUntil
                ? t('export.closesIn', {
                    accounts: t('export.accounts', { count: chosen.length }),
                    count: Math.max(1, Math.ceil((openUntil - Date.now()) / 60_000)),
                  })
                : t('export.closesSoon', { accounts: t('export.accounts', { count: chosen.length }) })}
            </span>
            <Button size="sm" variant="ghost" onClick={() => { setOpenUntil(null); setView(null); }}>
              {t('export.closeNow')}
            </Button>
          </div>
        </div>
      )}
      {open && view === 'transfer' && (
        <TransferCodes chosen={chosen} destination={destination ?? DESTINATIONS[0]!} onActivity={touch} onClose={() => setView(null)} />
      )}
      {open && view === 'one-by-one' && (
        <OneByOne chosen={chosen} destination={destination ?? OTHER} onActivity={touch} onClose={() => setView(null)} />
      )}
      {open && view === 'print' && <PrintSheet chosen={chosen} onClose={() => setView(null)} />}
    </Section>
  );
}

const OTHER = DESTINATIONS.find((option) => option.id === 'other')!;

const METHOD_LABEL: Record<Method, MessageKey> = {
  transfer: 'export.method.transfer',
  'one-by-one': 'export.method.oneByOne',
  aegis: 'export.method.aegis',
  bitwarden: 'export.method.bitwarden',
  text: 'export.method.text',
};

/** Apps keep their own names; "another app" is said in the page's language. */
function appName(destination: Destination): string {
  return destination.id === 'other' ? translate('dest.other.name') : destination.name;
}

function DestinationPanel({
  destination,
  count,
  onMethod,
}: {
  destination: Destination;
  count: number;
  onMethod: (method: Method) => void;
}) {
  const t = useT();
  return (
    <div
      aria-live="polite"
      className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 animate-fade-in dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] font-semibold">{appName(destination)}</p>
        <span
          className={cx(
            'rounded-full px-2 py-0.5 text-[11px] font-medium',
            destination.allAtOnce
              ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
              : 'bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
          )}
        >
          {destination.allAtOnce ? t('export.allAtOnce') : t('export.oneAtATime')}
        </span>
      </div>
      <p className="mt-1.5 max-w-[68ch] text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-300">
        {t(destination.steps)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {destination.methods.map((method, index) => (
          <Button key={method} size="sm" variant={index === 0 ? 'primary' : 'secondary'} onClick={() => onMethod(method)}>
            {t(METHOD_LABEL[method])}
            {method === 'one-by-one' ? ` (${count})` : ''}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** A full-screen layer over the settings page, closed by its button or Escape. */
function Overlay({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="export-sheet fixed inset-0 z-50 overflow-y-auto bg-white text-neutral-900 animate-fade-in dark:bg-neutral-950 dark:text-neutral-50"
    >
      {children}
    </div>,
    document.body,
  );
}

function TransferCodes({
  chosen,
  destination,
  onActivity,
  onClose,
}: {
  chosen: VaultItem[];
  destination: Destination;
  onActivity: () => void;
  onClose: () => void;
}) {
  // Once, not per render: every code of a transfer carries the same batch id,
  // and Google Authenticator refuses to finish a batch whose codes disagree.
  const [{ uris, skipped }] = useState(() => encodeMigrationUris(chosen));
  const [index, setIndex] = useState(0);
  const t = useT();

  return (
    <Overlay onClose={onClose} label={t('export.transfer.label', { app: appName(destination) })}>
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-10">
        <h2 className="text-[20px] font-semibold tracking-tight">
          {destination.id === 'other' ? t('export.transfer.title') : t('export.moveTo', { app: destination.name })}
        </h2>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t(destination.steps)}
        </p>

        {uris.length === 0 ? (
          <div className="mt-8 w-full">
            <Callout tone="warning">{t('export.transfer.none')}</Callout>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-700">
              <QrCode text={uris[index]!} size={360} label={t('export.transfer.codeLabel', { index: index + 1, total: uris.length })} />
            </div>
            {uris.length > 1 ? (
              <div className="mt-5 flex items-center gap-3">
                <Button
                  size="sm"
                  disabled={index === 0}
                  onClick={() => {
                    onActivity();
                    setIndex((value) => value - 1);
                  }}
                >
                  {t('export.previous')}
                </Button>
                <span className="min-w-28 text-center text-[13px] font-medium">
                  {t('export.transfer.code', { index: index + 1, total: uris.length })}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={index === uris.length - 1}
                  onClick={() => {
                    onActivity();
                    setIndex((value) => value + 1);
                  }}
                >
                  {t('export.next')}
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-neutral-600 dark:text-neutral-400">
                {t('export.transfer.oneHolds', { count: chosen.length - skipped.length })}
              </p>
            )}
          </>
        )}

        {skipped.length > 0 && (
          <div className="mt-8 w-full">
            <Callout tone="warning">
              <p className="font-medium">{t('export.transfer.notIncluded')}</p>
              <ul className="mt-1 list-disc ps-5">
                {skipped.map(({ item, reason }) => (
                  <li key={item.id}>
                    {titleOf(item)}: {localise(reason)}
                  </li>
                ))}
              </ul>
            </Callout>
          </div>
        )}

        <Button className="mt-8" onClick={onClose}>
          {t('common.done')}
        </Button>
      </div>
    </Overlay>
  );
}

/**
 * Setup codes one after another, for the apps that import nothing in bulk:
 * scan, Next, scan. One code on the screen at a time, large — a sheet of them
 * leaves the phone's camera to pick whichever it sees first.
 */
function OneByOne({
  chosen,
  destination,
  onActivity,
  onClose,
}: {
  chosen: VaultItem[];
  destination: Destination;
  onActivity: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const item = chosen[index]!;
  const last = index === chosen.length - 1;

  const move = (step: number) => {
    onActivity();
    setIndex((value) => Math.min(chosen.length - 1, Math.max(0, value + step)));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        move(1);
      } else if (event.key === 'ArrowLeft') {
        move(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <Overlay onClose={onClose} label={t('export.oneByOne.label', { app: appName(destination) })}>
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-10">
        <h2 className="text-[20px] font-semibold tracking-tight">
          {destination.id === 'other' ? t('export.oneByOne.title') : t('export.moveTo', { app: destination.name })}
        </h2>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t(destination.steps)}
        </p>

        <div className="mt-7 flex max-w-full items-center gap-3">
          <BrandMark issuer={item.issuer} label={item.label} domains={item.domains} icon={item.icon} size={36} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{titleOf(item)}</p>
            {item.issuer && item.label && (
              <p className="truncate text-[12.5px] text-neutral-600 dark:text-neutral-400">{item.label}</p>
            )}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-700">
          <QrCode text={buildOtpUri(item)} size={300} label={t('share.qrLabel', { account: titleOf(item) })} />
        </div>

        <div
          className="mt-5 h-1 w-64 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={chosen.length}
          aria-valuenow={index + 1}
          aria-label={t('export.oneByOne.progress')}
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] dark:bg-brand-400"
            style={{ width: `${((index + 1) / chosen.length) * 100}%` }}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" disabled={index === 0} onClick={() => move(-1)}>
            {t('export.previous')}
          </Button>
          <span className="min-w-32 text-center text-[13px] font-medium">
            {t('export.oneByOne.position', { index: index + 1, total: chosen.length })}
          </span>
          {last ? (
            <Button size="sm" variant="primary" onClick={onClose}>
              {t('common.done')}
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={() => move(1)}>
              {t('export.next')}
            </Button>
          )}
        </div>
        <p className="mt-3 text-[11.5px] text-neutral-400 dark:text-neutral-500">{t('export.oneByOne.keys')}</p>
      </div>
    </Overlay>
  );
}

/**
 * One setup code per account, laid out for paper. The browser's own print
 * dialog does the rest — print it, or save it as PDF — and print styles hide
 * everything but the sheet.
 */
function PrintSheet({ chosen, onClose }: { chosen: VaultItem[]; onClose: () => void }) {
  const t = useT();
  return (
    <Overlay onClose={onClose} label={t('export.print.label')}>
      <div className="mx-auto max-w-4xl px-6 py-8 print:max-w-none print:p-0">
        <div className="mb-6 flex items-start justify-between gap-6 print:mb-4">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight">{t('export.print.title')}</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400 print:text-neutral-600">
              {t('export.print.body', {
                accounts: t('export.accounts', { count: chosen.length }),
                date: new Date().toLocaleDateString(t.locale),
              })}
            </p>
          </div>
          <div className="flex shrink-0 gap-2 print:hidden">
            <Button variant="primary" onClick={() => window.print()}>
              {t('export.print.print')}
            </Button>
            <Button onClick={onClose}>{t('common.close')}</Button>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-3">
          {chosen.map((item) => (
            <li
              key={item.id}
              className="flex break-inside-avoid flex-col items-center rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-800 print:border-neutral-300 print:p-3"
            >
              <QrCode text={buildOtpUri(item)} size={168} exact label={t('share.qrLabel', { account: titleOf(item) })} />
              <p className="mt-2 w-full truncate text-[13px] font-semibold">{titleOf(item)}</p>
              {item.issuer && item.label && (
                <p className="w-full truncate text-[11.5px] text-neutral-600 print:text-neutral-600">{item.label}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Overlay>
  );
}
