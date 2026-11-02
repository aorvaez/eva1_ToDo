import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

export function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="checklist" size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>Aún no tienes tareas</Text>
      <Text style={styles.message}>Toca + para agregar una</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: { ...typography.headline, color: colors.text, textAlign: "center" },
  message: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
