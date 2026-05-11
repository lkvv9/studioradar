import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0a0a1a" }}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0a0a1a" } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="studio/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="booking/[studioId]" options={{ presentation: "modal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
