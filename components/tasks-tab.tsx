import { db } from "@/lib/firebase";
import {
  checkChallenge,
  manageChallenges,
  manageTokenHistory,
  tokensManager,
  type Challenge,
  type User,
  type Friend,
} from "@/lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const TasksTab = ({ user, friends }: { user: User; friends: Friend[] }) => {
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

        setChallenges(challenges as Challenge[]);
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

        // ✅ Add token history after successful challenge completion
        await manageTokenHistory(user.id, "update", {
          task: `Challenge Completed: ${challenge.description}`,
          date: new Date().toISOString(),
          tokens: challenge.tokens,
        });

        toast.success(
          `Challenge completed! You've earned ${challenge.tokens} tokens.`
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

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 shadow-md">
      <h3 className="text-3xl font-bold mb-4">Your Tasks</h3>
      <p className="mb-4">Complete tasks to earn tokens and level up!</p>

      <div className="space-y-4">
        {challenges.map((task, index) => {
          const isCompleted = task.completed_user_ids.includes(user.id);

          return (
            <div
              key={task.id}
              className="border border-gray-700 rounded-md p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {isCompleted ? "✓" : "○"}
                  </div>
                  <span
                    className={`ml-3 font-medium ${
                      isCompleted ? "text-gray-500 line-through" : ""
                    }`}
                  >
                    {task.description}
                  </span>
                </div>
                <div className="text-green-400 font-bold">+{task.tokens}</div>
              </div>
              {!isCompleted && (
                <button
                  disabled={isCompleted}
                  onClick={() => completeChallenge(task, index)}
                  className="mt-2 bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-500"
                >
                  {loadingStates[index] && (
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
                      className="animate-spin inline mr-3"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  )}
                  Complete Now
                </button>
              )}
            </div>
          );
        })}
      </div>

      <StreakBonus user={user} />
      <ReferralMilestones user={user} friends={friends} />
      <ChallengeMilestoneBonus user={user} challenges={challenges} />
    </div>
  );
};

export default TasksTab;

