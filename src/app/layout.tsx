import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
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
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grid-pattern">{children}</body>
    </html>
  );
}
