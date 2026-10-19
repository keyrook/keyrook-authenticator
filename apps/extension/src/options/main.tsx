import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@authx/ui/styles/tailwind.css';
import { installHost } from '@authx/ui/host.js';
import { I18nProvider } from '@authx/ui/i18n/react.js';
import { startI18n } from '@authx/ui/i18n/runtime.js';
import { App } from '@authx/ui/options/App.js';
import { chromeHost } from '../lib/host.js';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root');

installHost(chromeHost);
// The language first, so nothing paints in English and then changes.
await startI18n();

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
