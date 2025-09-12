import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { PersonalizedLearningPath } from "@/components/personalized-learning-path";
import { getCurrentStudentId } from "@/lib/localStorage";
import { Student } from "@shared/schema";

export default function LearningPathPage() {
  // Get current student ID from localStorage-based user management
  const currentStudentId = getCurrentStudentId();
  
  // Fallback if no student is selected
  if (!currentStudentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 font-serif mb-4">Your Learning Path</h1>
            <p className="text-gray-600">
              Please select a student profile to view personalized learning recommendations.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Learning Path</h1>
          <p className="text-gray-600 mt-2">
            Discover personalized recommendations based on your math fact fluency progress and the Bay-Williams & Kling framework
          </p>
        </div>

        <PersonalizedLearningPath studentId={currentStudentId} />
      </main>
    </div>
  );
}