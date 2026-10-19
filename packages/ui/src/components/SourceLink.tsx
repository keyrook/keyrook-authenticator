import type { ReactNode } from 'react';
import { SOURCE_URL } from '../lib/links.js';
import { CodeIcon } from './icons.js';
import { cx } from './primitives.js';
import { useT } from '../i18n/react.js';

/** "Open source", linking to the published code. Opens in a new tab. */
export function SourceLink({
  href = SOURCE_URL,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children?: ReactNode;
}) {
  const t = useT();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cx(
        'inline-flex items-center gap-1 font-medium text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400',
        className,
      )}
    >
      <CodeIcon className="shrink-0" />
      {children ?? t('common.openSource')}
    </a>
  );
}
