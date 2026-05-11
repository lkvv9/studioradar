import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase/client";

// Configuration du comportement des notifs quand l'app est au premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export async function registerPushToken(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name:       "StudioRadar",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2d4eff",
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Sauvegarder le token dans Supabase
  await supabase
    .from("profiles")
    .update({ push_token: token })
    .eq("id", userId);

  return token;
}

// Notification locale (immédiate)
export async function scheduleLocalNotification(opts: {
  title:   string;
  body:    string;
  data?:   Record<string, unknown>;
  delay?:  number; // secondes
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body:  opts.body,
      data:  opts.data ?? {},
      sound: true,
    },
    trigger: opts.delay ? { seconds: opts.delay } : null,
  });
}

// Notification de rappel pour une réservation (1h avant)
export async function scheduleBookingReminder(opts: {
  studioName: string;
  startTime:  Date;
  bookingId:  string;
}) {
  const reminderTime = new Date(opts.startTime.getTime() - 60 * 60 * 1000);
  if (reminderTime <= new Date()) return; // Déjà passé

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎤 Ta session commence bientôt !",
      body:  `Dans 1h — ${opts.studioName}`,
      data:  { bookingId: opts.bookingId, screen: "my-bookings" },
      sound: true,
    },
    trigger: {
      date: reminderTime,
    },
  });
}

export function useNotificationNavigation(router: { push: (path: string) => void }) {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.screen === "my-bookings") router.push("/my-bookings");
    if (data?.screen === "match")       router.push("/(tabs)/match");
  });
}
