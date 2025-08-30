/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata, Viewport } from "next";
import { Poppins, PT_Sans } from "next/font/google";
import { cookies } from "next/headers";

import TanstackProvider from "@/components/providers/tanstack-query-provider";
import "../assets/globals.fixed.css"; // IMPORTANT: Utilise le CSS fixé
import { Toaster } from "@/components/ui/sonner";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";
import AppContext from "@/components/contexts/app-context";
import Script from "next/script";
import StorageInitializer from "@/components/providers/storage-initializer";
import AutoSync from "@/components/providers/auto-sync";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const ptSans = PT_Sans({
  variable: "--font-ptSans-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(MY_TOKEN_KEY);

  if (!accessToken?.value) {
    console.log("No access token found in cookies");
    return null;
  }

  // Return server URL for Next.js server-side
  const serverUrl = process.env.NEXT_APP_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${serverUrl}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch user:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching user in root layout:", error.message);
    return null;
  }
}

export const metadata: Metadata = {
  title: {
    default: "Ezia | Votre partenaire IA pour réussir en ligne",
    template: "%s | Ezia",
  },
  description:
    "Ezia est votre assistant IA personnel qui vous accompagne dans la création et le développement de votre présence en ligne. Créez votre site web, développez votre stratégie marketing et atteignez vos objectifs business.",
  keywords: [
    "création site web IA",
    "assistant business IA",
    "stratégie digitale automatisée",
    "développement entreprise en ligne",
    "marketing digital IA",
    "Ezia AI",
  ],
  authors: [{ name: "Ezia Team" }],
  openGraph: {
    title: "Ezia - Votre partenaire IA pour réussir en ligne",
    description:
      "Transformez vos idées en succès digital avec Ezia, votre assistant IA personnel.",
    url: "https://ezia.ai",
    siteName: "Ezia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ezia - Assistant IA pour entrepreneurs",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezia - Votre partenaire IA pour réussir en ligne",
    description:
      "Créez, développez et gérez votre présence en ligne avec l'aide de l'IA",
    images: ["/twitter-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getCurrentUser();

  return (
    <html lang="en">
      <Script
        defer
        data-domain="ezia.agency"
        src="https://plausible.io/js/script.js"
      ></Script>
      <body
        className={`${poppins.variable} ${ptSans.variable} antialiased bg-[#ebe7e1] min-h-[100dvh] font-poppins`}
        suppressHydrationWarning
      >
        <Toaster richColors position="bottom-center" />
        <TanstackProvider>
          <AppContext me={data}>
            <StorageInitializer />
            <AutoSync />
            {children}
          </AppContext>
        </TanstackProvider>
      </body>
    </html>
  );
}