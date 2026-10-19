import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@authx/core': resolve(import.meta.dirname, 'packages/core/src/index.ts'),
      '@keyrook/account': resolve(import.meta.dirname, 'vendor/keyrook-account/src/index.ts'),
      '@authx/service': resolve(import.meta.dirname, 'packages/service/src'),
      '@authx/ui': resolve(import.meta.dirname, 'packages/ui/src'),
      '@keyrook/brand': resolve(import.meta.dirname, 'vendor/keyrook-brand/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: [
      'packages/**/test/**/*.test.ts',
      // @keyrook/account's own tests, copied with it.
      'vendor/keyrook-account/test/**/*.test.ts',
      'apps/extension/test/**/*.test.ts',
      // This app against the account server, through keyrook-account's kit.
      'integration/**/*.test.ts',
    ],
  },
});
