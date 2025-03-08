import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Join Friend Blitz",
  },
  openGraph: {
    title: "Join Friend Blitz",
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
