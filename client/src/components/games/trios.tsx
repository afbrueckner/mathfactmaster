import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TenFrame } from "@/components/ten-frame";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TriosBoardCell {
  number: number;
  covered: boolean;
  player: 1 | 2 | null; // Which player claimed this square
}

interface TriosProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function Trios({ onComplete, onExit }: TriosProps) {
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [player1Trios, setPlayer1Trios] = useState(0);
  const [player2Trios, setPlayer2Trios] = useState(0);
  const [player1ClaimedTrios, setPlayer1ClaimedTrios] = useState<string[]>([]);
  const [player2ClaimedTrios, setPlayer2ClaimedTrios] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<number | null>(null);
  const [cardDeck, setCardDeck] = useState<number[]>([]);
  const [deckPosition, setDeckPosition] = useState(0);
  const [triosBoard, setTriosBoard] = useState<TriosBoardCell[]>([]);
  const [feedback, setFeedback] = useState("");
  const [gameComplete, setGameComplete] = useState(false);
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);
  const [selectedMultiple, setSelectedMultiple] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = () => {
    // Create 5x5 board with multiples of selected number
    // Deck only has cards 1-10, so board should only have 1× through 10× the selected multiple
    const maxMultiplier = 10;
    
    // Create a pool with each multiple appearing at most 4 times (matching deck composition)
    const multiplesPool: number[] = [];
    for (let multiplier = 1; multiplier <= maxMultiplier; multiplier++) {
      const product = multiplier * selectedMultiple;
      // Add each multiple up to 4 times to match the deck
      for (let copy = 0; copy < 4; copy++) {
        multiplesPool.push(product);
      }
    }
    
    // Shuffle the pool
    for (let i = multiplesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [multiplesPool[i], multiplesPool[j]] = [multiplesPool[j], multiplesPool[i]];
    }
    
    // Take first 25 numbers from shuffled pool for the board
    const boardNumbers = multiplesPool.slice(0, 25);
    
    const board = boardNumbers.map(number => ({
      number,
      covered: false,
      player: null
    }));
    
    setTriosBoard(board);
    
    // Create shuffled deck of 40 cards (4 copies of numbers 1-10)
    const deck: number[] = [];
    for (let num = 1; num <= 10; num++) {
      for (let copy = 0; copy < 4; copy++) {
        deck.push(num);
      }
    }
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    setCardDeck(deck);
    setDeckPosition(0);
    
    // Draw first card
    if (deck.length > 0) {
      setCurrentCard(deck[0]);
    }
    
    setGameStarted(true);
  };

  const findAllTrios = (board: TriosBoardCell[], player: 1 | 2): number[][] => {
    const allTrios: number[][] = [];
    
    // Check rows
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= 2; col++) {
        const idx1 = row * 5 + col;
        const idx2 = row * 5 + col + 1;
        const idx3 = row * 5 + col + 2;
        if (board[idx1].player === player &&
            board[idx2].player === player &&
            board[idx3].player === player) {
          allTrios.push([idx1, idx2, idx3].sort((a, b) => a - b));
        }
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row <= 2; row++) {
        const idx1 = row * 5 + col;
        const idx2 = (row + 1) * 5 + col;
        const idx3 = (row + 2) * 5 + col;
        if (board[idx1].player === player &&
            board[idx2].player === player &&
            board[idx3].player === player) {
          allTrios.push([idx1, idx2, idx3].sort((a, b) => a - b));
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 2; col++) {
        const idx1 = row * 5 + col;
        const idx2 = (row + 1) * 5 + col + 1;
        const idx3 = (row + 2) * 5 + col + 2;
        if (board[idx1].player === player &&
            board[idx2].player === player &&
            board[idx3].player === player) {
          allTrios.push([idx1, idx2, idx3].sort((a, b) => a - b));
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= 2; row++) {
      for (let col = 2; col < 5; col++) {
        const idx1 = row * 5 + col;
        const idx2 = (row + 1) * 5 + col - 1;
        const idx3 = (row + 2) * 5 + col - 2;
        if (board[idx1].player === player &&
            board[idx2].player === player &&
            board[idx3].player === player) {
          allTrios.push([idx1, idx2, idx3].sort((a, b) => a - b));
        }
      }
    }
    
    return allTrios;
  };
  
  const getTrioKey = (indices: number[]): string => {
    return indices.sort((a, b) => a - b).join('-');
  };

  const drawNextCard = () => {
    if (deckPosition + 1 < cardDeck.length) {
      setDeckPosition(deckPosition + 1);
      setCurrentCard(cardDeck[deckPosition + 1]);
    } else {
      setGameComplete(true);
    }
  };

  const handleSkip = () => {
    setFeedback(`Player ${currentPlayer} skipped this card`);
    setTimeout(() => {
      setFeedback("");
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      drawNextCard();
    }, 1000);
  };

  const handleBoardClick = (index: number) => {
    if (!currentCard || feedback !== "" || triosBoard[index].covered) return;
    
    const targetProduct = currentCard * selectedMultiple;
    const selectedNumber = triosBoard[index].number;
    
    if (selectedNumber === targetProduct) {
      const newBoard = [...triosBoard];
      newBoard[index].covered = true;
      newBoard[index].player = currentPlayer;
      
      setFeedback(`✓ Player ${currentPlayer} correct! ${currentCard} × ${selectedMultiple} = ${targetProduct}`);
      
      const strategyName = `counting by ${selectedMultiple}s (×${selectedMultiple})`;
      setStrategiesUsed([...strategiesUsed, strategyName]);
      
      // Find all trios for current player
      const allTrios = findAllTrios(newBoard, currentPlayer);
      const currentClaimed = currentPlayer === 1 ? player1ClaimedTrios : player2ClaimedTrios;
      
      // Filter for new trios not yet claimed
      const newTrios = allTrios.filter(trio => {
        const key = getTrioKey(trio);
        return !currentClaimed.includes(key);
      });
      
      if (newTrios.length > 0) {
        // Add new trios to claimed list
        const newKeys = newTrios.map(getTrioKey);
        if (currentPlayer === 1) {
          setPlayer1ClaimedTrios([...player1ClaimedTrios, ...newKeys]);
          setPlayer1Trios(player1Trios + newTrios.length);
        } else {
          setPlayer2ClaimedTrios([...player2ClaimedTrios, ...newKeys]);
          setPlayer2Trios(player2Trios + newTrios.length);
        }
        
        const trioText = newTrios.length === 1 ? 'TRIO' : `${newTrios.length} TRIOS`;
        setFeedback(`🎉 Player ${currentPlayer} got ${trioText}! +${newTrios.length} point${newTrios.length > 1 ? 's' : ''}`);
      }
      
      setTriosBoard(newBoard);
      
      // Switch players after short delay
      setTimeout(() => {
        setFeedback("");
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        drawNextCard();
      }, 2000);
    } else {
      setFeedback(`✗ Not quite. ${currentCard} × ${selectedMultiple} = ${targetProduct}, not ${selectedNumber}`);
      
      // Switch players after wrong answer
      setTimeout(() => {
        setFeedback("");
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        drawNextCard();
      }, 2000);
    }
  };

  const handleComplete = () => {
    const uniqueStrategies = Array.from(new Set(strategiesUsed));
    const totalScore = (player1Trios + player2Trios) * 10;
    onComplete(totalScore, 100, uniqueStrategies);
  };

  if (gameComplete) {
    const winner = player1Trios > player2Trios ? 1 : player2Trios > player1Trios ? 2 : 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🎲</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Trios Game Complete!
        </h2>
        
        {winner > 0 && (
          <p className="text-xl font-bold mb-4" data-testid="winner-announcement">
            <span className={winner === 1 ? "text-blue-600" : "text-red-600"}>
              Player {winner} Wins!
            </span>
          </p>
        )}
        {winner === 0 && (
          <p className="text-xl font-bold mb-4 text-gray-600" data-testid="tie-announcement">
            It's a Tie!
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-500">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Player 1</h3>
            <p className="text-4xl font-bold text-blue-600" data-testid="player1-trios">{player1Trios}</p>
            <p className="text-sm text-blue-700">Trios</p>
          </div>
          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-500">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Player 2</h3>
            <p className="text-4xl font-bold text-red-600" data-testid="player2-trios">{player2Trios}</p>
            <p className="text-sm text-red-700">Trios</p>
          </div>
        </div>

        {strategiesUsed.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Strategies Used:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(new Set(strategiesUsed)).map((strategy, index) => (
                <Badge key={index} variant="secondary" className="bg-primary-100 text-primary-800">
                  {strategy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-4 justify-center">
          <Button onClick={handleComplete} className="bg-primary-500 hover:bg-primary-600" data-testid="save-results">
            Save Results
          </Button>
          <Button variant="outline" onClick={onExit} data-testid="back-to-games">
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
          <span className="text-3xl">🎲</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Trios</h2>
            <p className="text-sm text-gray-600">Find the product of the card × {selectedMultiple}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          Exit Game
        </Button>
      </div>

      {!gameStarted && (
        <div className="text-center mb-8">
          <div className="bg-primary-50 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Multiple</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which multiplication facts you want to practice
            </p>
            <Select value={selectedMultiple.toString()} onValueChange={(value) => setSelectedMultiple(parseInt(value))}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select a multiple" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">×3 (Multiples of 3)</SelectItem>
                <SelectItem value="4">×4 (Multiples of 4)</SelectItem>
                <SelectItem value="5">×5 (Multiples of 5)</SelectItem>
                <SelectItem value="6">×6 (Multiples of 6)</SelectItem>
                <SelectItem value="7">×7 (Multiples of 7)</SelectItem>
                <SelectItem value="8">×8 (Multiples of 8)</SelectItem>
                <SelectItem value="9">×9 (Multiples of 9)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={initializeGame}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
            >
              Start Game
            </Button>
          </div>
        </div>
      )}

      {gameStarted && (
        <div className="text-center mb-6">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="text-lg font-semibold text-gray-600">Card {deckPosition + 1} of {cardDeck.length}</span>
          <div className="w-px h-6 bg-gray-300"></div>
          <Badge 
            className={`text-lg px-4 py-2 ${
              currentPlayer === 1 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            data-testid="current-player"
          >
            Player {currentPlayer}'s Turn
          </Badge>
          <div className="w-px h-6 bg-gray-300"></div>
          <span className="text-lg font-semibold text-blue-600">P1 Trios: {player1Trios}</span>
          <span className="text-lg font-semibold text-red-600">P2 Trios: {player2Trios}</span>
        </div>
        
        {currentCard && (
          <div className="bg-primary-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Card</h3>
            <div className="flex justify-center mb-4">
              <TenFrame number={currentCard} className="text-2xl" />
            </div>
            <p className="text-sm text-gray-600">
              Find {currentCard} × {selectedMultiple} on the board
            </p>
          </div>
        )}
        </div>
      )}

      {/* Game Board */}
      {gameStarted && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">Trios Board</h3>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {triosBoard.map((cell, index) => {
              let cellStyle = "";
              let cellContent: string | number = cell.number;
              
              // Check if this cell is part of any claimed trio
              const isPartOfPlayer1Trio = player1ClaimedTrios.some(trioKey => 
                trioKey.split('-').map(Number).includes(index)
              );
              const isPartOfPlayer2Trio = player2ClaimedTrios.some(trioKey => 
                trioKey.split('-').map(Number).includes(index)
              );
              
              if (isPartOfPlayer1Trio && cell.player === 1) {
                // Player 1 trio square - light blue with star
                cellStyle = "bg-blue-300 text-blue-900 border-blue-500 font-bold shadow-lg";
                cellContent = "★";
              } else if (isPartOfPlayer2Trio && cell.player === 2) {
                // Player 2 trio square - light red with star
                cellStyle = "bg-red-300 text-red-900 border-red-500 font-bold shadow-lg";
                cellContent = "★";
              } else if (cell.player === 1) {
                // Player 1 claimed but not part of trio - blue
                cellStyle = "bg-blue-500 text-white border-blue-600";
                cellContent = "✓";
              } else if (cell.player === 2) {
                // Player 2 claimed but not part of trio - red
                cellStyle = "bg-red-500 text-white border-red-600";
                cellContent = "✓";
              } else {
                // Unclaimed
                cellStyle = "bg-white text-gray-800 border-gray-300 hover:border-primary-500 hover:bg-primary-50";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleBoardClick(index)}
                  className={`aspect-square text-lg font-bold rounded-lg border-2 transition-all ${cellStyle}`}
                  disabled={feedback !== "" || cell.covered}
                  data-testid={`cell-${index}`}
                >
                  {cellContent}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {gameStarted && feedback && (
        <div className={`p-4 rounded-lg text-center mb-6 ${
          feedback.includes("Correct") || feedback.includes("THREE IN A ROW") ? "bg-green-50 border border-green-200 text-green-800" :
          feedback.includes("skipped") ? "bg-blue-50 border border-blue-200 text-blue-800" :
          "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {feedback}
        </div>
      )}

      {/* Skip Button */}
      {gameStarted && currentCard && feedback === "" && (
        <div className="text-center">
          <Button 
            onClick={handleSkip}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
          >
            Skip Card (not on board)
          </Button>
        </div>
      )}

      {gameStarted && (
        <div className="mt-6 text-center text-xs text-gray-500">
          Get 3 in a row to win! Practice: Multiplication by {selectedMultiple}
        </div>
      )}
    </div>
  );
}