import { useEffect, useState } from 'react';
import { send, type ProviderOffer } from '../lib/protocol.js';
import { CREATE_FRAGMENT, SIGN_IN_FRAGMENT, type SettingsFragment } from '../lib/deep-link.js';
import { host } from '../host.js';
import { ArrowLeftIcon, CheckIcon, CloudLockIcon } from '../components/icons.js';
import { Button } from '../components/primitives.js';
import { OrDivider, ProviderButtons } from '../options/ProviderSignIn.js';
import { useT } from '../i18n/react.js';

const BENEFITS = ['intro.benefit1', 'intro.benefit2'] as const;

/**
 * Signing in, from the popup. The popup closes the moment another window takes
 * focus, so it cannot hold a sign-in itself: Google and GitHub open in a tab
 * that ends on Settings → Sync, and email opens Settings on the form chosen.
 * It is here so that someone on a new browser, looking for their codes, finds
 * the way to them where they first look.
 */
export function SignInSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [offer, setOffer] = useState<ProviderOffer | null>(null);

  useEffect(() => {
    void send({ type: 'provider/offered' })
      .then(setOffer)
      .catch(() => setOffer({ providers: [], inTab: false }));
  }, []);

  const openSettings = (fragment: SettingsFragment) => {
    void host().openSettings(fragment);
    window.close();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-in-title"
      className="absolute inset-0 z-10 flex flex-col bg-white animate-slide-up dark:bg-neutral-950"
    >
      <header className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5 dark:border-neutral-900">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.back')}
          className="rounded-lg p-1.5 text-base text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <ArrowLeftIcon />
        </button>
        <h1 id="sign-in-title" className="text-[15px] font-semibold">
          {t('intro.title')}
        </h1>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 scrollarea">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-[18px] text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <CloudLockIcon />
          </span>
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">{t('intro.subtitle')}</p>
        </div>

        <ul className="flex flex-col gap-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2 text-[12.5px] leading-snug text-neutral-600 dark:text-neutral-300">
              <CheckIcon className="mt-px shrink-0 text-[14px] text-brand-600 dark:text-brand-400" />
              {t(benefit)}
            </li>
          ))}
        </ul>

        {/* Held at its height until the answer is known, so the buttons do not
            arrive under the pointer. */}
        <div className={offer ? 'flex flex-col gap-4' : 'invisible flex flex-col gap-4'} aria-hidden={offer ? undefined : true}>
          {(offer === null || offer.providers.length > 0) && (
            <>
              <ProviderButtons offer={offer ?? { providers: ['google', 'github'], inTab: true }} inNewTab />
              <OrDivider>{t('intro.orEmail')}</OrDivider>
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full" onClick={() => openSettings(CREATE_FRAGMENT)}>
              {t('intro.create')}
            </Button>
            <Button className="w-full" onClick={() => openSettings(SIGN_IN_FRAGMENT)}>
              {t('intro.signIn')}
            </Button>
          </div>
          <p className="text-center text-[11.5px] leading-relaxed text-neutral-400 dark:text-neutral-500">
            {t('popup.signInOpensTab')}
          </p>
        </div>
      </div>
    </div>
  );
}
