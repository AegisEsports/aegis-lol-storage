module.exports = {
  root: true,

  env: {
    node: true,         // Node.js global vars & Node scoping
    es2022: true,       // modern JS features
  },

  parser: '@typescript-eslint/parser', // parse TS into ESLint
  parserOptions: {
    project: './tsconfig.json',        // enable type-aware linting
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  plugins: [
    'n',
    '@typescript-eslint',              // TS-specific rules
    'import',                          // import/order, missing imports
    'security-node',                   // security checks
  ],

  extends: [
    'plugin:n/recommended',
    'plugin:@typescript-eslint/recommended',    // TS rules :contentReference[oaicite:6]{index=6}
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',                        // disable ESLint formatting rules
  ],

  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.ts'] },
      typescript: {},                  // use tsconfig paths
    },
  },

  rules: {
    // ─── TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',       // discourage `any`
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // ─── Import Order
    'import/order': ['error', {
      'groups': [['builtin','external','internal'], ['parent','sibling','index']],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc', caseInsensitive: true },
      // Map @/* imports into the "internal" group
      'pathGroups': [
        {
          pattern: '@/**',
          group: 'internal',
          position: 'after',  // or 'before' if you want it before the other internal imports
        },
      ],
    }],
    // ─── Import
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    "n/no-missing-import": ["error", {
      "ignoreTypeImport": true,
      "resolvePath": "@/*",
    }],

    // ─── Node related
    'n/no-unpublished-import': 'off',
    
    // ─── Style & Formatting
    'eol-last': ['error', 'always'],                     // final newline in every file
    // ------- Enforce use of function expressions (arrow functions), no `function` declarations
    'func-style': [
      'error',
      'expression',
      { allowArrowFunctions: true }
    ],
    // ------- Ban all direct `process.env` access—force use of your getEnv util
    'no-restricted-properties': [
      'error',
      {
        object: 'process',
        property: 'env',
        message: 'Use getEnv from utils'
      }
    ],
  },

  overrides: [
    {
      files: ['**/*.test.ts'],
      env: { jest: true },                               // Jest globals in tests
    },
  ],
};
