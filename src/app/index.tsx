import { router } from "expo-router";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FAB_SIZE, FloatingAddButton } from "@/components/FloatingAddButton";
import { TaskItem } from "@/components/TaskItem";
import { useTasks } from "@/context/TasksContext";
import { spacing } from "@/theme";
import type { Task } from "@/types/task";

export default function TaskList() {
  const { tasks, dispatch } = useTasks();
  const insets = useSafeAreaInsets();

  const confirmDelete = (task: Task) =>
    Alert.alert(
      "¿Eliminar esta tarea?",
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => dispatch({ type: "delete", id: task.id }) },
      ],
      { cancelable: true },
    );

  return (
    <View style={styles.container}>
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
});
