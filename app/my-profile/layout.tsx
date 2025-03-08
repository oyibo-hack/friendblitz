import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  openGraph: {
    title: "My Profile",
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
