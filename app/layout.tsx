import type { Metadata } from "next";
import { Raleway, Mulish, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { publicEnv } from "@/lib/env";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo/organization-jsonld";

// Display — Raleway (variable font; headings use 500–800).
const fontDisplay = Raleway({
  variable: "--font-d",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Body — Mulish (variable font; 400–800).
const fontBody = Mulish({
  variable: "--font-b",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Mono — IBM Plex Mono (static; weights enumerated).
const fontMono = IBM_Plex_Mono({
  variable: "--font-m",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_NAME = "Avesta Nordic";
const DEFAULT_DESCRIPTION =
  "Clinically formulated hydration drinks and nutrient gummies, built on Avesthagen's 25-year bioscience heritage. Prevention, Precaution and Cure.";

export const metadata: Metadata = {
  // Resolves every route's relative canonical/OG URL against the site origin.
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  // Title template: routes set a bare `title` and inherit the brand suffix; the
  // root default applies to any route that sets none.
  title: {
    default: "Avesta Nordic — Medicine, rooted in science",
    template: "%s · Avesta Nordic",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    // og:title / og:description intentionally omitted: Next falls them back to
    // each route's resolved title/description, so OG tracks the page. The
    // site-wide OG image (app/opengraph-image.tsx) is auto-attached by Next.
  },
  twitter: {
    card: "summary_large_image",
    // title/description inherit from openGraph/title the same way.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Site-wide Organization + WebSite structured data. */}
        <JsonLd data={organizationJsonLd(publicEnv.NEXT_PUBLIC_SITE_URL)} />
        {children}
      </body>
    </html>
  );
}
