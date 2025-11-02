import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { ProgressOverview } from "@/components/progress-overview";
import { DerivedStrategies } from "@/components/derived-strategies";
import { StudentProgress, FactCategory } from "@shared/schema";

export default function Dashboard() {
  const { data: progress = [] } = useQuery<StudentProgress[]>({
    queryKey: ["/api/students/student-1/progress"],
  });

  const { data: factCategories = [] } = useQuery<FactCategory[]>({
    queryKey: ["/api/fact-categories"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressOverview progress={progress} factCategories={factCategories} />
        
        <DerivedStrategies progress={progress} factCategories={factCategories} />
        
        {/* Bay-Williams & Kling Framework */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Based on Bay-Williams & Kling Framework</h2>
            <p className="text-sm text-gray-600 mb-6">
              This application is inspired by research from Bay-Williams & Kling's Math Fact Fluency framework. 
              It is not an official product of their research.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4 text-center border-2 border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-2xl">🧠</span>
                </div>
                <h3 className="font-semibold text-purple-800 text-sm mb-2">Strategy Focus</h3>
                <p className="text-xs text-purple-700">Practice derived strategies through sustained, meaningful engagement</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-blue-800 text-sm mb-2">Track Progress</h3>
                <p className="text-xs text-blue-700">Monitor accuracy over time, strategies used, and session frequency</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-2xl">🎮</span>
                </div>
                <h3 className="font-semibold text-green-800 text-sm mb-2">Enjoyable Practice</h3>
                <p className="text-xs text-green-700">Games over drills - build fluency through engaging activities</p>
              </div>
            </div>
            
            {/* Attribution */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h4 className="font-medium text-gray-800">Learn More About the Framework</h4>
                  <p className="text-sm text-gray-700 mt-1 mb-3">
                    This app draws inspiration from Bay-Williams & Kling's research on math fact fluency. 
                    Visit their official resources to learn more about the framework.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://kcm.nku.edu/mathfactfluency/index.php" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      <span>Official Research Site →</span>
                    </a>
                    <a 
                      href="https://www.ascd.org/books/math-fact-fluency" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      <span>Math Fact Fluency Book →</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
