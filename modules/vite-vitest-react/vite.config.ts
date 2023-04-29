/// <reference types="vitest" />
/// <reference types="vite/client" />

import { default as react } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~/': './src',
    },
  },
  test: {
    css: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
