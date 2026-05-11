import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";

function RootNavigator() {
  const { session, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!session && !inAuth) router.replace("/(auth)/welcome");
    if (session && inAuth)   router.replace("/(tabs)/map");
  }, [session, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0a0a1a" } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="studio/[id]"          options={{ presentation: "modal" }} />
      <Stack.Screen name="booking/[studioId]"   options={{ presentation: "modal" }} />
      <Stack.Screen name="my-bookings"            options={{ presentation: "card" }} />
      <Stack.Screen name="review/[bookingId]"    options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0a0a1a" }}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <AuthProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
