/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata, Viewport } from "next";
import { Poppins, PT_Sans } from "next/font/google";
import { cookies } from "next/headers";

import TanstackProvider from "@/components/providers/tanstack-query-provider";
// import "./globals-inline.css"; // Désactivé - Dokploy ne peut pas parser le CSS
import { Toaster } from "@/components/ui/sonner";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";
import AppContext from "@/components/contexts/app-context";
import Script from "next/script";
import StorageInitializer from "@/components/providers/storage-initializer";
import AutoSync from "@/components/providers/auto-sync";
import GoogleAnalytics from "@/components/google-analytics";
import CookieConsent from "@/components/cookie-consent";

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

export const metadata: Metadata = {
  title: "Ezia | Votre Partenaire Business IA",
  description:
    "Ezia est votre partenaire business propulsé par l'IA. Création de sites web, stratégie marketing, analyse de marché - Développez votre présence en ligne avec notre expertise.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Ezia | Votre Partenaire Business IA",
    description:
      "Ezia est votre partenaire business propulsé par l'IA. Création de sites web, stratégie marketing, analyse de marché - Développez votre présence en ligne avec notre expertise.",
    url: "https://ezia.ai",
    siteName: "Ezia",
    images: [
      {
        url: "https://ezia.ai/banner.png",
        width: 1200,
        height: 630,
        alt: "Ezia Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezia | Votre Partenaire Business IA",
    description:
      "Ezia est votre partenaire business propulsé par l'IA. Création de sites web, stratégie marketing, analyse de marché - Développez votre présence en ligne avec notre expertise.",
    images: ["https://ezia.ai/banner.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Ezia",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ebe7e1",
};

async function getMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  if (!token) return { user: null, errCode: null };
  
  try {
    // Utiliser isAuthenticated pour obtenir l'utilisateur depuis HuggingFace directement
    const { isAuthenticated } = await import("@/lib/auth-simple");
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
      <head>
        <Script
          defer
          data-domain="ezia.agency"
          src="https://plausible.io/js/script.js"
        />
        <link rel="preload" href="https://cdn.tailwindcss.com" as="script" />
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Google Analytics - Balise de vérification */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <meta name="google-analytics-id" content={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS pour éviter FOUC */
          body { background-color: #ebe7e1; min-height: 100vh; }
          .hidden { display: none; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          /* Variables CSS pour les composants UI */
          :root {
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 47.4% 11.2%;
          }
          
          /* Classes manquantes pour les dropdowns */
          .bg-popover { background-color: hsl(var(--popover)); }
          .text-popover-foreground { color: hsl(var(--popover-foreground)); }
          
          /* Amélioration des Select components */
          [role="combobox"]:hover {
            border-color: #6D3FC8 !important;
            background-color: rgba(109, 63, 200, 0.05);
          }
          
          [role="option"]:hover {
            background-color: rgba(109, 63, 200, 0.1) !important;
            color: #6D3FC8;
          }
          
          [role="option"][data-highlighted] {
            background-color: rgba(109, 63, 200, 0.1) !important;
            color: #6D3FC8;
          }
        ` }} />
      </head>
      <body
        className={`${poppins.variable} ${ptSans.variable} antialiased bg-[#ebe7e1] min-h-[100dvh]`}
        style={{ fontFamily: 'var(--font-poppins)' }}
        suppressHydrationWarning
      >
        <Toaster richColors position="bottom-center" />
        <TanstackProvider>
          <AppContext me={data}>
            <StorageInitializer />
            <AutoSync />
            {children}
            <CookieConsent />
          </AppContext>
        </TanstackProvider>
      </body>
    </html>
  );
}
