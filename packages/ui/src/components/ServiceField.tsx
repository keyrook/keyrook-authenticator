import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { searchBrands, type BrandEntry } from '@authx/core';
import { BrandMark } from './BrandMark.js';
import { cx } from './primitives.js';
import { useT } from '../i18n/react.js';

export interface ServiceFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired when a suggestion is taken, so the caller can keep its domains. */
  onPick: (brand: BrandEntry) => void;
  label?: string;
  placeholder?: string;
  hint?: ReactNode;
  autoFocus?: boolean;
}

/**
 * A service name with suggestions from the bundled registry.
 *
 * Picking one is worth more than saving keystrokes: it attaches the service's
 * domains to the account, which is what later lets the popup offer the right
 * code on the right site without the user configuring anything.
 *
 * Free text stays valid — most services are not in a list of 125.
 */
export function ServiceField({
  value,
  onChange,
  onPick,
  label,
  placeholder = 'GitHub',
  hint,
  autoFocus,
}: ServiceFieldProps) {
  const t = useT();
  const id = useId();
  const [open, setOpen] = useState(false);
  // Nothing is highlighted until the user arrows into the list. Pre-selecting
  // the first match would mean someone typing an internal name like "Git
  // server" and pressing Enter to submit silently gets GitHub instead.
  const [highlight, setHighlight] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const suggestions = useMemo(() => searchBrands(value), [value]);

  // A query that no longer has matches must not leave a stale list open.
  useEffect(() => {
    setHighlight(-1);
    if (suggestions.length === 0) setOpen(false);
  }, [suggestions]);

  function take(brand: BrandEntry) {
    onChange(brand.name);
    onPick(brand);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === 'ArrowDown' && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((index) => (index <= 0 ? suggestions.length : index) - 1);
    } else if (event.key === 'Enter') {
      // Only swallow Enter while a suggestion is actually highlighted; with
      // nothing chosen the form submits as the user expects.
      const brand = highlight >= 0 ? suggestions[highlight] : undefined;
      if (brand) {
        event.preventDefault();
        take(brand);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
        {label ?? t('service.label')}
      </label>

      <input
        id={id}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && highlight >= 0 && suggestions[highlight]
            ? `${id}-option-${suggestions[highlight]!.slug}`
            : undefined
        }
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Blur fires before click, so closing here would cancel the pick. The
        // options prevent mousedown instead; this only handles leaving by tab.
        onBlur={() => window.setTimeout(() => setOpen(false), 0)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
      />

      {hint && <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{hint}</p>}

      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={t('service.matches')}
          className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-raised dark:border-neutral-700 dark:bg-neutral-900"
        >
          {suggestions.map((brand, index) => (
            <li
              key={brand.slug}
              id={`${id}-option-${brand.slug}`}
              role="option"
              aria-selected={index === highlight}
              onMouseDown={(event) => {
                event.preventDefault();
                take(brand);
              }}
              // `mousemove`, not `mouseenter`: the list opens wherever the
              // pointer happens to be resting, and `mouseenter` fires for
              // whatever it lands under — silently arming Enter to pick a
              // service the user never pointed at.
              onMouseMove={() => setHighlight(index)}
              className={cx(
                'flex cursor-pointer items-center gap-2.5 px-2.5 py-2',
                index === highlight && 'bg-neutral-100 dark:bg-neutral-800',
              )}
            >
              <BrandMark issuer={brand.name} domains={brand.domains} size={24} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-neutral-800 dark:text-neutral-100">
                  {brand.name}
                </span>
                {brand.domains[0] && (
                  <span className="block truncate text-[11px] text-neutral-400 dark:text-neutral-500">
                    {brand.domains[0]}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
