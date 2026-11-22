import { Stack, router } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FAB_SIZE, FloatingAddButton } from "@/components/FloatingAddButton";
import { TaskItem } from "@/components/TaskItem";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import { authAvailable, signOut } from "@/services/auth";
import { colors, minTouchTarget, spacing, typography } from "@/theme";
import type { Task } from "@/types/task";

export default function TaskList() {
  const { user } = useAuth();
  const { tasks, dispatch } = useTasks();
  const insets = useSafeAreaInsets();

  const leave = () =>
    signOut().catch(() => Alert.alert("No se pudo cerrar sesión", "Inténtalo de nuevo."));

  const confirmDelete = (task: Task) =>
    Alert.alert(
      "¿Eliminar esta tarea?",
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => dispatch({ type: "delete", id: task.id, at: Date.now() }) },
      ],
      { cancelable: true },
    );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: authAvailable
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={user ? "Cerrar sesión" : "Iniciar sesión"}
                  onPress={user ? leave : () => router.push("/login")}
                  style={styles.leave}
                >
                  <Text style={styles.leaveText}>{user ? "Salir" : "Iniciar sesión"}</Text>
                </Pressable>
              )
            : undefined,
        }}
      />
      <FlatList
        data={tasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => router.push({ pathname: "/task-form", params: { id: item.id } })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={EmptyState}
        // Room below the last card so the FAB never covers it.
        contentContainerStyle={[
          styles.list,
          { paddingBottom: FAB_SIZE + spacing.lg + spacing.md + insets.bottom },
        ]}
      />
      <FloatingAddButton onPress={() => router.push("/task-form")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flexGrow: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  leave: { minHeight: minTouchTarget, justifyContent: "center" },
  leaveText: { ...typography.button, color: colors.primary },
});
