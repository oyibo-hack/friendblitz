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
              PRIVACY <span>POLICY</span>
            </h2>
            <div className={styles.block__swiper}>
              <div className={styles.prose}>
                <p>
                  <strong>Effective Date:</strong> 02 Dec 2024
                </p>

                <p>
                  FriendsBlitz (&quot;we&quot;, &quot;our&quot;, or
                  &quot;us&quot;) is committed to protecting your privacy. This
                  Privacy Policy outlines how we collect, use, and safeguard
                  your personal information when you use our website (the
                  &quot;Site&quot;).
                </p>
                <p>
                  By accessing or using the Site, you agree to the collection
                  and use of information in accordance with this Privacy Policy.
                </p>

                <h3>1. Information We Collect</h3>
                <ul>
                  <li>
                    <strong>Personal Information:</strong> When you sign up for
                    an account, we may collect personal details such as your
                    name, email address, phone number, and other contact
                    information.
                  </li>
                  <li>
                    <strong>Referral Information:</strong> We track the
                    referrals you make through your unique referral link or code
                    to ensure you earn rewards.
                  </li>
                  <li>
                    <strong>Device and Usage Data:</strong> We may collect data
                    about your device, including your IP address, browser type,
                    operating system, and how you use our Site.
                  </li>
                </ul>

                <h3>2. How We Use Your Information</h3>
                <ul>
                  <li>
                    <strong>To provide and improve our services:</strong> To
                    manage your account, process referrals, and deliver rewards
                    such as airtime, SMS, and data.
                  </li>
                  <li>
                    <strong>To communicate with you:</strong> To send you
                    updates, promotions, or customer service information related
                    to your account.
                  </li>
                  <li>
                    <strong>For analytics:</strong> To understand user behavior
                    on our Site and improve the user experience.
                  </li>
                </ul>

                <h3>3. Sharing Your Information</h3>
                <p>
                  We do not sell, rent, or trade your personal information.
                  However, we may share your data with third parties in the
                  following cases:
                </p>
                <ul>
                  <li>
                    <strong>Service Providers:</strong> We may share your
                    information with trusted third-party service providers who
                    help us deliver rewards, process payments, or maintain the
                    functionality of our Site. These providers are bound by
                    confidentiality agreements and are only permitted to use
                    your data for the specific purpose of helping us run the
                    Site.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose your
                    information to comply with legal obligations, such as
                    responding to subpoenas or legal claims.
                  </li>
                </ul>

                <h3>4. Cookies and Tracking Technologies</h3>
                <p>
                  We use cookies and other tracking technologies to enhance your
                  experience on our Site. Cookies are small data files stored on
                  your device that help us recognize you and analyze your usage
                  patterns. You can disable cookies in your browser settings,
                  but some features of the Site may not work properly without
                  them.
                </p>

                <h3>5. Security of Your Information</h3>
                <p>
                  We take reasonable steps to protect your personal information
                  from unauthorized access, use, or disclosure. While we strive
                  to use commercially acceptable means to protect your
                  information, no method of transmission over the internet or
                  electronic storage is 100% secure. We cannot guarantee its
                  absolute security.
                </p>

                <h3>6. Your Rights and Choices</h3>
                <ul>
                  <li>
                    <strong>Access and Update:</strong> You can access and
                    update your personal information at any time by logging into
                    your account.
                  </li>
                  <li>
                    <strong>Opt-Out of Communications:</strong> You can opt out
                    of receiving promotional emails by following the unsubscribe
                    link in any email we send.
                  </li>
                  <li>
                    <strong>Request Deletion:</strong> You can request that we
                    delete your personal information by contacting us at{" "}
                    <a href="mailto:contact@friendsblitz.com">
                      contact@friendsblitz.com
                    </a>
                    . Please note that certain information may need to be
                    retained for legal or administrative purposes.
                  </li>
                </ul>

                <h3>7. Children’s Privacy</h3>
                <p>
                  Our Site is not intended for individuals under the age of 16.
                  We do not knowingly collect personal information from children
                  under 16. If we become aware that a child under 16 has
                  provided us with personal information, we will take steps to
                  delete such information.
                </p>

                <h3>8. Changes to This Privacy Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page, and the &quot;Effective
                  Date&quot; will be updated accordingly. By continuing to use
                  the Site after these changes, you agree to the revised policy.
                </p>

                <h3>9. Contact Us</h3>
                <p>
                  If you have any questions or concerns about this Privacy
                  Policy or how we handle your personal information, please
                  contact us at:
                </p>
                <ul>
                  <li>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:contact@friendsblitz.com">
                      contact@friendsblitz.com
                    </a>
                  </li>
                </ul>
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
