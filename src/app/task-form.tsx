import { EditorKeyboardAvoidingView, PlaceholderBridge, TenTapStartKit, useEditorBridge, useEditorContent, useScrollToCaret } from "@10play/tentap-editor";
import * as Crypto from "expo-crypto";
import { Redirect, Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormField } from "@/components/FormField";
import { RichTextField } from "@/components/RichTextField";
import { useTasks } from "@/context/TasksContext";
import { colors, minTouchTarget, radius, spacing, typography } from "@/theme";
import type { RichDoc } from "@/types/task";
import { emptyDoc } from "@/utils/richDoc";
import { validateTask, type TaskErrors } from "@/utils/validateTask";

// One screen for both flows: with an `id` param it edits, without it adds.
export default function TaskForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, dispatch } = useTasks();
  const editing = id ? tasks.find((task) => task.id === id) : undefined;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [errors, setErrors] = useState<TaskErrors>({});
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const editor = useEditorBridge({
    initialContent: editing?.description ?? emptyDoc,
    dynamicHeight: true,
    bridgeExtensions: [...TenTapStartKit, PlaceholderBridge.configureExtension({ placeholder: "Describe la tarea" })],
  });
  useScrollToCaret(editor, scrollViewRef);
  const description = useEditorContent(editor, { type: "json" }) as RichDoc | undefined;
  // Once the description error is showing, keep it in sync as the person types, same as changeTitle.
  const descriptionError =
    errors.description && description ? validateTask({ title, description }).description : errors.description;

  if (id && !editing) return <Redirect href="/" />;

  // Errors only show after the first failed save; from then on they update as the person types.
  const changeTitle = (value: string) => {
    setTitle(value);
    if (errors.title) setErrors(validateTask({ title: value, description: description ?? emptyDoc }));
  };

  const save = () => {
    const current = description ?? emptyDoc;
    const found = validateTask({ title, description: current });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    dispatch({
      type: editing ? "update" : "add",
      task: { id: editing?.id ?? Crypto.randomUUID(), title: title.trim(), description: current },
    });
    // The form clears itself: going back unmounts this screen and its state.
    router.back();
  };

  return (
    <EditorKeyboardAvoidingView style={styles.flex}>
      <Stack.Screen options={{ title: editing ? "Editar tarea" : "Nueva tarea" }} />
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + insets.bottom }]}
      >
        <FormField
          label="Título"
          value={title}
          onChangeText={changeTitle}
          error={errors.title}
          placeholder="Ej. Comprar pan"
          returnKeyType="next"
        />
        <RichTextField label="Descripción" editor={editor} error={descriptionError} />
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
    </EditorKeyboardAvoidingView>
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
