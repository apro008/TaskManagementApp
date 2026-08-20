import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { Colors, darkColors, lightColors } from './colors';
import { fontSize, radius, spacing } from './tokens';
import { buildVariants, type Variants } from './variants';

export type Theme = {
  dark: boolean;
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  variants: Variants;
};

const defaultTheme: Theme = {
  dark: false,
  colors: lightColors,
  spacing,
  radius,
  fontSize,
  variants: buildVariants(lightColors),
};

const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector(state => state.settings.themeMode);
  const systemScheme = useColorScheme();

  const theme = useMemo<Theme>(() => {
    const dark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    const colors = dark ? darkColors : lightColors;
    return {
      dark,
      colors,
      spacing,
      radius,
      fontSize,
      variants: buildVariants(colors),
    };
  }, [mode, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
