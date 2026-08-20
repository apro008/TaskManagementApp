import type { TextStyle, ViewStyle } from 'react-native';
import type { Colors } from './colors';
import { fontSize, radius } from './tokens';

export function buildVariants(colors: Colors) {
  return {
    screen: {
      backgroundColor: colors.background,
    } satisfies ViewStyle,

    loader: {
      root: { backgroundColor: colors.background },
      text: { color: colors.textMuted },
      indicator: colors.primary,
    },

    chip: {
      on: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderRadius: radius.pill,
      },
      off: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.pill,
      },
    } satisfies Record<'on' | 'off', ViewStyle>,

    chipLabel: {
      on: { color: colors.primaryText },
      off: { color: colors.textMuted },
    } satisfies Record<'on' | 'off', TextStyle>,

    button: {
      primary: { backgroundColor: colors.primary, borderRadius: radius.md },
      secondary: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
      },
      danger: { backgroundColor: colors.danger, borderRadius: radius.md },
    } satisfies Record<'primary' | 'secondary' | 'danger', ViewStyle>,

    buttonLabel: {
      primary: { color: colors.primaryText, fontSize: fontSize.md },
      secondary: { color: colors.text, fontSize: fontSize.md },
      danger: { color: colors.primaryText, fontSize: fontSize.md },
    } satisfies Record<'primary' | 'secondary' | 'danger', TextStyle>,

    input: {
      label: { color: colors.textMuted, fontSize: fontSize.sm },
      field: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
        color: colors.text,
        fontSize: fontSize.md,
      },
      placeholder: colors.textMuted,
    },

    emptyState: {
      title: { color: colors.text, fontSize: fontSize.lg },
      message: { color: colors.textMuted },
    } satisfies Record<'title' | 'message', TextStyle>,

    banner: {
      offline: { backgroundColor: colors.warning },
      online: { backgroundColor: colors.surfaceAlt },
    } satisfies Record<'offline' | 'online', ViewStyle>,

    bannerText: {
      offline: { color: colors.onAccent },
      online: { color: colors.textMuted },
    } satisfies Record<'offline' | 'online', TextStyle>,

    taskRow: {
      card: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
      },
      check: {
        done: { borderColor: colors.success, backgroundColor: colors.success },
        open: { borderColor: colors.border, backgroundColor: 'transparent' },
      },
      title: {
        done: { color: colors.text, textDecorationLine: 'line-through' },
        open: { color: colors.text, textDecorationLine: 'none' },
      },
      notes: { color: colors.textMuted },
      due: {
        late: { color: colors.danger },
        onTime: { color: colors.textMuted },
      },
      unsynced: { color: colors.warning },
      priority: {
        high: { backgroundColor: colors.danger },
        medium: { backgroundColor: colors.warning },
        low: { backgroundColor: colors.success },
      },
      tick: { color: colors.onAccent },
    } satisfies {
      card: ViewStyle;
      check: Record<'done' | 'open', ViewStyle>;
      title: Record<'done' | 'open', TextStyle>;
      notes: TextStyle;
      due: Record<'late' | 'onTime', TextStyle>;
      unsynced: TextStyle;
      priority: Record<'high' | 'medium' | 'low', ViewStyle>;
      tick: TextStyle;
    },
  };
}

export type Variants = ReturnType<typeof buildVariants>;
