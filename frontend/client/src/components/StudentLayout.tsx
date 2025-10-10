import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  const handleLogout = () => {
    // Clear all queries and local storage (JWT logout is client-side only)
    queryClient.clear();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Redirect to landing page
    window.location.href = "/landing";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-primary-foreground text-xl animate-pulse"></i>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be handled by the routing
  }

  const studentMenuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: "fas fa-home",
    },
    {
      path: "/aluno/workbook",
      label: "Workbook",
      icon: "fas fa-book",
    },
    {
      path: "/aluno/provas",
      label: "Provas",
      icon: "fas fa-clipboard-check",
    },
    {
      path: "/aluno/cronograma",
      label: "Cronograma",
      icon: "fas fa-calendar-alt",
    },
    {
      path: "/aluno/progresso",
      label: "Meu Progresso",
      icon: "fas fa-chart-line",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/student-area"))
      return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // Mock progress data - replace with real data from API
  const progressData = {
    overall: 65,
    course: "Journey • Intermediário",
    level: "Book 3",
    completedLessons: 23,
    totalLessons: 35,
  };

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar with Profile */}
      <aside className="w-72 hidden md:flex md:flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50">
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">OpenLife</span>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-4" data-testid="profile-section">
            <Avatar className="h-14 w-14 ring-2 ring-blue-500">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate" data-testid="text-student-name">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                Estudante
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Progresso Geral
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400" data-testid="text-progress-percentage">
                  {progressData.overall}%
                </span>
              </div>
              <Progress value={progressData.overall} className="h-2" data-testid="progress-bar-overall" />
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Curso:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-current-course">
                  {progressData.course}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Nível:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-current-level">
                  {progressData.level}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Lições:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-lessons-completed">
                  {progressData.completedLessons}/{progressData.totalLessons}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {studentMenuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/50'
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon}`}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/50 transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="h-14 px-4 flex items-center justify-between">
            <span className="text-base font-semibold">OpenLife</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
