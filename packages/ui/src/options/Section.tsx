import { createContext, useContext, type ReactNode } from 'react';
import { cx } from '../components/primitives.js';
import { ArrowLeftIcon } from '../components/icons.js';
import { translate } from '../i18n/runtime.js';
import { useBack } from '../lib/back.js';

/**
 * The top of every Settings tab: what the tab is for, in one line, and the
 * one thing most people come to it to do. The tabs used to open straight on a
 * card, so nothing said where you were or why.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    // On a phone with large text an action beside the title left the words a
    // column a few wide: there it goes under them once they would get narrow.
    <header className="mb-8 flex items-start justify-between gap-6 app:mb-4 app:flex-wrap app:gap-y-4 app:empty:hidden">
      <div className="min-w-0 app:min-w-[60%] app:flex-1 app:empty:hidden">
        {/* A phone's bar already names the page. */}
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] app:hidden">{title}</h1>
        {description && (
          <p className="kr-explain mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/**
 * True where the window's own header already holds the way back — a phone's
 * Settings, whose arrow goes back one step whatever the step is. A second
 * arrow under it, going somewhere else, left people guessing which was which.
 */
export const BackInHeader = createContext(false);

/** A page one step into a tab, with the way back to it. */
export function SubpageHeader({
  title,
  description,
  onBack,
}: {
  title: string;
  description?: ReactNode;
  onBack: () => void;
}) {
  useBack(true, onBack);
  const backInHeader = useContext(BackInHeader);
  return (
    <header className="mb-8">
      {!backInHeader && (
        <button
          type="button"
          onClick={onBack}
          aria-label={translate('common.back')}
          className="-ms-1.5 mb-3 grid h-8 w-8 place-items-center rounded-lg text-[17px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeftIcon />
        </button>
      )}
      <h1 className="text-[22px] font-semibold tracking-[-0.015em]">{title}</h1>
      {description && (
        <p className="kr-explain mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
    </header>
  );
}

/**
 * A group of settings: a short label above, the rows in one card below. The
 * label sat inside the card once, over a paragraph, and every card read like
 * a page of a manual; a label and rows read like controls, which these are.
 */
export function Section({
  title,
  description,
  keep = false,
  action,
  tone = 'default',
  children,
}: {
  title?: string;
  description?: ReactNode;
  /** The description is a warning, not an explanation: a phone shows it too (`kr-explain`). */
  keep?: boolean;
  action?: ReactNode;
  /** A danger zone is outlined in red, so it is never mistaken for an ordinary setting. */
  tone?: 'default' | 'danger';
  /** Absent, the group is its label alone — a danger zone still folded away. */
  children?: ReactNode;
}) {
  return (
    <section className="mb-8">
      {(title || action) && (
        <div className="mb-2 flex items-end justify-between gap-4 px-1">
          <div className="min-w-0">
            {title && (
              <h2
                className={cx(
                  'text-[13px] font-semibold',
                  tone === 'danger' ? 'text-red-600 dark:text-red-300' : 'text-neutral-800 dark:text-neutral-200',
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cx(
                  'mt-0.5 max-w-[62ch] text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400',
                  !keep && 'kr-explain',
                )}
              >
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children ? (
        <div
          className={cx(
            'overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900/60',
            tone === 'danger' ? 'border-red-200 dark:border-red-500/30' : 'border-neutral-200/80 dark:border-neutral-800',
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function Row({
  label,
  name,
  description,
  keep = false,
  control,
  children,
}: {
  label: ReactNode;
  /**
   * The row's name as a group, where two rows have controls of the same name —
   * two "Turn on" buttons — and each needs saying which it belongs to.
   */
  name?: string;
  description?: ReactNode;
  /** The description is a warning, not an explanation: a phone shows it too (`kr-explain`). */
  keep?: boolean;
  control?: ReactNode;
  /** What opens under the row when its control is used: a form, a warning. */
  children?: ReactNode;
}) {
  return (
    <div
      {...(name ? { role: 'group', 'aria-label': name } : {})}
      className="border-b border-neutral-100 px-4 py-3.5 last:border-b-0 dark:border-neutral-800/80"
    >
      {/* The control goes under the words where both will not fit beside
          each other — on a phone, a button would squeeze them into a column
          a few words wide. A switch still fits beside them. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-48 flex-1 app:min-w-[60%]">
          <div className="text-[13.5px] font-medium">{label}</div>
          {description && (
            <p
              className={cx(
                'mt-0.5 text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400',
                !keep && 'kr-explain',
              )}
            >
              {description}
            </p>
          )}
        </div>
        {/* No wider than the row: a long button under the words wraps, where
            it once ran past the screen's edge on a phone with large text. */}
        {control && <div className="max-w-full shrink-0">{control}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** A dot before a state: green when nothing needs doing, amber when something does. */
export function StateDot({ good }: { good: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx('me-2 inline-block h-2 w-2 shrink-0 rounded-full align-middle', good ? 'bg-green-500' : 'bg-yellow-500')}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 rounded-full transition-colors ${
        checked ? 'bg-brand-600' : 'bg-neutral-300 dark:bg-neutral-700'
      }`}
    >
      {/* `start-0` is load-bearing. An absolutely placed box with no inset
          sits at its static position, and inside a <button> — text centred
          by default — that is the middle of the track. The knob then started
          halfway along: off looked on, and on slid out past the edge. Read
          right to left, the track is mirrored, so "on" moves the other way. */}
      <span
        className={`absolute top-0.5 start-0 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[18px] rtl:-translate-x-[18px]' : 'translate-x-0.5 rtl:-translate-x-0.5'
        }`}
      />
    </button>
  );
}

/**
 * A choice of a few values. Up to three show as a segmented control — every
 * option visible, one click — which looks like part of the product; more fall
 * back to a menu, styled rather than left as the browser's default control.
 */
export function Select<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  if (options.length <= 3) {
    return (
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-xl bg-neutral-100 p-0.5 dark:bg-neutral-800"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cx(
                'h-8 rounded-[10px] px-3 text-[12.5px] font-medium transition-colors',
                selected
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        aria-label={label}
        value={String(value)}
        onChange={(event) => {
          const match = options.find((option) => String(option.value) === event.target.value);
          if (match) onChange(match.value);
        }}
        className="h-9 appearance-none rounded-xl border border-neutral-200 bg-white pe-8 ps-3 text-[13px] font-medium text-neutral-800 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 end-2.5 h-4 w-4 -translate-y-1/2 text-neutral-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7 10 5 5 5-5" />
      </svg>
    </div>
  );
}
