import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Friend Blitz",
    short_name: "Friendblitz",
    description:
      "Invite your friends to join, and get up to 10GB of free data, airtime, and SMS credits! Start earning now with our easy referral program.",
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
