module.exports = {
  root: true,
  extends: ['@automatize/eslint-config/base'],
  ignorePatterns: [
    'node_modules',
    'dist',
    '.turbo',
    '.expo',
    'coverage',
    '*.config.js',
    '*.config.ts',
  ],
};
