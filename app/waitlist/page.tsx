import { Metadata } from "next";
import WaitlistClient from "./waitlist-client";

export const metadata: Metadata = {
  title: "Liste d'attente - Ezia",
  description: "Inscrivez-vous sur la liste d'attente d'Ezia pour être parmi les premiers à accéder à notre plateforme révolutionnaire de création de business propulsée par l'IA.",
  openGraph: {
    title: "Rejoignez la liste d'attente d'Ezia",
    description: "Soyez parmi les premiers à transformer votre business avec l'IA. Accès limité disponible bientôt.",
    url: "https://ezia.ai/waitlist",
    siteName: "Ezia",
    images: [
      {
        url: "https://ezia.ai/og-waitlist.png",
        width: 1200,
        height: 630,
        alt: "Ezia - Liste d'attente",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rejoignez la liste d'attente d'Ezia",
    description: "Accès anticipé à la plateforme business IA la plus innovante",
    images: ["https://ezia.ai/twitter-waitlist.png"],
    creator: "@ezia_ai",
  },
};

export default function Page() {
  return <WaitlistClient />;
}