import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateCode, type VaultItem, type ThemePreference } from '@authx/core';
import {
  onVaultChanged,
  send,
  type Mutation,
  type VaultStatus,
} from '../lib/protocol.js';
import { errorText } from '../i18n/error-text.js';
import { host } from '../host.js';

/** Vault status plus the only sanctioned way to write to it. */
export function useVault() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await send({ type: 'vault/status' }));
      setError(null);
    } catch (cause) {
      setError(errorText(cause));
    }
  }, []);

  useEffect(() => {
    void refresh();
    return onVaultChanged(() => void refresh());
  }, [refresh]);

  const mutate = useCallback(
    async (mutation: Mutation): Promise<void> => {
      await send({ type: 'vault/mutate', mutation });
      await refresh();
    },
    [refresh],
  );

  const data = status?.state === 'unlocked' ? status.data : null;
  const protection = status?.state === 'unlocked' ? status.protection : null;
  return { status, data, protection, error, refresh, mutate, setStatus };
}

/** Ticking clock. 250 ms keeps the countdown rings smooth without thrashing React. */
export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * Codes for every item, recomputed only when a time step actually rolls over
 * rather than on every clock tick — HMAC is cheap but not free, and this keeps
 * the list stable while the ring animates.
 */
export function useCodes(items: VaultItem[], now: number): Record<string, string> {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const second = Math.floor(now / 1000);

  const stepKey = useMemo(
    () =>
      items
        .map((item) =>
          item.type === 'hotp'
            ? `${item.id}:h${item.counter}`
            : `${item.id}:t${Math.floor(second / item.period)}`,
        )
        .join('|'),
    // `second` is intentionally part of the input: the resulting string only
    // changes at a step boundary, which is what the effect below keys on.
    [items, second],
  );

  const generation = useRef(0);

  useEffect(() => {
    const run = ++generation.current;
    let cancelled = false;

    void Promise.all(
      items.map(async (item) => {
        try {
          return [item.id, await generateCode(item, Date.now())] as const;
        } catch {
          return [item.id, '——————'] as const;
        }
      }),
    ).then((entries) => {
      // Drop results from a superseded run so a slow batch cannot overwrite a
      // newer one.
      if (cancelled || run !== generation.current) return;
      setCodes(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  return codes;
}

/** Applies the theme preference to <html> and follows the OS when set to system. */
export function useTheme(preference: ThemePreference | undefined): void {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved =
        preference === 'system' || preference === undefined
          ? media.matches
            ? 'dark'
            : 'light'
          : preference;
      document.documentElement.dataset.theme = resolved;
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference]);
}

/** Copy-to-clipboard with a short "copied" acknowledgement. */
export function useCopy(resetAfterMs = 1400) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (id: string, text: string) => {
      await host().copy(text);
      setCopiedId(id);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopiedId(null), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { copiedId, copy };
}

/**
 * Tell the vault service the user is still here, so auto-lock keeps deferring
 * — while the page can be seen, and not otherwise. A Settings tab left behind
 * another one, or a phone app sent to the background, is a page nobody is
 * using, and kept the vault open for as long as it stayed open. Coming back
 * into sight counts as use at once, or a short delay would lock the vault
 * under the person who just returned to it.
 */
export function useActivityPing(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const ping = () => {
      if (document.visibilityState === 'visible') void send({ type: 'activity/ping' });
    };
    ping();
    const id = window.setInterval(ping, 60_000);
    document.addEventListener('visibilitychange', ping);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', ping);
    };
  }, [active]);
}
