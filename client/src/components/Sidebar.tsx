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
    <aside className="w-64 glassmorphism-card border-r border-white/20 flex flex-col shadow-xl backdrop-blur-xl" data-testid="sidebar">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center icon-glow shadow-lg">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">ERP Idiomas</h1>
            <p className="text-xs text-muted-foreground font-medium">Escola de Idiomas</p>
          </div>
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth ${
                    isActive(item.path)
                      ? "gradient-primary text-white shadow-lg icon-glow"
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
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth ${
                          isActive(item.path)
                            ? "gradient-secondary text-white shadow-lg"
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
      <div className="p-4 border-t border-white/20">
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 rounded-xl sidebar-hover transition-smooth text-muted-foreground glassmorphism"
          data-testid="link-support"
        >
          <i className="fas fa-question-circle w-5"></i>
          <span className="text-sm">Suporte</span>
        </a>
      </div>
    </aside>
  );
}
