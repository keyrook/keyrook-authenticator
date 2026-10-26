import { useEffect, useState } from 'react';
import type { PendingStartOver } from '@authx/core';
import { send } from '../lib/protocol.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { asName } from '../lib/device-name.js';
import { Button, Callout, Spinner } from './primitives.js';

/**
 * A start over asked for with the account's email alone, still waiting its
 * week. Whoever reads the inbox can ask for one, and once it happens the
 * account has their password; besides the account page, a device still
 * signed in is the only place it can be stopped. So it is red, it names the
 * day, and the button that stops it is right here.
 *
 * Draws nothing until the service answers, and nothing when it cannot reach
 * the server: a warning that might be wrong would teach people to ignore it.
 */
export function StartOverWaiting({ fresh = false }: { fresh?: boolean }) {
  const t = useT();
  const [waiting, setWaiting] = useState<PendingStartOver | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void send({ type: 'account/startOverWaiting', fresh })
      .then(setWaiting)
      .catch(() => undefined);
  }, [fresh]);

  if (!waiting) return null;
  const day = (at: number) => new Date(at).toLocaleDateString(t.locale, { dateStyle: 'long' });

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await send({ type: 'account/cancelStartOver' });
      setWaiting(null);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Callout tone="danger">
      <p className="font-medium">{t('startOver.title', { date: day(waiting.executesAt) })}</p>
      <p className="mt-1">{t('startOver.lead', { device: asName(waiting.deviceName), date: day(waiting.requestedAt) })}</p>
      <p className="mt-1">{t('startOver.ifYou')}</p>
      {error && <p className="mt-1 font-medium">{error}</p>}
      {/* Wrapped rather than cut off: in a long language the label is wider
          than the popup. */}
      <Button
        variant="danger"
        size="sm"
        className="mt-2 h-auto! min-h-8 py-1.5 text-start whitespace-normal!"
        disabled={busy}
        onClick={() => void cancel()}
      >
        {busy ? <Spinner /> : null}
        {t('startOver.cancel')}
      </Button>
    </Callout>
  );
}

