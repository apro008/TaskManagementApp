import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function Chip({ label, active = false, onPress }: Props) {
  const { variants } = useTheme();
  const state = active ? 'on' : 'off';

  return (
    <Pressable onPress={onPress} style={[styles.chip, variants.chip[state]]}>
      <Text style={[styles.label, variants.chipLabel[state]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
