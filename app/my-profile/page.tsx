/* eslint-disable @next/next/no-img-element */
"use client";
import styles from "../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import { convertBundle, getMNO, tokensManager, VTUService } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/footer";
import Header from "@/components/header";

const guide = {
  intro:
    "How to Use Your Profile 🚀\nHey there! Let’s go step by step on how to make the most of your profile.",
  steps: [
    {
      title: "Share Your Invite Link",
      description:
        "Click the Share button to copy your unique invite link or share it directly with friends.",
      action: "Next",
    },
    {
      title: "Claim Your Rewards",
      description:
        "Go to the Rewards section to view unredeemed invites and claim bonuses like data or airtime.",
      action: "Next",
    },
    {
      title: "Track Your Friends",
      description:
        "Check the Friends section to see who has joined using your invite link and track their status.",
      action: "Next",
    },
    {
      title: "Check & Use Your Tokens",
      description:
        "View your token balance in the Tokens section and trade tokens for airtime or data.",
      action: "Next",
    },
    {
      title: "Play & Earn More Tokens",
      description:
        "Head over to the Puzzle section to play games and collect extra tokens.",
      action: "Next",
    },
    {
      title: "Complete Challenges",
      description:
        "Visit the Challenges section to complete tasks and earn bonus tokens.",
      action: "Next",
    },
    {
      title: "Manage Your Account",
      description:
        "In the Manage Account section, you can update settings, log out, or delete your account anytime.",
      action: "Next",
    },
    {
      title: "You’re All Set!",
      description:
        "Congrats! You now know how to use all the features of your profile. Start inviting friends and earning rewards!",
      action: "Done",
    },
  ],
};

export default function Page() {
  const { user, friends, loading, error } = useUser("current");

  const [bundleCode, setBundleCode] = useState("");
  const [rewardClaimed, setRewardClaimed] = useState(false); // Track if reward is already claimed

  // Identify the Mobile Network Operator (MNO) from the decoded phone number
  const network = user?.phone_number ? getMNO(user.phone_number) : "Unknown";

  // Memoized function to claim the welcome reward
  const claimWelcomeReward = useCallback(
    async (providedBundleCode?: string) => {
      if (rewardClaimed) {
        toast.error("Reward already claimed.");
        return;
      }

      const vtuService = new VTUService();
      const codeToUse = providedBundleCode || bundleCode;

      if (user && codeToUse) {
        try {
          toast.promise(
            async () => {
              try {
                // Check system balance before proceeding
                const isValid = await vtuService.isBalanceValidForUse();
                if (!isValid) {
                  throw new Error(
                    "The system is under too much load. Please try again later."
                  );
                }

                // Top up data if the network is valid
                if (network !== "Unknown") {
                  await vtuService.topUpData(
                    user.phone_number,
                    network,
                    codeToUse
                  );
                }

                // Add tokens to user account
                await tokensManager("add", {
                  userId: user.id,
                  tokens: 10,
                });

                // Remove the welcome flag from local storage
                localStorage.removeItem("welcomeNewUser");
                setRewardClaimed(true); // ✅ Mark reward as claimed
                return "Reward claimed!"; // Success message
              } catch (error) {
                console.error(error);
                throw error;
              }
            },
            {
              loading: "Processing your reward...",
              success: (msg) => msg,
              error: (err) =>
                err.message || "An error occurred while claiming the reward.",
            }
          );
        } catch (error) {
          console.error("Error claiming reward:", error);
        }
      } else {
        toast.error("An error occurred");
      }
    },
    [bundleCode, network, rewardClaimed, user] // Dependencies: re-creates only if any of these change
  );

  // Effect to handle welcome modal on first load
  useEffect(() => {
    if (!user) return;

    const newUserData = localStorage.getItem("welcomeNewUser");
    if (newUserData) {
      const { isNewUser, bundleCode } = JSON.parse(newUserData);
      if (isNewUser && bundleCode) {
        setBundleCode(bundleCode); // Set the state first
      }
    }
  }, [user]);

  useEffect(() => {
    if (!bundleCode || !user || rewardClaimed) return; // ✅ Prevent toast if already claimed

    toast.message(`Welcome, ${user.username}!`, {
      description: `You have 10 tokens and just received 
        ${network !== "Unknown" ? convertBundle(network, bundleCode) : ""}`,
      action: {
        label: "Claim",
        onClick: () => claimWelcomeReward(bundleCode),
      },
      duration: 30000,
    });
  }, [bundleCode, network, user, claimWelcomeReward, rewardClaimed]); // ✅ Added rewardClaimed

  const showSteps = useCallback((index: number): void => {
    if (index < guide.steps.length) {
      const step = guide.steps[index];

      toast.message(step.title, {
        description: step.description,
        action: {
          label: step.action,
          onClick: () => {
            if (index === guide.steps.length - 1) {
              localStorage.removeItem("guideUser"); // Remove guide when last step is clicked
            }
            showSteps(index + 1);
          },
        },
        duration: 30000,
      });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const guideUser = localStorage.getItem("guideUser");
    const welcomeUser = localStorage.getItem("welcomeNewUser");

    // Show welcome message if guide-user exists but welcomeNewUser does not
    if (guideUser && !welcomeUser) {
      const { id } = JSON.parse(guideUser);
      if (id) {
        toast.message("Welcome!", {
          description: guide?.intro || "Let's get started!",
          action: {
            label: "Start",
            onClick: () => showSteps(0),
          },
          duration: 30000,
        });
      }
    }
  }, [showSteps, user]);

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
            You are {user.username}
          </h2>
          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            <article className={`${styles.widget__card} animated-bounce-twice`}>
              <img
                src="/logo-big.png"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Share your link!</span>
                Copy your unique invite link to share with friends
              </p>
              <button
                type="button"
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                onClick={() => {
                  if (!user) return;

                  const link = `${location.origin}/join?friend=${user.username
                    .split(" ")
                    .join("-")
                    .toLowerCase()}`;

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
                href="/my-profile/rewards"
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
                href="/my-profile/your-friends"
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
                href="/my-profile/your-tokens"
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
                href="/my-profile/manage-account"
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
