import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Timer, Target, Trophy } from "lucide-react";

interface RacingBearsProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

interface GameState {
  currentProblem: string;
  answer: number;
  userAnswer: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeElapsed: number;
  gameComplete: boolean;
}

export function RacingBears({ onComplete, onExit }: RacingBearsProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentProblem: '',
    answer: 0,
    userAnswer: '',
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    timeElapsed: 0,
    gameComplete: false
  });

  const [bearPositions, setBearPositions] = useState([0, 0, 0, 0]); // 4 bears racing
  const [selectedBear, setSelectedBear] = useState(0);

  const problems = [
    '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', '7+1', '8+1', '9+1',
    '1+2', '2+2', '3+2', '4+2', '5+2', '6+2', '7+2', '8+2'
  ];

  const generateNewProblem = () => {
    const problem = problems[Math.floor(Math.random() * problems.length)];
    // Safe calculation without eval
    const [num1, num2] = problem.split('+').map(n => parseInt(n.trim()));
    const answer = num1 + num2;
    setGameState(prev => ({ ...prev, currentProblem: problem, answer, userAnswer: '' }));
  };

  useEffect(() => {
    generateNewProblem();
    const timer = setInterval(() => {
      setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = () => {
    const isCorrect = parseInt(gameState.userAnswer) === gameState.answer;
    const newCorrectAnswers = gameState.correctAnswers + (isCorrect ? 1 : 0);
    const newQuestionsAnswered = gameState.questionsAnswered + 1;
    
    let newBearPosition = bearPositions[selectedBear];
    if (isCorrect) {
      // Move the selected bear forward
      newBearPosition += 10;
      setBearPositions(prev => {
        const newPositions = [...prev];
        newPositions[selectedBear] = newBearPosition;
        return newPositions;
      });
      setGameState(prev => ({ ...prev, score: prev.score + 10 }));
    }

    setGameState(prev => ({
      ...prev,
      questionsAnswered: newQuestionsAnswered,
      correctAnswers: newCorrectAnswers
    }));

    // Check if any bear reached the finish line (100) - use the new position
    if (newBearPosition >= 100 || newQuestionsAnswered >= 15) {
      const accuracy = Math.round((newCorrectAnswers / newQuestionsAnswered) * 100);
      const finalScore = gameState.score + (isCorrect ? 10 : 0);
      setGameState(prev => ({ ...prev, gameComplete: true }));
      onComplete(finalScore, accuracy, ['counting', 'memorization']);
      return;
    }

    generateNewProblem();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onExit} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>
        <h1 className="text-2xl font-bold text-center">🐻 Racing Bears</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            <Timer className="h-4 w-4 mr-1" />
            {formatTime(gameState.timeElapsed)}
          </Badge>
          <Badge variant="outline">
            <Target className="h-4 w-4 mr-1" />
            {gameState.questionsAnswered}/15
          </Badge>
          <Badge variant="outline">
            <Trophy className="h-4 w-4 mr-1" />
            Score: {gameState.score}
          </Badge>
        </div>
      </div>

      {/* Race Track */}
      <Card>
        <CardHeader>
          <CardTitle>Race Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bearPositions.map((position, index) => (
              <div key={index} className="relative">
                <div className="flex items-center">
                  <Button
                    variant={selectedBear === index ? "default" : "outline"}
                    onClick={() => setSelectedBear(index)}
                    className="mr-4 w-20"
                    size="sm"
                  >
                    Bear {index + 1}
                  </Button>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    {/* Track */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-dashed border-gray-400 border-t-2"></div>
                    </div>
                    {/* Finish Line */}
                    <div className="absolute right-0 top-0 h-full w-2 bg-checkered bg-black"></div>
                    {/* Bear */}
                    <div 
                      className="absolute top-1 h-6 w-6 flex items-center justify-center text-lg transition-all duration-500"
                      style={{ left: `${Math.min(position, 92)}%` }}
                    >
                      🐻
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Problem */}
      <Card>
        <CardHeader>
          <CardTitle>Solve to Move Your Bear!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-blue-600">
              {gameState.currentProblem} = ?
            </div>
            <div className="flex items-center justify-center space-x-4">
              <input
                type="number"
                value={gameState.userAnswer}
                onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-32 h-12 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="?"
                autoFocus
              />
              <Button onClick={handleAnswer} size="lg">
                Submit
              </Button>
            </div>
            <p className="text-gray-600">
              Bear {selectedBear + 1} will move forward if you're correct!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Choose which bear you want to race with by clicking on them</li>
            <li>Solve the addition problem to move your bear forward</li>
            <li>The first bear to reach the finish line wins!</li>
            <li>Answer 15 problems or get your bear to the finish line to complete the game</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}