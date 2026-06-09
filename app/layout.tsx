import type { Metadata } from "next";
import { Schibsted_Grotesk, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display — Schibsted Grotesk (variable font: full weight range available).
const fontDisplay = Schibsted_Grotesk({
  variable: "--font-d",
  subsets: ["latin"],
  display: "swap",
});

// Body — Instrument Sans (variable font).
const fontBody = Instrument_Sans({
  variable: "--font-b",
  subsets: ["latin"],
  display: "swap",
});

// Mono — IBM Plex Mono (static; weights enumerated).
const fontMono = IBM_Plex_Mono({
  variable: "--font-m",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avesta Health — Medicine, rooted in science",
  description:
    "Clinically formulated hydration drinks and nutrient gummies, built on Avesthagen's 25-year bioscience heritage. Prevention, Precaution and Cure.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
