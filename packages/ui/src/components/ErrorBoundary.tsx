import { Component, useEffect, type ReactNode } from 'react';
import { useT } from '../i18n/react.js';
import { Logo } from './icons.js';
import { Button, cx } from './primitives.js';

/**
 * What a page shows when a screen in it throws while drawing. Without it React
 * unmounts the whole tree: an account with an empty secret once made "Share or
 * move" throw, and the popup went white with nothing left to press.
 *
 * It catches rendering and effects, never an event handler — those show their
 * own error where it happened. React still logs what it caught to the console.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; className?: string }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? <Crashed className={this.props.className} /> : this.props.children;
  }
}

function Crashed({ className }: { className?: string }) {
  const t = useT();

  // The theme is applied from the vault's settings, which a screen that threw
  // before its first commit never got to do: follow the system rather than
  // flash a white page at someone who reads in dark.
  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.theme) {
      root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  }, []);

  return (
    <div role="alert" className={cx('flex flex-col items-center justify-center gap-4 px-8 text-center', className)}>
      <Logo className="h-9 w-9 opacity-60" />
      <h1 className="text-[16px] font-semibold">{t('crash.title')}</h1>
      <p className="max-w-sm text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('crash.body')}</p>
      {/* A fresh page asks the vault again from the start; nothing held in
          the one that broke is worth keeping. */}
      <Button variant="primary" onClick={() => location.reload()}>
        {t('crash.reload')}
      </Button>
    </div>
  );
}
