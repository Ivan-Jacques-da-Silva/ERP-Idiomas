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
        <Route path="/" component={Landing} />
      ) : user?.role === 'student' ? (
        <>
          <Route path="/" component={StudentArea} />
          <Route path="/student-area" component={StudentArea} />
          <Route path="/aluno/workbook" component={() => <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Workbook Digital</h1><p className="text-gray-600 dark:text-gray-400">Página em construção</p></div></div>} />
          <Route path="/aluno/provas" component={() => <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Área de Provas</h1><p className="text-gray-600 dark:text-gray-400">Página em construção</p></div></div>} />
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