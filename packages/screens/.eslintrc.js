module.exports = {
  root: true,
  extends: [require.resolve('../../tools/eslint-config/base.js')],
  overrides: [
    {
      files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      parserOptions: {
        project: ['./tsconfig.test.json'],
      },
    },
  ],
};
