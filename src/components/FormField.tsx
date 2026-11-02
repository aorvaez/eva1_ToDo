import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { colors, minTouchTarget, radius, spacing, typography } from "@/theme";

type Props = TextInputProps & { label: string; error?: string };

export function FormField({ label, error, multiline, style, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textSecondary },
  input: {
    ...typography.body,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  inputError: { borderColor: colors.error, borderWidth: 2 },
  error: { ...typography.label, color: colors.error },
});
