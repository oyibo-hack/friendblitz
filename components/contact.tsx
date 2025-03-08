import styles from "../app/page.module.css";

function Contact() {
  return (
    <section className={`${styles.contact} ${styles.section}`}>
      <h2 className={styles.section__title}>
        JOIN THE<span>COMMUNITY</span>
      </h2>
      <div
        className={`${styles.contact__container} ${styles.container} ${styles.grid}`}
      >
        <form action="" className={styles.contact__form}>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            autoComplete="email"
            className={styles.contact__input}
          />
          <button
            type="submit"
            className={`${styles.button} ${styles.button__yellow}`}
          >
            Email Address
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
