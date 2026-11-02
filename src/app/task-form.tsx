import * as Crypto from "expo-crypto";
import { Redirect, Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormField } from "@/components/FormField";
import { useTasks } from "@/context/TasksContext";
import { colors, minTouchTarget, radius, spacing, typography } from "@/theme";
import { validateTask, type TaskErrors } from "@/utils/validateTask";

// One screen for both flows: with an `id` param it edits, without it adds.
export default function TaskForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, dispatch } = useTasks();
  const editing = id ? tasks.find((task) => task.id === id) : undefined;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [errors, setErrors] = useState<TaskErrors>({});
  const insets = useSafeAreaInsets();

  if (id && !editing) return <Redirect href="/" />;

  // Errors only show after the first failed save; from then on they update as the person types.
  const change = (next: { title: string; description: string }) => {
    setTitle(next.title);
    setDescription(next.description);
    if (Object.keys(errors).length > 0) setErrors(validateTask(next));
  };

  const save = () => {
    const found = validateTask({ title, description });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    dispatch({
      type: editing ? "update" : "add",
      task: {
        id: editing?.id ?? Crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
      },
    });
    // The form clears itself: going back unmounts this screen and its state.
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <Stack.Screen options={{ title: editing ? "Editar tarea" : "Nueva tarea" }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + insets.bottom }]}
      >
        <FormField
          label="Título"
          value={title}
          onChangeText={(value) => change({ title: value, description })}
          error={errors.title}
          placeholder="Ej. Comprar pan"
          returnKeyType="next"
        />
        <FormField
          label="Descripción"
          value={description}
          onChangeText={(value) => change({ title, description: value })}
          error={errors.description}
          placeholder="Ej. Pasar por la panadería antes de las 6"
          multiline
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Guardar"
          onPress={save}
          android_ripple={{ color: colors.primaryContainer }}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg },
  button: {
    minHeight: minTouchTarget,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { ...typography.button, color: colors.onPrimary },
});
