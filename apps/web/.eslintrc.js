module.exports = {
  root: true,
  extends: ['@automatize/eslint-config/base'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    '.eslintrc.js',
    '*.config.js',
    '*.config.ts',
    'next-env.d.ts',
  ],
  rules: {
    // Next.js specific rules
    '@next/next/no-html-link-for-pages': 'off',
  },
};
