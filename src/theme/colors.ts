export const lightColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F4',
  border: '#DDE1E7',
  text: '#14181F',
  textMuted: '#6B7280',
  primary: '#2F6FED',
  primaryText: '#FFFFFF',
  danger: '#D94141',
  success: '#2E9E63',
  warning: '#C97A11',
  onAccent: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.35)',
};

export const darkColors: Colors = {
  background: '#0F1216',
  surface: '#181C22',
  surfaceAlt: '#22272F',
  border: '#2C333C',
  text: '#F2F4F7',
  textMuted: '#9AA3AF',
  primary: '#5B8DEF',
  primaryText: '#0F1216',
  danger: '#E8635F',
  success: '#4CB782',
  warning: '#E0A54A',
  onAccent: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.6)',
};

export type Colors = typeof lightColors;

export const splashColors = {
  background: '#2F6FED',
  text: '#FFFFFF',
};

export const envColors = {
  development: '#C97A11',
  staging: '#6C4BD6',
  production: '#2F6FED',
};
