module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js', '__tests__/**/*.{ts,tsx}'],
      env: { jest: true },
    },
  ],
};
