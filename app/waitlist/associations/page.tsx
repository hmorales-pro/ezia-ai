import { Metadata } from "next";
import WaitlistClient from "../waitlist-client-v2";

export const metadata: Metadata = {
  title: "Liste d'attente Associations - Ezia",
  description: "Inscrivez votre association sur la liste d'attente d'Ezia. Créez votre site web, gérez vos membres et développez votre visibilité grâce à l'IA.",
  openGraph: {
    title: "Ezia pour les Associations - Liste d'attente",
    description: "Solution IA dédiée aux associations : site web, communication, collecte de dons, gestion des membres. Accès anticipé disponible bientôt.",
    url: "https://ezia.ai/waitlist/associations",
    siteName: "Ezia",
    images: [
      {
        url: "https://ezia.ai/og-waitlist-associations.png",
        width: 1200,
        height: 630,
        alt: "Ezia pour Associations - Liste d'attente",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezia pour Associations - Accès anticipé",
    description: "L'IA au service de votre association : site web, communication et plus",
    images: ["https://ezia.ai/twitter-waitlist-associations.png"],
    creator: "@ezia_ai",
  },
};

export default function AssociationsWaitlistPage() {
  return <WaitlistClient />;
}