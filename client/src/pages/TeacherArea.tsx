
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TeacherArea() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { locale: ptBR }));

  // Fetch teacher's classes
  const { data: teacherClasses = [], isLoading: classesLoading } = useQuery<any[]>({
    queryKey: ["/api/classes/teacher", user?.id],
    enabled: isAuthenticated && user?.role === 'teacher',
    retry: false,
  });

  // Fetch teacher's schedule
  const { data: teacherSchedule = [], isLoading: scheduleLoading } = useQuery<any[]>({
    queryKey: ["/api/schedule/teacher", user?.id],
    enabled: isAuthenticated && user?.role === 'teacher',
    retry: false,
  });

  // Mock data for students and grades (would come from API)
  const mockStudents = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      workbookProgress: 75,
      currentUnit: 8,
      totalUnits: 12,
      averageGrade: 8.5,
      attendance: 95,
      avatar: null
    },
    {
      id: '2', 
      name: 'Carlos Santos',
      email: 'carlos.santos@email.com',
      workbookProgress: 60,
      currentUnit: 6,
      totalUnits: 12,
      averageGrade: 7.2,
      attendance: 88,
      avatar: null
    },
    {
      id: '3',
      name: 'Beatriz Costa',
      email: 'beatriz.costa@email.com', 
      workbookProgress: 90,
      currentUnit: 10,
      totalUnits: 12,
      averageGrade: 9.1,
      attendance: 98,
      avatar: null
    }
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
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

  // Check if user is teacher
  if (user?.role !== 'teacher') {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-user-slash text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Negado</h3>
              <p className="text-muted-foreground">Esta área é exclusiva para professores.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const renderWeeklySchedule = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);

    // Sistema de cores por livro
    const bookColors: { [key: string]: string } = {
      'English Basic - Book 1': '#3b82f6',
      'English Basic - Book 2': '#1d4ed8'
    };

    // Dados exemplares das turmas do professor
    const mockTeacherSchedule = [
      {
        id: '1',
        title: 'Inglês A1 - Manhã',
        book: 'English Basic - Book 1',
        dayOfWeek: 1, // Segunda
        startTime: '09:00',
        endTime: '11:00',
        room: 'Sala 101',
        currentDay: 5,
        totalDays: 30,
        studentsCount: 12,
        maxStudents: 15
      },
      {
        id: '2',
        title: 'Inglês A2 - Tarde',
        book: 'English Basic - Book 2',
        dayOfWeek: 1, // Segunda
        startTime: '14:00',
        endTime: '16:00',
        room: 'Sala 102',
        currentDay: 8,
        totalDays: 35,
        studentsCount: 10,
        maxStudents: 15
      },
      {
        id: '3',
        title: 'Inglês A1 - Manhã',
        book: 'English Basic - Book 1',
        dayOfWeek: 3, // Quarta
        startTime: '09:00',
        endTime: '11:00',
        room: 'Sala 101',
        currentDay: 6,
        totalDays: 30,
        studentsCount: 12,
        maxStudents: 15
      },
      {
        id: '4',
        title: 'Inglês A2 - Tarde',
        book: 'English Basic - Book 2',
        dayOfWeek: 3, // Quarta
        startTime: '14:00',
        endTime: '16:00',
        room: 'Sala 102',
        currentDay: 9,
        totalDays: 35,
        studentsCount: 10,
        maxStudents: 15
      }
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigateWeek('prev')}>
              ← Semana Anterior
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 6), "dd MMM yyyy", { locale: ptBR })}
            </h3>
            <Button variant="outline" onClick={() => navigateWeek('next')}>
              Próxima Semana →
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
          <div className="grid grid-cols-8 gap-0 min-w-[900px]">
            {/* Header */}
            <div className="p-3 font-medium text-center bg-gray-50 border-b border-r text-sm">Horário</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-3 font-medium text-center bg-gray-50 border-b border-r text-sm">
                <div className="font-semibold">{format(day, "EEE", { locale: ptBR })}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(day, "dd/MM", { locale: ptBR })}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((timeSlot) => {
              const [hour] = timeSlot.split(':');
              return (
                <>
                  <div key={`time-${timeSlot}`} className="p-3 text-xs font-medium text-center bg-gray-50 border-b border-r text-gray-600">
                    {timeSlot}
                  </div>
                  
                  {weekDays.map((day) => {
                    const dayClasses = mockTeacherSchedule.filter(classItem => {
                      if (classItem.dayOfWeek !== day.getDay()) return false;
                      const classHour = parseInt(classItem.startTime.split(':')[0]);
                      return classHour === parseInt(hour);
                    });

                    return (
                      <div key={`${day.toISOString()}-${timeSlot}`} className="min-h-[80px] p-1 border-b border-r border-gray-100">
                        {dayClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="p-3 rounded-lg text-xs cursor-pointer transition-all hover:shadow-md border border-opacity-30 h-full"
                            style={{
                              backgroundColor: bookColors[classItem.book] + '20',
                              borderColor: bookColors[classItem.book],
                              color: '#000'
                            }}
                            data-testid={`schedule-class-${classItem.id}`}
                          >
                            <div className="font-semibold text-sm mb-2">{classItem.title}</div>
                            <div className="text-xs opacity-75 mb-1">
                              📚 {classItem.book}
                            </div>
                            <div className="text-xs opacity-75 mb-1">
                              🏢 {classItem.room}
                            </div>
                            <div className="text-xs opacity-75 mb-1">
                              👥 {classItem.studentsCount}/{classItem.maxStudents} alunos
                            </div>
                            <div className="text-xs font-medium">
                              Dia {classItem.currentDay}/{classItem.totalDays}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              );
            })}
          </div>
        </div>

        {/* Legenda dos meus livros */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Meus Livros</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(bookColors).map(([bookName, color]) => (
              <div key={bookName} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sm">{bookName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Área do Professor</h2>
            <p className="text-sm text-muted-foreground">
              Bem-vindo, Prof. Ivan Silva - Gerencie suas turmas e acompanhe o progresso dos alunos
            </p>
          </div>
        </div>

        <Tabs defaultValue="turmas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="turmas">Minhas Turmas</TabsTrigger>
            <TabsTrigger value="alunos">Alunos & Notas</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            <TabsTrigger value="agenda">Minha Agenda</TabsTrigger>
          </TabsList>

          {/* Minhas Turmas */}
          <TabsContent value="turmas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-users text-primary"></i>
                  <span>Minhas Turmas</span>
                  <Badge variant="secondary">{teacherClasses.length} turmas ativas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader>
                          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : teacherClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-chalkboard-teacher text-muted-foreground text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma turma atribuída</h3>
                    <p className="text-muted-foreground">Você ainda não tem turmas atribuídas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacherClasses.map((classItem: any) => (
                      <Card key={classItem.id} className="border-l-4 transition-all hover:shadow-lg" 
                            style={{ borderLeftColor: classItem.book?.color || '#3b82f6' }}>
                        <CardHeader>
                          <CardTitle className="text-lg">{classItem.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span style={{ color: classItem.book?.color || '#3b82f6' }}>
                              📚 {classItem.book?.name}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">📅 Horário:</span>
                              <span>{classItem.schedule}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">🏢 Sala:</span>
                              <span>{classItem.room}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">👥 Alunos:</span>
                              <span>{classItem.currentStudents}/{classItem.maxStudents}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">📖 Progresso:</span>
                                <span>Dia {classItem.currentDay}/{classItem.book?.totalDays || 30}</span>
                              </div>
                              <Progress 
                                value={(classItem.currentDay / (classItem.book?.totalDays || 30)) * 100} 
                                className="h-2" 
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setSelectedClassId(classItem.id)}
                            >
                              <i className="fas fa-eye mr-2"></i>
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alunos & Notas */}
          <TabsContent value="alunos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-user-graduate text-primary"></i>
                  <span>Progresso dos Alunos</span>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((classItem: any) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {selectedClassId ? (
                  <div className="space-y-4">
                    {mockStudents.map((student) => (
                      <Card key={student.id} className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={student.avatar || undefined} />
                            <AvatarFallback>
                              <i className="fas fa-user"></i>
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{student.name}</h4>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">{student.averageGrade}</div>
                                <div className="text-sm text-muted-foreground">Média Geral</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>📚 Workbook</span>
                                  <span>{student.workbookProgress}%</span>
                                </div>
                                <Progress value={student.workbookProgress} className="h-2" />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>📖 Unidade</span>
                                  <span>{student.currentUnit}/{student.totalUnits}</span>
                                </div>
                                <Progress value={(student.currentUnit / student.totalUnits) * 100} className="h-2" />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>📅 Presença</span>
                                  <span>{student.attendance}%</span>
                                </div>
                                <Progress value={student.attendance} className="h-2" />
                              </div>
                            </div>

                            <div className="flex space-x-2 mt-3">
                              <Button variant="outline" size="sm">
                                <i className="fas fa-edit mr-2"></i>
                                Editar Notas
                              </Button>
                              <Button variant="outline" size="sm">
                                <i className="fas fa-eye mr-2"></i>
                                Ver Histórico
                              </Button>
                              <Button variant="outline" size="sm">
                                <i className="fas fa-chart-line mr-2"></i>
                                Relatório
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-users text-muted-foreground text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Selecione uma turma</h3>
                    <p className="text-muted-foreground">Escolha uma turma acima para ver o progresso dos alunos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avaliações */}
          <TabsContent value="avaliacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-clipboard-check text-primary"></i>
                  <span>Área de Avaliações</span>
                </CardTitle>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Gerencie provas e avaliações das suas turmas</p>
                  <Button>
                    <i className="fas fa-plus mr-2"></i>
                    Nova Avaliação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock assessment data */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-sm">Prova Unit 8 - Inglês A1</CardTitle>
                      <CardDescription>Agendada para 15/03/2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Status:</span>
                          <Badge className="bg-blue-100 text-blue-700">Agendada</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Turma:</span>
                          <span>Inglês A1</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Alunos:</span>
                          <span>12 alunos</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <i className="fas fa-edit mr-2"></i>
                          Gerenciar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-sm">Avaliação Workbook - Inglês A1</CardTitle>
                      <CardDescription>Concluída em 10/03/2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Status:</span>
                          <Badge className="bg-green-100 text-green-700">Concluída</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Média:</span>
                          <span className="font-semibold text-green-600">8.4</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Participaram:</span>
                          <span>11/12 alunos</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <i className="fas fa-chart-bar mr-2"></i>
                          Ver Resultados
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-sm">Prova Oral - Inglês A1</CardTitle>
                      <CardDescription>Em andamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Status:</span>
                          <Badge className="bg-yellow-100 text-yellow-700">Em Andamento</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso:</span>
                          <span>7/12 alunos</span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={58} className="h-2" />
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <i className="fas fa-microphone mr-2"></i>
                          Continuar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Minha Agenda */}
          <TabsContent value="agenda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar-week text-primary"></i>
                  <span>Minha Agenda Semanal</span>
                </CardTitle>
                <CardDescription>
                  Visualize suas turmas organizadas por horário com informações detalhadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduleLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  renderWeeklySchedule()
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
