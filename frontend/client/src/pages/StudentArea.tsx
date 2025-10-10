import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import StudentCourseShelf from "@/components/StudentCourseShelf";

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
      <div className="space-y-8">
        {/* Header - Welcome Message */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" data-testid="text-welcome-title">
            Olá, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Continue sua jornada de aprendizado
          </p>
        </div>

        {/* Netflix-style Course Shelves - Featured at Top */}
        <StudentCoursesNetflix />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Current Lesson & Next Class */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Lesson Card */}
            <Card className="glassmorphism-card border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-book-open text-blue-600"></i>
                  <span>Lição Atual: Travel Adventures</span>
                </CardTitle>
                <CardDescription>Passo 4 de 6 • Em progresso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progresso da lição</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100" data-testid="text-lesson-progress">67%</span>
                </div>
                <Progress value={67} className="h-3 mb-4" data-testid="progress-bar-lesson" />
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

            {/* Next Class Card */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar text-purple-600"></i>
                  <span>Próxima Aula</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100" data-testid="text-next-class-title">
                        Lesson 9: Cultural Differences
                      </h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Hoje • 14:00 - 15:30 • Prof. Maria Santos
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 button-hover-effect" data-testid="button-enter-class">
                    Entrar
                  </Button>
                </div>
                <div className="mt-4">
                  <Link href="/aluno/cronograma" data-testid="link-view-schedule">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-calendar mr-2"></i>
                      Ver Cronograma Completo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary Card */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-green-600"></i>
                  <span>Resumo do Progresso</span>
                </CardTitle>
                <CardDescription>Journey • Intermediário • Book 3</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600" data-testid="text-overall-progress">65%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Progresso Geral</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600" data-testid="text-completed-lessons">23</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lições Concluídas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600" data-testid="text-average-grade">8.9</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Média Geral</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600" data-testid="text-pending-exams">1</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prova Pendente</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/aluno/progresso" data-testid="link-full-progress">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-chart-line mr-2"></i>
                      Ver Progresso Completo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Access */}
          <div className="space-y-6">
            
            {/* Recent Activities */}
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

            {/* Quick Access - Workbook */}
            <Link href="/aluno/workbook" data-testid="link-workbook">
              <Card className="glassmorphism-card cursor-pointer hover:shadow-lg transition-all duration-300" data-testid="card-workbook">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-book text-white text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Workbook Digital</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">12 de 15 exercícios</p>
                  <Progress value={80} className="h-2 mb-3" data-testid="progress-bar-workbook" />
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 button-hover-effect" data-testid="button-workbook">
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Quick Access - Exams */}
            <Link href="/aluno/provas" data-testid="link-exams">
              <Card className="glassmorphism-card border-2 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all duration-300" data-testid="card-exams">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-clipboard-check text-white text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Área de Provas</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">1 prova pendente</p>
                  <Badge className="bg-red-100 text-red-700 border-red-300 mb-3">Urgente</Badge>
                  <br />
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 button-hover-effect" data-testid="button-exams">
                    Ver Provas
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

function StudentCoursesNetflix() {
  const { data: enrollments = [] } = useQuery<any[]>({
    queryKey: ["student-courses"],
    queryFn: async () => apiRequest('/api/student/courses'),
  });

  const activeCourse = useMemo(() => enrollments[0], [enrollments]);

  if (!enrollments || enrollments.length === 0) return null;

  return (
    <div className="space-y-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Meus Cursos
        </h2>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" data-testid="badge-course-count">
          {enrollments.length} {enrollments.length === 1 ? 'Curso' : 'Cursos'}
        </Badge>
      </div>
      {enrollments.map((enroll: any) => (
        <StudentCourseShelf
          key={enroll.course.id}
          courseId={enroll.course.id}
          title={`${enroll.course.name} • ${enroll.course.level || ''}`}
          currentBookId={enroll.currentBookId || enroll.current_book_id}
          disabled={activeCourse?.course?.id !== enroll.course.id}
        />
      ))}
    </div>
  );
}
