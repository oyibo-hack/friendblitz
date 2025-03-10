"use client";

import useLocalStorage from "@/lib/hooks/use-local-storage";
import { manageTokenHistory, tokensManager, User } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// import { pushToLocalStorage } from "@/lib/utils";

const PuzzleTab = ({ user }: { user: User }) => {
  const [recentGames, setRecentGames] = useState<string[]>([]);

  useEffect(() => {
    // Retrieve stored values
    const storedData = JSON.parse(localStorage.getItem("recentGames") || "[]");

    // Ensure it's an array before setting state
    if (Array.isArray(storedData)) {
      setRecentGames(storedData);
    }
  }, []);

  const [playPuzzleLimit, setPlayPuzzleLimit] = useLocalStorage(
    "playPuzzleLimit",
    { count: 0, date: new Date().toDateString() }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString();

      // Ensure playPuzzleLimit has valid structure
      if (!playPuzzleLimit || typeof playPuzzleLimit.date !== "string") {
        setPlayPuzzleLimit({ count: 0, date: today });
      } else if (playPuzzleLimit.date !== today) {
        setPlayPuzzleLimit({ count: 0, date: today });
      }
    }
  }, [playPuzzleLimit, setPlayPuzzleLimit]);

  async function claimReward() {
    try {
      if (playPuzzleLimit.count >= 15) return;

      // Update play puzzle limit without redundant reassignment
      setPlayPuzzleLimit((prev) => ({ ...prev }));

      // 30% chance to generate tokens
      if (Math.random() <= 0.7) return;

      // Generate random token amount (0.2 - 1.0)
      const tokens = +(Math.random() * 0.8 + 0.2).toFixed(2);

      if (!tokens) return;

      // Add tokens to the user's account
      await tokensManager("add", { userId: user.id, tokens });

      // ✅ Log token history
      await manageTokenHistory(user.id, "update", {
        task: `You won ${tokens} tokens!`,
        date: new Date().toISOString(),
        tokens,
      });

      toast.success(`You earned ${tokens} tokens 🎉`);
    } catch (error) {
      console.error("An error occurred:", error);
      throw error; // Ensure errors are caught by the caller
    }
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Play Puzzle</h3>
      <p className="mb-4 text-gray-300">Play the puzzle to earn 10 tokens!</p>

      <TicTacToe claimReward={claimReward} />
      <Hangman claimReward={claimReward} />
      <Tenzi claimReward={claimReward} />

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

function TicTacToe({ claimReward }: { claimReward: () => void }) {
  const [board, setBoard] = useState<("X" | "O" | null)[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<"X" | "O" | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isDraw, setIsDraw] = useState(false);

  const checkWinner = (newBoard: ("X" | "O" | null)[]): "X" | "O" | null => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        if (newBoard[a] === "X") claimReward();
        return newBoard[a];
      }
    }

    // Check for draw (all cells filled)
    if (!newBoard.includes(null)) {
      setIsDraw(true);
    }

    return null;
  };

  const computerMove = (newBoard: ("X" | "O" | null)[]) => {
    const emptyCells = newBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter((i) => i !== null);
    if (emptyCells.length === 0) return;

    const randomIndex =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[randomIndex] = "O";
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }
    setIsXTurn(true);
  };

  const handleClick = (index: number) => {
    // Only allow moves if game has started, square is empty, no winner yet, and it's player's turn
    if (!gameStarted || board[index] || winner || !isXTurn) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXTurn(false);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setTimeout(() => computerMove([...newBoard]), 500); // Delay for realism
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setGameStarted(false);
    setIsDraw(false);
  };

  const getStatusMessage = () => {
    if (winner) {
      return `${winner === "X" ? "You" : "Computer"} won!`;
    } else if (isDraw) {
      return "It's a draw!";
    } else if (gameStarted) {
      return `${isXTurn ? "Your" : "Computer's"} turn`;
    } else {
      return "Click Play Game to start";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-white mb-2">Tic-Tac-Toe</h3>
      <p className="text-white mb-3">{getStatusMessage()}</p>
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-16 h-16 bg-gray-700 text-white font-bold text-xl flex items-center justify-center border border-gray-500 ${
              gameStarted && !winner && !cell ? "hover:bg-gray-600" : ""
            }`}
            disabled={!gameStarted || Boolean(winner)}
          >
            {cell}
          </button>
        ))}
      </div>
      {!gameStarted && !winner ? (
        <button
          onClick={startGame}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Play Game
        </button>
      ) : (
        <button
          onClick={resetGame}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          {winner || isDraw ? "Play Again" : "Restart Game"}
        </button>
      )}
    </div>
  );
}

const words = ["REACT", "JAVASCRIPT", "HANGMAN", "CODING", "WEBSITE"];

function Hangman({ claimReward }: { claimReward: () => void }) {
  const [word, setWord] = useState<string>("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const maxWrong = 6;

  // Initialize a random word when component mounts
  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const startGame = () => {
    setGameStarted(true);
    resetGame();
  };

  const handleGuess = (letter: string) => {
    // Prevent guessing if letter already guessed or game over
    if (guessedLetters.includes(letter) || wrongGuesses >= maxWrong || isWinner)
      return;

    setGuessedLetters([...guessedLetters, letter]);

    if (!word.includes(letter)) {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  const resetGame = () => {
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStarted(true);
  };

  const displayWord = word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  const isWinner = word && !displayWord.includes("_");
  const isLoser = wrongGuesses >= maxWrong;
  const gameOver = isWinner || isLoser;

  useEffect(() => {
    if (isWinner) {
      claimReward();
    }
  }, [claimReward, isWinner]);

  // Function to determine button styling based on letter status
  const getButtonStyle = (letter: string) => {
    if (!gameStarted)
      return "bg-gray-700 text-white opacity-50 cursor-not-allowed";
    if (guessedLetters.includes(letter)) {
      return word.includes(letter)
        ? "bg-green-600 text-white cursor-default"
        : "bg-red-600 text-white cursor-default";
    }
    if (gameOver) return "bg-gray-700 text-white opacity-50 cursor-not-allowed";
    return "bg-gray-700 text-white font-bold hover:bg-gray-600 cursor-pointer";
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-white mb-2">Hangman</h3>
      <p className="text-white mb-3">Guess the Nigerian State:</p>
      <div className="flex flex-col items-center">
        {gameStarted && (
          <>
            <p className="text-xl font-mono tracking-widest text-gray-300 mb-2">
              {displayWord}
            </p>
            <p className="text-gray-400 mb-4">
              Wrong guesses: {wrongGuesses} of {maxWrong}
            </p>

            {isWinner && (
              <p className="text-green-500 font-bold mb-4">You won! 🎉</p>
            )}
            {isLoser && (
              <p className="text-red-500 font-bold mb-4">
                Game over! The word was:{" "}
                <span className="font-mono">{word}</span>
              </p>
            )}
          </>
        )}

        <div className="grid grid-cols-6 gap-2 mb-4">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={
                !gameStarted || guessedLetters.includes(letter) || gameOver
              }
              className={`w-10 h-10 ${getButtonStyle(
                letter
              )} font-bold text-lg flex items-center justify-center border border-gray-500 transition`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {!gameStarted ? (
        <button
          onClick={startGame}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Play Game
        </button>
      ) : (
        <button
          onClick={resetGame}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          {gameOver ? "Play Again" : "Restart Game"}
        </button>
      )}
    </div>
  );
}

function Tenzi({ claimReward }: { claimReward: () => void }) {
  const [dice, setDice] = useState(Array(10).fill(1));
  const [held, setHeld] = useState(Array(10).fill(false));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestTime, setBestTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [storedBestTime, setStoredBestTime] = useLocalStorage<number>(
    "time",
    0
  );

  useEffect(() => {
    setBestTime(storedBestTime || 0);
  }, [storedBestTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (gameStarted && !gameWon) {
      setStartTime(Date.now());
      timer = setInterval(() => {
        setNow(Date.now());
      }, 100);
    } else if (gameWon) {
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameWon]);

  const secondsPassed =
    startTime != null && now != null
      ? Number(((now - startTime) / 1000).toFixed(2))
      : 0;

  const rollDice = () => {
    if (gameWon) return;

    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
      setNow(Date.now());
    }

    const newDice = dice.map((value, index) =>
      held[index] ? value : Math.floor(Math.random() * 6) + 1
    );
    setDice(newDice);

    // Check if all dice are the same
    if (newDice.every((num) => num === newDice[0])) {
      setGameWon(true);
      if (secondsPassed < bestTime || bestTime === 0) {
        setStoredBestTime(Number(secondsPassed));
        setBestTime(Number(secondsPassed));
      }
    }
  };

  const holdDie = (index: number) => {
    if (gameWon || !gameStarted) return;

    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  useEffect(() => {
    if (gameWon) {
      claimReward();
    }
  }, [claimReward, gameWon]);

  const resetGame = () => {
    setDice(Array(10).fill(1));
    setHeld(Array(10).fill(false));
    setGameWon(false);
    setGameStarted(false);
    setStartTime(null);
    setNow(null);
  };

  const renderDice = (value: number, index: number) => {
    const pip = <div className="w-2 h-2 bg-white rounded-full"></div>;

    const diceFaces: Record<number, (React.JSX.Element | null)[][]> = {
      1: [
        [null, null, null],
        [null, pip, null],
        [null, null, null],
      ],
      2: [
        [pip, null, null],
        [null, null, null],
        [null, null, pip],
      ],
      3: [
        [pip, null, null],
        [null, pip, null],
        [null, null, pip],
      ],
      4: [
        [pip, null, pip],
        [null, null, null],
        [pip, null, pip],
      ],
      5: [
        [pip, null, pip],
        [null, pip, null],
        [pip, null, pip],
      ],
      6: [
        [pip, null, pip],
        [pip, null, pip],
        [pip, null, pip],
      ],
    };

    return (
      <div
        onClick={() => holdDie(index)}
        className={`w-12 h-12 flex flex-col justify-center items-center border border-gray-500 rounded-md transition
          ${held[index] ? "bg-green-500" : "bg-gray-700 hover:bg-gray-600"}`}
      >
        {diceFaces[value].map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 w-full">
            {row.map((dot, dotIndex) => (
              <div
                key={dotIndex}
                className="w-4 h-4 flex justify-center items-center"
              >
                {dot}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-white mb-2">Tenzi</h3>
      <p className="text-white mb-3">
        Roll until all dice are the same.
        <br />
        Click each die to freeze it at its current value between rolls.
      </p>
      <p className="text-white mb-3">
        <span>{secondsPassed}s</span>
        <span> | Best Time: {bestTime}s</span>
      </p>
      {gameWon && (
        <div className="bg-green-500 text-white p-2 rounded-md mb-4 text-center">
          You won! All dice match!
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        {dice.map((value, index) => (
          <div key={index}>{renderDice(value, index)}</div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {!gameStarted ? (
          <button
            onClick={rollDice}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Play Game
          </button>
        ) : (
          <>
            {!gameWon && (
              <button
                onClick={rollDice}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
              >
                Roll Dice
              </button>
            )}
            <button
              onClick={resetGame}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition"
            >
              Reset Game
            </button>
          </>
        )}
      </div>
    </div>
  );
}
