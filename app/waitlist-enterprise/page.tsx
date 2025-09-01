import { Metadata } from "next";
import WaitlistClient from "../waitlist/waitlist-client-v2";

export const metadata: Metadata = {
  title: "Liste d'attente Entreprises - Ezia Analytics",
  description: "Transformez vos données en histoires. Ezia connecte vos outils (Stripe, Asana, Zendesk...) pour révéler les insights cachés de votre entreprise.",
  openGraph: {
    title: "Ezia Analytics - Racontez l'histoire de vos données",
    description: "La plateforme IA qui unifie vos données business pour des décisions éclairées",
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
  return <WaitlistClient />;
}