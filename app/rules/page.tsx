/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import styles from "../page.module.css";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <div>
      <Header />
      <main className={styles.main}>
        <section className={`${styles.block} ${styles.section}`} id="block">
          <img
            src="/image.png"
            alt="image"
            className={styles.block__lines}
          />

          <div className={`${styles.block__container} ${styles.container}`}>
            <h2 className={styles.section__title}>
              OUR <span>RULES</span>
            </h2>
            <div className={styles.prose}>
              <p>
                <strong>Effective Date:</strong> 02 Dec 2024
              </p>

              <h3>1. Welcome to FriendsBlitz!</h3>
              <p>
                By using FriendsBlitz, you&apos;re agreeing to follow these
                rules. If you don’t agree, you won’t be able to use our
                platform.
              </p>

              <h3>2. Who Can Join?</h3>
              <p>
                You need to be at least 16 years old to sign up and start
                earning rewards.
              </p>

              <h3>3. Your Account</h3>
              <p>
                To get rewards, you’ll need an account. Keep your login details
                safe—you’re responsible for everything that happens under your
                account.
              </p>

              <h3>4. Registration Fees</h3>
              <p>
                FriendsBlitz may charge a fee for registration. If a fee
                applies, it will be clearly stated before you sign up.
              </p>

              <h3>5. How the Referral Program Works</h3>
              <ul>
                <li>
                  Invite your friends to sign up, and you’ll earn rewards like
                  airtime, SMS, and data.
                </li>
                <li>
                  Your friends must complete the signup and activation steps for
                  you to earn rewards.
                </li>
                <li>
                  Rewards can’t be exchanged for cash or transferred to someone
                  else.
                </li>
              </ul>

              <h3>6. No Cheating 🚫</h3>
              <p>To keep things fair, you CAN’T:</p>
              <ul>
                <li>
                  Use fake accounts or misleading tricks to get referrals.
                </li>
                <li>Sign up multiple times using different emails or names.</li>
                <li>
                  Break any rules set by mobile carriers or other services
                  involved in the rewards.
                </li>
              </ul>

              <h3>7. Privacy Matters</h3>
              <p>
                We respect your privacy. Your data is safe with us and used only
                as explained in our <a href="privacy-policy">Privacy Policy</a>.
              </p>

              <h3>8. Claiming Your Rewards</h3>
              <p>
                You can redeem your rewards based on the rules listed on the
                site. FriendsBlitz might change the rewards or how they work at
                any time.
              </p>

              <h3>9. If You Break the Rules...</h3>
              <p>
                If we find out you’re breaking these rules, we may suspend or
                even delete your account.
              </p>

              <h3>10. No Guarantees</h3>
              <p>
                We try our best to keep everything running smoothly, but we
                can’t promise rewards will always be available.
              </p>

              <h3>11. Updates to These Rules</h3>
              <p>
                We may update these rules from time to time. If you keep using
                the site after changes, that means you accept them.
              </p>

              <h3>12. The Legal Stuff</h3>
              <p>
                These rules are based on the laws of [Your Country or Region].
              </p>

              <div className="footer">
                <p>
                  <strong>Need Help?</strong>
                </p>
                <p>
                  Got questions? Reach out to us at{" "}
                  <a href="mailto:contact@friendsblitz.com">
                    contact@friendsblitz.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
