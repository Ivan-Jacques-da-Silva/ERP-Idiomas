import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentExams() {
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
        window.location.href = "/landing";
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Área de Provas
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Gerencie suas avaliações e acompanhe seu desempenho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Provas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Provas Pendentes - URGENTE */}
            <Card className="glassmorphism-card border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                  <span>Provas Urgentes</span>
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">Atenção: Prazo próximo do vencimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prova 1 - Urgente */}
                <Card className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-red-100 text-red-700 border-red-300">Urgente</Badge>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">Unit 2 Test</span>
                    </div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Prova: Travel & Culture</h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">Avaliação sobre vocabulário e gramática das lições 8-12</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-red-600 dark:text-red-400">Prazo: Hoje até 23:59</span>
                      <span className="text-xs text-red-600 dark:text-red-400">Duração: 45 minutos</span>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="button-start-urgent-exam">
                      <i className="fas fa-play mr-2"></i>
                      Iniciar Prova Agora
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Próximas Provas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar-alt text-blue-600"></i>
                  <span>Próximas Provas</span>
                </CardTitle>
                <CardDescription>Suas avaliações programadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">Agendada</Badge>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Mid-term Test</span>
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Prova de Meio de Período</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">Avaliação abrangente do conteúdo estudado até agora</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-blue-600 dark:text-blue-400">Data: 25/09 às 14:00</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">Duração: 90 minutos</span>
                    </div>
                    <Button variant="outline" className="w-full" data-testid="button-prepare-exam">
                      <i className="fas fa-book-reader mr-2"></i>
                      Preparar-se
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">Futura</Badge>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit 3 Test</span>
                    </div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Prova: Business English</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Avaliação sobre vocabulário empresarial e comunicação</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Data: A definir</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Duração: 60 minutos</span>
                    </div>
                  </CardContent>
                </Card>

              </CardContent>
            </Card>

            {/* Provas Realizadas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  <span>Provas Realizadas</span>
                </CardTitle>
                <CardDescription>Histórico de suas avaliações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Unit 1 Test</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">Realizada em 10/09 • Foundations & Greetings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">9.2</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Excelente</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Diagnostic Test</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">Realizada em 01/09 • Avaliação de Nivelamento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">8.5</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Muito Bom</p>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Right Column - Estatísticas e Recursos */}
          <div className="space-y-6">
            
            {/* Performance Geral */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-purple-600"></i>
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
                  <p className="text-3xl font-bold text-purple-600">8.9</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Média Geral</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Provas Realizadas:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Melhor Nota:</span>
                    <span className="font-medium text-green-600">9.2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de Aprovação:</span>
                    <span className="font-medium text-blue-600">100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            

            {/* Lembretes */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-bell text-yellow-600"></i>
                  <span>Lembretes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                  <i className="fas fa-clock text-yellow-600 text-2xl mb-2"></i>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                    Prova Urgente!
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Você tem 1 prova para fazer ainda hoje.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
