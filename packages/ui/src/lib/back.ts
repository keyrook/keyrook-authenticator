import { useEffect, useRef } from 'react';

/**
 * A phone's back button or gesture closes whatever was opened last — a sheet,
 * a page of Settings, Settings itself — the way that thing's own back button
 * would. Left to the platform, it would leave the app from under a half-filled
 * form. The extension has no such button: nothing calls `goBack` there, and
 * the hook only keeps a list.
 *
 * Last opened, first closed: the list is in the order things opened. Two that
 * open in one render are pushed child first, so a screen that opens already
 * showing something of its own takes back for both, in one handler.
 */
const open: Array<{ close: () => void }> = [];

/** While `active`, back does what `onBack` does. */
export function useBack(active: boolean, onBack: () => void): void {
  const latest = useRef(onBack);
  latest.current = onBack;
  useEffect(() => {
    if (!active) return;
    const entry = { close: () => latest.current() };
    open.push(entry);
    return () => {
      const at = open.lastIndexOf(entry);
      if (at >= 0) open.splice(at, 1);
    };
  }, [active]);
}

/**
 * The platform's back, taken by what was opened last. False when nothing was
 * open — the first screen is showing, and leaving is the platform's to do.
 */
export function goBack(): boolean {
  const last = open.at(-1);
  if (!last) return false;
  last.close();
  return true;
}
