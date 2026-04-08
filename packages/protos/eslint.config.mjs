// @ts-check
import nx from '@nx/eslint-plugin';
import angularConfig from '../../eslint.angular.config.mjs';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          ignoredDependencies: [
            '@analogjs/vite-plugin-angular',
            '@analogjs/vitest-angular',
            '@angular/compiler',
            '@nx/vite',
            '@testing-library/angular',
            '@testing-library/jest-dom',
            'vite',
            'vitest',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'proto',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'proto',
          style: 'kebab-case',
        },
      ],
    },
  },
  ...angularConfig,
];
