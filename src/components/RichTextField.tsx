import { MaterialIcons } from "@expo/vector-icons";
import { RichText, useBridgeState, type EditorBridge } from "@10play/tentap-editor";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, minTouchTarget, radius, spacing, typography } from "@/theme";

type FormatButton = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  isActive: (state: ReturnType<typeof useBridgeState>) => boolean;
  toggle: (editor: EditorBridge) => void;
};

const FORMAT_BUTTONS: FormatButton[] = [
  { icon: "format-bold", label: "Negrita", isActive: (s) => s.isBoldActive, toggle: (e) => e.toggleBold() },
  { icon: "format-italic", label: "Cursiva", isActive: (s) => s.isItalicActive, toggle: (e) => e.toggleItalic() },
  {
    icon: "format-list-numbered",
    label: "Lista numerada",
    isActive: (s) => s.isOrderedListActive,
    toggle: (e) => e.toggleOrderedList(),
  },
  {
    icon: "format-list-bulleted",
    label: "Lista con viñetas",
    isActive: (s) => s.isBulletListActive,
    toggle: (e) => e.toggleBulletList(),
  },
  { icon: "check-box", label: "Casilla", isActive: (s) => s.isTaskListActive, toggle: (e) => e.toggleTaskList() },
];

type Props = { label: string; editor: EditorBridge; error?: string };

// Mirrors FormField's look (label, bordered box, error state) around a TenTap WYSIWYG editor.
// The caller owns the editor instance (created with useEditorBridge), since it also needs it to read getJSON() on save.
export function RichTextField({ label, editor, error }: Props) {
  const state = useBridgeState(editor);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.toolbar}>
        {FORMAT_BUTTONS.map(({ icon, label: buttonLabel, isActive, toggle }) => {
          const active = isActive(state);
          return (
            <Pressable
              key={buttonLabel}
              accessibilityRole="button"
              accessibilityLabel={buttonLabel}
              accessibilityState={{ selected: active }}
              onPress={() => toggle(editor)}
              style={[styles.button, active && styles.buttonActive]}
            >
              <MaterialIcons name={icon} size={22} color={active ? colors.primary : colors.textSecondary} />
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.editorBox, error ? styles.editorBoxError : null]}>
        <RichText editor={editor} />
      </View>
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
  toolbar: { flexDirection: "row", gap: spacing.sm / 2 },
  button: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: { backgroundColor: colors.primaryContainer },
  editorBox: {
    minHeight: 120,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  editorBoxError: { borderColor: colors.error, borderWidth: 2 },
  error: { ...typography.label, color: colors.error },
});
