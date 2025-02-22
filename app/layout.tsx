import type { Metadata, Viewport } from "next";
import { Cherry_Bomb_One, Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ScrollUp from "@/components/scroll-up";
import Script from "next/script";
import Popup from "@/components/popup";
import { PROD_URL } from "@/lib/constant";

const figtree = Figtree({
  variable: "--body-font",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const cherryBombOne = Cherry_Bomb_One({
  variable: "--second-font",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Friend Blitz",
    default: "Friend Blitz - Let's Make Friends", // a default is required when creating a template
  },
  description:
    "Invite your friends to join, and get up to 10GB of free data, airtime, and SMS credits! Start earning now with our easy referral program.",
  metadataBase: new URL(PROD_URL),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  openGraph: {
    title: "Friend Blitz",
    description:
      "Invite your friends to join, and get up to 10GB of free data, airtime, and SMS credits! Start earning now with our easy referral program.",
    url: PROD_URL,
    siteName: "Friend Blitz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Friend Blitz",
    description:
      "Invite your friends to join, and get up to 10GB of free data, airtime, and SMS credits! Start earning now with our easy referral program.",
    creator: "@friend-blitz",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${cherryBombOne.variable}`}>
        {children}
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GFSEQND4NJ"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-GFSEQND4NJ');
            `,
          }}
        />
        <Popup routes={["/", "/profile", "/free-points"]} />
        <ScrollUp />
        <Toaster
          position="top-center"
          closeButton
          richColors
          toastOptions={{ className: `${figtree.className}` }}
        />
      </body>
    </html>
  );
}
