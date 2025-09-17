import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // No mobile, sidebar começa contraído
      if (window.innerWidth < 768) {
        setSidebarExpanded(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all queries and redirect to login
      queryClient.clear();
      window.location.href = '/';
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-background theme-transition">
      <Sidebar expanded={sidebarExpanded} isMobile={isMobile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border shadow-sm px-6 py-4 theme-transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="mr-4 hover:bg-primary/10 transition-colors"
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <ThemeToggle /> 
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="transition-smooth"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-background theme-transition">
          {children}
        </main>
      </div>
    </div>
  );
}