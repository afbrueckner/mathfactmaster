import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentProgress, FactCategory } from '@shared/schema';
import { LearningPathEngine, LearningPath, LearningPathRecommendation, Milestone } from '@shared/learningPath';
import { getProgress, getFactCategories } from '@/lib/localStorage';

interface PersonalizedLearningPathProps {
  studentId: string;
}

export function PersonalizedLearningPath({ studentId }: PersonalizedLearningPathProps) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLearningPath = async () => {
      try {
        setIsLoading(true);
        
        // Get data from localStorage
        const studentProgress = getProgress();
        const factCategories = getFactCategories();
        
        // Analyze learning path if we have data
        if (studentProgress.length > 0 && factCategories.length > 0) {
          const analysis = LearningPathEngine.analyzeLearningPath({
            studentProgress,
            factCategories,
            studentId
          });
          setLearningPath(analysis);
        } else {
          // Generate default learning path for new students
          const defaultAnalysis = LearningPathEngine.analyzeLearningPath({
            studentProgress: [],
            factCategories,
            studentId
          });
          setLearningPath(defaultAnalysis);
        }
      } catch (error) {
        console.error('Error loading learning path:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLearningPath();
  }, [studentId]);

  if (isLoading || !learningPath) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your learning path...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Your Personalized Math Journey</CardTitle>
          <CardDescription>
            Based on your current progress and the Bay-Williams & Kling framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Current Phase</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {learningPath.currentPhase === 'counting' ? '🔢' : 
                   learningPath.currentPhase === 'deriving' ? '🧠' : '⚡'}
                </span>
                <span className="text-lg font-medium capitalize">{learningPath.currentPhase}</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Overall Accuracy</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-medium">{learningPath.overallProgress.accuracy}%</span>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Speed & Efficiency</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="text-lg font-medium">{learningPath.overallProgress.efficiency}%</span>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Strategy Use</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💭</span>
                <span className="text-lg font-medium">{learningPath.overallProgress.strategyUse}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="growth">Growth Areas</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your current progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningPath.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
              {learningPath.recommendations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="font-medium">Great work! Keep practicing to maintain your skills.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">💪</span>
                Your Math Strengths
              </CardTitle>
              <CardDescription>
                Areas where you're doing really well
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {learningPath.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <span className="font-medium text-green-800">{strength}</span>
                    </div>
                  </div>
                ))}
                {learningPath.strengths.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>Keep practicing to build your strengths!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                Growth Opportunities
              </CardTitle>
              <CardDescription>
                Areas where you can improve with focused practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {learningPath.growthAreas.map((area, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <span className="font-medium text-blue-800">{area}</span>
                    </div>
                  </div>
                ))}
                {learningPath.growthAreas.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>You're doing well across all areas!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Upcoming Milestones
              </CardTitle>
              <CardDescription>
                Goals to work toward in the coming weeks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningPath.nextMilestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
              {learningPath.nextMilestones.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="font-medium">You've achieved all your current milestones!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: LearningPathRecommendation }) {
  const [, setLocation] = useLocation();
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⭐';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  const handleStartPractice = () => {
    // Navigate to games page to start practicing
    setLocation('/games');
  };

  const handleLearnMore = () => {
    // Navigate to assessment page for more detailed analysis
    setLocation('/assessment');
  };

  return (
    <div className={`rounded-lg p-4 border-2 ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getPriorityIcon(recommendation.priority)}</span>
          <h4 className="font-semibold">{recommendation.title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {recommendation.priority} priority
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {recommendation.estimatedTime} min
          </Badge>
        </div>
      </div>
      
      <p className="text-sm mb-4">{recommendation.description}</p>
      
      {recommendation.suggestedActivities.length > 0 && (
        <div className="mb-4">
          <h5 className="font-medium text-sm mb-2">Suggested Activities:</h5>
          <div className="space-y-2">
            {recommendation.suggestedActivities.map((activity, index) => (
              <div key={index} className="bg-white rounded p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{activity.name}</span>
                  <span className="text-gray-500">{activity.duration} min</span>
                </div>
                <p className="text-gray-600 mt-1">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button size="sm" className="text-xs" onClick={handleStartPractice}>
          Start Practice
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={handleLearnMore}>
          Learn More
        </Button>
      </div>
    </div>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const [, setLocation] = useLocation();
  const daysUntilTarget = Math.ceil((milestone.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className={`rounded-lg p-4 border-2 ${milestone.isCompleted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{milestone.isCompleted ? '✅' : '🎯'}</span>
          <h4 className="font-semibold">{milestone.title}</h4>
        </div>
        <Badge variant={milestone.isCompleted ? 'default' : 'secondary'} className="text-xs">
          {milestone.isCompleted ? 'Completed' : `${daysUntilTarget} days`}
        </Badge>
      </div>
      
      <p className="text-sm mb-3">{milestone.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Target: {milestone.targetDate.toLocaleDateString()}</span>
        <span>Required Accuracy: {milestone.requiredAccuracy}%</span>
      </div>
      
      {!milestone.isCompleted && (
        <div className="mt-3">
          <Button 
            size="sm" 
            className="text-xs w-full"
            onClick={() => setLocation('/games')}
          >
            Work Toward This Goal
          </Button>
        </div>
      )}
    </div>
  );
}