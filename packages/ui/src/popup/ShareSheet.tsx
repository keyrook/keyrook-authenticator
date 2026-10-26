import type { VaultItem } from '@authx/core';
import { BrandMark } from '../components/BrandMark.js';
import { ArrowLeftIcon } from '../components/icons.js';
import { ShareOrMove } from '../components/ShareCodes.js';
import { useT } from '../i18n/react.js';
import { useBack } from '../lib/back.js';
import { titleOf } from '../i18n/titles.js';

/** The popup's view of sharing one account, over the list like Add. */
export function ShareSheet({ item, onClose }: { item: VaultItem; onClose: () => void }) {
  const t = useT();
  useBack(true, onClose);
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-white animate-slide-up dark:bg-neutral-950">
      <header className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5 dark:border-neutral-900">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.back')}
          className="rounded-lg p-1.5 text-base text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-[15px] font-semibold">{t('row.share')}</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollarea">
        <div className="mb-4 flex items-center gap-3">
          <BrandMark issuer={item.issuer} label={item.label} domains={item.domains} icon={item.icon} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold">{titleOf(item)}</p>
            {item.issuer && item.label && (
              <p className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{item.label}</p>
            )}
          </div>
        </div>
        <ShareOrMove item={item} compact />
      </div>
    </div>
  );
}
