import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudentSelectionScreen } from "@/components/student-selection-screen";
import { getCurrentStudentId } from "@/lib/localStorage";
import Dashboard from "@/pages/dashboard";
import LearningPath from "@/pages/learning-path";
import Games from "@/pages/games";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const basePath = isGitHubPages ? '/mathfactmaster' : '';

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/learning-path" component={LearningPath} />
      <Route path="/games" component={Games} />
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
        <WouterRouter base={basePath}>
          <AppRoutes />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
