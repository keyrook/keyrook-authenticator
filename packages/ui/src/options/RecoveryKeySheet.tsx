import { useState } from 'react';
import { recoveryKitDocument } from '@authx/core';
import { Button, Callout, Field } from '../components/primitives.js';
import { host } from '../host.js';
import { groupMatches, pickGroups } from '../lib/sheet-check.js';
import { useT } from '../i18n/react.js';

/**
 * A freshly issued recovery key, shown the one time it exists anywhere.
 *
 * Going on takes two of its groups typed back from what was saved: the key is
 * stored nowhere, so closing this without keeping it throws it away, and a
 * checkbox let people go on with a key they never kept — they found out the
 * day they forgot their password. There is deliberately no "skip": by the
 * time this shows, the key is already the account's, and an account whose key
 * nobody kept looks exactly like one that is safe.
 */
export function RecoveryKeySheet({
  recoveryKey,
  onDone,
  wide = false,
  apart,
}: {
  recoveryKey: string;
  onDone: () => void;
  /** Full-width actions, for a narrow card rather than a settings row. */
  wide?: boolean;
  /**
   * What, with this key, opens the account — the email, or the Google or
   * GitHub account it signs in with — to say it must be kept apart from.
   * Absent for a vault signed in to nothing, whose key opens only itself.
   */
  apart?: 'password' | 'provider';
}) {
  const t = useT();
  const [asked, setAsked] = useState<[number, number] | null>(null);
  const [typed, setTyped] = useState<[string, string]>(['', '']);
  const [mismatch, setMismatch] = useState(false);

  function downloadSheet() {
    void host().saveFile(
      'keyrook-recovery-key.txt',
      new Blob([recoveryKitDocument(recoveryKey)], { type: 'text/plain' }),
    );
  }

  function showAgain() {
    setAsked(null);
    setTyped(['', '']);
    setMismatch(false);
  }

  if (asked) {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const matches = asked.every((position, index) => groupMatches(recoveryKey, position, typed[index]!));
          if (matches) onDone();
          else setMismatch(true);
        }}
      >
        <div>
          <p className="text-[13px] font-medium">{t('sheet.checkHeading')}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t('sheet.checkLead')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {asked.map((position, index) => (
            <Field
              key={position}
              label={t('sheet.group', { position })}
              data-group={position}
              autoComplete="off"
              spellCheck={false}
              autoFocus={index === 0}
              maxLength={6}
              value={typed[index]}
              onChange={(event) => {
                const next: [string, string] = [...typed];
                next[index] = event.target.value;
                setTyped(next);
                setMismatch(false);
              }}
              className="font-mono text-[14px] uppercase"
            />
          ))}
        </div>
        {mismatch && <Callout tone="danger">{t('sheet.mismatch')}</Callout>}
        <div className={wide ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}>
          <Button type="submit" variant="primary" disabled={typed.some((value) => value.trim() === '')}>
            {t('sheet.check')}
          </Button>
          <Button onClick={showAgain}>{t('sheet.showAgain')}</Button>
        </div>
      </form>
    );
  }

  return (
    // Printed alone: the stylesheet hides the rest of the page and the buttons.
    <div className="recovery-print flex flex-col gap-3">
      <Callout tone="warning">
        {t('sheet.once')}
      </Callout>
      <code className="code-digits block rounded-xl bg-neutral-100 px-4 py-3.5 text-center text-[15px] font-semibold dark:bg-neutral-900">
        <KeyHalves recoveryKey={recoveryKey} />
      </code>
      {apart && (
        <Callout tone="warning">{apart === 'provider' ? t('sheet.apartProvider') : t('sheet.apart')}</Callout>
      )}
      {/* Grown to fill the card, and wrapped rather than squeezed: in a long
          language three labels do not fit one row of a narrow card. */}
      <div className={wide ? 'flex flex-wrap gap-2 [&>*]:grow' : 'flex flex-wrap gap-2'}>
        <Button onClick={downloadSheet}>{t('sheet.download')}</Button>
        <Button onClick={() => host().print()}>{t('sheet.print')}</Button>
        <Button onClick={() => void host().copy(recoveryKey)}>{t('sheet.copy')}</Button>
      </div>
      <div>
        <Button variant="primary" className={wide ? 'w-full' : undefined} onClick={() => setAsked(pickGroups(recoveryKey))}>
          {t('sheet.kept')}
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
