// @ts-check

export default [
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript strict overrides for library code
      '@typescript-eslint/explicit-member-accessibility': ['error', {accessibility: 'no-public'}],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Relax rules that conflict with Angular patterns
      '@typescript-eslint/no-extraneous-class': 'off', // Angular services/components are classes
      '@typescript-eslint/unbound-method': 'off', // Angular template bindings

      // Misc
      'no-console': 'error',

      '@angular-eslint/component-selector': 'off',
      // Library authors rename inputs/outputs for public API
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-rename': 'off',

      // Enforce modern Angular patterns
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off', // v22 uses OnPush by default
      '@angular-eslint/no-host-metadata-property': 'off', // we use host bindings intentionally
      '@angular-eslint/prefer-output-readonly': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@angular-eslint/component-selector': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/attributes-order': [
        'warn',
        {
          alphabetical: true,
          order: [
            'STRUCTURAL_DIRECTIVE',
            'TEMPLATE_REFERENCE',
            'ATTRIBUTE_BINDING',
            'INPUT_BINDING',
            'TWO_WAY_BINDING',
            'OUTPUT_BINDING',
          ],
        },
      ],

      '@angular-eslint/template/button-has-type': 'off',
      '@angular-eslint/template/cyclomatic-complexity': ['error', {maxComplexity: 10}],
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/label-has-associated-control': 'off',
    },
  },
];
