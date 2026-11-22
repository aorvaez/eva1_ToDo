import { Stack, router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FAB_SIZE, FloatingAddButton } from "@/components/FloatingAddButton";
import { TaskItem } from "@/components/TaskItem";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import { authAvailable, signOut } from "@/services/auth";
import { fetchTodos } from "@/services/api";
import { colors, minTouchTarget, radius, spacing, typography } from "@/theme";
import type { Task } from "@/types/task";
import { todosToTasks } from "@/utils/importTodos";

export default function TaskList() {
  const { user } = useAuth();
  const { tasks, dispatch } = useTasks();
  const insets = useSafeAreaInsets();
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string>();

  // Imported tasks get stable ids, so importing again only adds the ones not already here.
  const importFromApi = async () => {
    setImporting(true);
    setImportError(undefined);
    try {
      const todos = await fetchTodos();
      dispatch({ type: "import", tasks: todosToTasks(todos, Date.now()) });
    } catch {
      setImportError("No se pudieron importar las tareas. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setImporting(false);
    }
  };

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
        ListHeaderComponent={
          <View style={styles.importBox}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Importar tareas"
              accessibilityState={{ disabled: importing }}
              disabled={importing}
              onPress={importFromApi}
              android_ripple={{ color: colors.primaryContainer }}
              style={[styles.importButton, importing && styles.importDisabled]}
            >
              <Text style={styles.importText}>{importing ? "Importando…" : "Importar tareas"}</Text>
            </Pressable>
            {importError && (
              <Text style={styles.importError} accessibilityLiveRegion="polite">
                {importError}
              </Text>
            )}
          </View>
        }
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
  importBox: { gap: spacing.sm, marginBottom: spacing.md },
  importButton: {
    minHeight: minTouchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  importDisabled: { opacity: 0.5 },
  importText: { ...typography.button, color: colors.primary },
  importError: { ...typography.label, color: colors.error },
  leave: { minHeight: minTouchTarget, justifyContent: "center" },
  leaveText: { ...typography.button, color: colors.primary },
});
