/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "@/components/header";
import styles from "../../page.module.css";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

function Puzzle() {
  return (
    <div>
      {/*==================== HEADER ====================*/}
      <Header />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== BLOCK ====================*/}
        <section className={`${styles.block} ${styles.section}`} id="block">
          <img
            src="/block-lines.svg"
            alt="image"
            className={styles.block__lines}
          />

          <div className={`${styles.block__container} ${styles.container}`}>
            <h2 className={styles.section__title}>
              PLAY & <span>WIN TOKENS</span>
            </h2>

            <div className={styles.block__swiper}>
              <div className={`${styles.block__content} ${styles.grid}`}>
                <article className={styles.block__card}>
                  <img
                    src="/block-5.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Tenzi</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Match all dice in Tenzi within 20 seconds to earn 0.2
                    tokens.
                  </p>
                  <a
                    href="puzzle/tenzi"
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
                <article className={styles.block__card}>
                  <img
                    src="/block-5.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Hangman</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Guess the Nigerian state in Hangman to earn 0.2 tokens.
                  </p>
                  <a
                    href="puzzle/hangman"
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
                <article className={styles.block__card}>
                  <img
                    src="/block-5.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Tic Tac Toe</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Win the game of Tic Tac Toe to earn 1 tokens.
                  </p>
                  <a
                    href="puzzle/tic-tac-toe"
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

export default Puzzle;
