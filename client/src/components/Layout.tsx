import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">EduManage</h1>
              <span className="text-sm text-muted-foreground">
                {user?.role === 'admin' && 'Administrador'}
                {user?.role === 'teacher' && 'Professor'}
                {user?.role === 'secretary' && 'Secretário'}
                {user?.role === 'financial' && 'Financeiro'}
                {user?.role === 'student' && 'Aluno'}
                {user?.role === 'developer' && 'Desenvolvedor'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
                  data-testid="input-header-search"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-smooth">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </button>

              {/* User Menu */}
              <button 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-user-menu"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-primary-foreground text-sm"></i>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.firstName || 'Usuário'}
                </span>
                <i className="fas fa-chevron-down text-muted-foreground text-xs"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {children}
      </main>
    </div>
  );
}
