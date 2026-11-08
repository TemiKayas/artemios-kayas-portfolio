import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Pixelify_Sans, Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--f-storybook", subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], style: ["normal", "italic"] });
const inter = Inter({ variable: "--f-body", subsets: ["latin"] });
const pixel = Pixelify_Sans({ variable: "--f-pixel", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const bricolage = Bricolage_Grotesque({ variable: "--f-modern", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--f-editorial", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

const site = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Artemios Kayas — Full-Stack & Applied AI Engineer",
  description:
    "Portfolio of Artemios Kayas: full-stack engineering and applied AI. Lead developer of ClassChat, award-winning hackathon builder.",
  icons: { icon: "/art/icon.png", apple: "/art/icon.png" },
  openGraph: {
    title: "Artemios Kayas",
    description: "Full-stack engineering & applied AI.",
    images: [{ url: "/art/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#2a2860" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} ${pixel.variable} ${bricolage.variable} ${instrument.variable}`}>
        {children}
      </body>
    </html>
  );
}
