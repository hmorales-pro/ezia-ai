import { Metadata } from "next";
import HomeEnterpriseClient from "./home-enterprise-client";

export const metadata: Metadata = {
  title: "Ezia Analytics - L'IA qui raconte l'histoire de vos données",
  description: "Unifiez vos données business (Stripe, Asana, Zendesk...) et transformez-les en insights actionnables. Découvrez l'histoire cachée de votre entreprise.",
  openGraph: {
    title: "Ezia Analytics - Transformez vos données en décisions",
    description: "La plateforme IA française qui unifie et analyse vos données business pour révéler des opportunités de croissance",
    url: "https://ezia.ai/home-enterprise",
    siteName: "Ezia Analytics",
    images: [
      {
        url: "https://ezia.ai/og-analytics.png",
        width: 1200,
        height: 630,
        alt: "Ezia Analytics",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezia Analytics - L'IA qui unifie vos données business",
    description: "Connectez tous vos outils et découvrez les insights cachés de votre entreprise",
    images: ["https://ezia.ai/twitter-analytics.png"],
  },
};

export default function HomePage() {
  return <HomeEnterpriseClient />;
}