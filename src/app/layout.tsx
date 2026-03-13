import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a855f7" },
    { media: "(prefers-color-scheme: dark)", color: "#a855f7" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ingressos.xdeals.online"),
  title: {
    default: "XDeals - Ingressos com até 60% de Desconto | Parceiro Q2Ingressos",
    template: "%s | XDeals",
  },
  description: "Compre ingressos com descontos exclusivos de 40% a 60%. XDeals é parceiro oficial Q2Ingressos. Shows, festivais, rodeios e eventos em todo Brasil. MC Livinho, Nattan, Ana Castela, Copa do Mundo 2026 e mais!",
  keywords: [
    "ingressos",
    "ingressos com desconto",
    "shows",
    "festivais",
    "rodeios",
    "Q2Ingressos",
    "promoção",
    "MC Livinho",
    "Nattan",
    "Menos é Mais",
    "Ana Castela",
    "Alok",
    "Matuê",
    "eventos",
    "Maringá",
    "Paraná",
    "Expoingá",
    "Copa do Mundo 2026",
    "ingressos baratos",
    "venda de ingressos",
    "ingressos promocionais",
    "XDeals",
  ],
  authors: [{ name: "XDeals", url: "https://ingressos.xdeals.online" }],
  creator: "XDeals",
  publisher: "XDeals",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
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
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "XDeals - Ingressos com até 60% de Desconto",
    description: "Compre ingressos com descontos exclusivos de 40% a 60%. Parceiro oficial Q2Ingressos. Shows, festivais, Copa do Mundo 2026!",
    type: "website",
    url: "https://ingressos.xdeals.online",
    siteName: "XDeals",
    locale: "pt_BR",
    images: [
      {
        url: "https://files.catbox.moe/5vwc60.jpg",
        width: 1200,
        height: 630,
        alt: "XDeals - Ingressos com até 60% de Desconto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XDeals - Ingressos com até 60% de Desconto",
    description: "Compre ingressos com descontos exclusivos de 40% a 60%. Parceiro oficial Q2Ingressos.",
    images: ["https://files.catbox.moe/5vwc60.jpg"],
  },
  alternates: {
    canonical: "https://ingressos.xdeals.online",
  },
  verification: {
    google: "google-site-verification-code", // Add your Google Search Console verification code
  },
  category: "Entertainment",
  classification: "Ticket Sales",
  appLinks: {
    web: {
      url: "https://ingressos.xdeals.online",
      should_fallback: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://files.catbox.moe" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://files.catbox.moe" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
        
        {/* Additional meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="XDeals" />
        <meta name="application-name" content="XDeals" />
        <meta name="msapplication-TileColor" content="#a855f7" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Geo tags for local SEO */}
        <meta name="geo.region" content="BR-PR" />
        <meta name="geo.placename" content="Maringá" />
        
        {/* Rating and safety */}
        <meta name="rating" content="general" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        
        {/* Language */}
        <meta httpEquiv="content-language" content="pt-BR" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
