import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function StudentProgress() {
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
            Meu Progresso
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Acompanhe sua evolução e conquistas no aprendizado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progresso Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progresso Geral */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-blue-600"></i>
                  <span>Progresso Geral</span>
                </CardTitle>
                <CardDescription>Journey • Intermediário • Book 3</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progresso Geral */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso Geral</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">65%</span>
                  </div>
                  <Progress value={65} className="h-3 bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Livro Atual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Livro Atual</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">40%</span>
                  </div>
                  <Progress value={40} className="h-3 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>23 de 36 lições concluídas</span>
                    <span>Lesson 8: Travel Adventures</span>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">23</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lições Concluídas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">15h 42m</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tempo de Estudo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lição Atual Detalhada */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-book-open text-purple-600"></i>
                  <span>Lição Atual: Travel Adventures</span>
                </CardTitle>
                <CardDescription>Complete os 6 passos para finalizar esta lição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Passo 1 - Concluído */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Passo 1</span>
                        <i className="fas fa-check-circle text-purple-600"></i>
                      </div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Vocabulary</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400">video</p>
                    </CardContent>
                  </Card>

                  {/* Passo 2 - Concluído */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Passo 2</span>
                        <i className="fas fa-check-circle text-purple-600"></i>
                      </div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Grammar Focus</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400">activity</p>
                    </CardContent>
                  </Card>

                  {/* Passo 3 - Concluído */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Passo 3</span>
                        <i className="fas fa-check-circle text-purple-600"></i>
                      </div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Listening Practice</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400">audio</p>
                    </CardContent>
                  </Card>

                  {/* Passo 4 - Em Progresso */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Passo 4</span>
                        <i className="fas fa-play text-blue-600"></i>
                      </div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Speaking Exercise</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400">speaking</p>
                    </CardContent>
                  </Card>

                  {/* Passo 5 - Próximo */}
                  <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Passo 5</span>
                        <i className="fas fa-play text-gray-400"></i>
                      </div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Writing Challenge</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">writing</p>
                    </CardContent>
                  </Card>

                  {/* Passo 6 - Próximo */}
                  <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Passo 6</span>
                        <i className="fas fa-play text-gray-400"></i>
                      </div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Final Quiz</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">quiz</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Conquistas e Histórico */}
          <div className="space-y-6">
            
            {/* Conquistas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-trophy text-yellow-600"></i>
                  <span>Conquistas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conquista 1 */}
                <div className="flex items-center space-x-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-pink-900 dark:text-pink-100 text-sm">Primeira Semana</h4>
                    <p className="text-xs text-pink-600 dark:text-pink-400">Complete sua primeira semana de estudos</p>
                  </div>
                  <i className="fas fa-check-circle text-pink-600"></i>
                </div>

                {/* Conquista 2 */}
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-medal text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Frequência Exemplar</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Participe de 10 aulas consecutivas</p>
                  </div>
                  <i className="fas fa-check-circle text-blue-600"></i>
                </div>

                {/* Conquista 3 - Em progresso */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Estudante Dedicado</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Complete 50 lições (23/50)</p>
                  </div>
                  <Progress value={46} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Atividades */}
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
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Quiz realizado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ontem</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nova conquista desbloqueada</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 dias atrás</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Lesson 7 concluída</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3 dias atrás</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
}