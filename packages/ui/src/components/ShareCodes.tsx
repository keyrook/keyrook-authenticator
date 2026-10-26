import { useState } from 'react';
import {
  SHARE_MINUTES,
  isTimeBased,
  isValidBase32,
  shareCodes,
  shareLink,
  sharedUntil,
  type ShareMinutes,
  type VaultItem,
} from '@authx/core';
import { CheckIcon, CopyIcon } from './icons.js';
import { Button, Callout } from './primitives.js';
import { ShareAccount } from './ShareAccount.js';
import { Select } from '../options/Section.js';
import { host } from '../host.js';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';

const LENGTH_LABEL: Record<ShareMinutes, MessageKey> = {
  5: 'shareCodes.min5',
  15: 'shareCodes.min15',
  60: 'shareCodes.hour',
};

/**
 * One account's codes for a while, by link. The link holds the codes worked
 * out ahead for the time chosen and never the secret (core's otp/share.ts),
 * so it ends on every copy of it, and nothing about it is kept or sent from
 * here: copying it is the whole of it.
 */
export function ShareCodes({ item }: { item: VaultItem }) {
  const t = useT();
  const [minutes, setMinutes] = useState<ShareMinutes>(15);
  const [until, setUntil] = useState<number | null>(null);

  if (item.type === 'hotp') return <Callout tone="info">{t('shareCodes.counter')}</Callout>;

  async function copy() {
    const shared = await shareCodes(item, minutes);
    await host().copy(shareLink(shared));
    setUntil(sharedUntil(shared));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">{t('shareCodes.intro')}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('shareCodes.lengthLabel')}</span>
        <Select
          label={t('shareCodes.lengthLabel')}
          value={minutes}
          onChange={(value) => {
            setMinutes(value);
            setUntil(null);
          }}
          options={SHARE_MINUTES.map((value) => ({ value, label: t(LENGTH_LABEL[value]) }))}
        />
      </div>
      <Callout tone="warning">{t('shareCodes.cannotRecall')}</Callout>
      <Button variant="primary" className="w-full" onClick={() => void copy()}>
        {until ? <CheckIcon /> : <CopyIcon />}
        {t('shareCodes.copy')}
      </Button>
      {until && (
        <p role="status" className="text-center text-[12px] text-neutral-600 dark:text-neutral-400">
          {t('shareCodes.copied', {
            time: new Date(until).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          })}
        </p>
      )}
    </div>
  );
}

/**
 * The one way in to giving an account to someone or something else: its
 * codes for a while, or the account itself for another app. A time-based
 * account opens on the codes — the one that ends.
 */
export function ShareOrMove({ item, compact = false }: { item: VaultItem; compact?: boolean }) {
  const t = useT();
  const [mode, setMode] = useState<'codes' | 'move'>(isTimeBased(item.type) ? 'codes' : 'move');
  // An account with no key makes no codes and has nothing to move. Both ways
  // build from the key, and the setup QR code threw as it drew, blanking the
  // whole page.
  if (!isValidBase32(item.secret)) return <Callout tone="warning">{t('shareCodes.noSecret')}</Callout>;
  return (
    <div className="flex flex-col gap-4">
      <Select
        label={t('shareCodes.modeLabel')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'codes', label: t('shareCodes.modeCodes') },
          { value: 'move', label: t('shareCodes.modeMove') },
        ]}
      />
      {mode === 'codes' ? <ShareCodes item={item} /> : <ShareAccount item={item} compact={compact} />}
    </div>
  );
}
