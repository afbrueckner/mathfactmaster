import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Trophy, Calculator } from "lucide-react";

interface LuckyThirteenProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

interface GameCard {
  value: number;
  selected: boolean;
  id: string;
}

interface RoundResult {
  round: number;
  card1: number;
  card2: number;
  sum: number;
  difference: number;
  score: number;
  player: 1 | 2;
}

interface GameState {
  currentRound: number;
  currentPlayer: 1 | 2;
  cards: GameCard[];
  selectedCards: GameCard[];
  player1Results: RoundResult[];
  player2Results: RoundResult[];
  player1Score: number;
  player2Score: number;
  gameComplete: boolean;
  showResult: boolean;
}

export function LuckyThirteen({ onComplete, onExit }: LuckyThirteenProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    currentPlayer: 1,
    cards: [],
    selectedCards: [],
    player1Results: [],
    player2Results: [],
    player1Score: 0,
    player2Score: 0,
    gameComplete: false,
    showResult: false
  });

  // Generate 4 random cards (0-10)
  const dealCards = () => {
    const newCards: GameCard[] = [];
    for (let i = 0; i < 4; i++) {
      newCards.push({
        value: Math.floor(Math.random() * 11), // 0-10
        selected: false,
        id: `card-${i}-${Date.now()}`
      });
    }
    
    setGameState(prev => ({
      ...prev,
      cards: newCards,
      selectedCards: [],
      showResult: false
    }));
  };

  useEffect(() => {
    dealCards();
  }, []);

  const handleCardClick = (clickedCard: GameCard) => {
    if (gameState.selectedCards.length === 2 && !clickedCard.selected) {
      return; // Can't select more than 2 cards
    }

    setGameState(prev => {
      const updatedCards = prev.cards.map(card =>
        card.id === clickedCard.id
          ? { ...card, selected: !card.selected }
          : card
      );

      const selectedCards = updatedCards.filter(card => card.selected);

      return {
        ...prev,
        cards: updatedCards,
        selectedCards
      };
    });
  };

  const calculateRoundScore = () => {
    if (gameState.selectedCards.length !== 2) return;

    const card1 = gameState.selectedCards[0];
    const card2 = gameState.selectedCards[1];
    const sum = card1.value + card2.value;
    const difference = Math.abs(13 - sum);
    const score = difference; // Lower is better

    const roundResult: RoundResult = {
      round: gameState.currentRound,
      card1: card1.value,
      card2: card2.value,
      sum,
      difference,
      score,
      player: gameState.currentPlayer
    };

    setGameState(prev => {
      if (prev.currentPlayer === 1) {
        return {
          ...prev,
          player1Results: [...prev.player1Results, roundResult],
          player1Score: prev.player1Score + score,
          showResult: true
        };
      } else {
        return {
          ...prev,
          player2Results: [...prev.player2Results, roundResult],
          player2Score: prev.player2Score + score,
          showResult: true
        };
      }
    });
  };

  const nextRound = () => {
    // Check if both players have completed 5 rounds
    const player1Rounds = gameState.player1Results.length;
    const player2Rounds = gameState.player2Results.length;
    
    if (player1Rounds >= 5 && player2Rounds >= 5) {
      // Game complete
      setGameState(prev => ({ ...prev, gameComplete: true }));
      
      // Calculate final stats for onComplete callback
      const allResults = [...gameState.player1Results, ...gameState.player2Results];
      const totalRounds = allResults.length;
      const averageAccuracy = totalRounds > 0 
        ? allResults.reduce((acc, result) => acc + (result.score === 0 ? 100 : Math.max(0, 100 - (result.score * 20))), 0) / totalRounds
        : 0;
      
      const strategies = ['target number strategy', 'addition fact fluency', 'number sense'];
      const totalScore = gameState.player1Score + gameState.player2Score;
      
      onComplete(totalScore, averageAccuracy, strategies);
    } else {
      // Switch player and continue
      setGameState(prev => {
        const nextPlayer = prev.currentPlayer === 1 ? 2 : 1;
        const shouldAdvanceRound = prev.currentPlayer === 2; // After player 2 goes, advance round
        
        return {
          ...prev,
          currentPlayer: nextPlayer as 1 | 2,
          currentRound: shouldAdvanceRound ? prev.currentRound + 1 : prev.currentRound
        };
      });
      dealCards();
    }
  };

  const getCurrentRoundResult = () => {
    if (gameState.currentPlayer === 1) {
      return gameState.player1Results[gameState.player1Results.length - 1];
    } else {
      return gameState.player2Results[gameState.player2Results.length - 1];
    }
  };

  if (gameState.gameComplete) {
    const winner = gameState.player1Score < gameState.player2Score ? 1 : 
                   gameState.player2Score < gameState.player1Score ? 2 : 0; // 0 = tie
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onExit} className="flex items-center gap-2" data-testid="exit-game">
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </div>

          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Lucky 13 Complete!
              </CardTitle>
              {winner > 0 && (
                <p className="text-2xl font-bold mt-4" data-testid="winner-announcement">
                  <span className={winner === 1 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                    Player {winner} Wins!
                  </span>
                </p>
              )}
              {winner === 0 && (
                <p className="text-2xl font-bold mt-4 text-gray-600 dark:text-gray-300" data-testid="tie-announcement">
                  It's a Tie!
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Player 1</h3>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="player1-final-score">
                    {gameState.player1Score}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Final Score</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Player 2</h3>
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400" data-testid="player2-final-score">
                    {gameState.player2Score}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Final Score</p>
                </div>
              </div>

              <Button onClick={onExit} size="lg" className="w-full mt-4" data-testid="play-again">
                Play Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit} className="flex items-center gap-2" data-testid="exit-game">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Round {gameState.currentRound} of 5
            </Badge>
            <Badge 
              className={`text-lg px-4 py-2 ${
                gameState.currentPlayer === 1 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              data-testid="current-player"
            >
              Player {gameState.currentPlayer}'s Turn
            </Badge>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <Target className="w-8 h-8 text-blue-500" />
              Lucky 13
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Pick 2 cards that add up as close to 13 as possible. Lower score wins!
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {gameState.cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={gameState.showResult}
                  className={`
                    aspect-[3/4] rounded-lg border-2 text-4xl font-bold
                    transition-all duration-200 flex items-center justify-center
                    ${card.selected 
                      ? (gameState.currentPlayer === 1 
                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 scale-105 shadow-lg'
                        : 'border-red-500 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 scale-105 shadow-lg')
                      : 'border-gray-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-400 hover:scale-105'
                    }
                    ${gameState.showResult ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                  data-testid={`card-${card.value}`}
                >
                  {card.value}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${
                  gameState.currentPlayer === 1 
                    ? 'border-blue-500 text-blue-700 dark:text-blue-300' 
                    : 'border-red-500 text-red-700 dark:text-red-300'
                }`}
              >
                Player {gameState.currentPlayer} Score: {gameState.currentPlayer === 1 ? gameState.player1Score : gameState.player2Score}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Selected: {gameState.selectedCards.map(c => c.value).join(' + ')} 
                {gameState.selectedCards.length === 2 && ` = ${gameState.selectedCards[0].value + gameState.selectedCards[1].value}`}
              </Badge>
            </div>

            {gameState.showResult && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">Round {gameState.currentRound} Result</h3>
                </div>
                {(() => {
                  const result = getCurrentRoundResult();
                  return result ? (
                    <div className="space-y-2">
                      <p>Sum: {result.card1} + {result.card2} = {result.sum}</p>
                      <p>Difference from 13: |13 - {result.sum}| = {result.difference}</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        Round Score: {result.score}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="text-center">
              {!gameState.showResult ? (
                <Button
                  onClick={calculateRoundScore}
                  disabled={gameState.selectedCards.length !== 2}
                  size="lg"
                  data-testid="submit-round"
                >
                  Submit Round
                </Button>
              ) : (
                <Button onClick={nextRound} size="lg" data-testid="next-round">
                  {gameState.currentRound >= 5 ? 'Finish Game' : 'Next Round'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {(gameState.player1Results.length > 0 || gameState.player2Results.length > 0) && (
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle>Score Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Player 1 Table */}
                <div className="border-2 border-blue-500 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 text-center">
                    Player 1 - Blue
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm font-semibold border-b-2 pb-2 text-center">
                      <div>Number Sentence</div>
                      <div>Score</div>
                    </div>
                    {gameState.player1Results.map((result, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 text-sm border-b pb-2 text-center" data-testid={`player1-result-${index}`}>
                        <div className="text-blue-700 dark:text-blue-300 font-medium">
                          {result.card1} + {result.card2} = {result.sum}
                        </div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {result.score}
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2 text-sm font-bold pt-2 border-t-2 text-center">
                      <div className="text-blue-700 dark:text-blue-300">Total Score:</div>
                      <div className="text-blue-600 dark:text-blue-400" data-testid="player1-score">
                        {gameState.player1Score}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player 2 Table */}
                <div className="border-2 border-red-500 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3 text-center">
                    Player 2 - Red
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm font-semibold border-b-2 pb-2 text-center">
                      <div>Number Sentence</div>
                      <div>Score</div>
                    </div>
                    {gameState.player2Results.map((result, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 text-sm border-b pb-2 text-center" data-testid={`player2-result-${index}`}>
                        <div className="text-red-700 dark:text-red-300 font-medium">
                          {result.card1} + {result.card2} = {result.sum}
                        </div>
                        <div className="font-semibold text-red-600 dark:text-red-400">
                          {result.score}
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2 text-sm font-bold pt-2 border-t-2 text-center">
                      <div className="text-red-700 dark:text-red-300">Total Score:</div>
                      <div className="text-red-600 dark:text-red-400" data-testid="player2-score">
                        {gameState.player2Score}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}