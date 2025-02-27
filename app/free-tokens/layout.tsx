import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Token Friend Blitz",
  },
  openGraph: {
    title: "Free Token Friend Blitz",
    description:
      "Get FREE Airtime, Data, and SMS Just for Sharing With Friends!",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
