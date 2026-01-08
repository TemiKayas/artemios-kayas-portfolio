import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka, Nunito } from "next/font/google";
import { NavigationProvider } from "@/components/NavigationProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artemios Kayas Portfolio",
  description: "Portfolio showcasing my work in Full-Stack Engineering and Applied AI",
  icons: {
    icon: [
      { url: "/assets/ArtemiosCloud.png?v=2" },
      { url: "/assets/ArtemiosCloud.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/assets/ArtemiosCloud.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: "/assets/ArtemiosCloud.png?v=2",
    shortcut: "/assets/ArtemiosCloud.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${nunito.variable} antialiased`}
      >
        <NavigationProvider>{children}</NavigationProvider>
      </body>
    </html>
  );
}
