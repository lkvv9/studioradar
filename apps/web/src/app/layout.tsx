import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StudioRadar", template: "%s · StudioRadar" },
  description:
    "Trouve et réserve un studio d'enregistrement disponible maintenant près de toi. Studios pro, home studios, et rencontres musicales.",
  keywords: ["studio", "enregistrement", "musique", "home studio", "réservation", "paris"],
  openGraph: {
    title: "StudioRadar — Trouve un studio maintenant",
    description: "Trouve et réserve un studio d'enregistrement disponible maintenant",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudioRadar",
    description: "Trouve et réserve un studio d'enregistrement disponible maintenant",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
