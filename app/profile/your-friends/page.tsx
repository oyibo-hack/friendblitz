/* eslint-disable @next/next/no-img-element */
"use client";
import Contact from "@/components/contact";
import styles from "../../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import { type Friend, manageUserFriends, type User } from "@/lib/utils";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

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
    return <pre>{error}</pre>;
  }

  if (!user) return null;

  return (
    <div>
      {/*==================== HEADER ====================*/}
      <Header />
      {/*==================== MAIN ====================*/}
      <main className={styles.main}>
        {/*==================== BLOCK ====================*/}
        <section className={`${styles.block} ${styles.section}`} id="block">
          <img
            src="/block-lines.svg"
            alt="image"
            className={styles.block__lines}
          />

          <div className={`${styles.block__container} ${styles.container}`}>
            <h2 className={styles.section__title}>
              YOUR <span>FRIENDS & INVITES</span>
            </h2>

            <div className={styles.block__swiper}>
              <div className={`${styles.block__content} ${styles.grid}`}>
                {friendLists.map((friend, index) => {
                  return (
                    <article key={index} className={styles.block__card}>
                      <img
                        src="/block-3.svg"
                        alt="image"
                        className={styles.block__img}
                      />
                      <h3 className={styles.block__title}>
                        {friend.username} - Rewarded 🎉
                      </h3>
                      <span className={styles.block__info}>
                        {moment(friend.created_at, "YYYYMMDD").fromNow()}
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
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

export default YourFriends;
