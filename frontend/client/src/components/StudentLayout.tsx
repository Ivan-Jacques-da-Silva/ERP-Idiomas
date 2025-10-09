import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Menu, Settings, Bell, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex md:flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">OpenLife</span>
        </div>
        <nav className="p-3 space-y-1">
          {studentMenuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/50'
                }`}>
                <i className={`${item.icon}`}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/50">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="h-14 px-4 flex items-center justify-between">
            <span className="text-base font-semibold">OpenLife</span>
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
