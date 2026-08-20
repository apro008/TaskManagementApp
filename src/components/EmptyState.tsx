import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  const { variants } = useTheme();

  return (
    <View style={styles.root}>
      <Text style={[styles.title, variants.emptyState.title]}>{title}</Text>
      <Text style={[styles.message, variants.emptyState.message]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  title: { fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
