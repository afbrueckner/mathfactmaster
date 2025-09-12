import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { PersonalizedLearningPath } from "@/components/personalized-learning-path";
import { Student } from "@shared/schema";

export default function LearningPathPage() {
  // Get current student from user management system
  const { data: currentStudent } = useQuery<Student | null>({
    queryKey: ["/api/students/current"]
  });
  
  const currentStudentId = currentStudent?.id || "default-student";

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