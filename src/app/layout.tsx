import type { Metadata } from "next";
import "./globals.css";
import { SoundProvider } from "@/contexts/SoundContext";
import GlobalMuteButton from "@/components/GlobalMuteButton";
import ButtonSoundHandler from "@/components/ButtonSoundHandler";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://show-milenio.vercel.app' 
    : 'http://localhost:3000'
  ),
  title: "Show do Milênio - Quiz Interativo",
  description: "Plataforma de perguntas e respostas com design inspirado no Show do Milhão. Teste seus conhecimentos em futebol e novelas!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Show do Milênio",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Show do Milênio",
    title: "Show do Milênio - Quiz Interativo",
    description: "Teste seus conhecimentos em diferentes áreas!",
  },
  twitter: {
    card: "summary",
    title: "Show do Milênio - Quiz Interativo",
    description: "Teste seus conhecimentos em diferentes áreas!",
  },
};

export const viewport = {
  themeColor: "#0E1525",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-base.png" />
        <link rel="apple-touch-icon" href="/icons/icon-base.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Show do Milênio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0E1525" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body suppressHydrationWarning>
        <SoundProvider>
          {children}
          <GlobalMuteButton />
          <ButtonSoundHandler />
        </SoundProvider>
      </body>
    </html>
  );
}
