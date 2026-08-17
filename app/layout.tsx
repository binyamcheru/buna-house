import type { Metadata, Viewport } from "next";
import { Domine, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { StructuredData } from "./components/structured-data";

const domine = Domine({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buna House — Premium Coffee Shop in Bole, Addis Ababa",
  description:
    "Premium small-batch coffee, artisan lattes, shakes, desserts and more. Order online from Buna House in Bole, Addis Ababa. Rated 4.9★ by 2000+ customers. Fast delivery.",
  keywords: [
    "coffee shop addis ababa",
    "bole coffee",
    "coffee delivery addis ababa",
    "best coffee ethiopia",
    "latte addis ababa",
    "buna house",
    "premium coffee ethiopia",
    "online coffee order",
  ],
  authors: [{ name: "Buna House" }],
  creator: "Buna House",
  publisher: "Buna House",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bunahouse.et'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_ET',
    url: 'https://bunahouse.et',
    title: 'Buna House — Premium Coffee Shop in Bole, Addis Ababa',
    description: 'Premium small-batch coffee, artisan lattes, shakes & desserts. Order online for fast delivery in Addis Ababa.',
    siteName: 'Buna House',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Buna House Coffee Shop - Premium coffee in Bole, Addis Ababa',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buna House — Premium Coffee in Addis Ababa',
    description: 'Order premium coffee, lattes & desserts online. Fast delivery in Bole & CMC.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${domine.variable} ${manrope.variable}`}>
      <head>
        <StructuredData />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. "Cz Shortcut")
          inject attributes like cz-shortcut-listen onto <body> before React
          hydrates, which otherwise triggers a harmless hydration warning. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}