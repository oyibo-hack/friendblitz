"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// import { pushToLocalStorage } from "@/lib/utils";

const PuzzleTab = () => {
  const [recentGames, setRecentGames] = useState<string[]>([]);

  useEffect(() => {
    // Retrieve stored values
    const storedData = JSON.parse(localStorage.getItem("recentGames") || "[]");

    // Ensure it's an array before setting state
    if (Array.isArray(storedData)) {
      setRecentGames(storedData);
    }
  }, []);
  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Play Puzzle</h3>
      <p className="mb-4 text-gray-300">
        Play the puzzle to earn 10 tokens!
      </p>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <p className="font-medium text-blue-400">Todays Challenge:</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <button
            onClick={() => toast.error("Not available right now")}
            className="bg-gray-700 border border-gray-600 rounded-md p-4 text-center hover:bg-gray-600 transition"
          >
            <span className="font-bold text-white">Tic-Tac-Toe</span>
          </button>
          <button
            onClick={() => toast.error("Not available right now")}
            className="bg-gray-700 border border-gray-600 rounded-md p-4 text-center hover:bg-gray-600 transition"
          >
            <span className="font-bold text-white">Hangman</span>
          </button>
          <button
            onClick={() => toast.error("Not available right now")}
            className="bg-gray-700 border border-gray-600 rounded-md p-4 text-center hover:bg-gray-600 transition"
          >
            <span className="font-bold text-white">Tenzi</span>
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-bold mb-3">Previous Puzzles</h4>
        <div className="space-y-2">
          {recentGames.map((game, index) => {
            // Split the game string into date/game and status
            const parts = game.split(" /n ");
            const [dateGame, status] = parts;

            // Determine text color based on completion status
            const statusColor = status.includes("Completed")
              ? "text-green-400"
              : "text-red-400";

            return (
              <div
                key={index}
                className="flex justify-between p-2 bg-gray-800 rounded"
              >
                <span className="text-gray-300">{dateGame}</span>
                <span className={statusColor}>{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PuzzleTab;