function StreakBonus({ user }: { user: User }) {
  const [streak, setStreak] = useState<string[]>([]);
  const today = new Date().toDateString(); // Normalize date to avoid time issues

  const claimBonus = useCallback(async () => {
    try {
      // Add tokens to the user
      await tokensManager("add", {
        userId: user.id,
        tokens: 15,
      });

      // ✅ Add token history after successful bonus claim
      await manageTokenHistory(user.id, "update", {
        task: "Bonus Claim: Received 15 tokens",
        date: new Date().toISOString(),
        tokens: 15,
      });

      toast.success("You've earned 15 tokens!");
    } catch (error) {
      toast.error("Failed to claim bonus. Please try again.");
      console.error("Bonus claim error:", error);
    }
  }, [user.id]); // Only depend on user.id, not the entire user object

  useEffect(() => {
    // Load streak data
    const loadStreak = () => {
      try {
        const storedData = JSON.parse(
          localStorage.getItem("dailyBonus") || "[]"
        );

        if (!Array.isArray(storedData)) {
          // Handle corrupted data
          setStreak([today]);
          localStorage.setItem("dailyBonus", JSON.stringify([today]));
          return;
        }

        if (storedData.length > 0) {
          const lastLogin = storedData[storedData.length - 1];
          const lastLoginDate = new Date(lastLogin).toDateString();

          if (lastLoginDate === today) {
            // User already logged in today, just update state
            setStreak(storedData);
            return;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();

          let newStreak;
          if (lastLoginDate === yesterdayString) {
            // Continue streak
            newStreak = [...storedData, today];
          } else {
            // Reset streak if a day is missed
            newStreak = [today];
          }

          // Update localStorage and state
          localStorage.setItem("dailyBonus", JSON.stringify(newStreak));
          setStreak(newStreak);

          // Check if bonus should be claimed
          if (newStreak.length === 5) {
            claimBonus().then(() => {
              // Reset streak after successful bonus claim
              const resetStreak = [today];
              localStorage.setItem("dailyBonus", JSON.stringify(resetStreak));
              setStreak(resetStreak);
            });
          }
        } else {
          // First login
          const newStreak = [today];
          localStorage.setItem("dailyBonus", JSON.stringify(newStreak));
          setStreak(newStreak);
        }
      } catch (error) {
        console.error("Error processing streak data:", error);
        // Recover from any error
        setStreak([today]);
        localStorage.setItem("dailyBonus", JSON.stringify([today]));
      }
    };

    loadStreak();
  }, [today, claimBonus]); // Include claimBonus in dependencies

  return (
    <div className="mt-6 p-4 bg-gray-700 rounded-md border border-gray-600">
      <h4 className="font-bold text-blue-400 mb-2">Daily Bonus</h4>
      <p className="text-sm text-gray-300 mb-2">
        Log in 5 days in a row to get a 15 token bonus!
      </p>
      <div className="flex space-x-2">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < streak.length
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-400"
            }`}
          >
            {index < streak.length ? "✓" : index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

const MILESTONES = [
  { count: 5, tokens: 75 },
  { count: 15, tokens: 125 },
  { count: 25, tokens: 200 },
  { count: 75, tokens: 500 },
  { count: 100, tokens: 1200 },
];

function ReferralMilestones({
  user,
  friends,
}: {
  user: User;
  friends: Friend[];
}) {
  const [referralCount, setReferralCount] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (!user.referralMilestones) return;

    let lastAchievedMilestone = 0;
    let claimable = false;

    for (const milestone of MILESTONES) {
      if (user.referralMilestones[milestone.count]) {
        lastAchievedMilestone = milestone.count;
      } else if (friends.length >= milestone.count) {
        lastAchievedMilestone = milestone.count;
        claimable = true;
        break;
      }
    }

    setReferralCount(lastAchievedMilestone);
    setCanClaim(claimable);
  }, [friends.length, user.referralMilestones]);

  const claimReferralReward = async () => {
    const milestone = MILESTONES.find((m) => m.count === referralCount);
    if (!milestone) return;

    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        [`referralMilestones.${referralCount}`]: true,
      });

      // Add tokens to the user
      await tokensManager("add", {
        userId: user.id,
        tokens: milestone.tokens,
      });

      // ✅ Add token history after successful bonus claim
      await manageTokenHistory(user.id, "update", {
        task: `Bonus Claim: Received ${milestone.tokens} tokens`,
        date: new Date().toISOString(),
        tokens: milestone.tokens,
      });

      toast.success(`You've earned ${milestone.tokens} tokens!`);
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-md border border-gray-600">
      <h4 className="font-bold text-green-400 mb-2">Referral Milestones</h4>
      <p className="text-sm text-gray-300 mb-2">
        Invite friends and unlock rewards!
      </p>
      <div className="flex space-x-2">
        {MILESTONES.map(({ count }) => (
          <div
            key={count}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              referralCount >= count
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {referralCount >= count ? "✓" : count}
          </div>
        ))}
      </div>
      {canClaim && (
        <button
          onClick={claimReferralReward}
          className="cursor-pointer mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500"
        >
          Claim {MILESTONES.find((m) => m.count === referralCount)?.tokens}{" "}
          Tokens
        </button>
      )}
    </div>
  );
}

function ChallengeMilestoneBonus({
  user,
  challenges,
}: {
  user: User;
  challenges: Challenge[];
}) {
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (user && challenges) {
      const completedCount = challenges.filter((challenge) =>
        challenge.completed_user_ids.includes(user.id)
      ).length;
      setCompletedChallenges(completedCount);

      // Hide button if user has already claimed the reward
      setCanClaim(completedCount >= 5 && !user.challengeMilestone);
    }
  }, [user, challenges]);

  const claimChallengeReward = async () => {
    if (completedChallenges < 5) return;

    try {
      // Add tokens to the user
      await tokensManager("add", {
        userId: user.id,
        tokens: 1000,
      });

      // ✅ Add token history after successful bonus claim
      await manageTokenHistory(user.id, "update", {
        task: "Bonus Claim: Received 1000 tokens",
        date: new Date().toISOString(),
        tokens: 1000,
      });

      // Update challengeMilestone in Firestore
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        challengeMilestone: true,
      });

      toast.success("You've earned 1000 tokens!");
    } catch (error) {
      toast.error("Failed to claim reward. Try again later.");
      console.error("Error claiming challenge reward:", error);
    }
  };

  return (
    <div className="mt-6 p-4 bg-purple-800 rounded-md border border-purple-600">
      <h4 className="font-bold text-white mb-2">Challenge Milestone</h4>
      <p className="text-sm text-gray-300 mb-2">
        Complete at least 5 challenges to receive a 1000-token bonus!
      </p>
      <div className="flex space-x-2">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < completedChallenges
                ? "bg-purple-500 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {index < completedChallenges ? "✓" : index + 1}
          </div>
        ))}
      </div>
      {canClaim && (
        <button
          onClick={claimChallengeReward}
          className="cursor-pointer mt-3 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-500"
        >
          Claim 1000 Tokens
        </button>
      )}
    </div>
  );
}
