import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Builds the extension's HTML surfaces and the MV3 service worker.
 * The content script is built separately (see vite.content.config.ts) because
 * `chrome.scripting.executeScript` requires a classic, self-contained script.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@authx/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
      '@keyrook/account': resolve(import.meta.dirname, '../../vendor/keyrook-account/src/index.ts'),
      '@authx/service': resolve(import.meta.dirname, '../../packages/service/src'),
      '@authx/ui': resolve(import.meta.dirname, '../../packages/ui/src'),
      '@keyrook/brand': resolve(import.meta.dirname, '../../vendor/keyrook-brand/src/index.ts'),
      '~': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome116',
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup.html'),
        options: resolve(import.meta.dirname, 'options.html'),
        background: resolve(import.meta.dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Give the shared chunks meaningful names. A store reviewer opening the
        // package should be able to tell library code from ours at a glance.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          // The Keyrook account's code beside the app's own core: both are
          // ours, and the chunk keeps the name it had before the two split.
          if (id.includes('packages/core') || id.includes('vendor/keyrook-account/')) return 'authx-core';
          return undefined;
        },
      },
    },
  },
  define: {
    // Strip React's dev-only warning machinery from the shipped bundle.
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
