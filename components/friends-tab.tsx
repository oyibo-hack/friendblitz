"use client";

import {
  convertBundle,
  getMNO,
  manageTokenHistory,
  manageUserFriends,
  tokensManager,
  VTUService,
  type Friend,
  type User,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FriendsWithUsername = Friend & { username: string };

const FriendsTab = ({ user, friends }: { user: User; friends: Friend[] }) => {
  const [friendLists, setFriendLists] = useState<FriendsWithUsername[]>([]);

  const [claimStatus, setClaimStatus] = useState<Record<string, boolean>>({});

  const network = ((): "mtn" | "airtel" | "glo" => {
    const mno = user?.phone_number ? getMNO(user.phone_number) : "mtn";
    return mno === "Unknown" ? "mtn" : mno;
  })();

  useEffect(() => {
    const fetchFriendsWithUsername = async () => {
      if (!user) return;

      try {
        const friendsWithUsername = await Promise.all(
          friends.map(async (friend) => {
            const { username } = (await manageUserFriends({
              action: "get",
              friendId: friend.friend_id,
            })) as Partial<User>;

            return {
              ...friend,
              username: username || "Unknown",
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

  // Claim bonus for a friend
  const claimBonus = async (friend: Friend) => {
    try {
      if (!user) return;

      setClaimStatus((prev) => ({ ...prev, [friend.id]: true }));

      // Instantiate VTU services
      const vtuService = new VTUService();

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (!isValid) {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }

      await manageUserFriends({
        action: "claim",
        userId: user.id,
        friendId: friend.friend_id,
      });

      if (friend.airtime) {
        await vtuService.topUpAirtime(
          user.phone_number,
          network,
          friend.airtime
        );
      } else if (friend.data) {
        await vtuService.topUpData(user.phone_number, network, friend.data);
      } else if (friend.tokens) {
        await tokensManager("add", {
          userId: user.id,
          tokens: friend.tokens,
        });

        // ✅ Log token history only when tokens are rewarded
        await manageTokenHistory(user.id, "update", {
          task: `Bonus Claim: Received ${friend.tokens} tokens`,
          date: new Date().toISOString(),
          tokens: friend.tokens,
        });
      } else {
        throw new Error("An unexpected error occurred.");
      }

      // Success notification
      toast.success(`Claimed`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      // Reset claim status
      setClaimStatus((prev) => ({ ...prev, [friend.id]: false }));
    }
  };

  // Controls the number of friends displayed per page for pagination
  // Adjust this value to change the number of items shown per page
  const ITEMS_PER_PAGE = 5; // Adjust this value as needed

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(friendLists.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFriends = friendLists.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 shadow-md">
      <h3 className="text-3xl font-bold mb-4">
        Your Referrals
      </h3>
      <p className="mb-4 text-gray-300">
        Invite friends to earn tokens! Each successful referral rewards you with
        free airtime, SMS, data, 50 tokens.
      </p>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-700 bg-gray-800 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={`${location.origin}/join?friend=${user.username
              .split(" ")
              .join("-")
              .toLowerCase()}`}
            readOnly
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${location.origin}/join?friend=${user.username
                  .split(" ")
                  .join("-")
                  .toLowerCase()}`
              );
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded-r-md hover:bg-blue-700 transition cursor-pointer"
          >
            Copy
          </button>
        </div>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700 transition cursor-pointer"
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
                  console.error("Could not copy text to clipboard:", error)
                );
            }
          }}
        >
          Invite via Whatsapp
        </button>
      </div>

      <div>
        <h4 className="font-bold mb-2">Your Friends ({friends.length})</h4>
        <div className="space-y-3">
          {paginatedFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-md"
            >
              <div>
                <p className="font-medium">{friend.username}</p>
                <span
                  className={`text-sm ${
                    friend.is_claimed ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {friend.is_claimed ? "Active" : "Pending"}
                </span>
              </div>
              {friend.is_claimed && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Generated for you</p>
                  <p className="font-bold text-blue-400">
                    {friend.airtime
                      ? `Claim ₦${friend.airtime} Airtime`
                      : friend.data
                      ? `Claim ${convertBundle(friend.data!)} Data`
                      : `Claim ${friend.tokens} Tokens`}
                  </p>
                  <button
                    className={`mt-2 py-1 px-3 text-sm rounded-md ${
                      friend.is_claimed
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 transition"
                    }`}
                    disabled={friend.is_claimed}
                    onClick={() => claimBonus(friend)}
                  >
                    {claimStatus[friend.id] && (
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
                    {friend.is_claimed ? "Claimed" : "Claim"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="cursor-pointer py-1 px-3 bg-gray-700 text-white rounded-md disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="cursor-pointer py-1 px-3 bg-gray-700 text-white rounded-md disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendsTab;
