import importPlugin from 'eslint-plugin-import';
import js from "@eslint/js";

const rules = {
  ...js.configs.recommended.rules,
  ...importPlugin.flatConfigs.recommended.rules,
  'no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  }],
};

const plugins = {
  ...js.configs.recommended.plugins,
  ...importPlugin.flatConfigs.recommended.plugins,
};

export default [
  {
    rules,
    plugins,
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 6,
      sourceType: 'module',
      globals: {
        'game': 'readonly',
      }
    }
  },
  {
    rules,
    plugins,
    files: ['test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    }
  }
];
