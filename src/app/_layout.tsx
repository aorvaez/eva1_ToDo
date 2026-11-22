import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  if (loading) return null;

  // key resets the list when the person changes, so one account never sees another's tasks.
  return (
    <TasksProvider key={user?.uid ?? "guest"} userId={user?.uid ?? null}>
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
        <Stack.Screen name="login" options={{ title: "Iniciar sesión" }} />
      </Stack>
    </TasksProvider>
  );
}
