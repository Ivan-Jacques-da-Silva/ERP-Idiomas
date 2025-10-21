import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  expanded: boolean;
  isMobile: boolean;
}

export default function Sidebar({ expanded, isMobile }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  // Get role-based permissions for access control
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/auth/effective-permissions'],
    enabled: !!user?.id,
    retry: false,
  });

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const canAccess = (permissionName: string) => {
    // Admin role always has access (failsafe)
    if (user?.role === 'admin') {
      return true;
    }

    // If role permissions are still loading, don't show any menu items (eliminates flicker)
    if (permissionsLoading) {
      return false;
    }

    // If role permissions haven't loaded yet or are malformed, deny access
    if (!rolePermissions || !Array.isArray((rolePermissions as any)?.permissions)) {
      return false;
    }

    // Check if user's role has the specific permission
    return (rolePermissions as any).permissions.some((permission: any) => 
      permission.name === permissionName
    );
  };

  const menuItems = [
    {
      path: "/",
      icon: "fas fa-chart-line",
      label: "Dashboard",
      permission: "dashboard:read"
    },
    {
      path: "/units",
      icon: "fas fa-building",
      label: "Unidades",
      permission: "units:read"
    },
    {
      path: "/staff",
      icon: "fas fa-users",
      label: "Colaboradores", 
      permission: "staff:read"
    },
    {
      path: "/students",
      icon: "fas fa-user-graduate",
      label: "Alunos",
      permission: "students:read"
    },
    {
      path: "/courses",
      icon: "fas fa-book",
      label: "Cursos",
      permission: "courses:read"
    },
    {
      path: "/schedule",
      icon: "fas fa-calendar-alt",
      label: "Agenda",
      permission: "classes:read"
    },
    {
      path: "/teacher-individual-schedule",
      icon: "fas fa-calendar-week",
      label: "Agenda Individual",
      permission: "teacher_schedule:manage"
    },
    {
      path: "/student-area",
      icon: "fas fa-book-open",
      label: "Área do Aluno",
      permission: "lessons:read",
      hideForAdmin: true
    }
  ];

  const systemMenuItems = [
    {
      path: "/financial",
      icon: "fas fa-dollar-sign",
      label: "Financeiro",
      permission: "finance:read"
    },
    {
      path: "/settings",
      icon: "fas fa-cog",
      label: "Configurações",
      permission: "settings:read"
    },
    {
      path: "/permissions",
      icon: "fas fa-shield-alt",
      label: "Permissões",
      permission: "permissions:manage"
    },
    {
      path: "/support",
      icon: "fas fa-question-circle",
      label: "Suporte",
      permission: "support:read"
    }
  ];

  const { toast } = useToast();

  const handleLogout = () => {
    // Clear authentication data (JWT logout is client-side only)
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Redirect to login page
    window.location.href = '/';
  };

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
              <h1 className="text-xl font-bold text-gradient whitespace-nowrap">OpenLife</h1>
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
            .filter(item => canAccess(item.permission))
            .filter(item => !(user?.role === 'admin' && item.hideForAdmin))
            .map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center ${expanded ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-xl transition-smooth group relative ${
                  isActive(item.path)
                    ? 'gradient-primary text-white shadow-lg icon-glow'
                    : 'text-muted-foreground sidebar-hover'
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
              </Link>
            ))}

          {/* Sistema Section */}
          {(systemMenuItems.some(item => canAccess(item.permission)) || user) && (
            <div className="pt-4">
              {expanded && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Sistema
                </p>
              )}
              <div className="space-y-1">
                {systemMenuItems
                  .filter(item => item.path === '/support' ? !!user : canAccess(item.permission))
                  .map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center ${expanded ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-xl transition-smooth group relative ${
                        isActive(item.path)
                          ? 'gradient-secondary text-white shadow-lg'
                          : 'text-muted-foreground sidebar-hover'
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
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile & Logout */}
      {user && (
        <div className={`${expanded ? 'p-4' : 'p-2'} border-t border-white/20 mt-auto`}>
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3 overflow-hidden">
              <Avatar>
                <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                <AvatarFallback>
                  {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              {expanded && (
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate" title={user.name}>{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate" title={user.email}>{user.email}</p>
                </div>
              )}
            </div>
            {expanded && (
              <button
                onClick={handleLogout}
                className="ml-auto p-2 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Logout"
                title="Sair do sistema"
              >
                <i className="fas fa-sign-out-alt text-lg"></i>
              </button>
            )}
             {!expanded && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Logout"
                title="Sair do sistema"
              >
                <i className="fas fa-sign-out-alt text-lg"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
