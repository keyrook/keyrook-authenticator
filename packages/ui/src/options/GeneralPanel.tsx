import type { VaultData } from '@authx/core';
import { host } from '../host.js';
import { ISSUES_URL, LICENCE, SECURITY_MODEL_URL, SOURCE_URL } from '../lib/links.js';
import type { Mutate } from '../lib/protocol.js';
import { answered, updateRating } from '../lib/rating.js';
import { BRAND_ICONS } from '../components/brand-icons.js';
import { ChevronIcon, Logo, StarIcon } from '../components/icons.js';
import { APP_NAME } from '../lib/name.js';
import { SourceLink } from '../components/SourceLink.js';
import { Keys, useShortcuts } from '../components/shortcuts.js';
import { FILL_COMMAND, OPEN_COMMAND } from '../lib/commands.js';
import { PageHeader, Row, Section, Select, Toggle } from './Section.js';
import { useT } from '../i18n/react.js';
import { browserLocale, currentPreference, setLanguage, type LanguagePreference } from '../i18n/runtime.js';
import { LOCALE_NAMES, LOCALES } from '../i18n/locales.js';
import type { MessageKey } from '../i18n/locales/en.js';

/** A function, not a table: which build is running is known only once the host is installed. */
const facts = (): { title: MessageKey; body: MessageKey }[] => [
  // Said of the build that is running: a release without sync has no server
  // at all, and one with sync must not claim that.
  host().syncEnabled
    ? { title: 'about.fact.sync.title', body: 'about.fact.sync.body' }
    : { title: 'about.fact.local.title', body: 'about.fact.local.body' },
  { title: 'about.fact.keys.title', body: 'about.fact.keys.body' },
  { title: 'about.fact.access.title', body: 'about.fact.access.body' },
  { title: 'about.fact.standards.title', body: 'about.fact.standards.body' },
];

const LINK = 'text-brand-600 underline-offset-2 hover:underline dark:text-brand-400';

/**
 * Everything that is about how the extension looks and behaves rather than
 * about the codes: language, theme, order, autofill, the shortcut — and what
 * the extension is. These sat under Security, where nobody looks for a theme,
 * and under an About tab that was mostly an essay.
 */
