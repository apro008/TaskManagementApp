import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = TextInputProps & {
  label?: string;
};

export type InputHandle = React.ComponentRef<typeof TextInput>;

export const Input = forwardRef<InputHandle, Props>(function InputField(
  { label, style, ...rest },
  ref,
) {
  const { variants } = useTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, variants.input.label]}>{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={variants.input.placeholder}
        style={[styles.input, variants.input.field, style]}
        {...rest}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, fontWeight: '500' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
