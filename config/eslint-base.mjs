import path from 'node:path';
import { createRequire } from 'node:module';

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import-x';
import a11yModule from 'eslint-plugin-jsx-a11y-x';
import hooksPlugin from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react-x';
import jsxPlugin from 'eslint-plugin-react-jsx';
import domPlugin from 'eslint-plugin-react-dom';
import globals from 'globals';

const require = createRequire(import.meta.url);
const baseline = require('./eslint.rules.json');
const typeScriptPresetRules = Object.assign(
  {},
  ...tsPlugin.configs['flat/recommended-type-checked'].map(
    (config) => config.rules,
  ),
);
const a11yPlugin = a11yModule.default ?? a11yModule;

// Keep existing rule IDs so inline React suppressions still work.
const reactAliases = {
  'no-access-state-in-setstate':
    reactPlugin.rules['no-access-state-in-setstate'],
  'no-did-update-set-state':
    reactPlugin.rules['no-set-state-in-component-did-update'],
  'no-will-update-set-state':
    reactPlugin.rules['no-set-state-in-component-will-update'],
  'no-unused-state': reactPlugin.rules['no-unused-state'],
  'no-unstable-nested-components':
    reactPlugin.rules['no-nested-component-definitions'],
  'jsx-no-constructed-context-values':
    reactPlugin.rules['no-unstable-context-value'],
  'no-unused-class-component-methods':
    reactPlugin.rules['no-unused-class-component-members'],
  'jsx-no-comment-textnodes': jsxPlugin.rules['no-comment-textnodes'],
  'no-children-prop': jsxPlugin.rules['no-children-prop'],
  'jsx-no-useless-fragment': jsxPlugin.rules['no-useless-fragment'],
  'no-namespace': jsxPlugin.rules['no-namespace'],
  'no-danger': domPlugin.rules['no-dangerously-set-innerhtml'],
  'no-danger-with-children':
    domPlugin.rules['no-dangerously-set-innerhtml-with-children'],
  'no-find-dom-node': domPlugin.rules['no-find-dom-node'],
  'no-render-return-value': domPlugin.rules['no-render-return-value'],
  'no-unknown-property': domPlugin.rules['no-unknown-property'],
  'style-prop-object': domPlugin.rules['no-string-style-prop'],
  'void-dom-elements-no-children':
    domPlugin.rules['no-void-elements-with-children'],
  'button-has-type': domPlugin.rules['no-missing-button-type'],
  'jsx-no-target-blank': domPlugin.rules['no-unsafe-target-blank'],
  'jsx-no-script-url': domPlugin.rules['no-script-url'],
};

export const ignores = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/coverage/**',
  '**/build/**',
  '**/*.d.ts',
  '**/__tests__/**',
  '**/__mocks__/**',
  '**/mocks/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/.deploy_stage/**',
  '**/.eslintrc.js',
  '**/next.config.js',
  '**/next-i18next.config.js',
];

const extendImportOrder = (pathGroups) => {
  const [level, options] = baseline['import/order'];
  return [
    level,
    {
      ...options,
      pathGroups: [...options.pathGroups, ...pathGroups],
    },
  ];
};

export const createConfig = ({
  rootDir,
  importPathGroups = [],
  rules = {},
  next = false,
  overrides = [],
}) => [
  { ignores },
  {
    name: `project/${path.basename(rootDir)}`,
    basePath: rootDir,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: path.join(rootDir, 'tsconfig.json'),
        tsconfigRootDir: rootDir,
        ecmaFeatures: { jsx: true },
        jsxPragma: 'React',
      },
      globals: { ...globals.browser, ...globals.node, ...globals.es2020 },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'jsx-a11y': a11yPlugin,
      react: { meta: { name: 'project-react-aliases' }, rules: reactAliases },
      'react-hooks': hooksPlugin,
      ...(next ? { '@next/next': nextPlugin } : {}),
    },
    settings: {
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
      'react-x': { version: '19.3.1' },
      ...(next ? { next: { rootDir } } : {}),
    },
    rules: {
      ...typeScriptPresetRules,
      ...baseline,
      'import/order': extendImportOrder(importPathGroups),
      'no-loss-of-precision': 'error',
      'prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'always' },
      ],
      '@typescript-eslint/prefer-promise-reject-errors': [
        'error',
        { allowEmptyReject: true },
      ],
      // Keep existing async call sites unchanged during the preset migration.
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      ...Object.fromEntries(
        Object.keys(reactAliases).map((rule) => [
          `react/${rule}`,
          rule === 'no-danger' ? 'warn' : 'error',
        ]),
      ),
      // New checks are advisory until existing violations are reviewed.
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'off',
      ...(next ? nextPlugin.configs.recommended.rules : {}),
      ...rules,
    },
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
  },
  { ...prettierConfig, basePath: rootDir, files: ['src/**/*.{ts,tsx}'] },
  ...overrides.map((override) => ({ ...override, basePath: rootDir })),
];

export default createConfig;
