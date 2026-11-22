import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { RichTextPreview } from "@/components/RichTextPreview";
import { describeWeather } from "@/services/weather";
import { colors, minTouchTarget, radius, shadow, spacing, typography } from "@/theme";
import type { Task } from "@/types/task";

type Props = { task: Task; onPress: () => void; onDelete: () => void };

// The trash button is a sibling of the main area, not a child, so tapping it never opens the editor.
export function TaskItem({ task, onPress, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Editar tarea: ${task.title}`}
        onPress={onPress}
        android_ripple={{ color: colors.primaryContainer }}
        style={styles.content}
      >
        {task.imageUri && (
          <Image
            source={{ uri: task.imageUri }}
            accessibilityLabel={`Foto de ${task.title}`}
            style={styles.photo}
          />
        )}
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <RichTextPreview doc={task.description} />
        {task.location && (
          <View style={styles.meta}>
            <MaterialIcons name="place" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {task.location.name ?? `${task.location.lat.toFixed(4)}, ${task.location.lon.toFixed(4)}`}
            </Text>
          </View>
        )}
        {task.weather && (
          <View style={styles.meta}>
            <MaterialIcons name="thermostat" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {`${Math.round(task.weather.tempC)} °C · ${describeWeather(task.weather.code)}`}
            </Text>
          </View>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Eliminar tarea: ${task.title}`}
        onPress={onDelete}
        android_ripple={{ color: colors.primaryContainer, radius: minTouchTarget / 2 }}
        style={styles.delete}
      >
        <MaterialIcons name="delete-outline" size={24} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  content: {
    flex: 1,
    minHeight: minTouchTarget,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: spacing.sm,
    borderTopLeftRadius: radius.card,
    borderBottomLeftRadius: radius.card,
  },
  photo: { width: "100%", height: 120, borderRadius: radius.input },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  metaText: { ...typography.label, color: colors.textSecondary },
  title: { ...typography.title, color: colors.text },
  delete: {
    width: minTouchTarget,
    height: minTouchTarget,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
