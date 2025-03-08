"use client";
import { auth } from "@/lib/firebase";
import useLocalStorage from "@/lib/hooks/use-local-storage";
import {
  calculateUserLevel,
  convertBundle,
  getMNO,
  levelLists,
  manageTokenHistory,
  tokensManager,
  type User,
  VTUService,
} from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const TokensTab = ({
  user,
  setActiveTab,
}: {
  user: User;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const [dailyCheckIn, setDailyCheckIn] = useLocalStorage("dailyCheckIn", {
    claimed: false,
    date: new Date().toDateString(),
  });

  useEffect(() => {
    const today = new Date().toDateString();

    // Ensure dailyCheckIn has a valid structure
    if (!dailyCheckIn || typeof dailyCheckIn.date !== "string") {
      setDailyCheckIn({ claimed: false, date: today });
    } else if (dailyCheckIn.date !== today) {
      setDailyCheckIn({ claimed: false, date: today });
    }
  }, [dailyCheckIn, setDailyCheckIn]);

  const [feelingLuckyLimit, setFeelingLuckyLimit] = useLocalStorage(
    "feelingLuckyLimit",
    { count: 0, date: new Date().toDateString() }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString();

      // Ensure feelingLuckyLimit has valid structure
      if (!feelingLuckyLimit || typeof feelingLuckyLimit.date !== "string") {
        setFeelingLuckyLimit({ count: 0, date: today });
      } else if (feelingLuckyLimit.date !== today) {
        setFeelingLuckyLimit({ count: 0, date: today });
      }
    }
  }, [feelingLuckyLimit, setFeelingLuckyLimit]);

  // Function to handle the feeling lucky action
  const feelingLucky = async () => {
    try {
      // Fetch authenticated user details
      const user = auth.currentUser;

      if (!user) {
        throw Error("You must be logged in to try your luck!");
      }

      if (feelingLuckyLimit.count < 6) {
        setFeelingLuckyLimit({
          count: feelingLuckyLimit.count + 1,
          date: feelingLuckyLimit.date,
        });

        // 30% chance to generate tokens (adjust the value for different probability)
        const randomChance = Math.random();

        if (randomChance > 0.7) {
          // 30% chance to generate tokens
          const tokens = parseFloat((Math.random() * 0.8 + 0.2).toFixed(2));

          if (tokens) {
            // Add tokens to the user's account
            await tokensManager("add", { userId: user.uid, tokens });

            // ✅ Add token history after successful purchase
            await manageTokenHistory(user.uid, "update", {
              task: `Feeling Lucky! You won ${tokens} tokens!`,
              date: new Date().toISOString(),
              tokens: +tokens,
            });

            toast.success(`You earned ${tokens} tokens 🎉`);
          }
        } else {
          toast.info("No tokens earned this time.");
        }
      } else {
        toast.error("Chill, that's enough for today. Try again tomorrow.");
      }
    } catch (error) {
      // Handle any errors that occur during execution
      console.error("An error occurred:", error);
      toast.error("Oops! Something went wrong. Please try again.");
    }
  };

  const redeemDailyBonus = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("You must be logged in to check in!");
      }

      if (dailyCheckIn.claimed) {
        toast.info("You've already checked in today. Come back tomorrow!");
        return;
      }

      // Generate random tokens (between 5 and 10)
      const tokens = Math.floor(Math.random() * 6) + 5;

      await tokensManager("add", { userId: user.uid, tokens });

      // Update state to prevent multiple claims
      setDailyCheckIn({ claimed: true, date: new Date().toDateString() });

      // ✅ Add token history after successful purchase
      await manageTokenHistory(user.uid, "update", {
        task: `Claimed ${tokens} tokens from daily check-in`,
        date: new Date().toISOString(),
        tokens: +tokens,
      });

      toast.success(
        `Daily check-in successful! You earned ${tokens} tokens 🎉`
      );
    } catch (error) {
      console.error("Daily check-in error:", error);
      toast.error("Oops! Something went wrong. Please try again.");
    }
  };

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

      // Deduct tokens
      await tokensManager("remove", {
        userId: user.id,
        tokens: tokens,
      });

      if (bundle.includes("Airtime")) {
        await vtuService.topUpAirtime(user.phone_number, network, 1000);
      } else if (bundle.includes("Data")) {
        await vtuService.topUpData(user.phone_number, network, variationId);
      }

      // ✅ Add token history after successful purchase
      await manageTokenHistory(user.id, "update", {
        task: `Bundle Purchase: Purchased ${bundle}`,
        date: new Date().toISOString(),
        tokens: -tokens,
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

      // Deduct tokens
      await tokensManager("remove", {
        userId: user.id,
        tokens: tokens,
      });

      // Randomly choose between airtime and data
      const isAirtime = Math.random() < 0.5;

      // Random amount for airtime between 100 and 500
      const airtimeAmount = Math.floor(Math.random() * (500 - 100 + 1) + 100);

      let bundleType = "";

      if (isAirtime) {
        await vtuService.topUpAirtime(
          user.phone_number,
          network,
          airtimeAmount
        );
        bundleType = `Airtime (₦${airtimeAmount})`;
      } else {
        await vtuService.topUpData(user.phone_number, network, variationId);
        bundleType = `${convertBundle(variationId)} Data`;
      }

      // ✅ Add token history after successful random purchase
      await manageTokenHistory(user.id, "update", {
        task: `Random Bundle: Received ${bundleType}`,
        date: new Date().toISOString(),
        tokens: -tokens,
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

  /**
   * Calculates the user's level and progress towards the next level.
   *
   * - `userLevel`: Determines the current level based on tokens.
   * - `nextLevelTokens`: Fetches the token requirement for the next level.
   * - `progress`: Calculates the percentage progress towards the next level.
   *
   * Edge cases handled:
   * - Prevents `undefined` issues if the user exceeds the last level.
   * - Ensures progress calculation works correctly even at max level.
   */
  const userLevel = calculateUserLevel(user.total_tokens);
  const nextLevelTokens =
    levelLists[userLevel - 1] || levelLists[levelLists.length - 1] + 200; // Prevents undefined issues
  const progress =
    userLevel <= 9
      ? ((user.total_tokens - (levelLists[userLevel - 2] || 0)) /
          (nextLevelTokens - (levelLists[userLevel - 2] || 0))) *
        100
      : 100; // Ensures proper percentage calculation

  console.log(user);

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 shadow-md">
      {/* Token Balance Section */}
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold mb-4">
          Your Token Balance
        </h3>
        <div className="text-4xl font-bold text-blue-400">{user.tokens}</div>
        <p className="text-sm text-gray-400 mt-1">Level {userLevel}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-600 rounded-full h-2 mt-4">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {Math.max(nextLevelTokens - user.total_tokens, 0)} tokens until Level{" "}
          {userLevel + 1}
        </p>
      </div>

      {/* Free Tokens Section */}
      <div className="mb-6">
        <h4 className="font-bold mb-3 text-gray-200">Earn Free Tokens</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab("friends")}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer transition duration-200"
          >
            <p className="font-bold">Invite Friends</p>
            <p className="text-green-400 font-bold">+50 tokens</p>
            <p className="text-xs text-gray-400 mt-1">Per referral</p>
          </button>
          <button
            onClick={redeemDailyBonus}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer transition duration-200"
          >
            <p className="font-bold">Daily Check-in</p>
            <p className="text-green-400 font-bold">+10 tokens</p>
            <p className="text-xs text-gray-400 mt-1">Once per day</p>
          </button>
          <button
            onClick={() => toast.error("Not available right now")}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer transition duration-200"
          >
            <p className="font-bold">Complete Surveys</p>
            <p className="text-green-400 font-bold">+25 tokens</p>
            <p className="text-xs text-gray-400 mt-1">Per survey</p>
          </button>
          <button
            onClick={() => toast.error("Not available right now")}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer transition duration-200"
          >
            <p className="font-bold">Watch Ad</p>
            <p className="text-green-400 font-bold">+5 tokens</p>
            <p className="text-xs text-gray-400 mt-1">Max 5 per day</p>
          </button>
          <button
            onClick={feelingLucky}
            className="border border-purple-500 rounded-md p-3 text-center hover:bg-purple-900 cursor-pointer transition duration-200 col-span-2 mt-2"
          >
            <p className="font-bold">I&apos;m Feeling Lucky</p>
            <p className="text-purple-400 font-bold">1-100 tokens</p>
            <p className="text-xs text-gray-400 mt-1">
              Max 5 per day • Random reward
            </p>
          </button>
        </div>
      </div>

      {/* Token History */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">Token History</h4>
        <div className="space-y-2">
          {user.token_history &&
            Object.entries(user.token_history).map(([key, task]) => (
              <div
                key={key}
                className="flex justify-between p-2 bg-gray-700 rounded"
              >
                <span>{task.task}</span>
                <span
                  className={
                    String(task.tokens).startsWith("-")
                      ? "text-red-400"
                      : "text-green-400"
                  }
                >
                  {String(task.tokens).startsWith("-")
                    ? String(task.tokens)
                    : `+${String(task.tokens)}`}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Redeem Tokens */}
      <div>
        <h4 className="font-bold mb-3">Redeem Tokens</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => purchaseBundle("₦1000 Airtime", 140)}
            disabled={loadingStates["₦1000 Airtime"]}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer disabled:opacity-45"
          >
            <p className="font-bold">Claim ₦1000 Airtime</p>
            <p className="text-blue-400 font-bold">140 tokens</p>
          </button>
          <button
            disabled={loadingStates["1GB Data"]}
            onClick={() => purchaseBundle("1GB Data", 100)}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer disabled:opacity-45"
          >
            <p className="font-bold">Claim 1GB Data</p>
            <p className="text-blue-400 font-bold">100 tokens</p>
          </button>
          <button
            disabled={loadingStates.random}
            onClick={() => purchaseRandomBundle(100)}
            className="border border-gray-600 rounded-md p-3 text-center hover:bg-gray-700 cursor-pointer disabled:opacity-45"
          >
            <p className="font-bold">Claim a random Airtime or Data</p>
            <p className="text-blue-400 font-bold">100 tokens</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokensTab;
