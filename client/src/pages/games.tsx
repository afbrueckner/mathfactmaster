import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { GameCard } from "@/components/game-card";
import { RacingBears } from "@/components/games/racing-bears";
import { DoublesBingo } from "@/components/games/doubles-bingo";
import { SumWar } from "@/components/games/sum-war";
import { Trios } from "@/components/games/trios";
import { Salute } from "@/components/games/salute";
import { ThreeDiceTake } from "@/components/games/three-dice-take";
import { LuckyThirteen } from "@/components/games/lucky-thirteen";
import { MultiplicationPathways } from "@/components/games/multiplication-pathways";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game, Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Get current student from user management system
  const { data: currentStudent } = useQuery<Student | null>({
    queryKey: ["/api/students/current"]
  });
  
  const currentStudentId = currentStudent?.id || "default-student";

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const saveGameResultMutation = useMutation({
    mutationFn: async (result: {
      gameId: string;
      score: number;
      accuracy: number;
      timeSpent: number;
      strategiesUsed: string[];
    }) => {
      return apiRequest(`/api/students/${currentStudentId}/game-results`, {
        method: "POST",
        body: JSON.stringify({ ...result, studentId: currentStudentId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", currentStudentId, "game-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", currentStudentId, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", currentStudentId, "points"] });
    }
  });

  const handlePlayGame = (gameId: string) => {
    setCurrentGame(gameId);
  };

  const handleGameComplete = (gameId: string, score: number, accuracy: number, strategies: string[]) => {
    const gameResult = {
      gameId,
      score,
      accuracy,
      timeSpent: 300, // Mock time spent - in real implementation, track actual time
      strategiesUsed: strategies
    };
    
    saveGameResultMutation.mutate(gameResult);
    setCurrentGame(null);
  };

  const handleExitGame = () => {
    setCurrentGame(null);
  };

  const filteredGames = selectedCategory === "all" 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const categories = [
    { value: "all", label: "All Games", count: games.length },
    { value: "foundational", label: "Foundational", count: games.filter(g => g.category === "foundational").length },
    { value: "derived", label: "Derived Strategies", count: games.filter(g => g.category === "derived").length },
    { value: "advanced", label: "Advanced", count: games.filter(g => g.category === "advanced").length },
  ];

  // Render current game if one is selected
  if (currentGame === "racing-bears") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RacingBears 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("racing-bears", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "doubles-bingo") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DoublesBingo 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("doubles-bingo", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "sum-war") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SumWar 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("sum-war", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "trios") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Trios 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("trios", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "salute") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Salute 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("salute", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "three-dice-take") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ThreeDiceTake 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("three-dice-take", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "lucky-thirteen") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LuckyThirteen 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("lucky-thirteen", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  if (currentGame === "multiplication-pathways") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MultiplicationPathways 
            onComplete={(score, accuracy, strategies) => 
              handleGameComplete("multiplication-pathways", score, accuracy, strategies)
            }
            onExit={handleExitGame}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Strategy Practice Games</h2>
                <p className="text-gray-600 mt-1">
                  Build math fact fluency through sustained practice with derived strategies
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🎮</span>
                <Badge variant="secondary" className="text-sm">
                  {filteredGames.length} Games Available
                </Badge>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center space-x-2"
                >
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Educational Philosophy */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-lightbulb text-green-500 mt-1"></i>
                <div>
                  <h4 className="font-medium text-green-800">Enjoyable Practice Over Speed Drills</h4>
                  <p className="text-sm text-green-700 mt-1">
                    These games focus on building understanding and strategic thinking rather than memorization. 
                    Students develop fluency through meaningful practice that emphasizes accuracy, efficiency, flexibility, and appropriate strategy use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              {selectedCategory === "all" ? "All Games" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Games`}
            </h3>
            
            {filteredGames.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onPlay={handlePlayGame} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
                <h4 className="text-lg font-medium text-gray-500 mb-2">No games found</h4>
                <p className="text-gray-400">Try selecting a different category</p>
              </div>
            )}
          </div>
        </section>

        {/* Game Categories Explanation */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Understanding Game Categories</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">Foundational Facts</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Games that focus on basic fact patterns and number relationships that serve as building blocks.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Addition: +/- 1 or 2, doubles, combinations of 10</li>
                  <li>• Multiplication: 2s, 5s, 10s, 0s, 1s, squares</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2">Derived Strategies</h4>
                <p className="text-sm text-green-700 mb-3">
                  Games that teach reasoning strategies based on foundational facts already mastered.
                </p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Addition: near doubles, making ten, pretend-a-ten</li>
                  <li>• Multiplication: adding groups, doubling, nearby squares</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-800 mb-2">Advanced Practice</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Games that combine multiple operations and require strategic thinking across fact families.
                </p>
                <ul className="text-xs text-orange-600 space-y-1">
                  <li>• Mixed operations</li>
                  <li>• Strategic thinking</li>
                  <li>• Problem solving</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Research Foundation */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Research Foundation</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <blockquote className="text-sm text-gray-700 italic mb-3">
                "Instead of using timed tests, teachers should engage students with substantial and enjoyable practice, 
                using games that develop all components of fluency: accuracy, efficiency, flexibility, and appropriate strategy use."
              </blockquote>
              <cite className="text-xs text-gray-600">- Bay-Williams & Kling, Math Fact Fluency Framework</cite>
              
              <div className="mt-4 flex items-center space-x-4">
                <a 
                  href="https://kcm.nku.edu/mathfactfluency/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                >
                  <i className="fas fa-external-link-alt"></i>
                  <span>Original Research Site</span>
                </a>
                <a 
                  href="https://www.ascd.org/books/math-fact-fluency" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                >
                  <i className="fas fa-book"></i>
                  <span>Math Fact Fluency Book</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
