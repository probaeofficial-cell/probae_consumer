import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Probae | Premium Health Bowls",
  description: "Delicious, chef-crafted health bowls tailored to your calorie and macronutrient goals. Join Probae for a personalized culinary experience.",
  keywords: ["health bowls", "meal prep", "healthy eating", "custom meals", "Probae", "nutrition"],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: "Probae | Premium Health Bowls",
    description: "Delicious, chef-crafted health bowls tailored to your calorie and macronutrient goals. Join Probae for a personalized culinary experience.",
    url: "https://probae.com",
    siteName: "Probae",
    images: [
      {
        url: "/images/PB_Probae - LogoMark.png",
        width: 800,
        height: 600,
        alt: "Probae Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Probae | Premium Health Bowls",
    description: "Delicious, chef-crafted health bowls tailored to your calorie and macronutrient goals.",
    images: ["/images/PB_Probae - LogoMark.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grid-pattern">{children}</body>
    </html>
  );
}
