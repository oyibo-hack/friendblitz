/* eslint-disable @next/next/no-img-element */
"use client";
import Contact from "@/components/contact";
import styles from "../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import { convertBundle, getMNO, tokensManager, VTUService } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/footer";
import Header from "@/components/header";

export default function Page() {
  const { user, friends, loading, error } = useUser("current");

  const [modalVisible, setModalVisible] = useState(false);

  const [bundleCode, setBundleCode] = useState("");

  const [rewardLoading, setRewardLoading] = useState(false);

  // Identify the Mobile Network Operator (MNO) from the decoded phone number
  const network = user?.phone_number ? getMNO(user.phone_number) : "Unknown";

  // Effect to handle welcome modal on first load
  useEffect(() => {
    const newUserData = localStorage.getItem("welcomeNewUser");
    if (!newUserData) {
      setModalVisible(false);
    } else {
      const { isNewUser, bundleCode } = JSON.parse(newUserData); // Parse and extract `bundleCode`
      if (isNewUser && bundleCode) {
        setModalVisible(true);
        setBundleCode(bundleCode);
      }
    }
  }, []);

  const claimWelcomeReward = async () => {
    try {
      if (!user || !bundleCode) return;

      const vtuService = new VTUService();

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (isValid) {
        // Top up data if the network is known
        if (network != "Unknown") {
          await vtuService.topUpData(user.phone_number, network, bundleCode);
        }

        // Add tokens to the user
        await tokensManager("add", {
          userId: user.id,
          tokens: 10,
        });

        setModalVisible(false);
        // Remove the key from localStorage
        localStorage.removeItem("welcomeNewUser");

        toast.success("Reward claimed!");
      } else {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRewardLoading(false); // Ensure loading is turned off in all cases
    }
  };

  if (loading) {
    return <h2 className={styles.section__title}>Loading...</h2>;
  }

  if (error) {
    return <h2 className={styles.section__title}>{error}</h2>;
  }

  if (!user) return null;

  return (
    <div>
      {/*==================== HEADER ====================*/}
      <Header />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== WIDGET ====================*/}
        <section className={`${styles.widget} ${styles.section}`} id="widget">
          <h2 className={styles.section__title}>
            HELLO, <span>{user.username.toUpperCase()} </span>
          </h2>

          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            <article className={`${styles.widget__card} animated-bounce-twice`}>
              <img
                src="/block-20.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Invite & Earn Rewards</span>
                Copy your unique invite link to share with friends
              </p>
              <button
                type="button"
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                onClick={() => {
                  if (!user) return;

                  const link = `${location.origin}/join?friend=${user.username
                    .split(" ")
                    .join("-")}`;

                  if (navigator.share) {
                    // Use navigator.share if available
                    navigator
                      .share({
                        title: `Hi, I'm ${user["username"]}. Use my link.`,
                        url: link,
                      })
                      .then(() => console.log("Share successful!"))
                      .catch((error) => console.error("Error sharing:", error));
                  } else {
                    // Fallback: Copy to clipboard
                    navigator.clipboard
                      .writeText(link)
                      .then(() => alert("Link copied to clipboard!"))
                      .catch((error) =>
                        console.error(
                          "Could not copy text to clipboard:",
                          error
                        )
                      );
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={24}
                  height={24}
                >
                  <path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z" />
                </svg>
              </button>
            </article>
            <article id="rewards" className={styles.widget__card}>
              <img
                src="/block-2.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>
                  {friends.filter((friend) => friend.is_claimed === false)
                    .length || 0}
                </span>
                View unredeemed invites and claim rewards like data or airtime.
              </p>
              <a
                href="/profile/rewards"
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
            <article id="friends" className={styles.widget__card}>
              <img
                src="/block-3.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>{friends?.length || 0}</span>
                See all your friends and track your invites.
              </p>
              <a
                href="/profile/your-friends"
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
            <article id="tokens" className={styles.widget__card}>
              <img
                src="/block-4.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>{user.tokens.toFixed(2) || 0}</span>
                Check your token balance and trade tokens for airtime or data.
              </p>
              <a
                href="/profile/your-tokens"
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
            <article id="puzzle" className={styles.widget__card}>
              <img
                src="/block-5.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Play & Earn Tokens</span>
                Play puzzle games to collect more tokens!
              </p>
              <a
                href="/profile/puzzle"
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
            <article id="challenges" className={styles.widget__card}>
              <img
                src="/block-6.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Complete Challenges & Get Rewards</span>
                Finish challenges to earn extra tokens.
              </p>
              <a
                href="/profile/challenges"
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
            <article id="account" className={styles.widget__card}>
              <img
                src="/block-7.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Manage Your Account </span>
                Delete or log out of your account anytime.
              </p>
              <a
                href="/profile/manage-account"
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
      {/*==================== MODAL ====================*/}
      <div className={`modal ${modalVisible ? "activeModal" : ""}`}>
        <div className="modal__container">
          <article className={styles.block__card}>
            <img
              src="/block-23.svg"
              alt="image"
              className={styles.block__img}
            />
            <h3 className={styles.block__title}>Welcome, {user.username}!</h3>
            <span className={styles.block__info}></span>
            <p className={styles.block__description}>
              You have 10 tokens and just received{" "}
              {network !== "Unknown" && convertBundle(network, bundleCode)}
            </p>
            <button
              type="button"
              disabled={rewardLoading}
              className={`${styles.button} ${styles.button__yellow} ${styles.block__button}`}
              onClick={claimWelcomeReward}
            >
              {rewardLoading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={24}
                  height={24}
                >
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              )}
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}
