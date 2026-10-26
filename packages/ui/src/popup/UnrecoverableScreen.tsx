import { useState } from 'react';
import { send } from '../lib/protocol.js';
import { Logo } from '../components/icons.js';
import { Button, Callout, Spinner } from '../components/primitives.js';
import { useT } from '../i18n/react.js';

/**
 * Shown when a device-protected vault outlives the key that protected it —
 * cleared browsing data, a fresh profile, or a reinstall. There is genuinely
 * no way back in, so the screen says that outright instead of pretending.
 */
export function UnrecoverableScreen({
  onReset,
  hasRecovery,
  onUseRecoveryKey,
}: {
  onReset: () => Promise<void>;
  hasRecovery: boolean;
  onUseRecoveryKey: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);

  return (
    <div className="flex min-h-[480px] app:min-h-(--app-height) flex-col justify-center gap-5 p-7 text-center">
      <div className="flex flex-col items-center gap-3">
        <Logo className="h-11 w-11 opacity-60" />
        <h1 className="text-[16px] font-semibold">{t('unrecoverable.title')}</h1>
      </div>

      <Callout tone="danger">
        {t('unrecoverable.why')}
      </Callout>

      {hasRecovery ? (
        <>
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t('unrecoverable.hasKit')}
          </p>
          <Button variant="primary" onClick={onUseRecoveryKey}>
            {t('unrecoverable.useKit')}
          </Button>
        </>
      ) : (
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t('unrecoverable.noKit')}
        </p>
      )}

      {armed ? (
        <div className="flex flex-col gap-2">
          <Button
            variant="danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await send({ type: 'vault/reset' });
                await onReset();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? <Spinner /> : null} {t('unrecoverable.confirmErase')}
          </Button>
          <Button variant="ghost" onClick={() => setArmed(false)}>
            {t('common.cancel')}
          </Button>
        </div>
      ) : (
        <Button variant={hasRecovery ? 'ghost' : 'primary'} onClick={() => setArmed(true)}>
          {t('unrecoverable.startOver')}
        </Button>
      )}
    </div>
  );
}
