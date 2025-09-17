import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  expanded: boolean;
  isMobile: boolean;
}

export default function Sidebar({ expanded, isMobile }: SidebarProps) {
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
      path: "/courses",
      icon: "fas fa-book",
      label: "Cursos",
      roles: ["admin", "developer", "secretary"]
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
    <aside 
      className={`${
        expanded ? (isMobile ? 'w-64' : 'w-64') : 'w-16'
      } ${
        isMobile && !expanded ? 'hidden' : ''
      } glassmorphism-card border-r border-white/20 flex flex-col shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden ${
        isMobile && expanded ? 'fixed inset-y-0 left-0 z-50' : ''
      }`} 
      data-testid="sidebar"
    >
      {/* Logo & Brand */}
      <div className={`${expanded ? 'p-6' : 'p-3'} border-b border-white/20 transition-all duration-300`}>
        <div className={`flex items-center ${expanded ? 'space-x-3' : 'justify-center'}`}>
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center icon-glow shadow-lg flex-shrink-0">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-gradient whitespace-nowrap">ERP Idiomas</h1>
              <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Escola de Idiomas</p>
            </div>
          )}
        </div>
      </div>


      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${expanded ? 'p-4' : 'p-2'} transition-all duration-300`}>
        <div className="space-y-2">
          {/* Main Menu Items */}
          {menuItems
            .filter(item => canAccess(item.roles))
            .map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center ${expanded ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-xl transition-smooth group relative ${
                    isActive(item.path)
                      ? "gradient-primary text-white shadow-lg icon-glow"
                      : "text-muted-foreground sidebar-hover"
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  title={!expanded ? item.label : undefined}
                >
                  <i className={`${item.icon} w-5 flex-shrink-0`}></i>
                  {expanded && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                  {!expanded && (
                    <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </a>
              </Link>
            ))}

          {/* Sistema Section */}
          {systemMenuItems.some(item => canAccess(item.roles)) && (
            <div className="pt-4">
              {expanded && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Sistema
                </p>
              )}
              <div className="space-y-1">
                {systemMenuItems
                  .filter(item => canAccess(item.roles))
                  .map((item) => (
                    <Link key={item.path} href={item.path}>
                      <a
                        className={`flex items-center ${expanded ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-xl transition-smooth group relative ${
                          isActive(item.path)
                            ? "gradient-secondary text-white shadow-lg"
                            : "text-muted-foreground sidebar-hover"
                        }`}
                        data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        title={!expanded ? item.label : undefined}
                      >
                        <i className={`${item.icon} w-5 flex-shrink-0`}></i>
                        {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                        {!expanded && (
                          <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                      </a>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Support Section */}
      <div className={`${expanded ? 'p-4' : 'p-2'} border-t border-white/20 transition-all duration-300 overflow-hidden`}>
        <a 
          href="#" 
          className={`flex items-center ${expanded ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-xl sidebar-hover transition-smooth text-muted-foreground glassmorphism group relative`}
          data-testid="link-support"
          title={!expanded ? "Suporte" : undefined}
        >
          <i className="fas fa-question-circle w-5 flex-shrink-0"></i>
          {expanded && <span className="text-sm whitespace-nowrap">Suporte</span>}
          {!expanded && (
            <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              Suporte
            </div>
          )}
        </a>
      </div>
    </aside>
  );
}