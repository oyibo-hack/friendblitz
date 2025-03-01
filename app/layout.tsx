import type { Metadata, Viewport } from "next";
import { Cherry_Bomb_One, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ScrollUp from "@/components/scroll-up";
import Script from "next/script";
import Popup from "@/components/popup";
import { PROD_URL } from "@/lib/constant";
import MembershipToast from "@/components/membership-toast";

const outfit = Outfit({
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
    "Your easy side hustle! Earn free airtime, SMS, and up to 10GB of data just by inviting friends. No pressure, just rewards. Start earning today!",
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
      "Your easy side hustle! Earn free airtime, SMS, and up to 10GB of data just by inviting friends. No pressure, just rewards. Start earning today!",
    url: "/",
    siteName: "Friend Blitz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Friend Blitz",
    description:
      "Your easy side hustle! Earn free airtime, SMS, and up to 10GB of data just by inviting friends. No pressure, just rewards. Start earning today!",
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
      <body className={`${outfit.variable} ${cherryBombOne.variable}`}>
        <MembershipToast />
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
        <Popup
          routes={[
            "/",
            "/my-profile/puzzle",
            "/free-points",
            "/rules",
            "/privacy-policy",
          ]}
        />
        <ScrollUp />
        <Toaster
          position="top-center"
          closeButton
          richColors
          expand={true}
          toastOptions={{ className: `${outfit.className}` }}
        />
      </body>
    </html>
  );
}
