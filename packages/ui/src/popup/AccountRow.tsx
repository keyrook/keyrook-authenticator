import { useState, type ReactNode } from 'react';
import { formatCode, itemSubtitle, totpWindow, type VaultItem } from '@authx/core';
import { BrandMark } from '../components/BrandMark.js';
import { CheckIcon, CopyIcon, EditIcon, QrIcon, RefreshIcon, StarIcon, TrashIcon } from '../components/icons.js';
import { Button, cx } from '../components/primitives.js';
import { CountdownRing } from '../components/CountdownRing.js';
import { host } from '../host.js';
import { useT } from '../i18n/react.js';
import { titleOf } from '../i18n/titles.js';
import { useBack } from '../lib/back.js';

export interface AccountRowProps {
  item: VaultItem;
  code: string | undefined;
  now: number;
  hideCodes: boolean;
  copied: boolean;
  canFill: boolean;
  onCopy: () => void;
  onFill: () => void;
  onToggleFavorite: () => void;
  onAdvanceCounter: () => void;
  onShare: () => void;
  /** A phone's sheet edits and deletes where the popup sends people to Settings. */
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AccountRow(props: AccountRowProps) {
  return host().device === 'phone' ? <PhoneAccountRow {...props} /> : <PopupAccountRow {...props} />;
}

function PopupAccountRow({
  item,
  code,
  now,
  hideCodes,
  copied,
  canFill,
  onCopy,
  onFill,
  onToggleFavorite,
  onAdvanceCounter,
  onShare,
}: AccountRowProps) {
  const t = useT();
  const subtitle = itemSubtitle(item);
  const window_ = totpWindow(item.period, now);
  const pending = code === undefined;

  return (
    <li className="group relative">
      <div
        className={cx(
          'flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors',
          'hover:bg-neutral-50 dark:hover:bg-neutral-900',
        )}
      >
        <BrandMark issuer={item.issuer} label={item.label} domains={item.domains} icon={item.icon} />

        <button
          type="button"
          onClick={onCopy}
          disabled={pending}
          className="flex flex-1 flex-col items-start gap-0.5 text-start"
          title={t('row.copyHint')}
        >
          {/* The code sets how narrow this column may get, and never wraps:
              "Introdueix" on the Fill button once broke 841 298 over two lines.
              Name and subtitle take no width of their own (w-0 min-w-full), so
              a long name truncates instead of widening the column. */}
          {/* A name keeps its own direction: "Amazon (production)" read right
              to left lost its bracket and its beginning. It still lines up
              with the page. */}
          <span dir="auto" className="w-0 min-w-full truncate text-[13px] font-medium text-neutral-800 rtl:text-right dark:text-neutral-100">
            {titleOf(item)}
          </span>
          <span
            className={cx(
              'code-digits whitespace-nowrap text-[19px] leading-tight font-semibold text-neutral-900 dark:text-neutral-50',
              hideCodes && 'blur-[5px] transition group-hover:blur-none',
              pending && 'opacity-40',
            )}
          >
            {pending ? '••• •••' : formatCode(code)}
          </span>
          {subtitle && (
            <span dir="auto" className="w-0 min-w-full truncate text-[11px] text-neutral-400 rtl:text-right dark:text-neutral-500">
              {subtitle}
            </span>
          )}
        </button>

        <div className="flex min-w-0 items-center gap-0.5 [&>*:not([data-fill])]:shrink-0">
          {/* Over a page with a code field, Fill takes the place of the QR
              button, which only shows on hover: in a long language the row
              has no room for both. Sharing is a click away everywhere else.
              A phone has no hover, so in an app's window both show: a button
              that cannot be seen should not be there to be tapped. */}
          {!canFill && (
            <button
              type="button"
              onClick={onShare}
              aria-label={t('row.share')}
              title={t('row.shareHint')}
              className="rounded-lg p-1.5 text-base text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:text-neutral-600 focus-visible:opacity-100 app:opacity-100 dark:text-neutral-700 dark:hover:text-neutral-400"
            >
              <QrIcon />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={item.favorite ? t('row.favouriteRemove') : t('row.favouriteAdd')}
            aria-pressed={item.favorite}
            className={cx(
              'rounded-lg p-1.5 text-base transition',
              item.favorite
                ? 'text-yellow-500'
                : 'text-neutral-300 opacity-0 group-hover:opacity-100 hover:text-neutral-500 app:opacity-100 dark:text-neutral-700 dark:hover:text-neutral-500',
            )}
          >
            <StarIcon filled={item.favorite} />
          </button>

          {canFill && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onFill}
              disabled={pending}
              title={t('row.fillHint')}
              aria-label={t('row.fill')}
              data-fill=""
              className="min-w-0"
            >
              {/* The last thing to give way when a row is tight. */}
              <span className="truncate">{t('row.fill')}</span>
            </Button>
          )}

          <button
            type="button"
            onClick={onCopy}
            disabled={pending}
            aria-label={copied ? t('row.copied') : t('row.copy')}
            className={cx(
              'rounded-lg p-1.5 text-base transition',
              copied
                ? 'text-green-500'
                : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
            )}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>

          {item.type === 'hotp' ? (
            <button
              type="button"
              onClick={onAdvanceCounter}
              aria-label={t('row.next')}
              title={t('row.counter', { counter: String(item.counter) })}
              className="rounded-lg p-1.5 text-base text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <RefreshIcon />
            </button>
          ) : (
            <CountdownRing remaining={window_.remaining} period={item.period} />
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * A row on a phone, laid out as the phone apps people already know lay theirs:
 * the account and its code, large and in the action colour, and the time left.
 * A tap copies — a thumb aims at the account, not at a small icon beside it —
 * and a long press opens what else there is to do, in a sheet. Nothing else
 * sits on the row: icons on every line made a list of controls of it.
 */
function PhoneAccountRow(props: AccountRowProps) {
  const { item, code, now, onCopy, onAdvanceCounter } = props;
  const t = useT();
  const [sheet, setSheet] = useState(false);
  const subtitle = itemSubtitle(item);
  const window_ = totpWindow(item.period, now);
  const pending = code === undefined;
  const late = item.type !== 'hotp' && window_.remaining <= 8;

  return (
    <li className="relative">
      <button
        type="button"
        onClick={onCopy}
        // Android turns a long press into this; a mouse's right button does the same.
        onContextMenu={(event) => {
          event.preventDefault();
          setSheet(true);
        }}
        disabled={pending}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-4 px-5 py-2.5 text-start transition-colors active:bg-neutral-100 dark:active:bg-neutral-900"
      >
        <BrandMark issuer={item.issuer} label={item.label} domains={item.domains} icon={item.icon} size={40} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-w-0 items-center gap-1.5">
            <span dir="auto" className="truncate text-[14.5px] font-medium text-neutral-900 rtl:text-right dark:text-neutral-100">
              {titleOf(item)}
            </span>
            {item.favorite && <StarIcon filled className="shrink-0 text-[12px] text-yellow-500" />}
          </span>
          {subtitle && (
            <span dir="auto" className="truncate text-[12.5px] text-neutral-500 rtl:text-right dark:text-neutral-400">
              {subtitle}
            </span>
          )}
          <span
            className={cx(
              'code-digits mt-0.5 whitespace-nowrap text-[28px] leading-tight font-semibold tracking-[0.06em]',
              late ? 'text-yellow-800 dark:text-yellow-300' : 'text-brand-600 dark:text-brand-300',
              pending && 'opacity-40',
            )}
          >
            {pending ? '••• •••' : formatCode(code)}
          </span>
        </span>
        {item.type !== 'hotp' && <CountdownRing remaining={window_.remaining} period={item.period} className="scale-110" />}
      </button>
      {/* A counter's next code is asked for, not waited for: its button sits
          where the time left would. Outside the row's own button, which a
          button cannot be inside. */}
      {item.type === 'hotp' && (
        <button
          type="button"
          onClick={onAdvanceCounter}
          aria-label={t('row.next')}
          className="absolute end-3 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[20px] text-neutral-500 active:bg-neutral-200 dark:text-neutral-400 dark:active:bg-neutral-800"
        >
          <RefreshIcon />
        </button>
      )}

      {sheet && <AccountSheet {...props} subtitle={subtitle} late={late} onClose={() => setSheet(false)} />}
    </li>
  );
}

/**
 * What one account can do, in a sheet from the bottom of the screen: its code
 * large, copying it first, then the rest. Deleting asks once more, here.
 */
function AccountSheet({
  item,
  code,
  now,
  subtitle,
  late,
  onCopy,
  onToggleFavorite,
  onAdvanceCounter,
  onShare,
  onEdit,
  onDelete,
  onClose,
}: AccountRowProps & { subtitle: string; late: boolean; onClose: () => void }) {
  const t = useT();
  const [deleting, setDeleting] = useState(false);
  useBack(true, onClose);
  const window_ = totpWindow(item.period, now);
  const then = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50 animate-fade-in dark:bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titleOf(item)}
        onClick={(event) => event.stopPropagation()}
        className="w-full rounded-t-[28px] bg-white pt-2.5 pb-[max(env(safe-area-inset-bottom),16px)] animate-slide-up dark:bg-neutral-900"
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-9 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        <div className="flex items-center gap-4 px-6">
          <BrandMark issuer={item.issuer} label={item.label} domains={item.domains} icon={item.icon} size={40} />
          <div className="min-w-0">
            <p dir="auto" className="truncate text-[14.5px] font-medium">
              {titleOf(item)}
            </p>
            {subtitle && (
              <p dir="auto" className="truncate text-[12.5px] text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 pt-4">
          <span
            className={cx(
              'code-digits whitespace-nowrap text-[34px] leading-tight font-semibold tracking-[0.06em]',
              late ? 'text-yellow-800 dark:text-yellow-300' : 'text-brand-600 dark:text-brand-300',
            )}
          >
            {code === undefined ? '••• •••' : formatCode(code)}
          </span>
          {item.type === 'hotp' ? (
            <button
              type="button"
              onClick={onAdvanceCounter}
              aria-label={t('row.next')}
              className="grid place-items-center rounded-full text-[22px] text-neutral-500 active:bg-neutral-200 dark:text-neutral-400 dark:active:bg-neutral-800"
            >
              <RefreshIcon />
            </button>
          ) : (
            <CountdownRing remaining={window_.remaining} period={item.period} className="scale-125" />
          )}
        </div>
        <div className="px-6 pt-4 pb-2">
          <Button variant="primary" className="w-full" disabled={code === undefined} onClick={then(onCopy)}>
            <CopyIcon /> {t('row.copy')}
          </Button>
        </div>
        <ul>
          <SheetAction icon={<StarIcon filled={item.favorite} />} onClick={then(onToggleFavorite)}>
            {item.favorite ? t('row.favouriteRemove') : t('row.favouriteAdd')}
          </SheetAction>
          <SheetAction icon={<QrIcon />} onClick={then(onShare)}>
            {t('row.share')}
          </SheetAction>
          {onEdit && (
            <SheetAction icon={<EditIcon />} onClick={then(onEdit)}>
              {t('accounts.edit')}
            </SheetAction>
          )}
          {onDelete &&
            (deleting ? (
              <li className="flex gap-2 px-6 py-2">
                <Button variant="danger" className="flex-1" onClick={then(onDelete)}>
                  <TrashIcon /> {t('common.delete')}
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setDeleting(false)}>
                  {t('common.cancel')}
                </Button>
              </li>
            ) : (
              <SheetAction icon={<TrashIcon />} danger onClick={() => setDeleting(true)}>
                {t('common.delete')}
              </SheetAction>
            ))}
        </ul>
      </div>
    </div>
  );
}

function SheetAction({
  icon,
  danger = false,
  onClick,
  children,
}: {
  icon: ReactNode;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cx(
          'flex w-full items-center gap-5 px-7 py-3.5 text-start text-[14.5px] active:bg-neutral-100 dark:active:bg-neutral-800',
          danger ? 'text-red-600 dark:text-red-300' : 'text-neutral-900 dark:text-neutral-100',
        )}
      >
        <span
          className={cx('shrink-0 text-[22px]', danger ? 'text-red-600 dark:text-red-300' : 'text-neutral-600 dark:text-neutral-300')}
        >
          {icon}
        </span>
        {children}
      </button>
    </li>
  );
}
