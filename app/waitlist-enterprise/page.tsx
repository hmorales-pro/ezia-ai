import { Metadata } from "next";
import WaitlistEnterpriseClient from "./waitlist-enterprise-client";

export const metadata: Metadata = {
  title: "Liste d'attente - Ezia Analytics pour Entreprises",
  description: "Vous avez des clients, des ventes, des outils... mais pas le temps d'analyser ? Ezia unifie vos données et révèle ce qui fait vraiment grandir votre business.",
  openGraph: {
    title: "Ezia Analytics - Pour les entreprises qui ont des données partout",
    description: "Connectez Stripe, votre CRM, vos analytics... Ezia comprend vos données et vous alerte sur ce qui compte vraiment.",
    url: "https://ezia.ai/waitlist-enterprise",
    siteName: "Ezia",
    images: [
      {
        url: "https://ezia.ai/og-enterprise.png",
        width: 1200,
        height: 630,
        alt: "Ezia Analytics - Enterprise",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function Page() {
  return <WaitlistEnterpriseClient />;
}