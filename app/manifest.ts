import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Friend Blitz",
    short_name: "Friendblitz",
    description:
      "Your easy side hustle! Earn free airtime, SMS, and up to 10GB of data just by inviting friends. No pressure, just rewards. Start earning today!",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
