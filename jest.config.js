module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@notifee|@op-engineering|@react-native-firebase|@react-native-community|@reduxjs|react-redux|redux|immer|reselect)/)',
  ],
};
