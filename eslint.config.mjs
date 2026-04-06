// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'out-tsc/', '.angular/', 'docs/'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Angular library: selectors use the library prefix
      '@angular-eslint/directive-selector': [
        'error',
        {type: 'attribute', prefix: 'base', style: 'camelCase'},
      ],
      '@angular-eslint/component-selector': [
        'error',
        {type: 'element', prefix: 'base', style: 'kebab-case'},
      ],

      // Library authors rename inputs/outputs for public API
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-rename': 'off',

      // Enforce modern Angular patterns
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/no-host-metadata-property': 'off', // we use host bindings intentionally
      '@angular-eslint/prefer-output-readonly': 'error',

      // TypeScript strict overrides for library code
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {allowExpressions: true, allowConciseArrowFunctionExpressionsStartingWithVoid: true},
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {prefer: 'type-imports', fixStyle: 'inline-type-imports'},
      ],

      // Relax rules that conflict with Angular patterns
      '@typescript-eslint/no-extraneous-class': 'off', // Angular services/components are classes
      '@typescript-eslint/unbound-method': 'off', // Angular template bindings
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      // Relax strictness in tests
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
  prettier,
);
