import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { QuickLooksDisplay } from "@/components/quick-looks-display";
import { QuickLooksAnalytics } from "@/components/quick-looks-analytics";
import { QuickLooksDemoGuide } from "@/components/quick-looks-demo-guide";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Student } from "@shared/schema";

export default function QuickLooks() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const queryClient = useQueryClient();
  
  // Get current student from user management system
  const { data: currentStudent } = useQuery<Student | null>({
    queryKey: ["/api/students/current"]
  });
  
  const currentStudentId = currentStudent?.id || "default-student";

  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      visualType: string;
      quantity: number;
      responses: any;
      accuracy: boolean;
      strategy: string;
    }) => {
      return apiRequest(`/api/students/${currentStudentId}/quick-looks`, {
        method: "POST",
        body: sessionData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", currentStudentId, "quick-looks"] });
    }
  });

  const handleStartSession = () => {
    setIsSessionActive(true);
  };

  const handleCompleteSession = (responses: {
    visualDescription: string;
    strategy: string;
    numberSentence: string;
  }) => {
    // In a real implementation, this would analyze the responses for accuracy
    const sessionData = {
      visualType: "dots",
      quantity: 6, // This would be the actual quantity shown
      responses: responses,
      accuracy: true, // This would be determined by analysis
      strategy: responses.strategy
    };

    saveSessionMutation.mutate(sessionData);
    setIsSessionActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header student={defaultStudent} />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Quick Looks Practice</h2>
                <p className="text-gray-600 mt-1">
                  Build visual number sense and encourage mathematical discussion
                </p>
              </div>
              {!isSessionActive && (
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="teacher-mode"
                      checked={teacherMode}
                      onChange={(e) => setTeacherMode(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="teacher-mode" className="text-sm text-gray-600">
                      Teacher Mode (Record Observations)
                    </label>
                  </div>
                  <Button 
                    onClick={handleStartSession}
                    className="bg-primary-500 text-white hover:bg-primary-600"
                  >
                    <i className="fas fa-eye mr-2"></i>Start Quick Look
                  </Button>
                </div>
              )}
            </div>
            
            {isSessionActive ? (
              <QuickLooksDisplay 
                onComplete={handleCompleteSession} 
                studentId={defaultStudent.id}
                enableTeacherMode={teacherMode}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-eye text-primary-500 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Ready for Quick Looks?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Quick Looks help you develop visual number sense by showing mathematical arrangements for just a few seconds. 
                  You'll then discuss what you saw and how you saw it, connecting visual representations to number concepts.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <i className="fas fa-eye text-blue-500 text-2xl mb-3"></i>
                    <h4 className="font-semibold text-blue-800 mb-2">Visual Display</h4>
                    <p className="text-sm text-blue-700">
                      Mathematical patterns appear briefly to encourage quick recognition
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <i className="fas fa-comments text-green-500 text-2xl mb-3"></i>
                    <h4 className="font-semibold text-green-800 mb-2">Discussion</h4>
                    <p className="text-sm text-green-700">
                      Share what you saw and how you organized the visual information
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <i className="fas fa-equals text-purple-500 text-2xl mb-3"></i>
                    <h4 className="font-semibold text-purple-800 mb-2">Connection</h4>
                    <p className="text-sm text-purple-700">
                      Link visual representations to number sentences and equations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Analytics and Learning Objectives */}
        <Tabs defaultValue="guide" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guide">How to Use</TabsTrigger>
            <TabsTrigger value="objectives">Learning Framework</TabsTrigger>
            <TabsTrigger value="analytics">Progress & Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guide">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <QuickLooksDemoGuide />
            </div>
          </TabsContent>
          
          <TabsContent value="objectives">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Through Quick Looks</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">What Quick Looks Develop:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span>Visual number recognition and subitizing skills</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span>Multiple ways of seeing mathematical relationships</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span>Mathematical communication and vocabulary</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span>Connection between visual and symbolic representations</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Research Foundation:</h4>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <blockquote className="text-sm text-blue-800 italic">
                    "A major goal of using quick looks is to encourage children to progress beyond Phase 1 (counting). 
                    Through class discussion, children can hear and begin to assimilate more sophisticated strategies shared by their peers."
                  </blockquote>
                  <cite className="text-xs text-blue-600 mt-2 block">- Bay-Williams & Kling Framework</cite>
                </div>
              </div>
            </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <QuickLooksAnalytics studentId={defaultStudent.id} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
