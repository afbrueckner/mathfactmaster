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
}

interface GameState {
  currentRound: number;
  cards: GameCard[];
  selectedCards: GameCard[];
  roundResults: RoundResult[];
  totalScore: number;
  gameComplete: boolean;
  showResult: boolean;
}

export function LuckyThirteen({ onComplete, onExit }: LuckyThirteenProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    cards: [],
    selectedCards: [],
    roundResults: [],
    totalScore: 0,
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
      score
    };

    setGameState(prev => ({
      ...prev,
      roundResults: [...prev.roundResults, roundResult],
      totalScore: prev.totalScore + score,
      showResult: true
    }));
  };

  const nextRound = () => {
    if (gameState.currentRound >= 5) {
      // Game complete
      setGameState(prev => ({ ...prev, gameComplete: true }));
      
      // Calculate final stats for onComplete callback
      const totalRounds = gameState.roundResults.length;
      const averageAccuracy = totalRounds > 0 
        ? gameState.roundResults.reduce((acc, result) => acc + (result.score === 0 ? 100 : Math.max(0, 100 - (result.score * 20))), 0) / totalRounds
        : 0;
      
      const strategies = ['target number strategy', 'addition fact fluency', 'number sense'];
      
      onComplete(gameState.totalScore, averageAccuracy, strategies);
    } else {
      // Next round
      setGameState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
      dealCards();
    }
  };

  const getCurrentRoundResult = () => {
    return gameState.roundResults[gameState.roundResults.length - 1];
  };

  if (gameState.gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onExit} className="flex items-center gap-2">
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
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-bold text-green-600 dark:text-green-400">
                {gameState.totalScore}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Final Score (Lower is Better!)
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-lg">Round Results:</h3>
                {gameState.roundResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>Round {result.round}: {result.card1} + {result.card2} = {result.sum}</span>
                    <span className="font-semibold">Score: {result.score}</span>
                  </div>
                ))}
              </div>

              <Button onClick={onExit} size="lg" className="mt-4">
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Round {gameState.currentRound} of 5
          </Badge>
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
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 scale-105 shadow-lg' 
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
              <Badge variant="outline" className="text-lg px-4 py-2">
                Total Score: {gameState.totalScore}
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

        {gameState.roundResults.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle>Previous Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameState.roundResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                    <span>Round {result.round}: {result.card1} + {result.card2} = {result.sum}</span>
                    <span className="font-semibold">Difference: {result.difference}, Score: {result.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}