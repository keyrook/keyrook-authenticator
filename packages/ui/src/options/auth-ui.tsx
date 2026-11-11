import { useContext, useState, type ReactNode } from 'react';
import { ArrowLeftIcon } from '../components/icons.js';
import { host } from '../host.js';
import { errorText } from '../i18n/error-text.js';
import { AppError } from '../i18n/errors.js';
import { translate } from '../i18n/runtime.js';
import { useBack } from '../lib/back.js';
import { BackInHeader } from './Section.js';

/*
 * The pieces every sign-in card is made of, shared by the email forms and the
 * Google and GitHub ones so the two read as one flow.
 */

/** A narrow, centred card: one column, one decision at a time. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-in mx-auto w-full max-w-[400px] rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 app:border-0 app:bg-transparent app:p-1 app:shadow-none dark:app:bg-transparent">
      {children}
    </div>
  );
}

export const MARK_TONES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  success: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300',
} as const;

export function Mark({ icon, tone = 'brand' }: { icon: ReactNode; tone?: keyof typeof MARK_TONES }) {
  return (
    <div className={`grid h-11 w-11 place-items-center rounded-2xl text-[22px] ${MARK_TONES[tone]}`}>
      {icon}
    </div>
  );
}

export function Heading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div>
      <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
    </div>
  );
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
    >
      {children}
    </button>
  );
}

export function Footnote({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">{children}</p>
  );
}

export function FormShell({
  onBack,
  title,
  subtitle,
  children,
  onSubmit,
}: {
  onBack: () => void;
  title: string;
  /** Left out when the first thing under the title is not about what it says. */
  subtitle?: ReactNode;
  children: ReactNode;
  onSubmit: () => void;
}) {
  // A step of a sign-in is a page of its own: the phone's back, and a phone's
  // header arrow, go back one step, not out of Sync.
  useBack(true, onBack);
  const backInHeader = useContext(BackInHeader);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-3">
        {!backInHeader && (
          <button
            type="button"
            onClick={onBack}
            aria-label={translate('common.back')}
            className="-ms-1.5 grid h-8 w-8 place-items-center rounded-lg text-[17px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <Heading title={title} subtitle={subtitle} />
      </div>
      {children}
    </form>
  );
}

/**
 * Firefox's leave to send anything to the account (`Host.allowAccountData`),
 * asked in the click that starts a sign-in, a sign-up or a sync. It must come
 * before anything else the click awaits: after an await Firefox no longer
 * counts the click, and refuses to show its prompt. Refused, it throws what
 * the vault service would say, and nothing has been sent.
 */
export async function askToSend(): Promise<void> {
  const ask = host().allowAccountData;
  if (ask && !(await ask())) throw new AppError('error.accountData.withheld');
}

/** Runs a submit with a busy flag and an error, the same way on every form. */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    if (busy) return;
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

  return { busy, error, run };
}
