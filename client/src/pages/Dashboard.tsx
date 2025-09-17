import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import StatsCard from "@/components/StatsCard";
import { PageLoader, FadeIn, StaggeredFadeIn } from "@/components/PageLoader";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const { data: stats, isLoading } = useQuery<{
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: todaysLessons } = useQuery<any[]>({
    queryKey: ["/api/lessons/today"],
    retry: false,
  });

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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <PageLoader>
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <FadeIn delay={50}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center icon-glow">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gradient">Dashboard</h2>
                <p className="text-sm text-muted-foreground">Visão geral do sistema de gestão escolar</p>
              </div>
            </div>
          </FadeIn>

        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <FadeIn key={index} delay={100 + index * 50}>
                  <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </FadeIn>
              ))
            ) : (
              <StaggeredFadeIn stagger={80}>
                {[
                  <StatsCard
                    title="Total de Alunos"
                    value={stats?.totalStudents || 0}
                    change="+12%"
                    changeType="positive"
                    icon="fas fa-user-graduate"
                    iconColor="blue"
                    data-testid="card-total-students"
                  />,
                  <StatsCard
                    title="Professores Ativos"
                    value={stats?.activeTeachers || 0}
                    change="+3%"
                    changeType="positive"
                    icon="fas fa-chalkboard-teacher"
                    iconColor="green"
                    data-testid="card-active-teachers"
                  />,
                  <StatsCard
                    title="Aulas Hoje"
                    value={stats?.todaysClasses || 0}
                    change="92 concluídas"
                    changeType="neutral"
                    icon="fas fa-calendar-check"
                    iconColor="purple"
                    data-testid="card-todays-classes"
                  />,
                  <StatsCard
                    title="Receita Mensal"
                    value={`R$ ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                    change="+8%"
                    changeType="positive"
                    icon="fas fa-dollar-sign"
                    iconColor="yellow"
                    data-testid="card-monthly-revenue"
                  />
                ]}
              </StaggeredFadeIn>
            )}
          </div>

        {/* Main Content Grid */}
          <FadeIn delay={300}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Schedule Overview */}
              <div className="xl:col-span-2 glassmorphism-card rounded-2xl border border-white/20 shadow-xl">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 gradient-secondary rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar-day text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Agenda de Hoje</h3>
                </div>
                <button className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-smooth">
                  Ver todas
                </button>
              </div>
            </div>
            <div className="p-6" data-testid="todays-schedule">
              <div className="space-y-4">
                {!todaysLessons || todaysLessons.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-times text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Nenhuma aula agendada para hoje</p>
                  </div>
                ) : (
                  todaysLessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-clock text-primary-foreground"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.startTime} - {lesson.endTime}
                          {lesson.room && ` • Sala ${lesson.room}`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          {lesson.status === 'scheduled' ? 'Agendado' : 
                           lesson.status === 'in_progress' ? 'Em andamento' : 
                           'Concluído'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="glassmorphism-card rounded-2xl border border-white/20 shadow-xl">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-white text-sm"></i>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Atividades Recentes</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4" data-testid="recent-activities">
                <div className="text-center py-8">
                  <i className="fas fa-clock text-muted-foreground text-4xl mb-4"></i>
                  <p className="text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              </div>
            </div>
          </div>
          </div>
          </FadeIn>

          {/* Quick Actions */}
          <FadeIn delay={400}>
            <div className="glassmorphism-card rounded-2xl border border-white/20 shadow-xl">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-white text-sm"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {(user?.role === 'admin' || user?.role === 'secretary') && (
                <button 
                  className="p-6 rounded-2xl glassmorphism hover:glassmorphism-card transition-smooth text-left border border-white/20 hover:border-blue-300/50 card-hover"
                  data-testid="button-new-student"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-plus text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Novo Aluno</h4>
                      <p className="text-sm text-muted-foreground">Cadastrar estudante</p>
                    </div>
                  </div>
                </button>
              )}

              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <button 
                  className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-smooth text-left"
                  data-testid="button-schedule-class"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar-plus text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Agendar Aula</h4>
                      <p className="text-sm text-muted-foreground">Nova agenda</p>
                    </div>
                  </div>
                </button>
              )}

              <button 
                className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-smooth text-left"
                data-testid="button-add-material"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-book text-purple-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Adicionar Material</h4>
                    <p className="text-sm text-muted-foreground">Conteúdo digital</p>
                  </div>
                </div>
              </button>

              {(user?.role === 'admin' || user?.role === 'financial') && (
                <button 
                  className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-smooth text-left"
                  data-testid="button-generate-report"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-invoice-dollar text-yellow-600"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Gerar Relatório</h4>
                      <p className="text-sm text-muted-foreground">Financeiro/Acadêmico</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
            </div>
          </FadeIn>
        </div>
      </PageLoader>
    </Layout>
  );
}
