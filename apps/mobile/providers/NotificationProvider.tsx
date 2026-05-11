import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { registerPushToken, useNotificationNavigation } from "@/lib/notifications";
import { useAuth } from "./AuthProvider";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router   = useRouter();
  const registered = useRef(false);

  // Enregistrer le token dès que l'utilisateur est connecté
  useEffect(() => {
    if (user && !registered.current) {
      registered.current = true;
      registerPushToken(user.id);
    }
  }, [user]);

  // Naviguer quand l'utilisateur tape une notification
  useNotificationNavigation(router);

  return <>{children}</>;
}
