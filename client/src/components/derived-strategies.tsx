import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { StudentProgress, FactCategory } from "@shared/schema";

interface DerivedStrategiesProps {
  progress: StudentProgress[];
  factCategories: FactCategory[];
}

export function DerivedStrategies({ progress, factCategories }: DerivedStrategiesProps) {
  const [, setLocation] = useLocation();
  // Focus on derived strategy categories
  const derivedCategories = factCategories.filter(cat => 
    cat.category === "derived" || 
    cat.name.includes("doubles") || 
    cat.name.includes("near") ||
    cat.name.includes("making") ||
    cat.name.includes("compensation")
  );

  const getProgressForCategory = (categoryId: string) => {
    return progress.find(p => p.factCategoryId === categoryId);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "counting": return "text-red-600";
      case "deriving": return "text-yellow-600";
      case "mastery": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getPhaseProgress = (phase: string) => {
    switch (phase) {
      case "counting": return 25;
      case "deriving": return 65;
      case "mastery": return 100;
      default: return 0;
    }
  };

  const handlePracticeStrategy = (strategyTitle: string) => {
    // Navigate to games page where students can find relevant practice activities
    setLocation("/games");
  };

  const strategySuggestions = [
    {
      title: "Doubles Strategy",
      description: "Use known doubles to solve near doubles",
      example: "7 + 8 = 7 + 7 + 1 = 14 + 1 = 15",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Making Ten",
      description: "Decompose numbers to make friendly tens",
      example: "8 + 5 = 8 + 2 + 3 = 10 + 3 = 13",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Compensation",
      description: "Add a friendly number, then adjust",
      example: "29 + 17 = 30 + 17 - 1 = 47 - 1 = 46",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Break Apart",
      description: "Split numbers into tens and ones",
      example: "34 + 28 = 30 + 20 + 4 + 8 = 50 + 12 = 62",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <section className="mb-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-gray-900">Derived Fact Strategies</CardTitle>
          <CardDescription>
            Build fluency using relationships and number patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {derivedCategories.slice(0, 4).map((category) => {
              const categoryProgress = getProgressForCategory(category.id);
              const phase = categoryProgress?.phase || "counting";
              const accuracy = categoryProgress?.accuracy || 0;
              
              return (
                <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-800">{category.name}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPhaseColor(phase)}`}
                    >
                      {phase}
                    </Badge>
                  </div>
                  <Progress 
                    value={getPhaseProgress(phase)} 
                    className="h-2 mb-2" 
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{accuracy}% accuracy</span>
                    <span className={getPhaseColor(phase)}>
                      {phase === "mastery" ? "Mastered!" : 
                       phase === "deriving" ? "Progressing" : "Beginning"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategy Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {strategySuggestions.map((strategy, index) => (
              <div 
                key={index}
                className={`${strategy.color} rounded-lg p-5 border-2`}
              >
                <h4 className="font-semibold text-gray-800 mb-2">{strategy.title}</h4>
                <p className="text-sm text-gray-700 mb-3">{strategy.description}</p>
                <div className="bg-white/80 rounded p-3 mb-3">
                  <p className="text-sm font-mono text-gray-800">Example: {strategy.example}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs relative z-10"
                  onClick={() => handlePracticeStrategy(strategy.title)}
                  data-testid={`button-practice-${strategy.title.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ pointerEvents: 'auto' }}
                >
                  Practice This Strategy
                </Button>
              </div>
            ))}
          </div>

          {/* Bay-Williams Teaching Note */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">Teaching Focus</h4>
            <p className="text-sm text-amber-700">
              <strong>Bay-Williams & Kling:</strong> Derived strategies help students move from counting 
              to reasoning. Focus on <em>why</em> strategies work, not just <em>how</em> to use them. 
              Encourage students to explain their thinking and make connections between different approaches.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}