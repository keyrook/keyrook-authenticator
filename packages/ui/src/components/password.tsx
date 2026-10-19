import { useId, useState, type ReactNode } from 'react';
import { scorePassword } from '@authx/core';
import { EyeIcon, EyeOffIcon } from './icons.js';
import { cx } from './primitives.js';
import { useT } from '../i18n/react.js';

const LEVELS = [
  { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-300' },
  { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-300' },
  { bar: 'bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-300' },
  { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
  { bar: 'bg-green-600', text: 'text-green-700 dark:text-green-300' },
] as const;

/**
 * Four bars and a word. A strength meter that is only text ("Strength: fair")
 * reads as a hint to skip; bars that fill as you type get used.
 */
export function StrengthMeter({ password }: { password: string }) {
  const t = useT();
  const { score } = scorePassword(password);
  const level = LEVELS[score]!;
  const filled = Math.max(1, score);

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cx(
              'h-1 flex-1 rounded-full transition-colors',
              bar <= filled ? level.bar : 'bg-neutral-200 dark:bg-neutral-800',
            )}
          />
        ))}
      </div>
      {/* At least the width of the longest English word, so the bars do not
          jump as it changes; a longer word in another language widens it. */}
      <span className={cx('min-w-20 text-end text-[11px] font-medium whitespace-nowrap', level.text)}>
        {t(`meter.${score}` as 'meter.0')}
      </span>
    </div>
  );
}

/**
 * A password input with a show/hide toggle, and optionally a strength meter.
 *
 * The toggle matters more here than on most forms: the account password cannot
 * be reset by anyone, so being able to see what was typed before committing to
 * it is worth more than a second box to type it into blind.
 */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus,
  hint,
  error,
  meter,
  labelAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  autoFocus?: boolean;
  hint?: ReactNode;
  error?: string | null;
  /** Show the strength meter once something is typed. */
  meter?: boolean;
  /** A small link on the label row, such as "Forgot password?". */
  labelAction?: ReactNode;
}) {
  const t = useT();
  const [shown, setShown] = useState(false);
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          className={cx(
            'h-10 w-full rounded-xl border pe-10 ps-3 text-sm transition-colors',
            'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50',
            error
              ? 'border-red-400 dark:border-red-500'
              : 'border-neutral-200 focus:border-brand-500 dark:border-neutral-800 dark:focus:border-brand-500',
          )}
        />
        <button
          type="button"
          onClick={() => setShown((current) => !current)}
          aria-label={shown ? t('password.hide') : t('password.show')}
          title={shown ? t('password.hide') : t('password.show')}
          className="absolute inset-y-0 end-0 grid w-10 place-items-center rounded-e-xl text-[16px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {meter && value.length > 0 && <StrengthMeter password={value} />}
      {error ? (
        <p className="text-[12px] text-red-600 dark:text-red-300">{error}</p>
      ) : (
        hint && <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">{hint}</p>
      )}
    </div>
  );
}
