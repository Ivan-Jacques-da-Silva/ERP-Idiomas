import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Units from "@/pages/Units";
import Staff from "@/pages/Staff";
import Students from "@/pages/Students";
import Courses from "@/pages/Courses";
import Schedule from "@/pages/Schedule";
import StudentArea from "@/pages/StudentArea";
import TeacherArea from "@/pages/TeacherArea";
import Financial from "@/pages/Financial";
import Permissions from "@/pages/Permissions";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import StudentProgress from "@/pages/StudentProgress";
import StudentSchedule from "@/pages/StudentSchedule";
import StudentWorkbook from "@/pages/StudentWorkbook";
import StudentExams from "@/pages/StudentExams";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/landing" component={Landing} />
          <Route path="/" component={Landing} />
        </>
      ) : user?.role === 'student' ? (
        <>
          <Route path="/" component={StudentArea} />
          <Route path="/student-area" component={StudentArea} />
          <Route path="/support" component={Support} />
          <Route path="/aluno/workbook" component={StudentWorkbook} />
          <Route path="/aluno/provas" component={StudentExams} />
          <Route path="/aluno/cronograma" component={StudentSchedule} />
          <Route path="/aluno/progresso" component={StudentProgress} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/units" component={Units} />
          <Route path="/staff" component={Staff} />
          <Route path="/students" component={Students} />
          <Route path="/courses" component={Courses} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/professor" component={TeacherArea} />
          <Route path="/financial" component={Financial} />
          <Route path="/permissions" component={Permissions} />
          <Route path="/settings" component={Settings} />
          <Route path="/support" component={Support} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="theme-transition">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;