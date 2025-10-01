import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

// Demo users for display
const demoUsers = [
  { email: 'admin@demo.com', password: 'demo123', role: 'Administrador', disabled: false },
  { email: 'teacher@demo.com', password: 'demo123', role: 'Professor', disabled: false },
  { email: 'secretary@demo.com', password: 'demo123', role: 'Secretário', disabled: false },
  { email: 'student@demo.com', password: 'demo123', role: 'Aluno', disabled: true },
];

export default function Landing() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; animationDelay: number }>>([]);

  useEffect(() => {
    // Generate random stars for the background
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          animationDelay: Math.random() * 3
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to main app
      window.location.href = '/';
    },
    onError: (error: Error) => {
      setErrorModal({ open: true, message: error.message });
    },
  });

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  const setDemoUser = (user: { email: string; password: string }) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Theme Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Left Column - Welcome Section with Stars */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-900 via-purple-700 to-purple-800 overflow-hidden">
        {/* Stars Animation */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-8 lg:px-12 text-white w-full">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/30">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
            Bem-vindo ao Portal
          </h1>

          <h2 className="text-3xl font-semibold mb-6 text-orange-100">
            OpenLife
          </h2>

          <p className="text-xl text-orange-200 mb-8 max-w-md leading-relaxed">
            Sistema completo de gestão escolar para escolas de idiomas. 
            Gerencie alunos, professores, horários e muito mais.
          </p>

          <div className="grid grid-cols-2 gap-4 lg:gap-6 mt-8 w-full max-w-sm mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <i className="fas fa-users text-white text-lg lg:text-2xl"></i>
              </div>
              <p className="text-xs lg:text-sm text-orange-200">Gestão de Alunos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <i className="fas fa-calendar-alt text-white text-lg lg:text-2xl"></i>
              </div>
              <p className="text-xs lg:text-sm text-orange-200">Agenda Inteligente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-black theme-transition min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-primary-foreground text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-foreground">OpenLife</h1>
            <p className="text-muted-foreground">Sistema de Gestão Escolar</p>
          </div>


          <Card className="shadow-2xl glassmorphism-card mb-6 theme-transition">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Login Demonstrativo
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Escolha um usuário demo ou digite suas credenciais
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Demo Users */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Usuários Demo:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoUsers.map((user, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => !user.disabled && setDemoUser(user)}
                      disabled={user.disabled}
                      className={`h-auto p-3 flex flex-col items-start border-gray-200 dark:border-gray-600 text-left transition-all duration-200 ${
                        user.disabled 
                          ? 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed' 
                          : 'bg-white/30 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-white/20'
                      }`}
                    >
                      <span className="font-medium text-xs">{user.role}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user.email}
                      </span>
                      {user.disabled && (
                        <span className="text-xs text-red-500 mt-1">Em breve</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                    Ou digite manualmente
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-12 bg-white/30 dark:bg-white/10 border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 sm:h-12 bg-white/30 dark:bg-white/10 border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 sm:h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleLogin}
                disabled={loginMutation.isPending}
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 button-hover-effect"
                data-testid="button-login"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                {loginMutation.isPending ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </CardContent>
          </Card>

          {/* Demo Info */}
          <Card className="border-border bg-muted/50 theme-transition">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-info text-primary-foreground text-xs"></i>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Sistema Demonstrativo</h3>
                  <p className="text-sm text-muted-foreground">
                    Este é um ambiente de demonstração. Todos os dados são fictícios e 
                    serão redefinidos periodicamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 OpenLife. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Dialog open={errorModal.open} onOpenChange={(open) => setErrorModal({ ...errorModal, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <i className="fas fa-exclamation-circle"></i>
              Erro no Login
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {errorModal.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setErrorModal({ open: false, message: "" })}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}