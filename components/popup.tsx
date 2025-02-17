/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "../app/page.module.css";
import { usePathname } from "next/navigation";

interface PopupMessage {
  title: string;
  subtitle: string;
  image: string;
}

const popupMessages: PopupMessage[] = [
  {
    title: "Up to 75 GB",
    subtitle: "Earn up to 75 GB by simply inviting your friends.",
    image: "/block-2.svg",
  },
  {
    title: "Don't worry!",
    subtitle: "Airtime is another surprise for you. Join now to start earning!",
    image: "/block-9.svg",
  },
  {
    title: "Earn Big with Friends",
    subtitle: "Invite your friends and get up to 75 GB of data for free.",
    image: "/block-10.svg",
  },
  {
    title: "Extra Surprises Await",
    subtitle: "Join now and earn airtime as an added bonus!",
    image: "/block-11.svg",
  },
  {
    title: "Share and Earn",
    subtitle:
      "Invite your friends and enjoy up to 75 GB of data plus exclusive rewards.",
    image: "/block-12.svg",
  },
  {
    title: "Get More, Do Less",
    subtitle: "Invite your friends and unlock up to 75 GB, plus bonus airtime!",
    image: "/block-4.svg",
  },
  {
    title: "The More You Share, The More You Get",
    subtitle:
      "Invite friends and earn up to 75 GB, along with exciting airtime rewards!",
    image: "/block-13.svg",
  },
];

function Popup({ routes }: { routes: string[] }) {
  const pathname = usePathname();
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Initially false for the 15s delay
  const [currentMessage, setCurrentMessage] = useState<PopupMessage | null>(
    null
  );
  const POPUP_DELAY = 72000; // 72 seconds

  const getRandomMessage = useCallback((): PopupMessage => {
    const randomIndex = Math.floor(Math.random() * popupMessages.length);
    return popupMessages[randomIndex];
  }, []);

  // Initialize the message after a 20-second delay
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setCurrentMessage(getRandomMessage());
      setIsPopupVisible(true);
    }, 20000); // 20 seconds

    return () => clearTimeout(initialDelay);
  }, [getRandomMessage]);

  // Handle popup visibility and message updates
  useEffect(() => {
    let popupTimer: NodeJS.Timeout | null = null;

    if (!isPopupVisible) {
      popupTimer = setTimeout(() => {
        setCurrentMessage(getRandomMessage());
        setIsPopupVisible(true);
      }, POPUP_DELAY);
    }

    return () => {
      if (popupTimer) clearTimeout(popupTimer);
    };
  }, [isPopupVisible, getRandomMessage]);

  // Don't render anything until we have a message
  if (!currentMessage || !routes.includes(pathname)) {
    return null;
  }

  return (
    <div className={`modal ${isPopupVisible ? "activeModal" : ""}`}>
      <div className="modal__container">
        <article className={styles.block__card}>
          <div
            className="modal__close"
            onClick={() => setIsPopupVisible(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width={24}
              height={24}
            >
              <path d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z" />
            </svg>
          </div>

          <img
            src={currentMessage.image}
            alt="image"
            className={styles.block__img}
          />

          <h3 className={styles.block__title}>{currentMessage.title}</h3>
          <span className={styles.block__info}></span>
          <p className={styles.block__description}>{currentMessage.subtitle}</p>
          <a
            href="/profile#share"
            className={`${styles.button} ${styles.button__yellow} ${styles.block__button}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width={24}
              height={24}
            >
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>
          </a>
        </article>
      </div>
    </div>
  );
}

export default Popup;
