import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StudioRadar", template: "%s · StudioRadar" },
  description:
    "Trouve et réserve un studio d'enregistrement disponible maintenant près de toi. Studios pro, home studios, et rencontres musicales.",
  keywords: ["studio", "enregistrement", "musique", "home studio", "réservation", "paris"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudioRadar",
  },
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#2d4eff" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
