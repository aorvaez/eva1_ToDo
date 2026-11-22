import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type Auth } from "firebase/auth";

import { auth } from "@/services/firebase";

// False when .env is missing: the login screen then tells the person accounts are not available.
export const authAvailable = auth !== null;

const messages: Record<string, string> = {
  "auth/unavailable": "La cuenta no está disponible en esta instalación.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento.",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet.",
};

// Firebase error codes are English; the person sees Spanish, and an unknown code gets a generic message.
export function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  return messages[code] ?? "No se pudo completar la acción. Inténtalo de nuevo.";
}

function client(): Auth {
  if (!auth) throw Object.assign(new Error("Firebase no configurado"), { code: "auth/unavailable" });
  return auth;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(client(), email, password);
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(client(), email, password);
}

export async function signOut() {
  return firebaseSignOut(client());
}
