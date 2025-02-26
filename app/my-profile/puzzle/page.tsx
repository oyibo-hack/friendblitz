/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "@/components/header";
import styles from "../../page.module.css";
import Footer from "@/components/footer";
import { toast } from "sonner";

function Puzzle() {
  return (
    <div>
      {/*==================== HEADER ====================*/}
      <Header />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== WIDGET ====================*/}
        <section className={`${styles.widget} ${styles.section}`} id="widget">
          <h2 className={styles.section__title}>
            PLAY & <span>WIN TOKENS</span>
          </h2>

          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            <article className={styles.widget__card}>
              <img
                src="/block-25.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Tenzi</span>
                Match all dice in Tenzi within 20 seconds to earn 0.2 tokens.
              </p>
              <a
                // href="puzzle/tenzi"
                onClick={() => toast.error("Something went wrong.")}
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
                src="/block-26.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Hangman</span>
                Guess the Nigerian state in Hangman to earn 0.2 tokens.
              </p>
              <a
                // href="puzzle/hangman"
                onClick={() => toast.error("Something went wrong.")}
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
                src="/block-27.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Tic Tac Toe</span>
                Win the game of Tic Tac Toe to earn 1 tokens.
              </p>
              <a
                // href="puzzle/tic-tac-toe"
                onClick={() => toast.error("Something went wrong.")}
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
        <hr className={styles.container} style={{ marginBlock: "5rem" }} />
      </main>
      {/*==================== FOOTER ====================*/}
      <Footer />
    </div>
  );
}

export default Puzzle;
