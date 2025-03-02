/* eslint-disable @next/next/no-img-element */
"use client";
import styles from "../page.module.css";
import { tokensManager } from "@/lib/utils";
import { toast } from "sonner";
import { auth } from "../firebase";
import { useEffect } from "react";
import useLocalStorage from "@/lib/hooks/use-local-storage";
import Contact from "@/components/contact";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Page() {
  const [feelingLuckyLimit, setFeelingLuckyLimit] = useLocalStorage(
    "feelingLuckyLimit",
    { count: 0, date: new Date().toDateString() }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString();

      // Ensure feelingLuckyLimit has valid structure
      if (!feelingLuckyLimit || typeof feelingLuckyLimit.date !== "string") {
        setFeelingLuckyLimit({ count: 0, date: today });
      } else if (feelingLuckyLimit.date !== today) {
        setFeelingLuckyLimit({ count: 0, date: today });
      }
    }
  }, [feelingLuckyLimit, setFeelingLuckyLimit]);

  // Function to handle the feeling lucky action
  const feelingLucky = async () => {
    try {
      // Fetch authenticated user details
      const user = auth.currentUser;

      if (!user) {
        throw Error("Whoa! You're logged in!");
      }

      if (feelingLuckyLimit.count < 6) {
        setFeelingLuckyLimit({
          count: feelingLuckyLimit.count + 1,
          date: feelingLuckyLimit.date,
        });

        // 30% chance to generate tokens (adjust the value for different probability)
        const randomChance = Math.random();

        if (randomChance > 0.7) {
          // 30% chance to generate tokens
          const tokens = Number((Math.random() * 0.8 + 0.2).toFixed(2));

          if (tokens) {
            // Add tokens to the user's account
            await tokensManager("add", { userId: user.uid, tokens });

            toast.success(`You earned ${tokens} tokens 🎉`);
          }
        } else {
          toast.info("No tokens earned this time.");
        }
      } else {
        toast.error("Chill, that's enough for today. Try again tomorrow.");
      }
    } catch (error) {
      // Handle any errors that occur during execution
      console.error("An error occurred:", error);
      toast.error("Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      {/*==================== HEADER ====================*/}
      <Header />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== WIDGET ====================*/}
        <section className={`${styles.widget} ${styles.section}`} id="widget">
          <h2 className={styles.section__title}>
            NEED MORE TOKENS TO TRADE? <span>LOOK NO FURTHER!</span>
          </h2>

          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            <article className={styles.widget__card}>
              <img
                src="/block-17.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>I am feeling lucky today.</span>
                Tap here to test your luck!
              </p>
              <button
                onClick={feelingLucky}
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
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
              </button>
            </article>
            <article className={styles.widget__card}>
              <img
                src="/block-6.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Can you tackle our challenges?</span>
                Take on the challenge now!
              </p>
              <a
                href="/my-profile/challenges"
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
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
            <article className={styles.widget__card}>
              <img
                src="/block-5.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Try to play a daily puzzle.</span>
                Start solving and earn tokens!
              </p>
              <a
                href="/my-profile/puzzle"
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
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
        </section>
        {/*==================== CONTACT ====================*/}
        <Contact />
      </main>
      {/*==================== FOOTER ====================*/}
      <Footer />
    </div>
  );
}
