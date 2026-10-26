import { useEffect, useState } from 'react';
import { send, type RemovedNotice } from '../lib/protocol.js';
import { useT } from '../i18n/react.js';
import { Button, Callout } from './primitives.js';

/**
 * This device was removed from its account by another one, with a proof it
 * checked, and the account's codes came off it (the vault service's
 * `endedByRemoval`). Said where the codes were — the popup and the Sync page —
 * until the person closes it: a list that empties itself with no reason given
 * is the worst way to find out.
 */
export function RemovedFromAccount() {
  const t = useT();
  const [notice, setNotice] = useState<RemovedNotice | null>(null);

  useEffect(() => {
    void send({ type: 'account/removedNotice' })
      .then(setNotice)
      .catch(() => undefined);
  }, []);

  if (!notice) return null;

  function close() {
    setNotice(null);
    void send({ type: 'account/dismissRemovedNotice' }).catch(() => undefined);
  }

  return (
    <Callout tone="warning">
      <p>{t('error.removedFromAccount')}</p>
      {notice.kept && <p className="mt-1">{t('removed.kept')}</p>}
      <Button size="sm" className="mt-2" onClick={close}>
        {t('common.close')}
      </Button>
    </Callout>
  );
}
