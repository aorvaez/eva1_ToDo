import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, shadow, spacing } from "@/theme";

export function FloatingAddButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Agregar tarea"
      onPress={onPress}
      android_ripple={{ color: colors.primaryContainer }}
      style={({ pressed }) => [
        styles.fab,
        { bottom: spacing.md + insets.bottom, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <MaterialIcons name="add" size={28} color={colors.onPrimary} />
    </Pressable>
  );
}

export const FAB_SIZE = 56;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.md,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.fab,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.fab,
  },
});
