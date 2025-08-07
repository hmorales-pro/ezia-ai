/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata, Viewport } from "next";
import { Inter, PT_Sans } from "next/font/google";
import { cookies } from "next/headers";

import TanstackProvider from "@/components/providers/tanstack-query-provider";
import "@/assets/globals.css";
import { Toaster } from "@/components/ui/sonner";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";
import AppContext from "@/components/contexts/app-context";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-ptSans-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Eziom Agency | Votre Partenaire Business IA",
  description:
    "Eziom Agency est votre partenaire business propulsé par l'IA. Création de sites web, stratégie marketing, analyse de marché - Développez votre présence en ligne avec notre expertise.",
  openGraph: {
    title: "Eziom Agency | Votre Partenaire Business IA",
    description:
      "Eziom Agency est votre partenaire business propulsé par l'IA. Création de sites web, stratégie marketing, analyse de marché - Développez votre présence en ligne avec notre expertise.",
    url: "https://eziom.agency",
    siteName: "Eziom Agency",
    images: [
      {
        url: "https://eziom.agency/banner.png",
        width: 1200,
        height: 630,
        alt: "Eziom Agency Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eziom Agency | Votre Partenaire Business IA",
    description:
      "Eziom Agency est votre partenaire business propulsé par l'IA. Création de sites web, stratégie marketing, analyse de marché - Développez votre présence en ligne avec notre expertise.",
    images: ["https://eziom.agency/banner.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Eziom Agency",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#EDEAE3",
};

async function getMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  if (!token) return { user: null, errCode: null };
  
  try {
    // Utiliser isAuthenticated pour obtenir l'utilisateur depuis HuggingFace directement
    const { isAuthenticated } = await import("@/lib/auth");
    const user = await isAuthenticated();
    
    if (user && !(user instanceof Response)) {
      return { user, errCode: null };
    }
    return { user: null, errCode: null };
  } catch (err: any) {
    console.error("Error getting user:", err);
    return { user: null, errCode: err.status || null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getMe();
  return (
    <html lang="en">
      <Script
        defer
        data-domain="eziom.agency"
        src="https://plausible.io/js/script.js"
      ></Script>
      <body
        className={`${inter.variable} ${ptSans.variable} antialiased bg-[#EDEAE3] h-[100dvh] overflow-hidden`}
      >
        <Toaster richColors position="bottom-center" />
        <TanstackProvider>
          <AppContext me={data}>{children}</AppContext>
        </TanstackProvider>
      </body>
    </html>
  );
}
