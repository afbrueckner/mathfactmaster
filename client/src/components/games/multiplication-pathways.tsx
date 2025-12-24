import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PathwayCell {
  product: number;
  marked: boolean;
}

interface MultiplicationPathwaysProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function MultiplicationPathways({ onComplete, onExit }: MultiplicationPathwaysProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [board, setBoard] = useState<PathwayCell[][]>([]);
  const [factors] = useState([0, 1, 2, 3, 4, 5, 6, 10]);
  const [selectedFactors, setSelectedFactors] = useState<[number | null, number | null]>([null, null]);
  const [movingClip, setMovingClip] = useState<0 | 1 | null>(null); // Which clip is being moved (0=blue, 1=red)
  const [path, setPath] = useState<{ row: number; col: number }[]>([]);
  const [equations, setEquations] = useState<{ player: 1 | 2; equation: string }[]>([]);
  const [feedback, setFeedback] = useState("");
  const [gameComplete, setGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const boardLayouts = [
    [
      [0, 40, 20, 3, 2, 5],
      [8, 10, 5, 30, 0, 10],
      [5, 20, 8, 50, 6, 20],
      [10, 4, 0, 10, 30, 12]
    ],
    [
      [8, 20, 0, 50, 6, 20],
      [5, 10, 8, 10, 0, 10],
      [0, 4, 5, 30, 2, 12],
      [40, 10, 20, 3, 30, 5]
    ]
  ];

  const initializeGame = () => {
    const layoutIndex = Math.floor(Math.random() * boardLayouts.length);
    const layout = boardLayouts[layoutIndex];
    
    const newBoard: PathwayCell[][] = layout.map(row =>
      row.map(product => ({ product, marked: false }))
    );
    
    setBoard(newBoard);
    setPath([]);
    setEquations([]);
    setSelectedFactors([null, null]);
    setMovingClip(null);
    setCurrentPlayer(1);
    setFeedback("");
    setGameComplete(false);
    setGameStarted(true);
  };

  const handleFactorClick = (factor: number) => {
    if (gameComplete) return;
    
    const currentColumn = path.length;
    
    // Phase 1: Initial placement (first column - need to place both clips)
    if (currentColumn === 0) {
      if (selectedFactors[0] === null) {
        // First clip placement (blue)
        setSelectedFactors([factor, null]);
        setFeedback(`Player ${currentPlayer}: Blue clip on ${factor}. Now select where to put the red clip.`);
      } else if (selectedFactors[1] === null) {
        if (factor === selectedFactors[0]) {
          setFeedback("Red clip must be on a different factor. Choose another number.");
          return;
        }
        // Second clip placement (red) - now try to mark a cell
        const factor1 = selectedFactors[0];
        const factor2 = factor;
        const product = factor1 * factor2;
        
        const validRow = board.findIndex((row) => row[0].product === product && !row[0].marked);
        
        if (validRow !== -1) {
          markCell(validRow, 0, factor1, factor2);
        } else {
          setFeedback(`No ${product} in column 1. Try different factors.`);
          setSelectedFactors([null, null]);
        }
      }
      return;
    }
    
    // Phase 2: Moving clips (after first column)
    // Step A: If no clip is selected to move, player must first click on a clip to move it
    if (movingClip === null) {
      if (factor === selectedFactors[0]) {
        setMovingClip(0);
        setFeedback(`Moving blue clip (currently on ${factor}). Click a new factor to move it to.`);
      } else if (factor === selectedFactors[1]) {
        setMovingClip(1);
        setFeedback(`Moving red clip (currently on ${factor}). Click a new factor to move it to.`);
      } else {
        setFeedback(`Click on a clip to move it first! Blue is on ${selectedFactors[0]}, Red is on ${selectedFactors[1]}.`);
      }
      return;
    }
    
    // Step B: Player has selected a clip, now they're choosing where to move it
    const stayingClip = movingClip === 0 ? 1 : 0;
    const stayingFactor = selectedFactors[stayingClip]!;
    const oldMovingFactor = selectedFactors[movingClip]!;
    
    // Can't move to the same position
    if (factor === oldMovingFactor) {
      setFeedback(`Clip is already on ${factor}. Choose a different factor or click the other clip.`);
      setMovingClip(null);
      return;
    }
    
    // Can't move to where the other clip is
    if (factor === stayingFactor) {
      setFeedback(`The other clip is already there! Choose a different factor.`);
      setMovingClip(null);
      return;
    }
    
    const newProduct = factor * stayingFactor;
    const lastPos = path[path.length - 1];
    const nextCol = currentColumn;
    
    const adjacentRows = [lastPos.row - 1, lastPos.row, lastPos.row + 1].filter(r => r >= 0 && r < 4);
    
    let found = false;
    for (const row of adjacentRows) {
      if (board[row] && board[row][nextCol] && 
          board[row][nextCol].product === newProduct && 
          !board[row][nextCol].marked) {
        // Update the selected factors with the new position
        const newFactors: [number, number] = movingClip === 0 
          ? [factor, stayingFactor] 
          : [stayingFactor, factor];
        markCell(row, nextCol, newFactors[0], newFactors[1]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      setFeedback(`No adjacent ${newProduct} in column ${nextCol + 1}. Try moving the other clip instead.`);
    }
    
    setMovingClip(null);
  };

  const markCell = (row: number, col: number, factor1: number, factor2: number) => {
    const newBoard = board.map((r, ri) =>
      r.map((cell, ci) =>
        ri === row && ci === col ? { ...cell, marked: true } : cell
      )
    );
    setBoard(newBoard);
    
    const newPath = [...path, { row, col }];
    setPath(newPath);
    
    const equation = `${factor1} × ${factor2} = ${factor1 * factor2}`;
    setEquations([...equations, { player: currentPlayer, equation }]);
    
    setSelectedFactors([factor1, factor2]);
    
    if (col === 5) {
      setGameComplete(true);
      setFeedback("🎉 Congratulations! You made it across the board!");
    } else {
      const nextPlayer = currentPlayer === 1 ? 2 : 1;
      setCurrentPlayer(nextPlayer);
      setFeedback(`Player ${nextPlayer}: Move one clip to a new factor to continue the path.`);
    }
  };

  const handleReset = () => {
    setAttempts(attempts + 1);
    const layout = boardLayouts[Math.floor(Math.random() * boardLayouts.length)];
    const newBoard: PathwayCell[][] = layout.map(row =>
      row.map(product => ({ product, marked: false }))
    );
    setBoard(newBoard);
    setPath([]);
    setEquations([]);
    setSelectedFactors([null, null]);
    setMovingClip(null);
    setCurrentPlayer(1);
    setFeedback("Board reset. Start fresh from the first column!");
  };

  const handleFinish = () => {
    const score = Math.max(100 - (attempts * 10), 50);
    const accuracy = Math.round((6 / (6 + attempts)) * 100);
    onComplete(score, accuracy, ['foundational multiplication', 'factor pairs', 'mental math']);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Multiplication Pathways</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-6xl">🛤️</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Work together as a team to create a connected path across the board using multiplication facts!
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200">How to Play:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Player 1 picks two different factors to make a product in the first column</li>
                  <li>Player 2 moves ONE clip to form a new product in the next column</li>
                  <li>Products must be adjacent (touching horizontally or diagonally)</li>
                  <li>Continue until you reach the finish column!</li>
                  <li>If stuck, reset and try again</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={initializeGame} className="bg-purple-600 hover:bg-purple-700" data-testid="start-game-btn">
                  Start Game
                </Button>
                <Button variant="outline" onClick={onExit} data-testid="exit-btn">
                  Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-purple-100 dark:from-green-900 dark:to-purple-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-4 border-green-500">
            <CardHeader className="bg-green-50 dark:bg-green-900/30">
              <div className="text-center space-y-2">
                <div className="text-6xl animate-bounce">🎉</div>
                <CardTitle className="text-3xl text-green-700 dark:text-green-300">
                  Congratulations!
                </CardTitle>
                <p className="text-xl text-green-600 dark:text-green-400 font-semibold">
                  You made it across the board!
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                <p className="text-lg font-medium text-purple-800 dark:text-purple-200">
                  🌟 Amazing teamwork! 🌟
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  You completed the path in {equations.length} moves
                  {attempts === 0 ? " with no resets!" : `.`}
                </p>
                {attempts === 0 && (
                  <p className="text-green-600 dark:text-green-400 font-bold mt-2">
                    ⭐ Perfect Run! ⭐
                  </p>
                )}
              </div>
              {attempts > 0 && (
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Resets needed: {attempts} (Keep practicing to get a perfect run!)
                </p>
              )}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-center">Your Winning Path:</h4>
                <div className="space-y-1 text-sm">
                  {equations.map((eq, i) => (
                    <div key={i} className={`flex items-center gap-2 ${eq.player === 1 ? "text-blue-600" : "text-red-600"}`}>
                      <span className="font-medium">Step {i + 1}:</span>
                      <span>Player {eq.player} - {eq.equation}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={initializeGame} className="bg-purple-600 hover:bg-purple-700" data-testid="play-again-btn">
                  🎮 Play Again
                </Button>
                <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700" data-testid="finish-btn">
                  ✓ Save & Finish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            Multiplication Pathways
          </h1>
          <Button variant="outline" onClick={onExit} data-testid="exit-game-btn">
            Exit Game
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <Badge className={currentPlayer === 1 ? "bg-blue-500" : "bg-red-500"} data-testid="current-player">
            Player {currentPlayer}'s Turn
          </Badge>
          <Badge variant="outline" data-testid="progress">
            Column {path.length + 1} of 6
          </Badge>
        </div>

        {feedback && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center" data-testid="feedback">
            {feedback}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-stretch">
              <div className="flex flex-col justify-center items-center pr-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                <span>S</span>
                <span>T</span>
                <span>A</span>
                <span>R</span>
                <span>T</span>
              </div>
              
              <div className="flex-1">
                <div className="grid grid-cols-6 gap-1">
                  {board.map((row, rowIdx) =>
                    row.map((cell, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={`
                          aspect-square flex items-center justify-center text-lg font-bold rounded border-2
                          ${cell.marked 
                            ? 'bg-green-500 text-white border-green-600' 
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}
                          ${path.length > 0 && path[path.length - 1].row === rowIdx && path[path.length - 1].col === colIdx
                            ? 'ring-4 ring-purple-500'
                            : ''}
                        `}
                        data-testid={`cell-${rowIdx}-${colIdx}`}
                      >
                        {cell.marked ? '✓' : cell.product}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center pl-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                <span>F</span>
                <span>I</span>
                <span>N</span>
                <span>I</span>
                <span>S</span>
                <span>H</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
                {path.length === 0 
                  ? "Place both clips on factors to start:" 
                  : movingClip !== null 
                    ? `Now click where to move the ${movingClip === 0 ? 'blue' : 'red'} clip:` 
                    : "Click a clip to move it:"}
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {factors.map((factor) => {
                  const isBlueClip = selectedFactors[0] === factor;
                  const isRedClip = selectedFactors[1] === factor;
                  const isMovingBlue = movingClip === 0 && isBlueClip;
                  const isMovingRed = movingClip === 1 && isRedClip;
                  
                  return (
                    <Button
                      key={factor}
                      variant={selectedFactors.includes(factor) ? "default" : "outline"}
                      className={`w-12 h-12 text-lg transition-all ${
                        isMovingBlue ? 'bg-blue-500 ring-4 ring-blue-300 animate-pulse' :
                        isMovingRed ? 'bg-red-500 ring-4 ring-red-300 animate-pulse' :
                        isBlueClip ? 'bg-blue-500 hover:bg-blue-600' :
                        isRedClip ? 'bg-red-500 hover:bg-red-600' : ''
                      }`}
                      onClick={() => handleFactorClick(factor)}
                      data-testid={`factor-${factor}`}
                    >
                      {factor}
                    </Button>
                  );
                })}
              </div>
              {selectedFactors[0] !== null && selectedFactors[1] !== null && (
                <p className="text-center mt-2 text-sm">
                  <span className={`font-bold ${movingClip === 0 ? 'text-blue-400 underline' : 'text-blue-600'}`}>
                    Blue clip: {selectedFactors[0]}
                  </span>
                  {' × '}
                  <span className={`font-bold ${movingClip === 1 ? 'text-red-400 underline' : 'text-red-600'}`}>
                    Red clip: {selectedFactors[1]}
                  </span>
                  {' = '}
                  <span className="font-bold">{selectedFactors[0] * selectedFactors[1]}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Card className="flex-1">
            <CardHeader className="py-2">
              <CardTitle className="text-sm text-blue-600">Player 1 Equations</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {equations.filter(e => e.player === 1).map((eq, i) => (
                  <div key={i}>{eq.equation}</div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardHeader className="py-2">
              <CardTitle className="text-sm text-red-600">Player 2 Equations</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {equations.filter(e => e.player === 2).map((eq, i) => (
                  <div key={i}>{eq.equation}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button variant="destructive" onClick={handleReset} data-testid="reset-btn">
            Reset Board
          </Button>
        </div>
      </div>
    </div>
  );
}
