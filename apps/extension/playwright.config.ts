import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';

// The sync suite drives two browsers against the sync server: keyrook-account's,
// from the kit copied into vendor/ (npm run account). The kit is not part of
// the open-source tree, and the extension does not trust the server anyway —
// so where it is absent, only the suites that need nothing but the extension
// run.
const DEV_SERVER = resolve(import.meta.dirname, '../../vendor/keyrook-account-kit/dev-server.mjs');
const hasSyncServer = existsSync(DEV_SERVER);

export default defineConfig({

  // A shared Chromium profile per test makes parallel runs fight over the
  // extension; these are fast enough to run in sequence.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? 'line' : [['list']],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'e2e', testDir: './e2e' },
    // Two browser profiles against a live server. Needs the extension built
    // with VITE_SYNC_API_URL pointing at it, which `npm run test:e2e` does.
    ...(hasSyncServer ? [{ name: 'sync', testDir: './sync-e2e' }] : []),
    // Asset generation, not a test. Run it with `npm run shots`.
    { name: 'shots', testDir: './shots' },
    // Every screen in light and dark, for a person to look at before a
    // release. Not a test either: `npm run review -w @authx/extension`.
    ...(hasSyncServer ? [{ name: 'review', testDir: './review', timeout: 300_000 }] : []),
  ],

  // The real server, on Postgres-compiled-to-WebAssembly, so no database has to
  // exist for the suite to run.
  ...(hasSyncServer
    ? {
        webServer: {
          // In memory, on :8799, its mailbox at /__dev/mailbox and stand-in
          // Google and GitHub sign-ins: the extension's e2e build points there.
          command: 'node vendor/keyrook-account-kit/dev-server.mjs',
          port: 8799,
          cwd: '../..',
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }
    : {}),
});
