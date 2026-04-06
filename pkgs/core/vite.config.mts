/// <reference types="vitest" />

import angular from '@analogjs/vite-plugin-angular';
import {defineConfig} from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
  plugins: [angular(), viteTsConfigPaths()],
  test: {
    name: 'core',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
