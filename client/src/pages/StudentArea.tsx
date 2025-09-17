import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Olá, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Continue sua jornada de aprendizado
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">65%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progresso Geral</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">14:00</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Próxima Aula</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-tasks text-white text-xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">3</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Atividades Pendentes</p>
            </div>
          </div>
        </div>

        {/* Learning Path / Steps */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">
            Suas Etapas de Aprendizado
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Course */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <i className="fas fa-book-open text-white"></i>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Inglês Avançado</CardTitle>
                      <CardDescription>Nível C1 • Prof. Maria Silva</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">Em Andamento</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progresso do curso</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-blue-700 dark:text-blue-300">
                      <i className="fas fa-calendar mr-2"></i>Próxima aula: Amanhã
                    </span>
                    <span className="flex items-center text-blue-700 dark:text-blue-300">
                      <i className="fas fa-map-marker-alt mr-2"></i>Sala 201
                    </span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" data-testid="button-access-course">
                  <i className="fas fa-play mr-2"></i>
                  Acessar Curso
                </Button>
              </CardContent>
            </Card>

            {/* Workbook Progress */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-pencil-alt text-white"></i>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Workbook Digital</CardTitle>
                    <CardDescription>Unit 6: Future Tenses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">12 de 15 exercícios</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20">
                  <i className="fas fa-edit mr-2"></i>
                  Continuar Exercícios
                </Button>
              </CardContent>
            </Card>

            {/* Pending Exams */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-clipboard-check text-white"></i>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Prova de Conversação</CardTitle>
                    <CardDescription>Prazo: 3 dias restantes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-orange-600 mr-2"></i>
                    <span className="text-sm text-orange-700 dark:text-orange-300">Atenção: Prazo próximo do vencimento</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <i className="fas fa-play mr-2"></i>
                  Iniciar Prova
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievement */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-trophy text-white"></i>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Última Conquista</CardTitle>
                    <CardDescription>Unit 5 - Conditionals</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    <span className="text-sm text-green-700 dark:text-green-300">Concluído com nota 9.2/10</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20" disabled>
                  <i className="fas fa-medal mr-2"></i>
                  Conquista Desbloqueada
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col space-y-2 bg-white/50 dark:bg-gray-800/50">
              <i className="fas fa-calendar text-blue-600"></i>
              <span className="text-xs">Agenda</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2 bg-white/50 dark:bg-gray-800/50">
              <i className="fas fa-comments text-green-600"></i>
              <span className="text-xs">Conversar</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2 bg-white/50 dark:bg-gray-800/50">
              <i className="fas fa-headphones text-purple-600"></i>
              <span className="text-xs">Áudio</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2 bg-white/50 dark:bg-gray-800/50">
              <i className="fas fa-chart-bar text-orange-600"></i>
              <span className="text-xs">Relatório</span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}