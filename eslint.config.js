import js from "@eslint/js";

export default [
  {
    ...js.configs.recommended,
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 6,
      globals: {
        'game': 'readonly',
      }
    }
  }
];
