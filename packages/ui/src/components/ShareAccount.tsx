import { useEffect, useState } from 'react';
import { buildOtpUri, type VaultItem } from '@authx/core';
import { CheckIcon, CopyIcon, ImageIcon } from './icons.js';
import { Button, Callout } from './primitives.js';
import { QrCode, qrPng } from './QrCode.js';
import { useT } from '../i18n/react.js';
import { titleOf } from '../i18n/titles.js';

/** How long a shown code stays on screen before it hides itself. */
const SHOWN_FOR_SECONDS = 60;

/**
 * One account, handed to another app: its setup QR code, which every
 * authenticator scans, and its `otpauth://` link. Shared by the popup and the
 * settings page.
 *
 * The code is the account's secret in a form a camera can take. So it is not
 * drawn until asked for, the warning comes first, and it hides itself again
 * after a minute — a screen left open, or a screen being shared, should not be
 * showing it.
 */
export function ShareAccount({ item, compact = false }: { item: VaultItem; compact?: boolean }) {
  const t = useT();
  const [shownUntil, setShownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const uri = buildOtpUri(item);
  const shown = shownUntil !== null && now < shownUntil;

  useEffect(() => {
    if (shownUntil === null) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [shownUntil]);

  useEffect(() => {
    if (shownUntil !== null && now >= shownUntil) {
      setShownUntil(null);
      setCopied(false);
    }
  }, [now, shownUntil]);

  async function copyLink() {
    await navigator.clipboard.writeText(uri);
    setCopied(true);
  }

  async function saveImage() {
    const url = URL.createObjectURL(await qrPng(uri));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(item.issuer || item.label || 'account').replace(/[^\p{L}\p{N}._-]+/gu, '-')}-2fa-qr.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  if (!shown) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
          {t('share.intro')}
        </p>
        <Callout tone="warning">
          {t('share.warning', { account: titleOf(item) })}
        </Callout>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => {
            setNow(Date.now());
            setShownUntil(Date.now() + SHOWN_FOR_SECONDS * 1000);
          }}
        >
          {t('share.show')}
        </Button>
      </div>
    );
  }

  const secondsLeft = Math.max(0, Math.ceil(((shownUntil ?? 0) - now) / 1000));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-700">
        <QrCode text={uri} size={compact ? 196 : 240} label={t('share.qrLabel', { account: titleOf(item) })} />
      </div>
      <p className="text-center text-[12px] text-neutral-600 dark:text-neutral-400">
        {t('share.hidesIn', { seconds: secondsLeft })}
      </p>
      <div className="grid w-full grid-cols-2 gap-2">
        <Button size="sm" onClick={() => void copyLink()}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? t('share.linkCopied') : t('share.copyLink')}
        </Button>
        <Button size="sm" onClick={() => void saveImage()}>
          <ImageIcon />
          {t('share.saveImage')}
        </Button>
      </div>
      {copied && (
        <p className="text-center text-[11.5px] leading-relaxed text-yellow-800 dark:text-yellow-300">
          {t('share.linkWarning')}
        </p>
      )}
      <Button size="sm" variant="ghost" onClick={() => setShownUntil(null)}>
        {t('share.hideNow')}
      </Button>
    </div>
  );
}
