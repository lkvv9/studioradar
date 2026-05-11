import { Redirect } from "expo-router";

export default function Index() {
  // TODO: vérifier session Supabase → rediriger vers (tabs) si connecté
  return <Redirect href="/(auth)/welcome" />;
}
