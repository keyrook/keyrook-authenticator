import { useEffect, useState } from 'react';
import { host } from '../host.js';

/**
 * The shortcuts as they are set now — someone may have changed them at
 * chrome://extensions/shortcuts — by command name. Null until the host answers.
 */
export function useShortcuts(): Record<string, string> | null {
  const [shortcuts, setShortcuts] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    host()
      .shortcuts()
      .then(setShortcuts)
      .catch(() => setShortcuts({}));
  }, []);
  return shortcuts;
}

const KEY =
  'rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[12px] dark:border-neutral-700 dark:bg-neutral-900';

/** "Alt+Shift+F" as keys; macOS's "⌥⇧F" arrives without the pluses, as one. */
export function Keys({ shortcut }: { shortcut: string }) {
  const parts = shortcut.includes('+') ? shortcut.split('+') : [shortcut];
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-neutral-600 dark:text-neutral-400" dir="ltr">
      {parts.map((part, index) => (
        <span key={index} className="inline-flex items-center gap-1">
          {index > 0 && '+'}
          <kbd className={KEY}>{part}</kbd>
        </span>
      ))}
    </span>
  );
}
