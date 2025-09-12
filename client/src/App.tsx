import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudentSelectionScreen } from "@/components/student-selection-screen";
import { getCurrentStudentId } from "@/lib/localStorage";
import Dashboard from "@/pages/dashboard";
import LearningPath from "@/pages/learning-path";
import QuickLooks from "@/pages/quick-looks";
import Games from "@/pages/games";
import Assessment from "@/pages/assessment";
import StudentRewards from "@/pages/student-rewards";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/learning-path" component={LearningPath} />
      <Route path="/quick-looks" component={QuickLooks} />
      <Route path="/games" component={Games} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/student-rewards" component={StudentRewards} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const currentStudentId = getCurrentStudentId();
  
  // Show student selection screen if no student is selected
  if (!currentStudentId) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <StudentSelectionScreen />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
