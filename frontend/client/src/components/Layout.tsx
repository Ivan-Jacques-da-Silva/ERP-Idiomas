import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import StudentLayout from "@/components/StudentLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, Settings, Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from 'wouter';


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();

  // Use StudentLayout for students
  if (user?.role === 'student') {
    return <StudentLayout>{children}</StudentLayout>;
  }
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erro ao fazer logout');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      // Redirecionar para a página de login
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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

  


  return (
    <div className="flex h-screen bg-background theme-transition">
      <Sidebar expanded={sidebarExpanded} isMobile={isMobile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50/50 border-b border-gray-100/80 navbar-shadow backdrop-blur-sm dark:bg-gray-900/50 dark:border-gray-800/50 theme-transition">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hover:bg-primary/10 transition-colors"
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {user && (
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-accent/50 rounded-lg p-2 transition-colors cursor-pointer focus:outline-none" data-testid="dropdown-user">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'admin' && 'Administrador'}
                      {user.role === 'teacher' && 'Professor'}
                      {user.role === 'secretary' && 'Secretário'}
                      {user.role === 'student' && 'Estudante'}
                    </p>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" style={{ zIndex: 999999 }}>
                <DropdownMenuItem className="cursor-default" data-testid="menu-item-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-default" data-testid="menu-item-notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notificações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  data-testid="menu-item-logout"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <main className="flex-1 overflow-auto p-6 bg-background theme-transition">
          {children}
        </main>
      </div>
    </div>
  );
}