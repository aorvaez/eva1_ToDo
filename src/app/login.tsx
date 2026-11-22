import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormField } from "@/components/FormField";
import { useAuth } from "@/context/AuthContext";
import { authAvailable, authErrorMessage, signIn, signUp } from "@/services/auth";
import { colors, minTouchTarget, radius, spacing, typography } from "@/theme";

// Optional: the app works without an account. Signing in only adds cloud sync.
export default function Login() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (user) return <Redirect href="/" />;

  const submit = async (action: typeof signIn) => {
    if (!email.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await action(email.trim(), password);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || !authAvailable;

  return (
    <View style={[styles.container, { paddingBottom: spacing.lg + insets.bottom }]}>
      {!authAvailable && (
        <Text style={styles.notice}>
          Las cuentas no están disponibles en esta instalación. Puedes seguir usando la app sin cuenta.
        </Text>
      )}
      <FormField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="Ej. ana@correo.cl"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        editable={!disabled}
      />
      <FormField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={() => submit(signIn)}
        error={error}
        editable={!disabled}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => submit(signIn)}
        android_ripple={{ color: colors.primaryContainer }}
        style={[styles.primary, disabled && styles.disabled]}
      >
        <Text style={styles.primaryText}>Iniciar sesión</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Crear cuenta"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => submit(signUp)}
        android_ripple={{ color: colors.primaryContainer }}
        style={[styles.secondary, disabled && styles.disabled]}
      >
        <Text style={styles.secondaryText}>Crear cuenta</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Seguir sin cuenta"
        onPress={() => router.replace("/")}
        android_ripple={{ color: colors.primaryContainer }}
        style={styles.guest}
      >
        <Text style={styles.guestText}>Seguir sin cuenta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.lg, backgroundColor: colors.background },
  notice: { ...typography.body, color: colors.textSecondary },
  primary: {
    minHeight: minTouchTarget,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { ...typography.button, color: colors.onPrimary },
  secondary: {
    minHeight: minTouchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { ...typography.button, color: colors.primary },
  guest: { minHeight: minTouchTarget, alignItems: "center", justifyContent: "center" },
  guestText: { ...typography.button, color: colors.textSecondary },
  disabled: { opacity: 0.5 },
});
