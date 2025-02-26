/* eslint-disable @next/next/no-img-element */
import Contact from "@/components/contact";
import styles from "../app/page.module.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <div>
      {/*==================== HEADER ====================*/}
      <Header />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== HOME ====================*/}
        <section className={`${styles.home} ${styles.section}`} id="home">
          <img src="/home-bg.svg" alt="image" className={styles.home__bg} />

          <div
            className={`${styles.home__container} ${styles.container} ${styles.grid}`}
          >
            <div className={styles.home__data}>
              <h1 className={styles.home__title}>
                <span>EARN FREE AIRTIME,</span>
                <span> SMS, & DATA BY </span>
                <span>INVITING FRIENDS!</span>
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
        {/*==================== BLOCK ====================*/}
        <section
          className={`${styles.block} ${styles.section}`}
          id="how-it-works"
        >
          <img
            src="/block-lines.svg"
            alt="image"
            className={styles.block__lines}
          />
          <div className={`${styles.block__container} ${styles.container}`}>
            <h2 className={styles.section__title}>
              HOW IT <span>WORKS</span>
            </h2>
            <div className={`${styles.block__swiper} swiper`}>
              <div className="swiper-wrapper">
                <article className={`${styles.block__card} swiper-slide`}>
                  <img
                    src="/block-15.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Share Your Link</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Drop your unique referral link on Instagram, WhatsApp,
                    TikTok, or anywhere.
                  </p>
                </article>
                <article className={`${styles.block__card} swiper-slide`}>
                  <img
                    src="/block-16.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>They Sign Up</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    When your friends join, you both score rewards.
                  </p>
                </article>
                <article className={`${styles.block__card} swiper-slide`}>
                  <img
                    src="/block-2.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Get Paid</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    You and your friends instantly get free airtime, data, and
                    SMS!
                  </p>
                </article>
                <article className={`${styles.block__card} swiper-slide`}>
                  <img
                    src="/block-17.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>No Catch</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Enjoy the freebies—no strings attached!
                  </p>
                </article>
              </div>
            </div>
            {/* Pagination */}
            <div className="swiper-pagination" />
          </div>
        </section>
        {/*==================== EXPLORE ====================*/}
        <section className={`${styles.explore} ${styles.section}`} id="explore">
          <div
            className={`${styles.explore__container} ${styles.container} ${styles.grid}`}
          >
            <div className={styles.explore__data}>
              <h2 className={styles.section__title}>
                GET FREE AIRTIME, SMS, <span>AND UP TO 10GB OF DATA</span>
              </h2>
              <p className={styles.explore__description}>
                We make it easy to get free airtime, data, and SMS! Just share
                your unique referral link with friends, and when they sign up,
                you both get rewarded. No catches, just free stuff for you and
                your crew. Start sharing and start earning today!
              </p>
              <img
                src="/block-9.svg"
                alt="image"
                className={styles.explore__planet}
              />
            </div>
            <div className={styles.explore__info}>
              <div>
                <h3 className={styles.explore__info_title}>USERS</h3>
                <h2 className={styles.explore__info_number}>2K+</h2>
              </div>
              <div>
                <h3 className={styles.explore__info_title}>DATA GIVEN</h3>
                <h2 className={styles.explore__info_number}>
                  6650.5 <span>GB</span>
                </h2>
              </div>
            </div>
            <img
              src="/about-img.png"
              alt="image"
              className={styles.explore__img}
            />
          </div>
        </section>
        {/*==================== FAQs ====================*/}
        <section className={`${styles.faq} ${styles.section}`} id="faq">
          <h2 className={styles.section__title}>
            START SHARING NOW <span>AND GET REWARDED</span>
          </h2>
          {/* <img src="/block-12.svg" alt="image" className={styles.faq__image1} /> */}
          <img src="/logo-big.png" alt="image" className={styles.faq__image2} />
          <div
            className={`${styles.faq__container} ${styles.container} ${styles.grid}`}
          >
            <article className={styles.faq__card}>
              <img src="/block-8.svg" alt="image" className={styles.faq__img} />
              <p className={styles.faq__description}>
                <span>How many friends can I refer?</span>
                There’s no limit! Invite as many friends as you want and get
                rewarded for each one.
              </p>
            </article>
            <article className={styles.faq__card}>
              <img src="/block-2.svg" alt="image" className={styles.faq__img} />
              <p className={styles.faq__description}>
                <span>How do I get my rewards?</span>
                Your rewards show up instantly in your account—use them however
                you like!
              </p>
            </article>
            <article className={styles.faq__card}>
              <img
                src="/block-14.svg"
                alt="image"
                className={styles.faq__img}
              />
              <p className={styles.faq__description}>
                <span>Is there a cap on how much I can earn?</span>
                Nope! Keep referring, keep earning. The more you share, the more
                you get.
              </p>
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
