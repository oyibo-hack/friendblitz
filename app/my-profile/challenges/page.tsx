/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "@/components/header";
import styles from "../../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import {
  type Challenge,
  checkChallenge,
  manageChallenges,
  tokensManager,
} from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/footer";

function Challenges() {
  const { user, loading, error } = useUser(); // Fetch current user data

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});

  // Fetch uncompleted challenges for the user
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        if (!user) return; // Do nothing if user is not defined

        const challenges = (await manageChallenges("fetch")) as Challenge[];
        const uncompletedChallenges = await manageChallenges("filter", {
          challenges,
          userId: user.id,
        });

        setChallenges(uncompletedChallenges as Challenge[]);
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchChallenges();
  }, [user]);

  const completeChallenge = async (challenge: Challenge, index: number) => {
    try {
      if (!user) return; // Do nothing if user is not defined

      setLoadingStates((prev) => ({ ...prev, [index]: true }));

      // Check if the challenge is complete
      const isChallengeComplete = await checkChallenge(
        user.id,
        challenge.method
      );

      if (isChallengeComplete === "complete") {
        // Mark the challenge as complete
        await manageChallenges("addUser", {
          challengeId: challenge.id,
          userId: user.id,
        });

        // Add tokens to the user
        await tokensManager("add", {
          userId: user.id,
          tokens: challenge.tokens,
        });

        toast.success(
          `Challenge completed! You've earned ${challenge.tokens} tokens.`
        );

        // Remove the completed challenge from the list
        setChallenges((prevChallenges) =>
          prevChallenges.filter((c) => c.id !== challenge.id)
        );
      } else {
        throw new Error("Challenge not completed yet!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
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
            PARTICIPATE IN <span>CHALLENGES AND EARN TOKENS</span>
          </h2>
          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            {challenges.map((challenge, index) => (
              <article key={index} className={styles.widget__card}>
                <img
                  src="/block-11.svg"
                  alt="image"
                  className={styles.widget__img}
                />
                <p className={styles.widget__description}>
                  <span>{challenge["title"]}</span>
                  <span>Claim {challenge["tokens"]} tokens</span>
                  {challenge["description"]}
                </p>

                <button
                  className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                  onClick={() => completeChallenge(challenge, index)}
                  disabled={loadingStates[index]}
                >
                  {loadingStates[index] ? (
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
            ))}
          </div>
        </section>
        <hr className={styles.container} style={{ marginBlock: "5rem" }} />
      </main>
      {/*==================== FOOTER ====================*/}
      <Footer />
    </div>
  );
}

export default Challenges;
