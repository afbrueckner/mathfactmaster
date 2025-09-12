import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { AssessmentTools } from "@/components/assessment-tools";
import { AssessmentObservation, Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Assessment() {
  const queryClient = useQueryClient();
  
  // Get current student from user management system
  const { data: currentStudent } = useQuery<Student | null>({
    queryKey: ["/api/students/current"]
  });
  
  const currentStudentId = currentStudent?.id || "default-student";

  const { data: observations = [] } = useQuery<AssessmentObservation[]>({
    queryKey: ["/api/students", currentStudentId, "observations"],
  });

  const addObservationMutation = useMutation({
    mutationFn: async (observation: {
      observationType: string;
      content: string;
      factArea: string;
      phase: string;
    }) => {
      return apiRequest(`/api/students/${currentStudentId}/observations`, {
        method: "POST",
        body: JSON.stringify({ ...observation, studentId: currentStudentId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", currentStudentId, "observations"] });
    }
  });

  const handleAddObservation = (observation: {
    observationType: string;
    content: string;
    factArea: string;
    phase: string;
  }) => {
    addObservationMutation.mutate(observation);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Assessment & Progress Monitoring</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Assessment Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Research-Based Assessment Approach</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-800 mb-2">Beyond Accuracy</h4>
                    <p className="text-sm text-blue-700">
                      True fluency assessment examines accuracy, efficiency, flexibility, and appropriate strategy use—not just speed.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <h4 className="font-medium text-green-800 mb-2">Understanding Over Speed</h4>
                    <p className="text-sm text-green-700">
                      We focus on mathematical thinking and reasoning rather than timed performance that can create anxiety.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <h4 className="font-medium text-purple-800 mb-2">Long-Term Development</h4>
                    <p className="text-sm text-purple-700">
                      Fluency develops over months and years. Patience and consistent practice lead to lasting mastery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Chart Placeholder */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Over Time</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-500">
                      <i className="fas fa-chart-line text-2xl mb-2"></i>
                      <p className="text-sm">Progress Chart</p>
                      <p className="text-xs">Shows fluency development over months</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Tools */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <AssessmentTools 
              observations={observations}
              onAddObservation={handleAddObservation}
            />
          </div>
        </section>

        {/* No Timed Tests Explanation */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <i className="fas fa-ban text-red-500 text-2xl mt-1"></i>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Why We Don't Use Timed Tests</h3>
                  <div className="space-y-3 text-sm text-red-700">
                    <p>
                      <strong>Research Evidence:</strong> Studies show that timed tests can create math anxiety and don't accurately 
                      assess fluency components like flexibility and strategic thinking.
                    </p>
                    <p>
                      <strong>NCTM Position:</strong> "Schools and districts must prioritize meaningful learning of basic number 
                      combinations and remove inequitable structures and practices (e.g., timed tests, drills, rote memorization) 
                      that have unintended and life-long negative consequences on children" (NCTM, 2020).
                    </p>
                    <p>
                      <strong>Our Approach:</strong> We use observation, interviews, and authentic assessment during game play 
                      to understand how students think mathematically and solve problems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Criteria */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">What We Assess</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-check text-green-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Accuracy</h4>
                <p className="text-sm text-gray-600">
                  Correct solutions and understanding of mathematical relationships
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-tachometer-alt text-blue-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Efficiency</h4>
                <p className="text-sm text-gray-600">
                  Using effective methods without unnecessary steps
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-random text-purple-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Flexibility</h4>
                <p className="text-sm text-gray-600">
                  Using multiple strategies and adapting approaches
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-lightbulb text-orange-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Strategy Use</h4>
                <p className="text-sm text-gray-600">
                  Selecting appropriate strategies for different problems
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phase Assessment */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Assessing Learning Phases</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
                <h4 className="font-semibold text-primary-800 mb-2">Phase 1: Counting</h4>
                <p className="text-sm text-primary-700 mb-3">
                  Students use objects, fingers, or mental counting to solve problems.
                </p>
                <div className="text-xs text-primary-600">
                  <p><strong>Look for:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Counting on fingers or objects</li>
                    <li>Skip counting patterns</li>
                    <li>One-by-one counting strategies</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-secondary-50 rounded-lg p-4 border-l-4 border-secondary-500">
                <h4 className="font-semibold text-secondary-800 mb-2">Phase 2: Deriving</h4>
                <p className="text-sm text-secondary-700 mb-3">
                  Students use reasoning strategies based on known facts.
                </p>
                <div className="text-xs text-secondary-600">
                  <p><strong>Look for:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Using doubles to solve near doubles</li>
                    <li>Making ten strategies</li>
                    <li>Breaking apart numbers</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-800 mb-2">Phase 3: Mastery</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Students produce answers efficiently with little hesitation.
                </p>
                <div className="text-xs text-orange-600">
                  <p><strong>Look for:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Quick, accurate responses</li>
                    <li>Automatic recall</li>
                    <li>Appropriate strategy selection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