export function GeneralPanel({ data, mutate }: { data: VaultData; mutate: Mutate }) {
  const t = useT();
  const { settings } = data;
  const { version } = host();
  const listing = host().storeListing();
  const shortcuts = useShortcuts();

  return (
    <>
      <PageHeader title={t('nav.general')} description={t('general.description')} />

      <Section title={t('security.appearance')}>
        <Row
          label={t('security.language')}
          control={
            <Select<LanguagePreference>
              label={t('security.language')}
              value={currentPreference()}
              onChange={(value) => void setLanguage(value)}
              options={[
                { value: 'auto', label: t('security.languageBrowser', { language: LOCALE_NAMES[browserLocale()] }) },
                ...LOCALES.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] })),
              ]}
            />
          }
        />
        <Row
          label={t('security.theme')}
          control={
            <Select
              label={t('security.theme')}
              value={settings.theme}
              onChange={(value) => void mutate({ op: 'settings/update', patch: { theme: value } })}
              options={[
                { value: 'system', label: t('security.theme.system') },
                { value: 'light', label: t('security.theme.light') },
                { value: 'dark', label: t('security.theme.dark') },
              ]}
            />
          }
        />
        <Row
          label={t('security.sortBy')}
          control={
            <Select
              label={t('security.sortOrder')}
              value={settings.sortBy}
              onChange={(value) => void mutate({ op: 'settings/update', patch: { sortBy: value } })}
              options={[
                { value: 'added', label: t('security.sort.added') },
                { value: 'name', label: t('security.sort.name') },
              ]}
            />
          }
        />
      </Section>

      <Section title={t('general.inBrowser')}>
        <Row
          label={t('security.autofillRow')}
          description={t('general.autofillHint')}
          control={
            <Toggle
              label={t('security.autofill')}
              checked={settings.autofillEnabled}
              onChange={(value) => void mutate({ op: 'settings/update', patch: { autofillEnabled: value } })}
            />
          }
        />
        {[
          { name: OPEN_COMMAND, label: t('shortcut.open'), hint: null },
          { name: FILL_COMMAND, label: t('shortcut.fill'), hint: t('shortcut.fillHint') },
        ].map(({ name, label, hint }) => (
          <Row
            key={name}
            label={label}
            description={hint ? `${hint} ${t('about.shortcut.change')}` : t('about.shortcut.change')}
            control={
              shortcuts === null ? null : shortcuts[name] ? (
                <Keys shortcut={shortcuts[name]!} />
              ) : (
                <span className="text-[12.5px] text-neutral-400 dark:text-neutral-500">{t('shortcut.notSet')}</span>
              )
            }
          />
        ))}
      </Section>

      <Section title={t('nav.about')}>
        <Row
          label={
            <span className="flex items-center gap-2.5">
              <Logo className="h-5 w-5" compact />
              {APP_NAME}
            </span>
          }
          control={<span className="text-[13px] text-neutral-600 dark:text-neutral-400">{t('about.version', { version })}</span>}
        />
        <Row
          label={t('about.source')}
          description={`${SOURCE_URL.replace('https://', '')} · ${LICENCE}`}
          control={<SourceLink className="text-[13px]">{t('about.viewOnGithub')}</SourceLink>}
        />
        <Row
          label={t('about.securityModel')}
          description={t('about.securityModelDescription')}
          control={
            <SourceLink href={SECURITY_MODEL_URL} className="text-[13px]">
              {t('about.readIt')}
            </SourceLink>
          }
        />
        <Row
          label={t('about.rate')}
          description={t('about.rateWhere', {
            store: listing.store === 'Edge Add-ons' ? t('rate.store.edge') : t('rate.store.chrome'),
          })}
          control={
            <a
              href={listing.url}
              target="_blank"
              rel="noreferrer"
              // Rated from here, the popup has no reason to ask.
              onClick={() => void updateRating(answered)}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
            >
              <StarIcon className="h-3.5 w-3.5 shrink-0" />
              {t('rate.rate')}
            </a>
          }
        />
        <Row
          label={t('about.report')}
          description={t('about.reportDescription')}
          control={
            <SourceLink href={`${ISSUES_URL}/new`} className="text-[13px]">
              {t('about.openIssue')}
            </SourceLink>
          }
        />
      </Section>

      {/* Folded: worth reading once, in the way of everything else after. */}
      <details className="group mb-8 rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900/60">
        <summary className="cursor-pointer list-none px-4 py-3.5 text-[13.5px] font-medium marker:hidden">
          <span className="flex items-center justify-between gap-4">
            {t('about.how')}
            <ChevronIcon className="h-4 w-4 shrink-0 rotate-90 text-neutral-400 transition-transform group-open:-rotate-90" />
          </span>
        </summary>
        <dl className="divide-y divide-neutral-100 border-t border-neutral-100 dark:divide-neutral-800/80 dark:border-neutral-800/80">
          {facts().map((fact) => (
            <div key={fact.title} className="px-4 py-3.5">
              <dt className="text-[13px] font-medium">{t(fact.title)}</dt>
              <dd className="mt-1 max-w-prose text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t(fact.body)}
              </dd>
            </div>
          ))}
          <div className="px-4 py-3.5">
            <dt className="text-[13px] font-medium">{t('about.logos.title')}</dt>
            <dd className="mt-1 max-w-prose text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t('about.logos.description')}{' '}
              {t.rich(
                'about.logos.body',
                { count: Object.keys(BRAND_ICONS).length },
                {
                  simple: (chunk) => (
                    <a href="https://simpleicons.org" target="_blank" rel="noreferrer" className={LINK}>
                      {chunk}
                    </a>
                  ),
                  fa: (chunk) => (
                    <a href="https://fontawesome.com" target="_blank" rel="noreferrer" className={LINK}>
                      {chunk}
                    </a>
                  ),
                },
              )}
            </dd>
          </div>
        </dl>
      </details>
    </>
  );
}
