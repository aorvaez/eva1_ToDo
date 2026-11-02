import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TasksProvider } from "@/context/TasksContext";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <TasksProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Mis tareas" }} />
        <Stack.Screen name="task-form" />
      </Stack>
    </TasksProvider>
  );
}
