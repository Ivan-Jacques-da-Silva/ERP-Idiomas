import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import LessonModal from "@/components/LessonModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Schedule() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { locale: ptBR }));

  const { data: lessons, isLoading } = useQuery<any[]>({
    queryKey: user?.role === 'teacher' 
      ? ["/api/lessons/teacher", user.id]
      : ["/api/lessons"],
    retry: false,
  });

  // Fetch teachers for filter (only for admin/secretary)
  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    enabled: user?.role === 'admin' || user?.role === 'secretary',
    retry: false,
  });

  // Fetch classes to get teacher information for filtering
  const { data: classes = [] } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    enabled: user?.role === 'admin' || user?.role === 'secretary',
    retry: false,
  });

  // Get filtered lessons for weekly view
  const getWeeklyLessons = () => {
    if (!lessons) return [];
    
    const weekStart = startOfDay(currentWeekStart);
    const weekEnd = endOfDay(addDays(currentWeekStart, 6));
    
    return lessons.filter(lesson => {
      const lessonDate = parseISO(lesson.date);
      return isWithinInterval(lessonDate, { start: weekStart, end: weekEnd });
    }).filter(lesson => {
      // Apply teacher filter if selected
      if (!selectedTeacherFilter) return true;
      
      // Find the class for this lesson to get teacher information
      const lessonClass = classes.find((cls: any) => cls.id === lesson.classId);
      if (!lessonClass?.teacher?.id) return false;
      
      // Check if the lesson's teacher matches the selected filter
      return lessonClass.teacher.id === selectedTeacherFilter;
    });
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const canManageSchedule = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'secretary';

  const handleNewLesson = () => {
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const renderWeeklyView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const timeSlots = Array.from({ length: 15 }, (_, i) => `${7 + i}:00`); // 7:00 to 21:00
    const weeklyLessons = getWeeklyLessons();

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
          
          {(user?.role === 'admin' || user?.role === 'secretary') && (
            <Select value={selectedTeacherFilter} onValueChange={setSelectedTeacherFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os professores</SelectItem>
                {teachers
                  .filter(teacher => teacher.user?.role === 'teacher')
                  .map((teacher: any) => (
                    <SelectItem key={teacher.user.id} value={teacher.user.id}>
                      {teacher.user.firstName} {teacher.user.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-1 min-w-[800px]">
            {/* Header row */}
            <div className="p-2 font-medium text-center bg-muted rounded">Horário</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-2 font-medium text-center bg-muted rounded">
                <div>{format(day, "EEE", { locale: ptBR })}</div>
                <div className="text-sm text-muted-foreground">
                  {format(day, "dd/MM", { locale: ptBR })}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((timeSlot) => {
              const [hour] = timeSlot.split(':');
              return (
                <div key={timeSlot}>
                  {/* Time label */}
                  <div className="p-2 text-sm font-medium text-center bg-muted/50 border-r">
                    {timeSlot}
                  </div>
                  
                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const dayLessons = weeklyLessons.filter(lesson => {
                      const lessonDate = parseISO(lesson.date);
                      if (!isSameDay(lessonDate, day)) return false;
                      
                      const lessonHour = parseInt(lesson.startTime.split(':')[0]);
                      return lessonHour === parseInt(hour);
                    });

                    return (
                      <div key={`${day.toISOString()}-${timeSlot}`} className="min-h-[60px] p-1 border border-border/50">
                        {dayLessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`p-2 rounded text-xs cursor-pointer transition-all hover:opacity-80 ${
                              lesson.status === 'completed' ? 'bg-green-100 border border-green-200' :
                              lesson.status === 'cancelled' ? 'bg-red-100 border border-red-200' :
                              lesson.status === 'in_progress' ? 'bg-blue-100 border border-blue-200' :
                              'bg-yellow-100 border border-yellow-200'
                            }`}
                            onClick={() => canManageSchedule && handleEditLesson(lesson)}
                            data-testid={`lesson-${lesson.id}`}
                          >
                            <div className="font-medium truncate">{lesson.title}</div>
                            <div className="text-xs opacity-75">
                              {lesson.startTime}-{lesson.endTime}
                            </div>
                            {lesson.room && (
                              <div className="text-xs opacity-75">Sala {lesson.room}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
            <h2 className="text-2xl font-semibold text-foreground">Agenda</h2>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'teacher' 
                ? "Gerencie sua agenda de aulas"
                : "Visualize e gerencie a agenda da escola"}
            </p>
          </div>
          
          {canManageSchedule && (
            <Button onClick={handleNewLesson} data-testid="button-new-lesson">
              <i className="fas fa-plus mr-2"></i>
              Nova Aula
            </Button>
          )}
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
            <TabsTrigger value="month">Este Mês</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar-day text-primary"></i>
                  <span>Aulas de Hoje</span>
                  <Badge variant="secondary">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!todaysLessons || todaysLessons.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-times text-muted-foreground text-4xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma aula agendada</h3>
                    <p className="text-muted-foreground mb-4">
                      Não há aulas programadas para hoje.
                    </p>
                    {canManageSchedule && (
                      <Button onClick={handleNewLesson} data-testid="button-schedule-first-lesson">
                        <i className="fas fa-plus mr-2"></i>
                        Agendar primeira aula
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="todays-lessons">
                    {todaysLessons.map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 border border-border/50 card-hover transition-smooth">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-clock text-primary-foreground"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {lesson.startTime} - {lesson.endTime}
                            {lesson.room && ` • Sala ${lesson.room}`}
                          </p>
                          {lesson.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{lesson.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(lesson.status)}>
                            {getStatusText(lesson.status)}
                          </Badge>
                          {canManageSchedule && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                              data-testid={`button-edit-lesson-${lesson.id}`}
                            >
                              <i className="fas fa-edit mr-2"></i>
                              Editar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualização Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                {renderWeeklyView()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <i className="fas fa-calendar-alt text-muted-foreground text-4xl mb-4"></i>
                  <p className="text-muted-foreground">Visualização mensal em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Calendário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <i className="fas fa-calendar text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Calendário interativo em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Aulas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <i className="fas fa-list text-muted-foreground text-4xl mb-4"></i>
                    <p className="text-muted-foreground">Lista de próximas aulas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={handleCloseModal}
        lessonToEdit={editingLesson}
      />
    </Layout>
  );
}
