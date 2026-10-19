import { useEffect, useMemo, useState } from 'react';
import {
  QUICK_DEFAULTS,
  formatCode,
  generateCode,
  readQuickInput,
  totpWindow,
  type OtpAlgorithm,
  type ParsedOtpUri,
  type QuickSettings,
} from '@authx/core';
import { CountdownRing } from './CountdownRing.js';
import { useCopy, useNow } from './hooks.js';
import { CheckIcon, CopyIcon } from './icons.js';
import { Button, cx } from './primitives.js';
import { useT } from '../i18n/react.js';
import { localise } from '../i18n/error-text.js';

/**
 * A code from a pasted key, kept nowhere. The key lives in this component's
 * state and nowhere else — not the vault, not storage, not the service worker
 * — so closing it is the whole of forgetting it. Saving is a separate choice.
 */
export function QuickCode({ onSave }: { onSave?: (params: ParsedOtpUri) => Promise<void> }) {
  const t = useT();
  const [input, setInput] = useState('');
  const [settings, setSettings] = useState<QuickSettings>(QUICK_DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [codes, setCodes] = useState<{ current: string; next: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const { copiedId, copy } = useCopy();
  const now = useNow(250);

  const read = useMemo(() => readQuickInput(input, settings), [input, settings]);
  const params = read.kind === 'ok' ? read.params : null;
  const window_ = params?.type === 'totp' ? totpWindow(params.period, now) : null;
  // What the code depends on, as one value: a new object every render would
  // recompute the code four times a second.
  const recipe = params ? JSON.stringify([params, window_?.counter ?? 0]) : '';

  useEffect(() => {
    if (!params) {
      setCodes(null);
      return;
    }
    let live = true;
    const at = Date.now();
    void Promise.all([
      generateCode(params, at),
      params.type === 'totp' ? generateCode(params, at + params.period * 1000) : Promise.resolve(null),
    ])
      .then(([current, next]) => live && setCodes({ current, next }))
      .catch(() => live && setCodes(null));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quick-key" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {t('quick.label')}
        </label>
        <textarea
          id="quick-key"
          autoFocus
          rows={2}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="JBSW Y3DP EHPK 3PXP"
          className="w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 font-mono text-[13px] placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
        />
        {read.kind === 'error' && (
          <p className="text-[12px] leading-snug text-red-600 dark:text-red-300">{localise(read.message)}</p>
        )}
      </div>

      {read.kind === 'ok' && read.fromLink ? (
        (params!.issuer || params!.label) && (
          <p className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">
            {[params!.issuer, params!.label].filter(Boolean).join(' · ')}
          </p>
        )
      ) : (
        <Settings settings={settings} editing={editing} onEdit={() => setEditing(true)} onChange={setSettings} />
      )}

      {params && codes && (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 animate-fade-in dark:border-neutral-800">
          <button
            type="button"
            onClick={() => void copy('quick', codes.current)}
            title={t('quick.copyHint')}
            className="min-w-0 flex-1 text-start"
          >
            <span className="code-digits block text-[26px] font-semibold leading-tight" aria-label={t('quick.current')}>
              {formatCode(codes.current)}
            </span>
            {codes.next && (
              <span className="text-[11.5px] text-neutral-600 dark:text-neutral-400">
                {t.rich(
                  'quick.next',
                  { code: formatCode(codes.next) },
                  { code: (chunk) => <span className="code-digits">{chunk}</span> },
                )}
              </span>
            )}
          </button>
          <Button size="sm" onClick={() => void copy('quick', codes.current)} aria-label={copiedId ? t('row.copied') : t('row.copy')}>
            {copiedId ? <CheckIcon /> : <CopyIcon />}
          </Button>
          {window_ && <CountdownRing remaining={window_.remaining} period={params.period} />}
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t('quick.notSaved')}
      </p>

      {onSave && params && (
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(params);
            } finally {
              setSaving(false);
            }
          }}
        >
          {t('quick.save')}
        </Button>
      )}
    </div>
  );
}

/**
 * The settings a bare key is read with. Folded to one line: nearly every site
 * uses six digits every thirty seconds, and the rest is noise until it is not.
 */
function Settings({
  settings,
  editing,
  onEdit,
  onChange,
}: {
  settings: QuickSettings;
  editing: boolean;
  onEdit: () => void;
  onChange: (settings: QuickSettings) => void;
}) {
  const t = useT();
  if (!editing) {
    return (
      <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
        {t('quick.settings', {
          digits: settings.digits,
          period: settings.period,
          algorithm: settings.algorithm.replace('SHA', 'SHA-'),
        })}
        {' — '}
        <button type="button" onClick={onEdit} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          {t('quick.change')}
        </button>
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <Segments
        label={t('quick.digits')}
        value={settings.digits}
        options={[6, 7, 8]}
        onChange={(digits) => onChange({ ...settings, digits })}
      />
      <Segments
        label={t('quick.every')}
        value={settings.period}
        options={[30, 60]}
        format={(seconds) => t('quick.seconds', { seconds })}
        onChange={(period) => onChange({ ...settings, period })}
      />
      <Segments<OtpAlgorithm>
        label={t('quick.hash')}
        value={settings.algorithm}
        options={['SHA1', 'SHA256', 'SHA512']}
        format={(algorithm) => algorithm.replace('SHA', 'SHA-')}
        onChange={(algorithm) => onChange({ ...settings, algorithm })}
      />
    </div>
  );
}

function Segments<T extends string | number>({
  label,
  value,
  options,
  format = String,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  format?: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[12px] text-neutral-600 dark:text-neutral-400">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
        {options.map((option) => (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={option === value}
            onClick={() => onChange(option)}
            className={cx(
              'h-7 rounded-md px-2.5 text-[12px] font-medium',
              option === value
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
            )}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
