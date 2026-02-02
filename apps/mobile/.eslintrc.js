module.exports = {
  root: true,
  extends: [require.resolve('../../tools/eslint-config/react-native.js')],
  rules: {
    // Button component from @automatize/ui handles text internally
    'react-native/no-raw-text': 'off',
    // Allow apostrophes in text content
    'react/no-unescaped-entities': 'off',
    // Allow inline styles (to be refactored later)
    'react-native/no-inline-styles': 'off',
    // Allow console for debugging (auth-init uses it for initialization)
    'no-console': 'off',
  },
};
