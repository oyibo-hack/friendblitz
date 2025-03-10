"use client";

// import useLocalStorage from "@/lib/hooks/use-local-storage";
import { useEffect, useState } from "react";
// import { toast } from "sonner";

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
      <p className="mb-4 text-gray-300">Play the puzzle to earn 10 tokens!</p>

      {/* Tic-Tac-Toe */}
      <TicTacToe />

      {/* Hangman */}
      <Hangman />

      {/* Tenzi */}
      <Tenzi />
    </div>
  );
};

export default PuzzleTab;

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isDraw, setIsDraw] = useState(false);

  const checkWinner = (newBoard) => {
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
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        return newBoard[a];
      }
    }

    // Check for draw (all cells filled)
    if (!newBoard.includes(null)) {
      setIsDraw(true);
    }

    return null;
  };

  const computerMove = (newBoard) => {
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

  const handleClick = (index) => {
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
            disabled={!gameStarted || winner}
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

function Hangman() {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const maxWrong = 6;

  // Initialize a random word when component mounts
  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const startGame = () => {
    setGameStarted(true);
    resetGame();
  };

  const handleGuess = (letter) => {
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

  // Function to determine button styling based on letter status
  const getButtonStyle = (letter) => {
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

function Tenzi() {
  const [dice, setDice] = useState(Array(10).fill(1));
  const [held, setHeld] = useState(Array(10).fill(false));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const rollDice = () => {
    if (gameWon) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newDice = dice.map((value, index) =>
      held[index] ? value : Math.floor(Math.random() * 6) + 1
    );
    setDice(newDice);

    // Check if all dice are the same
    if (newDice.every((num) => num === newDice[0])) {
      setGameWon(true);
    }
  };

  const holdDie = (index) => {
    if (gameWon || !gameStarted) return;

    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const resetGame = () => {
    setDice(Array(10).fill(1));
    setHeld(Array(10).fill(false));
    setGameWon(false);
    setGameStarted(false);
  };

  const renderDice = (value, index) => {
    const pip = <div className="w-2 h-2 bg-white rounded-full"></div>;

    const diceFaces = {
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
      <div className="mt-4 flex gap-2 justify-center">
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
