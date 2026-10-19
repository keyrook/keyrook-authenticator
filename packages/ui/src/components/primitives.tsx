import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { AUTHENTICATOR_MARK_COMPACT } from '@keyrook/brand';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  // On a dark page a faded blue or red still reads as a live button, so a
  // disabled one turns neutral there: "Done" before the box is ticked must look it.
  primary:
    'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 disabled:bg-brand-600/50 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500',
  secondary:
    'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-600',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  danger:
    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-600/50 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        // kr-press: down at once, back with a little give.
        'kr-press inline-flex items-center justify-center whitespace-nowrap font-medium select-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cx(
          'h-10 w-full rounded-xl border px-3 text-sm transition-colors',
          'bg-white text-neutral-900 placeholder:text-neutral-400',
          'dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-500',
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-neutral-200 focus:border-brand-500 dark:border-neutral-800 dark:focus:border-brand-500',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-[12px] text-red-600 dark:text-red-300">{error}</p>
      ) : (
        hint && <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{hint}</p>
      )}
    </div>
  );
});

export function Callout({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning' | 'danger';
  children: ReactNode;
}) {
  const tones = {
    info: 'bg-brand-50 text-brand-900 dark:bg-brand-500/10 dark:text-brand-200',
    warning: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-200',
    danger: 'bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200',
  } as const;

  return (
    <div className={cx('rounded-xl px-3 py-2.5 text-[13px] leading-relaxed', tones[tone])}>
      {children}
    </div>
  );
}

/**
 * Waiting, in Keyrook's way: the app's own asterisk with its ticks lighting in
 * turn (.kr-wait), drawn in the text colour so it sits in a blue button as well
 * as on the page. Never a spinning ring — nothing in the brand spins.
 */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={cx('kr-wait', className)} viewBox={AUTHENTICATOR_MARK_COMPACT.view.join(' ')} aria-hidden="true">
      {AUTHENTICATOR_MARK_COMPACT.parts.map((part, index) =>
        part.kind === 'stroke' ? (
          <path key={index} d={part.d} fill="none" stroke="currentColor" strokeWidth={part.width} strokeLinecap="round" />
        ) : null,
      )}
    </svg>
  );
}
