import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";

// Demo users for display
const demoUsers = [
  { email: 'admin@demo.com', password: 'admin123', role: 'Administrador' },
  { email: 'teacher@demo.com', password: 'teacher123', role: 'Professor' },
  { email: 'secretary@demo.com', password: 'secretary123', role: 'Secretário' },
  { email: 'student@demo.com', password: 'student123', role: 'Aluno' },
];

export default function Landing() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Redirect to main app
      window.location.href = '/';
    },
    onError: (error: Error) => {
      alert('Erro no login: ' + error.message);
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column - Welcome Section with Stars */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Stars Animation */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: '2s'
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

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Bem-vindo ao Portal
          </h1>

          <h2 className="text-3xl font-semibold mb-6 text-blue-100">
            OpenLife
          </h2>

          <p className="text-xl text-blue-200 mb-8 max-w-md leading-relaxed">
            Sistema completo de gestão escolar para escolas de idiomas. 
            Gerencie alunos, professores, horários e muito mais.
          </p>

          <div className="grid grid-cols-2 gap-4 lg:gap-6 mt-8 w-full max-w-sm mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <i className="fas fa-users text-white text-lg lg:text-2xl"></i>
              </div>
              <p className="text-xs lg:text-sm text-blue-200">Gestão de Alunos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <i className="fas fa-calendar-alt text-white text-lg lg:text-2xl"></i>
              </div>
              <p className="text-xs lg:text-sm text-blue-200">Agenda Inteligente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background theme-transition min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-primary-foreground text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-foreground">OpenLife</h1>
            <p className="text-muted-foreground">Sistema de Gestão Escolar</p>
          </div>

          {/* Header com tema toggle */}
          <div className="absolute top-6 right-6 z-50">
            <ThemeToggle />
          </div>

          <Card className="shadow-2xl bg-card border-border mb-6 theme-transition">
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
                      onClick={() => setDemoUser(user)}
                      className="h-auto p-3 flex flex-col items-start bg-white/50 hover:bg-blue-50 border-gray-200 text-left"
                    >
                      <span className="font-medium text-xs">{user.role}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user.email}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
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
                    className="h-10 sm:h-12 bg-white/50 border-gray-200 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-12 bg-white/50 border-gray-200 focus:border-primary"
                  />
                </div>
              </div>

              <Button 
                onClick={handleLogin}
                disabled={loginMutation.isPending}
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200"
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
              © 2024 EduManage. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}