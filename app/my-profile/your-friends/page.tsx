/* eslint-disable @next/next/no-img-element */
"use client";
import styles from "../../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import { type Friend, manageUserFriends, type User } from "@/lib/utils";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

type FriendWithUsername = Friend & { username: string };
function YourFriends() {
  const { user, friends, loading, error } = useUser("current"); // Fetch current user data

  const [friendLists, setFriendLists] = useState<FriendWithUsername[]>([]);

  useEffect(() => {
    const fetchFriendsWithUsername = async () => {
      if (!user) return; // Ensure user exists before proceeding

      try {
        // Fetch usernames for each friend
        const friendsWithUsername = await Promise.all(
          friends.map(async (friend) => {
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

        setFriendLists(friendsWithUsername);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriendsWithUsername();
  }, [friends, user]);

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
      <Navbar />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== WIDGET ====================*/}
        <section className={`${styles.widget} ${styles.section}`} id="widget">
          <h2 className={styles.section__title}>
            YOUR <span>FRIENDS & INVITES</span>
          </h2>
          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            {friendLists.length === 0 ? (
              <h2 className={styles.section__title}>
                You haven&apos;t invited any friends yet. Start inviting to
                claim rewards!
              </h2>
            ) : (
              friendLists.map((friend, index) => {
                return (
                  <article key={index} className={styles.widget__card}>
                    <img
                      src="/logo-big.png"
                      alt="image"
                      className={styles.widget__img}
                    />
                    <p className={styles.widget__description}>
                      <span>
                        {`( ${friendLists.indexOf(friend) + 1} ). ${
                          friend.username
                        }`}
                      </span>
                      {moment(friend.created_at, "YYYYMMDD").fromNow()}
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default YourFriends;
