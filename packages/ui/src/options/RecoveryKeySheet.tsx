import { useState } from 'react';
import { recoveryKitDocument } from '@authx/core';
import { Button, Callout } from '../components/primitives.js';
import { useT } from '../i18n/react.js';

/**
 * A freshly issued recovery key, shown the one time it exists anywhere.
 *
 * "Done" waits for the user to say it is saved: the key is stored nowhere, so
 * closing this without keeping it throws it away. There is deliberately no
 * "skip": by the time this shows, the key is already the account's, and an
 * account whose key nobody kept looks exactly like one that is safe.
 */
export function RecoveryKeySheet({
  recoveryKey,
  onDone,
  wide = false,
}: {
  recoveryKey: string;
  onDone: () => void;
  /** Full-width actions, for a narrow card rather than a settings row. */
  wide?: boolean;
}) {
  const t = useT();
  const [acknowledged, setAcknowledged] = useState(false);

  function downloadSheet() {
    const url = URL.createObjectURL(
      new Blob([recoveryKitDocument(recoveryKey)], { type: 'text/plain' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'keyrook-recovery-key.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3">
      <Callout tone="warning">
        {t('sheet.once')}
      </Callout>
      <code className="code-digits block rounded-xl bg-neutral-100 px-4 py-3.5 text-center text-[15px] font-semibold dark:bg-neutral-900">
        <KeyHalves recoveryKey={recoveryKey} />
      </code>
      <div className={wide ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}>
        <Button onClick={downloadSheet}>{t('sheet.download')}</Button>
        <Button onClick={() => void navigator.clipboard.writeText(recoveryKey)}>{t('sheet.copy')}</Button>
      </div>
      <label className="flex items-start gap-2.5 text-[13px] text-neutral-600 dark:text-neutral-300">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        {t('sheet.saved')}
      </label>
      <div>
        <Button variant="primary" className={wide ? 'w-full' : undefined} disabled={!acknowledged} onClick={onDone}>
          {t('common.done')}
        </Button>
      </div>
    </div>
  );
}

/**
 * The key in two halves of four groups, so a narrow box breaks it between
 * groups rather than inside one — a sheet copied by hand from "…E4GE-Y" and
 * "5AD…" is a key typed wrong later.
 */
function KeyHalves({ recoveryKey }: { recoveryKey: string }) {
  const groups = recoveryKey.split('-');
  const middle = Math.ceil(groups.length / 2);
  return (
    <>
      <span className="inline-block">{groups.slice(0, middle).join('-')}-</span>
      <span className="inline-block">{groups.slice(middle).join('-')}</span>
    </>
  );
}
