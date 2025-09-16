
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex">
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
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/30">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Bem-vindo ao Portal
          </h1>
          
          <h2 className="text-3xl font-semibold mb-6 text-blue-100">
            EduManage
          </h2>
          
          <p className="text-xl text-blue-200 mb-8 max-w-md leading-relaxed">
            Sistema completo de gestão escolar para escolas de idiomas. 
            Gerencie alunos, professores, horários e muito mais.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <i className="fas fa-users text-white text-2xl"></i>
              </div>
              <p className="text-sm text-blue-200">Gestão de Alunos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <i className="fas fa-calendar-alt text-white text-2xl"></i>
              </div>
              <p className="text-sm text-blue-200">Agenda Inteligente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-primary-foreground text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-foreground">EduManage</h1>
            <p className="text-muted-foreground">Sistema de Gestão Escolar</p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Entrar no Sistema
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Acesse sua conta para continuar
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
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
                    className="h-12 bg-white/50 border-gray-200 focus:border-primary"
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
                    className="h-12 bg-white/50 border-gray-200 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-muted-foreground">Lembrar-me</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                data-testid="button-login"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Entrar no Sistema
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-gray-200 bg-white/50 hover:bg-gray-50"
              >
                <i className="fab fa-google mr-2 text-red-500"></i>
                Google
              </Button>
              
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Solicitar acesso
                  </a>
                </p>
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
