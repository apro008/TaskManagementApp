import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  edges?: readonly Edge[];
  padded?: boolean;
};

export function Screen({ children, edges = ['top'], padded = false }: Props) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.root, theme.variants.screen]}>
      <View style={[styles.body, padded && { padding: theme.spacing.lg }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
