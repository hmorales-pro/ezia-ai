import { Metadata } from "next";
import HomePage from "./home-client";

export const metadata: Metadata = {
  title: "Ezia - Votre partenaire business propulsé par l'IA",
  description: "Créez votre site web, développez votre stratégie marketing et faites grandir votre business avec Ezia, votre équipe d'experts IA disponible 24/7.",
  keywords: "création site web IA, marketing digital, stratégie business, intelligence artificielle, développement web, SEO, Ezia",
  openGraph: {
    title: "Ezia - Votre partenaire business propulsé par l'IA",
    description: "Transformez votre idée en réalité avec Ezia. Création de sites web, stratégies marketing et croissance business, le tout propulsé par l'IA.",
    url: "https://ezia.ai",
    siteName: "Ezia",
    images: [
      {
        url: "https://ezia.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ezia - Votre partenaire business IA",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezia - Votre partenaire business propulsé par l'IA",
    description: "Créez, développez et faites grandir votre présence en ligne avec Ezia",
    images: ["https://ezia.ai/twitter-image.png"],
    creator: "@ezia_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ezia.ai",
  },
};

export default function Page() {
  return <HomePage />;
}