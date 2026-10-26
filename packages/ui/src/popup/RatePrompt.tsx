import { host } from '../host.js';
import { answered, snooze, storeName, updateRating } from '../lib/rating.js';
import { StarIcon } from '../components/icons.js';
import { Button } from '../components/primitives.js';
import { useT } from '../i18n/react.js';

/**
 * The one time the popup asks for a rating. It sits under the list rather than
 * over it: whoever opened the popup came for a code, and gets it first.
 */
export function RatePrompt({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { store, url } = host().storeListing();

  async function rate() {
    // Written before the tab opens: opening it closes the popup, and a write
    // still in flight could go with it — and then the question comes back.
    await updateRating(answered);
    await host().openUrl(url);
    window.close();
  }

  async function notNow() {
    await updateRating((state) => snooze(state, Date.now()));
    onClose();
  }

  return (
    <div
      role="region"
      aria-label={t('rate.region')}
      className="mx-2 mb-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 animate-fade-in dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex gap-2.5">
        <StarIcon filled className="mt-px h-4 w-4 shrink-0 text-yellow-500" />
        <p className="text-[12.5px] leading-snug text-neutral-600 dark:text-neutral-300">
          {t.rich(
            'rate.body',
            { store: t(storeName(store)) },
            { b: (chunk) => <span className="font-medium text-neutral-900 dark:text-neutral-100">{chunk}</span> },
          )}
        </p>
      </div>
      <div className="mt-2.5 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => void notNow()}>
          {t('rate.notNow')}
        </Button>
        <Button size="sm" variant="primary" onClick={() => void rate()}>
          {t('rate.rate')}
        </Button>
      </div>
    </div>
  );
}
