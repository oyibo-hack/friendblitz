"use client";
import { useCallback, useEffect, useState } from "react";
import styles from "../page.module.css";
import FriendsTab from "@/components/friends-tab";
import Header from "@/components/header";
import { useUser } from "@/lib/hooks/use-user";
import AccountTab from "@/components/account-tab";
import TasksTab from "@/components/tasks-tab";
import TokensTab from "@/components/tokens-tab";
import PuzzleTab from "@/components/puzzle-tab";
import {
  calculateUserLevel,
  convertBundle,
  getMNO,
  manageTokenHistory,
  tokensManager,
  VTUService,
} from "@/lib/utils";
import { toast } from "sonner";
import Footer from "@/components/footer";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const guide = {
  intro: "",
  steps: [
    {
      title: "See Your Profile 👤",
      description:
        "Look at the top! That’s you! It shows your level and how many tokens you have.",
      action: "Next",
    },
    {
      title: "Invite Friends 👯‍♂️",
      description:
        "Share your special invite link with friends. If they join, you win tokens! 🏆",
      action: "Next",
    },
    {
      title: "Check Your Tokens 💰",
      description: `Click "Tokens" to see how many you have and how close you are to leveling up! 🎯`,
      action: "Next",
    },
    {
      title: "Complete Fun Tasks ✅",
      description: `Click "Tasks" to see cool challenges. If you finish them, you earn more tokens!`,
      action: "Next",
    },
    {
      title: "Play the Puzzle Game 🧩",
      description: `Click "Play Puzzle" to solve a fun word game. If you get it right, you win tokens! 🎉`,
      action: "Next",
    },
    {
      title: "Manage Your Account ⚙️",
      description: `Click "Manage Account" to change your name, email, or settings.`,
      action: "Next",
    },
    {
      title: "🚀 You’re All Set!",
      action: "Done",
    },
  ],
};

export default function Page() {
  const { user, friends, loading, error } = useUser("current"); // Fetch current user data

  const [activeTab, setActiveTab] = useState("friends");

  const [modalVisible, setModalVisible] = useState(false);

  const [rewardLoading, setRewardLoading] = useState(false);

  const network = ((): "mtn" | "airtel" | "glo" => {
    const mno = user?.phone_number ? getMNO(user.phone_number) : "mtn";
    return mno === "Unknown" ? "mtn" : mno;
  })();

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

    const guideUserData = localStorage.getItem("guideUser");
    if (!guideUserData) return;

    try {
      const { id } = JSON.parse(guideUserData);
      if (!id) return;

      toast.message(`${user.username}, Hi there!`, {
        description: guide.intro,
        action: {
          label: "Next",
          onClick: () => showSteps(0),
        },
        duration: 30000,
      });
    } catch (error) {
      console.error("Error parsing guideUser from localStorage:", error);
    }
  }, [showSteps, user]); // Added `guide` dependency for consistency

  // Effect to handle welcome modal on first load
  useEffect(() => {
    if (!user?.isNewUser || user.isNewUser.isClaimed) return;

    setModalVisible(true);
  }, [user]);

  const claimWelcomeReward = async () => {
    try {
      if (!user?.isNewUser || user.isNewUser.isClaimed) {
        toast.error("You've already claimed this reward!");
        return;
      }

      const vtuService = new VTUService();

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (!isValid) {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }

      // Top up data
      await vtuService.topUpData(
        user.phone_number,
        network,
        user.isNewUser.bundleCode
      );

      // Add tokens to the user
      const tokens = 10;
      await tokensManager("add", {
        userId: user.id,
        tokens,
      });

      // ✅ Add token history after successful reward claim
      await manageTokenHistory(user.id, "update", {
        task: `Welcome Reward: Received ${tokens} tokens`,
        date: new Date().toISOString(),
        tokens,
      });

      // ✅ Update `isClaimed` in Firebase
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        "isNewUser.isClaimed": true, // Mark as claimed
        "isNewUser.date": new Date().toISOString(),
      });

      setModalVisible(false);
      toast.success("Reward claimed!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while claiming the reward.");
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

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "friends":
        return <FriendsTab friends={friends} user={user} />;
      case "tokens":
        return <TokensTab user={user} setActiveTab={setActiveTab} />;
      case "tasks":
        return <TasksTab user={user} friends={friends} />;
      case "puzzle":
        return <PuzzleTab />;
      case "manage account":
        return <AccountTab user={user} />;
      default:
        return <FriendsTab friends={friends} user={user} />;
    }
  };

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <section className={`${styles.container} ${styles.section}`}>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {calculateUserLevel(user.total_tokens)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-300">
                  {user.username}
                </h2>
                <div className="flex items-center">
                  <span className="text-blue-400 font-bold mr-2">
                    {user.tokens} tokens
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {friends.length} referrals
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex mb-4 overflow-x-auto">
            {["friends", "tokens", "tasks", "puzzle", "manage account"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer px-4 py-2 font-medium rounded-t-lg mr-1 transition-all duration-200 
              ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>

          {/* {renderTabContent()} */}
          <PuzzleTab />
        </section>
      </main>
      <Footer />
      {/*==================== MODAL ====================*/}
      <div className={`modal ${modalVisible && "activeModal"}`}>
        <div className="modal__container">
          <article className={styles.block__card}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-big.png"
              alt="image"
              className={styles.block__img}
            />
            <h3 className={styles.block__title}>Welcome, {user.username}!</h3>
            <span className={styles.block__info}></span>
            <p className={styles.block__description}>
              You have 10 tokens and just received{" "}
              {convertBundle(user.isNewUser.bundleCode)}
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
