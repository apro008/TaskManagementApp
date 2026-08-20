import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Loader({ text }: { text?: string }) {
  const { variants } = useTheme();

  return (
    <View style={[styles.root, variants.loader.root]}>
      <ActivityIndicator size="large" color={variants.loader.indicator} />
      {text ? (
        <Text style={[styles.text, variants.loader.text]}>{text}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { marginTop: 12, fontSize: 14 },
});
