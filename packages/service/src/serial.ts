/**
 * Runs work one piece at a time.
 *
 * Every vault write is read-modify-write: load the current data, apply a
 * change, re-encrypt the whole payload, store it. Requests arrive
 * concurrently — `chrome.runtime.onMessage` delivers them so in the
 * extension — so without this two of those interleave —
 * both read the same snapshot, and whichever finishes last silently discards
 * the other's change. That needs no attacker: a popup and a settings tab open
 * at once will do it, and so will the five-minute sync alarm firing while
 * somebody is editing.
 *
 * A failure must not wedge the queue, so the next piece of work runs whether
 * the previous one resolved or threw.
 */
export function createSerialiser() {
  let tail: Promise<unknown> = Promise.resolve();

  return function serial<T>(run: () => Promise<T>): Promise<T> {
    const result = tail.then(run, run);
    tail = result.catch(() => undefined);
    return result;
  };
}
