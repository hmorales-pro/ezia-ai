import { Metadata } from "next";
import WaitlistClient from "./waitlist-client";

export const metadata: Metadata = {
  title: "Liste d'attente - Ezia pour Entrepreneurs",
  description: "Vous avez une idée, un projet, une passion ? Ezia et son équipe d'IA vous accompagnent pour créer votre site, valider votre marché et lancer votre business.",
  openGraph: {
    title: "Ezia - Le partenaire IA des entrepreneurs qui se lancent",
    description: "De l'idée au lancement : création de site, stratégie marketing, validation de marché. Tout pour bien démarrer, sans code et avec l'IA.",
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
    title: "Ezia - Lancez votre business avec l'IA",
    description: "Le compagnon IA pour entrepreneurs : site web, marketing, stratégie. Tout pour réussir votre lancement.",
    images: ["https://ezia.ai/twitter-waitlist.png"],
    creator: "@ezia_ai",
  },
};

export default function Page() {
  return <WaitlistClient />;
}