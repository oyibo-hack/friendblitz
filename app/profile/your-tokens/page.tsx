/* eslint-disable @next/next/no-img-element */
"use client";

import Header from "@/components/header";
import styles from "../../page.module.css";
import { useUser } from "@/lib/hooks/use-user";
import { getMNO, tokensManager, VTUService } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/footer";
import Contact from "@/components/contact";

function YourTokens() {
  const { user, loading, error } = useUser(); // Fetch current user data

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Function to handle bundle purchase
  const purchaseBundle = async (bundle: string, tokens: number) => {
    try {
      if (!user) return;

      // Identify the Mobile Network Operator (MNO) from the decoded phone number
      const network = getMNO(user.phone_number);

      if (network == "Unknown") {
        toast.error("Unable to determine mobile network operator.");
        return;
      }

      const variationIds: Record<"mtn" | "glo" | "airtel", string> = {
        mtn: "M1024",
        glo: "G500",
        airtel: "AIRTEL1GB",
      };

      const variationId = variationIds[network];

      // Set the loading state for the specific transaction
      setLoadingStates((prevState) => ({ ...prevState, [bundle]: true }));

      // Instantiate VTU services
      const vtuService = new VTUService();

      // Retrieve the user's current tokens balance
      const currentTokens = (await tokensManager("get", {
        userId: user.id,
      })) as number;

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (!isValid) {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }

      // Ensure the user has enough tokens for the selected bundle
      if (!currentTokens || currentTokens < tokens) {
        throw new Error("You don't have enough tokens");
      }

      if (bundle.includes("Airtime")) {
        await vtuService.topUpAirtime(user.phone_number, network, 1000);
      } else if (bundle.includes("Data")) {
        await vtuService.topUpData(user.phone_number, network, variationId);
      }

      // Deduct tokens
      await tokensManager("remove", {
        userId: user.id,
        tokens: tokens,
      });

      toast.success("Purchase complete!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setLoadingStates((prevState) => ({ ...prevState, [bundle]: false }));
    }
  };

  // Function to handle random bundle purchase
  const purchaseRandomBundle = async (tokens: number) => {
    try {
      if (!user) return;

      // Identify the Mobile Network Operator (MNO) from the decoded phone number
      const network = getMNO(user.phone_number);

      if (network == "Unknown") {
        toast.error("Unable to determine mobile network operator.");
        return;
      }

      const variationIds: Record<"mtn" | "glo" | "airtel", string> = {
        mtn: "M1024",
        glo: "G500",
        airtel: "AIRTEL1GB",
      };

      const variationId = variationIds[network];

      // Set the loading state for the specific transaction
      setLoadingStates((prevState) => ({ ...prevState, random: true }));

      // Instantiate VTU services
      const vtuService = new VTUService();

      // Retrieve the user's current tokens balance
      const currentTokens = (await tokensManager("get", {
        userId: user.id,
      })) as number;

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (!isValid) {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }

      // Ensure the user has enough tokens for the selected bundle
      if (!currentTokens || currentTokens < tokens) {
        throw new Error("You don't have enough tokens");
      }

      // Randomly choose between airtime and data
      const isAirtime = Math.random() < 0.5;

      // Random amount for airtime between 100 and 500
      const airtimeAmount = Math.floor(Math.random() * (500 - 100 + 1) + 100);

      if (isAirtime) {
        await vtuService.topUpAirtime(
          user.phone_number,
          network,
          airtimeAmount
        );
      } else {
        await vtuService.topUpData(user.phone_number, network, variationId);
      }

      // Deduct tokens
      await tokensManager("remove", {
        userId: user.id,
        tokens: tokens,
      });

      toast.success("Purchase complete!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setLoadingStates((prevState) => ({ ...prevState, random: false }));
    }
  };

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
        {/*==================== WIDGET ====================*/}
        <section className={`${styles.widget} ${styles.section}`} id="widget">
          <h2 className={styles.section__title}>
            TRADE <span>YOUR POINTS</span>
          </h2>
          <div
            className={`${styles.widget__container} ${styles.container} ${styles.grid}`}
          >
            <article className={styles.widget__card}>
              <img
                src="/block-4.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Trade Tokens for Airtime</span>
                Trade 140 tokens for ₦1000 Airtime
              </p>
              <button
                disabled={loadingStates["₦1000 Airtime"]}
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                onClick={() => purchaseBundle("₦1000 Airtime", 140)}
              >
                {loadingStates["₦1000 Airtime"] ? (
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
            <article className={styles.widget__card}>
              <img
                src="/block-4.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Trade Tokens for Data</span>
                Trade 75 tokens for 1GB
              </p>
              <button
                disabled={loadingStates["1GB Data"]}
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                onClick={() => purchaseBundle("1GB Data", 45)}
              >
                {loadingStates["1GB Data"] ? (
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
            <article className={styles.widget__card}>
              <img
                src="/block-4.svg"
                alt="image"
                className={styles.widget__img}
              />
              <p className={styles.widget__description}>
                <span>Trade Tokens</span>
                Trade 100 tokens for Random Airtime or Data
              </p>
              <button
                disabled={loadingStates.random}
                className={`${styles.button} ${styles.button__yellow} ${styles.widget__button}`}
                onClick={() => purchaseRandomBundle(60)}
              >
                {loadingStates.random ? (
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
        </section>

        {/*==================== CONTACT ====================*/}
        <Contact />
      </main>
      {/*==================== FOOTER ====================*/}
      <Footer />
    </div>
  );
}

export default YourTokens;
