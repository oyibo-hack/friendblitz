"use client";
/* eslint-disable @next/next/no-img-element */
import Footer from "@/components/footer";
import Header from "@/components/header";
import styles from "../app/page.module.css";
import Contact from "@/components/contact";

export default function Home() {
  return (
    <div>
      <Header />
      <main className={styles.main}>
        <section className={`${styles.home} ${styles.section}`} id="home">
          <img src="/home-bg.svg" alt="image" className={styles.home__bg} />

          <div
            className={`${styles.home__container} ${styles.container} ${styles.grid}`}
          >
            <div className={styles.home__data}>
              <h1 className={styles.home__title}>
                <span>GET FREE 10GB,</span>
                <span>AIRTIME & SMS - JUST</span>
                <span>BY INVITING FRIENDS!</span>
              </h1>

              <a href="/my-profile" className={styles.button}>
                Start Earning Now{" "}
              </a>

              <img
                src="/logo-big.png"
                alt="image"
                className={styles.home__image}
              />
            </div>

            <img src="/home-img.png" alt="image" className={styles.home__img} />
          </div>
        </section>
        <section
          className={`${styles.block} ${styles.section}`}
          id="how-it-works"
        >
          <img src="/image.png" alt="image" className={styles.block__lines} />
          <div className={`${styles.block__container} ${styles.container}`}>
            <h2 className={styles.section__title}>
              IT&apos;S SUPER SIMPLE! <span>HERE&apos;S HOW YOU DO IT</span>
            </h2>
            <div className={`${styles.block__content} ${styles.grid}`}>
              <article className={styles.block__card}>
                <img
                  src="/image.png"
                  alt="image"
                  className={styles.block__img}
                />
                <h3 className={styles.block__title}>Create Your Account</h3>
                <span className={styles.block__info}></span>
                <p className={styles.block__description}>
                  Sign up in seconds and get your unique refferal link.
                </p>
              </article>
              <article className={styles.block__card}>
                <img
                  src="/image.png"
                  alt="image"
                  className={styles.block__img}
                />
                <h3 className={styles.block__title}>Share Your Link</h3>
                <span className={styles.block__info}></span>
                <p className={styles.block__description}>
                  Invite your friends via whatsApp, Instagram, or SMS,
                </p>
              </article>
              <article className={styles.block__card}>
                <img
                  src="/image.png"
                  alt="image"
                  className={styles.block__img}
                />
                <h3 className={styles.block__title}>Get Rewards</h3>
                <span className={styles.block__info}></span>
                <p className={styles.block__description}>
                  Earn up to 10GB, free airtime, and SMS credits for every
                  friend who joins!
                </p>
              </article>
              <article className={styles.block__card}>
                <img
                  src="/image.png"
                  alt="image"
                  className={styles.block__img}
                />
                <h3 className={styles.block__title}>Redeem & Enjoy</h3>
                <span className={styles.block__info}></span>
                <p className={styles.block__description}>
                  Claim your rewards whenever you hit your goal.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section className={`${styles.about} ${styles.section}`} id="about">
          <div
            className={`${styles.about__container} ${styles.container} ${styles.grid}`}
          >
            <div className={styles.about__data}>
              <h2 className={styles.section__title}>
                GET FREE AIRTIME, SMS, <span>AND UP TO 10GB OF DATA</span>
              </h2>
              <p className={styles.about__description}>
                We make it easy to get free airtime, data, and SMS! Just share
                your unique referral link with friends, and when they sign up,
                you both get rewarded. No catches, just free stuff for you and
                your crew. Start sharing and start earning today!
              </p>
              <img
                src="/logo-big.png"
                alt="image"
                className={styles.about__image1}
              />
            </div>
            <div className={styles.about__info}>
              <div>
                <h3 className={styles.about__infoTitle}>USERS</h3>
                <h2 className={styles.about__infoNumber}>2K+</h2>
              </div>
              <div>
                <h3 className={styles.about__infoTitle}>DATA GIVEN</h3>
                <h2 className={styles.about__infoNumber}>
                  6650.5 <span>GB</span>
                </h2>
              </div>
            </div>
            <img
              src="/about-img.png"
              alt="image"
              className={styles.about__img}
            />
          </div>
        </section>
        <section
          className={`${styles.highlight} ${styles.section}`}
          id="highlight"
        >
          <h2 className={styles.section__title}>
            THE MORE YOU INVITE, <span>THE MORE YOU GET</span>
          </h2>
          <img
            src="/image.png"
            alt="image"
            className={styles.highlight__image1}
          />
          <img
            src="/image.png"
            alt="image"
            className={styles.highlight__image2}
          />
          <div
            className={`${styles.highlight__container} ${styles.container} ${styles.grid}`}
          >
            <article className={styles.highlight__card}>
              <img
                src="/image.png"
                alt="image"
                className={styles.highlight__img}
              />
              <p className={styles.highlight__description}>
                <span>Invite 1 Friend: </span>
                Get up to 1GB + 100 SMS
              </p>
            </article>
            <article className={styles.highlight__card}>
              <img
                src="/image.png"
                alt="image"
                className={styles.highlight__img}
              />
              <p className={styles.highlight__description}>
                <span>Invite 5 Friend: </span>
                Get up to 5GB + 500 SMS
              </p>
            </article>
            <article className={styles.highlight__card}>
              <img
                src="/image.png"
                alt="image"
                className={styles.highlight__img}
              />
              <p className={styles.highlight__description}>
                <span>Invite 10 Friend: </span>
                Get up to 10GB + 1,000 SMS + Airtime
              </p>
            </article>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </div>
  );
}
