import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function StudentWorkbook() {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Workbook Digital
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Complete seus exercícios e atividades práticas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exercícios */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progresso Atual */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-purple-600"></i>
                  <span>Progresso do Workbook</span>
                </CardTitle>
                <CardDescription>Journey • Book 3 • Unit 2</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercícios Concluídos</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">12 de 15 (80%)</span>
                  </div>
                  <Progress value={80} className="h-3 bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">12</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Concluídos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">1</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Em Progresso</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-600">2</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exercícios Atuais */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-pencil-alt text-blue-600"></i>
                  <span>Exercícios Disponíveis</span>
                </CardTitle>
                <CardDescription>Continue de onde parou</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Exercício Em Progresso */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">Em Progresso</Badge>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Exercício 13</span>
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Grammar: Past Perfect Continuous</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">Complete as frases usando o tempo verbal correto</p>
                    <Progress value={60} className="h-2 mb-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 dark:text-blue-400">3 de 5 questões</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-continue-exercise">
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercícios Pendentes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Pendente</Badge>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Exercício 14</span>
                      </div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Vocabulary: Travel & Tourism</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Aprenda palavras relacionadas a viagens</p>
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-start-exercise">
                        Começar
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Pendente</Badge>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Exercício 15</span>
                      </div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Listening: Airport Announcements</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Pratique a compreensão auditiva</p>
                      <Button size="sm" variant="outline" className="w-full" disabled data-testid="button-start-exercise-locked">
                        <i className="fas fa-lock mr-2"></i>
                        Bloqueado
                      </Button>
                    </CardContent>
                  </Card>
                </div>

              </CardContent>
            </Card>

            {/* Exercícios Concluídos Recentes */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  <span>Exercícios Concluídos</span>
                </CardTitle>
                <CardDescription>Suas atividades finalizadas recentemente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Exercício 12: Reading Comprehension</h4>
                      <p className="text-xs text-green-600 dark:text-green-400">Concluído há 2 horas • Nota: 9.5/10</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-review-exercise">
                    Revisar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Exercício 11: Writing Practice</h4>
                      <p className="text-xs text-green-600 dark:text-green-400">Concluído ontem • Nota: 8.0/10</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-review-exercise">
                    Revisar
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Estatísticas e Recursos */}
          <div className="space-y-6">
            
            {/* Estatísticas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-bar text-orange-600"></i>
                  <span>Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-3">
                  <p className="text-2xl font-bold text-purple-600">8.7</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Média Geral</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">95%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Taxa de Acertos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">4h 20m</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tempo Estudado</p>
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