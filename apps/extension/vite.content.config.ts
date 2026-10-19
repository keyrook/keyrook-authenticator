import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * The content script is injected on demand via `chrome.scripting.executeScript`,
 * which loads a classic script — so this build emits one self-contained IIFE
 * with no imports and no code splitting.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@authx/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
      '@keyrook/account': resolve(import.meta.dirname, '../../vendor/keyrook-account/src/index.ts'),
      '@authx/ui': resolve(import.meta.dirname, '../../packages/ui/src'),
      '~': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'chrome116',
    sourcemap: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/content/autofill.ts'),
      formats: ['iife'],
      name: 'AuthxAutofill',
      fileName: () => 'content.js',
    },
  },
});
