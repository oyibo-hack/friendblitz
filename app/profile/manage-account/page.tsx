/* eslint-disable @next/next/no-img-element */
"use client";

import styles from "../../page.module.css";
import { auth, db } from "@/app/firebase";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useUser } from "@/lib/hooks/use-user";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

function ManageAccount() {
  const { user, loading, error } = useUser(); // Fetch current user data

  const router = useRouter();

  // Delete account function
  async function deleteAccount() {
    if (!user) return;

    const confirmation = prompt('Type "delete my account" to confirm:');

    // Validate user input to prevent accidental account deletion
    if (confirmation && confirmation.trim() === "delete my account") {
      try {
        // Delete the user document from Firestore
        const userDocRef = doc(db, "users", user.id);
        await deleteDoc(userDocRef);

        toast.success("Your account has been deleted successfully");

        // Calls logOut to clean up session after account deletion
        await logOut();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : String(error));
      }
    }
  }

  // Sign out function
  async function logOut() {
    try {
      await auth.signOut(); // Signs out the current user
      router.push("/"); // Redirect to home page
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

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
              MANAGE <span>ACCOUNT</span>
            </h2>

            <div className={styles.block__swiper}>
              <div className={`${styles.block__content} ${styles.grid}`}>
                <article className={styles.block__card}>
                  <img
                    src="/block-7.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Delete Account</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Permanently delete your account.
                  </p>
                  <button
                    className={`${styles.button} ${styles.button__yellow} ${styles.block__button}`}
                    onClick={deleteAccount}
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
                  </button>
                </article>
                <article className={styles.block__card}>
                  <img
                    src="/block-7.svg"
                    alt="image"
                    className={styles.block__img}
                  />
                  <h3 className={styles.block__title}>Log Out</h3>
                  <span className={styles.block__info}></span>
                  <p className={styles.block__description}>
                    Log out of your current session.
                  </p>
                  <button
                    className={`${styles.button} ${styles.button__yellow} ${styles.block__button}`}
                    onClick={logOut}
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
                  </button>
                </article>
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

export default ManageAccount;
