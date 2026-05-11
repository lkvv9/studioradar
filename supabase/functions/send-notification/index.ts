import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface NotificationPayload {
  user_ids:   string[];
  title:      string;
  body:       string;
  data?:      Record<string, unknown>;
  sound?:     "default" | null;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const payload: NotificationPayload = await req.json();
  const { user_ids, title, body, data, sound = "default" } = payload;

  // Récupérer les push tokens des utilisateurs
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("push_token")
    .in("id", user_ids)
    .not("push_token", "is", null);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const tokens = profiles
    .map((p: { push_token: string }) => p.push_token)
    .filter(Boolean);

  if (tokens.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  // Envoyer via l'API Expo
  const messages = tokens.map((token: string) => ({
    to:    token,
    title,
    body,
    data:  data ?? {},
    sound,
  }));

  const res = await fetch(EXPO_PUSH_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(messages),
  });

  const result = await res.json();
  return new Response(JSON.stringify({ sent: tokens.length, result }), {
    headers: { "Content-Type": "application/json" },
  });
});
