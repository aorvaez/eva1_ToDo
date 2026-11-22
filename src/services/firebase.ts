import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

// Values come from .env (see .env.example). EXPO_PUBLIC_ variables are read at build time.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId || !config.appId) {
  throw new Error("Falta la configuración de Firebase: copia .env.example a .env y completa los valores.");
}

// Fast Refresh re-runs this module, and both calls throw if the app or auth already exists.
export const app = getApps().length ? getApp() : initializeApp(config);

// The session is kept in AsyncStorage, so the person stays signed in after closing the app.
export const auth = (() => {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    // Only a repeated initialization is expected here; any other failure must surface, not silently drop persistence.
    if (typeof error === "object" && error !== null && (error as { code?: unknown }).code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw error;
  }
})();
