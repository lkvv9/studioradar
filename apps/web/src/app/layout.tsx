import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudioRadar — Trouve un studio maintenant",
  description:
    "Trouve et réserve un studio d'enregistrement disponible maintenant près de toi. Studios pro, home studios, et rencontres musicales.",
  keywords: ["studio", "enregistrement", "musique", "home studio", "réservation"],
  openGraph: {
    title: "StudioRadar",
    description: "Trouve un studio d'enregistrement disponible maintenant",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
