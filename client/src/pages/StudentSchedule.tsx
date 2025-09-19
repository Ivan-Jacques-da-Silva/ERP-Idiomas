import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentSchedule() {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Cronograma de Aulas
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Visualize e gerencie suas aulas agendadas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Próximas Aulas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Aulas de Hoje */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar-day text-green-600"></i>
                  <span>Aulas de Hoje</span>
                </CardTitle>
                <CardDescription>Suas aulas agendadas para hoje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Aula 1 - Hoje */}
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Lesson 9: Cultural Differences</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400">14:00 - 15:30 • Prof. Maria Santos</p>
                      <Badge className="bg-green-100 text-green-700 border-green-300 mt-1">Em 30 minutos</Badge>
                    </div>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700" data-testid="button-enter-aula">
                    Entrar na Aula
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Próximas Aulas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar text-blue-600"></i>
                  <span>Próximas Aulas</span>
                </CardTitle>
                <CardDescription>Suas aulas programadas para os próximos dias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Aula 2 - Amanhã */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Lesson 10: Business English</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Amanhã • 14:00 - 15:30 • Prof. Maria Santos</p>
                    </div>
                  </div>
                  <Badge variant="outline">Agendada</Badge>
                </div>

                {/* Aula 3 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Lesson 11: Technology Today</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">22/09 • 14:00 - 15:30 • Prof. João Silva</p>
                    </div>
                  </div>
                  <Badge variant="outline">Agendada</Badge>
                </div>

                {/* Aula 4 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Lesson 12: Health and Wellness</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">24/09 • 14:00 - 15:30 • Prof. Ana Costa</p>
                    </div>
                  </div>
                  <Badge variant="outline">Agendada</Badge>
                </div>

                {/* Aula 5 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Lesson 13: Environmental Issues</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">26/09 • 14:00 - 15:30 • Prof. Maria Santos</p>
                    </div>
                  </div>
                  <Badge variant="outline">Agendada</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Aulas Passadas */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-history text-gray-600"></i>
                  <span>Aulas Anteriores</span>
                </CardTitle>
                <CardDescription>Suas últimas aulas realizadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Lesson 8: Travel Adventures</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">Ontem • 14:00 - 15:30 • Prof. Maria Santos</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">Concluída</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Lesson 7: Food and Culture</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">17/09 • 14:00 - 15:30 • Prof. João Silva</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">Concluída</Badge>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Informações e Links Úteis */}
          <div className="space-y-6">
            
            {/* Resumo da Semana */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-bar text-purple-600"></i>
                  <span>Esta Semana</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">4</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aulas Agendadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">2</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aulas Concluídas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">6h</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Total</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Turma */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-users text-blue-600"></i>
                  <span>Minha Turma</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Journey - Intermediário</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Book 3, Unit 2</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Professora Principal:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Maria Santos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Horário:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Ter/Qui 14:00-15:30</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Alunos:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">12 estudantes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Links Úteis */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-link text-orange-600"></i>
                  <span>Links Úteis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" data-testid="button-classroom">
                  <i className="fas fa-chalkboard-teacher mr-2"></i>
                  Sala Virtual
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-materials">
                  <i className="fas fa-file-pdf mr-2"></i>
                  Materiais da Aula
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-homework">
                  <i className="fas fa-tasks mr-2"></i>
                  Tarefas Pendentes
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-contact">
                  <i className="fas fa-envelope mr-2"></i>
                  Contatar Professor
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
}