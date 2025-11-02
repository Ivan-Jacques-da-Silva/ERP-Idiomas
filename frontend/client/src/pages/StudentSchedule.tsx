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
        title: "Não autorizado",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
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
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Lição 9: Diferenças Culturais</h4>
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
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Lição 10: Inglês para Negócios</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Amanhã • 14:00 - 15:30 • Prof. Maria Santos</p>
                    </div>
                  </div>
                  <Badge variant="outline">Agendada</Badge>
                </div>

                {/* Aula 3 - Após amanhã (exemplo) */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Lição 11: Conversação — Viagens</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Em 2 dias • 10:00 - 11:30 • Prof. João Silva</p>
                    </div>
                  </div>
                  <Badge variant="outline">Agendada</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Aulas Anteriores */}
          <div className="space-y-6">
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-history text-gray-600"></i>
                  <span>Aulas Anteriores</span>
                </CardTitle>
                <CardDescription>Resumo das suas últimas aulas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-md">
                  <div className="font-medium">Lição 8: Gramática — Tempos Verbais</div>
                  <div className="text-sm text-gray-600">Ontem • 08:00 - 09:30 • Prof. Maria Santos</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="font-medium">Lição 7: Inglês Básico — Vocabulário</div>
                  <div className="text-sm text-gray-600">Há 3 dias • 09:00 - 10:30 • Prof. Carlos Lima</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
