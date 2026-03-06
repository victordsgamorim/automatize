module.exports = {
  root: true,
  extends: [require.resolve('../../tools/eslint-config/next.js')],
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    '.eslintrc.js',
    '*.config.js',
    '*.config.ts',
    'next-env.d.ts',
  ],
};
