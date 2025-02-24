/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "@/components/header";
import styles from "../../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import {
  convertBundle,
  type Friend,
  getMNO,
  manageUserFriends,
  type User,
  VTUService,
} from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

type FriendWithUsername = Friend & { username: string };
function Rewards() {
  const { user, friends, loading, error } = useUser("current"); // Fetch current user data

  const [unclaimedFriends, setUnclaimedFriends] = useState<
    FriendWithUsername[]
  >([]);
  const [claimStatus, setClaimStatus] = useState<Record<string, boolean>>({});

  // Identify the Mobile Network Operator (MNO) from the decoded phone number
  const network = user?.phone_number ? getMNO(user.phone_number) : "Unknown";

  useEffect(() => {
    const fetchUnclaimedFriends = async () => {
      try {
        if (!user) return;

        // Filter unclaimed friends
        const unclaimed = (await manageUserFriends({
          action: "filter",
          friends,
        })) as Friend[];

        if (!unclaimed) return;

        // Fetch usernames for unclaimed friends
        const unclaimedWithUsername = await Promise.all(
          unclaimed.map(async (friend) => {
            const { username } = (await manageUserFriends({
              action: "get",
              friendId: friend.friend_id,
            })) as Partial<User>;

            return {
              ...friend,
              username: username || "Unknown", // Fallback to "Unknown" if username is missing
            };
          })
        );

        setUnclaimedFriends(unclaimedWithUsername);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchUnclaimedFriends();
  }, [friends, user]);

  // Claim bonus for a friend
  const claimBonus = async (friend: Friend) => {
    try {
      if (!user) return;

      setClaimStatus((prev) => ({ ...prev, [friend.id]: true }));

      if (network == "Unknown") {
        return;
      }

      // Instantiate VTU services
      const vtuService = new VTUService();

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (!isValid) {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }

      if (friend.airtime) {
        await vtuService.topUpAirtime(
          user.phone_number,
          network,
          friend.airtime
        );
      } else {
        await vtuService.topUpData(user.phone_number, network, friend.data!);
      }

      // Success notification
      toast.success(`Claimed`);

      // Remove friend from unclaimed list
      setUnclaimedFriends((prev) => prev.filter((f) => f.id !== friend.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      // Reset claim status
      setClaimStatus((prev) => ({ ...prev, [friend.id]: false }));
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
            CLAIM YOUR <span>REWARDS & INVITES</span>
          </h2>

          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            {unclaimedFriends.length === 0 ? (
              <h2 className={styles.section__title}>
                You haven&apos;t invited any friends yet. Start inviting to
                claim rewards!
              </h2>
            ) : (
              unclaimedFriends.map((friend, index) => {
                return (
                  <article key={index} className={styles.widget__card}>
                    <img
                      src="/block-2.svg"
                      alt="image"
                      className={styles.widget__img}
                    />
                    <p className={styles.widget__description}>
                      <span>{friend.username} Joined</span>
                      {friend.airtime
                        ? `Claim ₦${friend.airtime} Airtime`
                        : `Claim ${
                            network !== "Unknown" &&
                            convertBundle(network, friend.data!)
                          } Data`}
                    </p>

                    <button
                      disabled={claimStatus[friend.id]}
                      className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                      onClick={() => claimBonus(friend)}
                    >
                      {claimStatus[friend.id] ? (
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
                );
              })
            )}
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

export default Rewards;
