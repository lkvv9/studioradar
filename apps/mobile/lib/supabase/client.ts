import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

declare const __DEV__: boolean;
// Expo injecte les variables EXPO_PUBLIC_* au build time via Babel
const env = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env ?? {};
const supabaseUrl  = env["EXPO_PUBLIC_SUPABASE_URL"]  ?? "";
const supabaseAnon = env["EXPO_PUBLIC_SUPABASE_ANON_KEY"] ?? "";

// Stockage sécurisé des tokens sur le device
const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage:          ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
