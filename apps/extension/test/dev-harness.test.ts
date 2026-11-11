import { describe, expect, test } from 'vitest';
import { DEV_RUNTIME_ID, devSender } from '../dev/identity.js';
import { isTrustedSender } from '../src/lib/messaging.js';

/**
 * The harness runs the real service worker behind a fake `chrome.*`, so it is
 * subject to the real trust check. It once sent an id with no origin, and the
 * check did exactly what it should: refused. The symptom was every harness
 * page reporting that the background never replied, with a clean console and
 * no failed request to point at, which cost more time to diagnose than the fix
 * was worth.
 *
 * These are cheap, and between them they say which side is allowed to move.
 * Tightening `isTrustedSender` may break the harness — that is fine, and this
 * test is where it gets noticed. Loosening it to accommodate the harness is
 * not, and `sender.test.ts` is where that gets caught.
 */
describe('the dev harness identity', () => {
  // Where `npm run dev` serves the harness, and so what `getURL('')` gives there.
  const PAGE = 'http://localhost:5173';

  test('satisfies the same check the background applies to real senders', () => {
    expect(isTrustedSender(devSender(PAGE), DEV_RUNTIME_ID, PAGE)).toBe(true);
  });

  test('is refused if it goes back to claiming an id alone', () => {
    expect(isTrustedSender({ id: DEV_RUNTIME_ID }, DEV_RUNTIME_ID, PAGE)).toBe(false);
  });

  test('does not accidentally trust some other extension', () => {
    expect(isTrustedSender(devSender(PAGE), 'anything-else', PAGE)).toBe(false);
  });
});
