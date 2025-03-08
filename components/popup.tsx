/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface PopupMessage {
  title: string;
  subtitle: string;
}

const popupMessages: PopupMessage[] = [
  {
    title: "Up to 75 GB",
    subtitle: "Earn up to 75 GB by simply inviting your friends.",
  },
  {
    title: "Don't worry!",
    subtitle: "Airtime is another surprise for you. Join now to start earning!",
  },
  {
    title: "Earn Big with Friends",
    subtitle: "Invite your friends and get up to 75 GB of data for free.",
  },
  {
    title: "Extra Surprises Await",
    subtitle: "Join now and earn airtime as an added bonus!",
  },
  {
    title: "Share and Earn",
    subtitle:
      "Invite your friends and enjoy up to 75 GB of data plus exclusive rewards.",
  },
  {
    title: "Get More, Do Less",
    subtitle: "Invite your friends and unlock up to 75 GB, plus bonus airtime!",
  },
  {
    title: "The More You Share, The More You Get",
    subtitle:
      "Invite friends and earn up to 75 GB, along with exciting airtime rewards!",
  },
];

function Popup({ routes }: { routes: string[] }) {
  const pathname = usePathname();
  const POPUP_DELAY = 92000; // 92 seconds

  const getRandomMessage = useCallback((): PopupMessage => {
    const randomIndex = Math.floor(Math.random() * popupMessages.length);
    return popupMessages[randomIndex];
  }, []);

  useEffect(() => {
    if (!routes.includes(pathname)) return;

    const showPopup = () => {
      const message = getRandomMessage();
      toast(
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo-big.png" alt="" width={50} height={50} />
          <div>
            <strong>{message.title}</strong>
            <p>{message.subtitle}</p>
          </div>
        </div>,
        {
          action: {
            label: "Share Now",
            onClick: () => (window.location.href = "/my-profile#share"),
          },
          duration: 8000, // 8 seconds
        }
      );
    };

    const initialDelay = setTimeout(showPopup, 30000); // First popup after 30s
    const interval = setInterval(showPopup, POPUP_DELAY); // Repeat every 92s

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [getRandomMessage, pathname, routes]);

  return null; // No UI, as Sonner handles the toast
}

export default Popup;
