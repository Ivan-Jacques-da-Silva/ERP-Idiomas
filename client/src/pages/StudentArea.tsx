import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Área do Aluno
          </h2>
          <p className="text-sm text-muted-foreground">
            Bem-vindo, {user.firstName}! Acompanhe seu progresso e acesse seus cursos.
          </p>
        </div>

        {/* Student Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">65%</div>
              <Progress value={65} className="mb-2" />
              <p className="text-xs text-muted-foreground">3 de 5 módulos concluídos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próxima Aula</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-foreground mb-1">Inglês Avançado</div>
              <p className="text-sm text-muted-foreground mb-2">Amanhã, 14:00 - 15:30</p>
              <Badge variant="outline">Sala 201</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">3</div>
              <p className="text-xs text-muted-foreground">2 exercícios + 1 prova</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Meus Cursos</TabsTrigger>
            <TabsTrigger value="exams">Provas</TabsTrigger>
            <TabsTrigger value="workbook">Workbook</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="student-courses">
              <Card className="card-hover transition-smooth">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inglês Avançado</CardTitle>
                      <CardDescription>Nível C1 • Prof. Maria Silva</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progresso do curso</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span><i className="fas fa-calendar mr-2"></i>Próxima aula: Amanhã</span>
                      <span><i className="fas fa-clock mr-2"></i>14:00</span>
                    </div>
                    <Button className="w-full" data-testid="button-access-course">
                      <i className="fas fa-play mr-2"></i>
                      Acessar Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-border">
                <CardContent className="py-12 text-center">
                  <i className="fas fa-plus-circle text-muted-foreground text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Inscreva-se em mais cursos</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore nossa variedade de idiomas e níveis disponíveis.
                  </p>
                  <Button variant="outline" data-testid="button-browse-courses">
                    <i className="fas fa-search mr-2"></i>
                    Ver Cursos Disponíveis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-clipboard-check text-primary"></i>
                  <span>Provas e Avaliações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="student-exams">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-exclamation-triangle text-yellow-600"></i>
                      <div>
                        <h4 className="font-medium">Prova de Conversação</h4>
                        <p className="text-sm text-muted-foreground">Inglês Avançado • Prazo: 3 dias</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Iniciar Prova
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <div>
                        <h4 className="font-medium">Grammar Test - Unit 5</h4>
                        <p className="text-sm text-muted-foreground">Inglês Avançado • Nota: 8.5/10</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Concluída</Badge>
                  </div>

                  <div className="text-center py-8">
                    <i className="fas fa-graduation-cap text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Você está em dia com suas avaliações!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workbook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-book-open text-primary"></i>
                  <span>Workbook Digital</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="student-workbook">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unit 6: Future Tenses</CardTitle>
                      <CardDescription>15 exercícios disponíveis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>12/15 completos</span>
                        </div>
                        <Progress value={80} />
                        <Button className="w-full" size="sm">
                          Continuar Exercícios
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unit 5: Conditional Sentences</CardTitle>
                      <CardDescription>10 exercícios disponíveis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>10/10 completos</span>
                        </div>
                        <Progress value={100} />
                        <Button variant="outline" className="w-full" size="sm" disabled>
                          <i className="fas fa-check mr-2"></i>
                          Concluído
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-primary"></i>
                  <span>Linha do Tempo - Seu Progresso</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6" data-testid="student-progress">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-check text-green-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Unit 5 - Conditionals</h4>
                        <span className="text-sm text-muted-foreground">Há 2 dias</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Parabéns! Você concluiu todos os exercícios da Unit 5 com nota 9.2/10
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-play text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Conversação - Speaking Practice</h4>
                        <span className="text-sm text-muted-foreground">Há 5 dias</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Participou da sessão de conversação sobre "Travel and Tourism"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-star text-yellow-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Milestone Alcançado!</h4>
                        <span className="text-sm text-muted-foreground">Há 1 semana</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Você completou 50% do curso Inglês Avançado. Continue assim!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
