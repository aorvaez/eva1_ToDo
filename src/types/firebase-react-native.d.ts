// The React Native build of firebase/auth exports getReactNativePersistence, but TypeScript
// resolves the public typings first, which omit it. Declare the signature the RN build provides.
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
