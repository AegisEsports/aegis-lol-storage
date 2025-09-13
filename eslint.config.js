import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import n from 'eslint-plugin-n';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // 1) Ignore compiled output (and any .js if necessary)
  { ignores: ['dist/**', '*.js', 'node_modules/**'] },

  // 2) Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  n.configs['flat/recommended'],
  // Put Prettier last so it disables conflicting stylistic rules
  prettier,

  // 3) Project rules & settings
  {
    plugins: {
      import: importPlugin,
      '@typescript-eslint': tseslint.plugin,
      n,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },

    settings: {
      // Make eslint-plugin-import understand TS path aliases like "@/…"
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: { extensions: ['.ts', '.js'] },
      },
    },

    rules: {
      // ─── TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      // ─── Import Order
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external', 'internal'],
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            { pattern: '@/**', group: 'parent', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          distinctGroup: false,
        },
      ],
      // With the TS resolver configured, let this catch unresolved imports:
      'import/no-unresolved': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../**'],
              message:
                'Do not use relative paths (unless parallel). Use "@/*" alias instead',
            },
            {
              group: [
                '@/database/tables/**',
                '@/database/shared/**',
                '@/database/migrations/**',
              ],
              message: 'Use the "@/database/*" aliases instead',
            },
          ],
        },
      ],

      // ─── Node plugin
      // IMPORTANT: plugin-n cannot resolve TS path aliases; disable for TS below.
      'n/no-missing-import': 'error',
      'n/no-unpublished-import': 'off',

      // ─── Style & Formatting
      'eol-last': ['error', 'always'],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Use getEnv from utils',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          // Error on any use of console.*
          selector: "MemberExpression[object.name='console']",
          message:
            'Do not use console.* — use the shared logger instead (import { logger } from "@/util/logger").',
        },
      ],
    },
  },

  // 4) TS-specific overrides
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Disable this for TS files; plugin-n doesn't understand tsconfig paths
      'n/no-missing-import': 'off',
    },
  },

  // 5) Test files
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
];
