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
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS pour éviter FOUC */
          body { background-color: #ebe7e1; min-height: 100vh; }
          .hidden { display: none; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
        ` }} />
      </head>
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
