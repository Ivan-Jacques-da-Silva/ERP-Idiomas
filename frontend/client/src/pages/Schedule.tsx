import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import LessonModal from "@/components/LessonModal";
import ClassModal from "@/components/ClassModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
}

function ClassDetailModal({ isOpen, onClose, classData }: ClassDetailModalProps) {
  if (!classData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: classData.bookColor }}
            />
            <span>{classData.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Informações da Turma */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Professor</Label>
              <p className="text-sm font-semibold">{classData.teacher}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Horário</Label>
              <p className="text-sm">{classData.startTime} - {classData.endTime}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Sala</Label>
              <p className="text-sm">{classData.room}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Livro</Label>
              <p className="text-sm">{classData.book}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Progresso</Label>
              <p className="text-sm">Dia {classData.currentDay}/{classData.totalDays}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Alunos</Label>
              <p className="text-sm">{classData.studentsCount}/{classData.maxStudents}</p>
            </div>
          </div>

          {/* Lista de Alunos */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">Alunos Matriculados</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {(classData.students?.length ? classData.students : [
                { name: "Ana Silva" },
                { name: "João Santos" },
                { name: "Maria Costa" },
                { name: "Pedro Lima" },
                { name: "Carla Oliveira" },
              ]).map((student: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {student.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                    </span>
                  </div>
                  <span className="text-sm">{student.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button>
              Editar Turma
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Schedule() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | undefined>(undefined);
  const [selectedStartTime, setSelectedStartTime] = useState<string | undefined>(undefined);
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("all");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { locale: ptBR }));
  const [selectedClassDetail, setSelectedClassDetail] = useState<any>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);

  const { data: todaysLessons } = useQuery<any[]>({
    queryKey: ["/api/lessons/today"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: apiClasses = [] } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    retry: false,
    enabled: isAuthenticated,
  });

  const normalizeClasses = (list: any[]) =>
    (list || []).map((c: any) => {
      const nomeProfessor = (c.teacher?.firstName || "").trim();
      const courseName = c.book?.course?.name || c.book?.name || "Turma";
      return {
        id: c.id,
        title: courseName,
        teacher: nomeProfessor || c.teacherName || "",
        teacherId: c.teacherId,
        book: c.book?.name || "",
        dayOfWeek: c.dayOfWeek,
        startTime: (c.startTime || "").substring(0, 5),
        endTime: (c.endTime || "").substring(0, 5),
        room: c.room || "",
        currentDay: c.currentDay || 0,
        totalDays: c.totalDays || 0,
        studentsCount: c.currentStudents || 0,
        maxStudents: c.maxStudents || 0,
        unitId: c.unitId || "",
      };
    });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
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

  const canManageSchedule = user?.role === "admin" || user?.role === "teacher" || user?.role === "secretary";
  const isAdminView = user?.role === "admin" || user?.role === "secretary";

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

  const handleNewClass = (dayOfWeek?: number, startTime?: string) => {
    setEditingClass(null);
    setSelectedDayOfWeek(dayOfWeek);
    setSelectedStartTime(startTime);
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setEditingClass(null);
    setSelectedDayOfWeek(undefined);
    setSelectedStartTime(undefined);
  };

  const handleClassClick = (classItem: any) => {
    setSelectedClassDetail(classItem);
    setShowClassDetail(true);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  const generateCourseColors = (classes: any[]) => {
    const uniqueCourses = [...new Set(classes.map((cls) => cls.title))];
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
      "#eab308",
    ];

    const courseColors: { [key: string]: string } = {};
    uniqueCourses.forEach((course, index) => {
      courseColors[course] = colors[index % colors.length];
    });

    return courseColors;
  };

  const renderAdminCalendarView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

    const classesData = normalizeClasses(apiClasses);

    const filteredClasses = classesData.filter((classItem) => {
      if (selectedTeacherFilter !== "all" && classItem.teacherId !== selectedTeacherFilter) return false;
      if (selectedUnitFilter !== "all" && classItem.unitId !== selectedUnitFilter) return false;
      return true;
    });

    const adminCourseColors = generateCourseColors(classesData);

    return (
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                &larr; Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                Próxima &rarr;
              </Button>
            </div>
            <h3 className="text-lg font-semibold text-center sm:text-left">
              {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 6), "dd MMM yyyy", { locale: ptBR })}
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedUnitFilter} onValueChange={setSelectedUnitFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                <SelectItem value="1">Unidade Centro</SelectItem>
                <SelectItem value="2">Unidade Vila Nova</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTeacherFilter} onValueChange={setSelectedTeacherFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os professores</SelectItem>
                {Array.from(
                  new Map(normalizeClasses(apiClasses).map((c: any) => [c.teacherId, c.teacher])).entries()
                )
                  .filter(([id, nome]) => id && nome)
                  .map(([id, nome]) => (
                    <SelectItem key={id as string} value={id as string}>
                      {nome as string}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto bg-card rounded-lg border shadow-sm">
          <div className="grid grid-cols-8 gap-0 min-w-[1200px]">
            {/* Header row */}
            <div
              className="font-medium text-center bg-muted border-b border-r border-border text-xs sm:text-sm min-w-[60px] max-w-[60px] px-[2px] py-2"
            >
              Horário
            </div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="p-2 font-medium text-center bg-muted border-b border-r border-border text-xs sm:text-sm"
              >
                <div className="font-semibold">{format(day, "EEE", { locale: ptBR })}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(day, "dd/MM", { locale: ptBR })}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((horaSlot) => {
              const [hora] = horaSlot.split(":");
              return (
                <React.Fragment key={horaSlot}>
                  {/* Time label */}
                  <div
                    className="text-xs font-medium text-center bg-muted border-b border-r border-border text-muted-foreground min-w-[60px] max-w-[60px] px-[2px] py-2"
                  >
                    {horaSlot}
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const dayClasses = filteredClasses.filter((classItem) => {
                      if (classItem.dayOfWeek !== day.getDay()) return false;
                      const classHour = parseInt(classItem.startTime.split(":")[0]);
                      return classHour === parseInt(hora);
                    });

                    return (
                      <div
                        key={`${day.toISOString()}-${horaSlot}`}
                        className="min-h-[60px] sm:min-h-[80px] p-1 border-b border-r border-border relative"
                      >
                        <div className="space-y-1">
                          {dayClasses.map((classItem) => (
                            <div
                              key={classItem.id}
                              className="p-2 rounded-lg text-xs cursor-pointer transition-all hover:shadow-md border border-opacity-30 h-full flex items-center justify-center"
                              style={{
                                backgroundColor: adminCourseColors[classItem.title] + "20",
                                borderColor: adminCourseColors[classItem.title],
                                color: "var(--foreground)",
                              }}
                              onClick={() =>
                                handleClassClick({
                                  ...classItem,
                                  bookColor: adminCourseColors[classItem.title],
                                })
                              }
                              data-testid={`admin-class-${classItem.id}`}
                            >
                              <div className="font-semibold text-center leading-tight text-xs">
                                {classItem.title}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add class button */}
                        {dayClasses.length === 0 && isAdminView && day.getDay() !== 0 && (
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-muted/50"
                            onClick={() => handleNewClass(day.getDay(), horaSlot)}
                          >
                            <Button size="sm" variant="outline" className="text-xs">
                              + Adicionar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-3">Legenda dos Cursos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Object.entries(adminCourseColors).map(([courseName, color]) => (
              <div key={courseName} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                <span className="text-sm truncate">{courseName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherCalendarView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

    const classesForTeacher = normalizeClasses(apiClasses).filter(
      (c) => c.teacherId === (user?.id || c.teacherId)
    );

    const teacherCourseColors = generateCourseColors(classesForTeacher);

    return (
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                &larr; Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                Próxima &rarr;
              </Button>
            </div>
            <h3 className="text-lg font-semibold text-center sm:text-left">
              {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 6), "dd MMM yyyy", { locale: ptBR })}
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto bg-card rounded-lg border shadow-sm">
          <div className="grid grid-cols-8 gap-0 min-w-[1200px]">
            {/* Header */}
            <div
              className="font-medium text-center bg-muted border-b border-r border-border text-xs sm:text-sm min-w-[60px] max-w-[60px] px-[2px] py-1.5"
            >
              Horário
            </div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="p-2 font-medium text-center bg-muted border-b border-r border-border text-xs sm:text-sm"
              >
                <div className="font-semibold">{format(day, "EEE", { locale: ptBR })}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(day, "dd/MM", { locale: ptBR })}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((horaSlot) => {
              const [hora] = horaSlot.split(":");
              return (
                <React.Fragment key={horaSlot}>
                  <div
                    className="text-xs font-medium text-center bg-muted border-b border-r border-border text-muted-foreground min-w-[60px] max-w-[60px] px-[2px] py-1"
                  >
                    {horaSlot}
                  </div>

                  {weekDays.map((day) => {
                    const dayClasses = classesForTeacher.filter((classItem) => {
                      if (classItem.dayOfWeek !== day.getDay()) return false;
                      const classHour = parseInt(classItem.startTime.split(":")[0]);
                      return classHour === parseInt(hora);
                    });

                    return (
                      <div
                        key={`${day.toISOString()}-${horaSlot}`}
                        className="min-h-[60px] sm:min-h-[80px] p-1 border-b border-r border-border relative"
                      >
                        {dayClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="p-2 rounded-lg text-xs cursor-pointer transition-all hover:shadow-md border border-opacity-30 h-full flex items-center justify-center"
                            style={{
                              backgroundColor: teacherCourseColors[classItem.title] + "20",
                              borderColor: teacherCourseColors[classItem.title],
                              color: "var(--foreground)",
                            }}
                            onClick={() =>
                              handleClassClick({
                                ...classItem,
                                bookColor: teacherCourseColors[classItem.title],
                                teacher: user?.firstName ? `Prof. ${user.firstName}` : classItem.teacher,
                              })
                            }
                            data-testid={`teacher-class-${classItem.id}`}
                          >
                            <div className="font-semibold text-center leading-tight text-xs">
                              {classItem.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Legenda de cores dos cursos */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-3">Legenda dos Cursos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Object.entries(teacherCourseColors).map(([courseName, color]) => (
              <div key={courseName} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                <span className="text-sm truncate">{courseName}</span>
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
            <h2 className="text-2xl font-semibold text-foreground">Agenda</h2>
            <p className="text-sm text-muted-foreground">
              {user?.role === "teacher"
                ? "Gerencie sua agenda de aulas"
                : "Visualize e gerencie a agenda da escola"}
            </p>
          </div>

          {canManageSchedule && (
            <div className="flex items-center space-x-2">
              <Button onClick={handleNewLesson} data-testid="button-new-lesson">
                <i className="fas fa-plus mr-2"></i>
                Nova Aula
              </Button>
              {isAdminView && (
                <Button onClick={() => handleNewClass()} data-testid="button-new-class">
                  <i className="fas fa-users mr-2"></i>
                  Nova Turma
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue={isAdminView ? "admin" : "teacher"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            {isAdminView && <TabsTrigger value="admin">Agenda Administrativa</TabsTrigger>}
            {user?.role === "teacher" && <TabsTrigger value="teacher">Minhas Aulas</TabsTrigger>}
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-calendar-day text-primary"></i>
                  <span>Aulas de Hoje</span>
                  <Badge variant="secondary">
                    {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                      <div
                        key={lesson.id}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 border border-border/50 card-hover transition-smooth"
                      >
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

          {isAdminView && (
            <TabsContent value="admin" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-users-cog text-primary"></i>
                    <span>Agenda Administrativa</span>
                    <Badge variant="secondary">Todas as turmas e professores</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderAdminCalendarView()}</CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.role === "teacher" && (
            <TabsContent value="teacher" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-chalkboard-teacher text-primary"></i>
                    <span>Minhas Aulas</span>
                    <Badge variant="secondary">
                      {user?.firstName ? `Prof. ${user.firstName}` : "Professor"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderTeacherCalendarView()}</CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={handleCloseModal}
        lessonToEdit={editingLesson}
        defaultTeacherId={selectedTeacherFilter && selectedTeacherFilter !== "all" ? selectedTeacherFilter : undefined}
      />

      {/* Class Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={handleCloseClassModal}
        classToEdit={editingClass}
        defaultTeacherId={selectedTeacherFilter && selectedTeacherFilter !== "all" ? selectedTeacherFilter : undefined}
        defaultDayOfWeek={selectedDayOfWeek}
        defaultStartTime={selectedStartTime}
      />

      {/* Class Detail Modal */}
      <ClassDetailModal
        isOpen={showClassDetail}
        onClose={() => setShowClassDetail(false)}
        classData={selectedClassDetail}
      />
    </Layout>
  );
}
