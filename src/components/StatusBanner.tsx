import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  online: boolean;
  syncing: boolean;
  pending: number;
};

export function StatusBanner({ online, syncing, pending }: Props) {
  const { variants } = useTheme();

  if (online && !syncing && pending === 0) return null;

  const text = !online
    ? `Offline${
        pending ? ` - ${pending} change${pending > 1 ? 's' : ''} waiting` : ''
      }`
    : syncing
    ? 'Syncing...'
    : `${pending} change${pending > 1 ? 's' : ''} waiting to sync`;

  const state = online ? 'online' : 'offline';

  return (
    <View style={[styles.root, variants.banner[state]]}>
      <Text style={[styles.text, variants.bannerText[state]]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center' },
  text: { fontSize: 12, fontWeight: '600' },
});
