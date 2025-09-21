import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function StudentArea() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Redirect if not a student
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== 'student') {
      window.location.href = "/";
    }
  }, [authLoading, isAuthenticated, user]);

  if (authLoading || !isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Sala do Aluno
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Bem-vindo, {user.firstName}! Continue sua jornada de aprendizado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Resumo Geral */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Resumo do Progresso */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-blue-600"></i>
                  <span>Resumo do Progresso</span>
                </CardTitle>
                <CardDescription>Journey • Intermediário • Book 3</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">65%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Progresso Geral</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">23</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lições Concluídas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">8.9</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Média Geral</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">1</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prova Pendente</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/aluno/progresso" data-testid="link-view-full-progress">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-chart-line mr-2"></i>
                      Ver Progresso Completo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Lição Atual Resumida */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-book-open text-purple-600"></i>
                  <span>Lição Atual: Travel Adventures</span>
                </CardTitle>
                <CardDescription>Passo 4 de 6 • Em progresso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progresso da lição</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">67%</span>
                </div>
                <Progress value={67} className="h-3 mb-4" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Speaking Exercise</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Próximo passo disponível</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 button-hover-effect" data-testid="button-continue-lesson">
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Próxima Aula */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar text-green-600"></i>
                  <span>Próxima Aula</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Lesson 9: Cultural Differences</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Hoje • 14:00 - 15:30 • Prof. Maria Santos</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 button-hover-effect" data-testid="button-enter-aula">
                    Entrar na Aula
                  </Button>
                </div>
                <div className="mt-4">
                  <Link href="/aluno/cronograma" data-testid="link-view-full-schedule">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-calendar mr-2"></i>
                      Ver Cronograma Completo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Acessos Rápidos */}
          <div className="space-y-6">
            
            {/* Atividades Recentes Resumidas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-clock text-blue-600"></i>
                  <span>Atividades Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Lesson 8 concluída</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Prova urgente pendente</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prazo: Hoje</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Workbook atualizado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ontem</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Áreas de Acesso Rápido */}
            <div className="space-y-4">
              {/* Workbook */}
              <Link href="/aluno/workbook" data-testid="link-workbook">
                <Card className="glassmorphism-card cursor-pointer hover:shadow-lg transition-all duration-300" data-testid="card-workbook">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-book text-white text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Workbook Digital</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">12 de 15 exercícios</p>
                    <Progress value={80} className="h-2 mb-3" />
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 button-hover-effect" data-testid="button-workbook">
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Provas */}
              <Link href="/aluno/provas" data-testid="link-provas">
                <Card className="glassmorphism-card border-2 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all duration-300" data-testid="card-provas">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-clipboard-check text-white text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Área de Provas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">1 prova pendente</p>
                    <Badge className="bg-red-100 text-red-700 border-red-300 mb-3">Urgente</Badge>
                    <br />
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 button-hover-effect" data-testid="button-provas">
                      Ver Provas
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}