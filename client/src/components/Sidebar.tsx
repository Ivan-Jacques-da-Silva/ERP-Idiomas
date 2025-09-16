import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const canAccess = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const menuItems = [
    {
      path: "/",
      icon: "fas fa-chart-line",
      label: "Dashboard",
      roles: ["admin", "teacher", "secretary", "financial", "student", "developer"]
    },
    {
      path: "/units",
      icon: "fas fa-building",
      label: "Unidades",
      roles: ["admin", "developer", "secretary"]
    },
    {
      path: "/staff",
      icon: "fas fa-users",
      label: "Colaboradores", 
      roles: ["admin", "developer"]
    },
    {
      path: "/students",
      icon: "fas fa-user-graduate",
      label: "Alunos",
      roles: ["admin", "secretary", "teacher", "developer"]
    },
    {
      path: "/schedule",
      icon: "fas fa-calendar-alt",
      label: "Agenda",
      roles: ["admin", "teacher", "secretary", "developer"]
    },
    {
      path: "/student-area",
      icon: "fas fa-book-open",
      label: "Área do Aluno",
      roles: ["student"]
    }
  ];

  const systemMenuItems = [
    {
      path: "/permissions",
      icon: "fas fa-shield-alt",
      label: "Permissões",
      roles: ["admin", "developer"]
    },
    {
      path: "/settings",
      icon: "fas fa-cog",
      label: "Configurações",
      roles: ["admin", "developer"]
    }
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shadow-lg" data-testid="sidebar">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">EduManage</h1>
            <p className="text-xs text-muted-foreground">Escola de Idiomas</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>
              <i className="fas fa-user text-muted-foreground text-sm"></i>
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-role">
              {user?.role === 'admin' && 'Administrador'}
              {user?.role === 'teacher' && 'Professor'}
              {user?.role === 'secretary' && 'Secretário'}
              {user?.role === 'financial' && 'Financeiro'}
              {user?.role === 'student' && 'Aluno'}
              {user?.role === 'developer' && 'Desenvolvedor'}
            </p>
          </div>
          <i className="fas fa-chevron-down text-muted-foreground text-xs"></i>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {/* Main Menu Items */}
          {menuItems
            .filter(item => canAccess(item.roles))
            .map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground sidebar-hover"
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5`}></i>
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              </Link>
            ))}

          {/* Sistema Section */}
          {systemMenuItems.some(item => canAccess(item.roles)) && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Sistema
              </p>
              <div className="space-y-1">
                {systemMenuItems
                  .filter(item => canAccess(item.roles))
                  .map((item) => (
                    <Link key={item.path} href={item.path}>
                      <a
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth ${
                          isActive(item.path)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground sidebar-hover"
                        }`}
                        data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <i className={`${item.icon} w-5`}></i>
                        <span className="text-sm">{item.label}</span>
                      </a>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Support Section */}
      <div className="p-4 border-t border-border">
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg sidebar-hover transition-smooth text-muted-foreground"
          data-testid="link-support"
        >
          <i className="fas fa-question-circle w-5"></i>
          <span className="text-sm">Suporte</span>
        </a>
      </div>
    </aside>
  );
}
