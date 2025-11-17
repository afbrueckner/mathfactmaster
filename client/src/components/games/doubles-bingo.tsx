import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TenFrame } from "@/components/ten-frame";

interface DoublesBingoProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function DoublesBingo({ onComplete, onExit }: DoublesBingoProps) {
  const [currentCard, setCurrentCard] = useState<number | null>(null);
  const [bingoBoard, setBingoBoard] = useState<{ number: number; covered: boolean }[]>([]);
  const [deck, setDeck] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctSelections, setCorrectSelections] = useState(0);
  const [totalSelections, setTotalSelections] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Doubles sums for numbers 1-10: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
    const possibleSums = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    
    // Create a pool where each sum appears at most 4 times (max 40 numbers total)
    const pool: number[] = [];
    possibleSums.forEach(sum => {
      for (let i = 0; i < 4; i++) {
        pool.push(sum);
      }
    });
    
    // Shuffle the pool and pick first 16 numbers for the 4x4 board
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const boardNumbers = shuffledPool.slice(0, 16);
    
    const board = boardNumbers.map(num => ({ number: num, covered: false }));
    setBingoBoard(board);

    // Create deck of cards (4 of each number 1-10 = 40 cards)
    const cardDeck: number[] = [];
    for (let num = 1; num <= 10; num++) {
      for (let copy = 0; copy < 4; copy++) {
        cardDeck.push(num);
      }
    }
    const shuffledDeck = [...cardDeck].sort(() => Math.random() - 0.5);
    setDeck(shuffledDeck);
    
    drawNextCard(shuffledDeck);
  };

  const drawNextCard = (currentDeck = deck) => {
    if (currentDeck.length === 0) {
      setGameComplete(true);
      return;
    }

    const nextCard = currentDeck[0];
    setCurrentCard(nextCard);
    setDeck(currentDeck.slice(1));
  };

  const handleSkipCard = () => {
    setFeedback("Card skipped - answer not on board");
    setTimeout(() => {
      setFeedback("");
      drawNextCard();
    }, 1500);
  };

  const handleBoardClick = (index: number) => {
    if (!bingoBoard[index] || bingoBoard[index].covered || currentCard === null) return;

    const selectedNumber = bingoBoard[index].number;
    const doubleOfCard = currentCard * 2;
    const isCorrect = selectedNumber === doubleOfCard;

    setTotalSelections(totalSelections + 1);

    if (isCorrect) {
      // Mark as covered
      const newBoard = [...bingoBoard];
      newBoard[index].covered = true;
      setBingoBoard(newBoard);
      
      setScore(score + 10);
      setCorrectSelections(correctSelections + 1);
      setFeedback(`Correct! ${currentCard} + ${currentCard} = ${doubleOfCard}`);
      
      // Check for bingo (4 in a row)
      if (checkForBingo(newBoard)) {
        setScore(score + 50); // Bonus for bingo
        setFeedback("BINGO! You got 4 in a row! +50 bonus points!");
        setTimeout(() => {
          setGameComplete(true);
        }, 2500); // Give time to see the BINGO message
        return; // Don't continue to draw next card
      }
    } else {
      setFeedback(`Not quite. ${currentCard} + ${currentCard} = ${doubleOfCard}, not ${selectedNumber}`);
    }

    // Draw next card after short delay (only if game isn't complete)
    setTimeout(() => {
      if (!gameComplete) {
        setFeedback("");
        drawNextCard();
      }
    }, 2000);
  };

  const checkForBingo = (board: { number: number; covered: boolean }[]) => {
    if (!board || board.length < 16) return false;
    
    // Check rows (4x4 grid)
    for (let row = 0; row < 4; row++) {
      let count = 0;
      for (let col = 0; col < 4; col++) {
        const index = row * 4 + col;
        if (board[index] && board[index].covered) count++;
      }
      if (count >= 4) return true;
    }

    // Check columns
    for (let col = 0; col < 4; col++) {
      let count = 0;
      for (let row = 0; row < 4; row++) {
        const index = row * 4 + col;
        if (board[index] && board[index].covered) count++;
      }
      if (count >= 4) return true;
    }

    // Check diagonals
    let diag1Count = 0, diag2Count = 0;
    for (let i = 0; i < 4; i++) {
      const diag1Index = i * 4 + i;
      const diag2Index = i * 4 + (3 - i);
      if (board[diag1Index] && board[diag1Index].covered) diag1Count++;
      if (board[diag2Index] && board[diag2Index].covered) diag2Count++;
    }
    if (diag1Count >= 4 || diag2Count >= 4) return true;

    return false;
  };

  const handleComplete = () => {
    const accuracy = totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0;
    onComplete(score, accuracy, ["doubles"]);
  };

  const accuracy = totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0;

  if (gameComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🎯</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {bingoBoard.some(cell => cell && cell.covered) && checkForBingo(bingoBoard) ? "BINGO! You Won!" : "Game Complete!"}
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{score}</p>
            <p className="text-sm text-blue-700">Points Earned</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-sm text-green-700">Accuracy</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-600">{correctSelections}</p>
            <p className="text-sm text-purple-700">Correct Doubles</p>
          </div>
        </div>

        <div className="mb-6">
          <Badge className="bg-primary-100 text-primary-800">Doubles Strategy Practiced</Badge>
        </div>

        <div className="flex space-x-4 justify-center">
          <Button onClick={handleComplete} className="bg-primary-500 hover:bg-primary-600">
            Save Results
          </Button>
          <Button variant="outline" onClick={onExit}>
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🎯</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Doubles Bingo</h2>
            <p className="text-sm text-gray-600">Find the double of the drawn card</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          Exit Game
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Current Card */}
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-4">Current Card</h3>
          <div className="bg-primary-50 rounded-lg p-8 mb-4">
            <div className="text-6xl font-bold text-primary-600 mb-4">{currentCard}</div>
            <p className="text-gray-600 mb-4">Double this number!</p>
            {currentCard !== null && (
              <div className="flex justify-center items-center space-x-4">
                <div className="text-center">
                  <TenFrame number={currentCard} />
                  <p className="text-xs text-gray-500 mt-1">{currentCard}</p>
                </div>
                <span className="text-2xl text-gray-400">+</span>
                <div className="text-center">
                  <TenFrame number={currentCard} />
                  <p className="text-xs text-gray-500 mt-1">{currentCard}</p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleSkipCard}
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={feedback !== ""}
            >
              Skip Card
            </Button>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-sm ${
              feedback.includes("Correct") || feedback.includes("BINGO") 
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {feedback}
            </div>
          )}
        </div>

        {/* Bingo Board */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Bingo Board</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {bingoBoard.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleBoardClick(index)}
                disabled={!cell || cell.covered}
                className={`aspect-square text-lg font-bold rounded-lg border-2 transition-all ${
                  cell && cell.covered 
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-white text-gray-800 border-gray-300 hover:border-primary-500 hover:bg-primary-50"
                }`}
              >
                {cell && cell.covered ? "✓" : (cell ? cell.number : "")}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Find the double and get 4 in a row for BINGO!
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 mt-6 pt-6 border-t">
        <div className="flex items-center space-x-4">
          <span>Score: {score}</span>
          <span>Accuracy: {accuracy}%</span>
          <span>Cards Left: {deck.length}</span>
        </div>
        <div className="text-xs text-gray-500">
          Foundational Facts: Doubles
        </div>
      </div>
    </div>
  );
}