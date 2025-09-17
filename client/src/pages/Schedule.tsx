import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
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
              <Label className="text-sm font-medium text-gray-500">Professor</Label>
              <p className="text-sm font-semibold">{classData.teacher}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Horário</Label>
              <p className="text-sm">{classData.startTime} - {classData.endTime}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Sala</Label>
              <p className="text-sm">{classData.room}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Livro</Label>
              <p className="text-sm">{classData.book}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Progresso</Label>
              <p className="text-sm">Dia {classData.currentDay}/{classData.totalDays}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Alunos</Label>
              <p className="text-sm">{classData.studentsCount}/{classData.maxStudents}</p>
            </div>
          </div>

          {/* Lista de Alunos */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-3 block">Alunos Matriculados</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {classData.students?.map((student: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <span className="text-sm">{student.name}</span>
                </div>
              )) || [
                  { name: 'Ana Silva' },
                  { name: 'João Santos' },
                  { name: 'Maria Costa' },
                  { name: 'Pedro Lima' },
                  { name: 'Carla Oliveira' },
                ].map((student, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("all");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { locale: ptBR }));
  const [selectedClassDetail, setSelectedClassDetail] = useState<any>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);

  // Fetch lessons based on user role
  const { data: lessons, isLoading } = useQuery<any[]>({
    queryKey: user?.role === 'teacher'
      ? ["/api/lessons/teacher", user.id]
      : ["/api/lessons"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Fetch teachers for filter (only for admin/secretary)
  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'secretary'),
    retry: false,
  });

  // Fetch units for filter
  const { data: units = [] } = useQuery<any[]>({
    queryKey: ["/api/units"],
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'secretary'),
    retry: false,
  });

  // Fetch admin schedule data (for administrative view)
  const { data: adminSchedule = [] } = useQuery<any[]>({
    queryKey: ["/api/schedule/admin"],
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'secretary'),
    retry: false,
  });

  // Fetch teacher schedule data
  const { data: teacherSchedule = [] } = useQuery<any[]>({
    queryKey: ["/api/schedule/teacher", user?.id],
    enabled: isAuthenticated && user?.role === 'teacher',
    retry: false,
  });

  const { data: todaysLessons } = useQuery<any[]>({
    queryKey: ["/api/lessons/today"],
    retry: false,
    enabled: isAuthenticated,
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

  const canManageSchedule = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'secretary';
  const isAdminView = user?.role === 'admin' || user?.role === 'secretary';

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

  const handleNewClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleEditClass = (classItem: any) => {
    setEditingClass(classItem);
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setEditingClass(null);
  };

  const handleClassClick = (classItem: any) => {
    setSelectedClassDetail(classItem);
    setShowClassDetail(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  // Generate dynamic colors for courses
  const generateCourseColors = (classes: any[]) => {
    const uniqueCourses = [...new Set(classes.map(cls => cls.title))];
    const colors = [
      '#3b82f6', // Blue
      '#10b981', // Green  
      '#f59e0b', // Orange
      '#8b5cf6', // Purple
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Orange
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#14b8a6', // Teal
      '#eab308', // Yellow
    ];
    
    const courseColors: { [key: string]: string } = {};
    uniqueCourses.forEach((course, index) => {
      courseColors[course] = colors[index % colors.length];
    });
    
    return courseColors;
  };

  // Get colors for admin and teacher schedules
  const adminCourseColors = generateCourseColors(mockAdminSchedule);
  const teacherCourseColors = generateCourseColors(mockTeacherSchedule);

  const renderAdminCalendarView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`); // 8:00 to 21:00

    // Dados de agenda administrativa (turmas regulares)
    const mockAdminSchedule = [
      {
        id: '1',
        title: 'Inglês A1 - Manhã',
        teacher: 'Prof. João Silva',
        teacherId: 'user-1',
        book: 'English Basic - Book 1',
        dayOfWeek: 1, // Segunda
        startTime: '09:00',
        endTime: '11:00',
        room: 'Sala 101',
        currentDay: 5,
        totalDays: 30,
        studentsCount: 12,
        maxStudents: 15,
        unitId: '1'
      },
      {
        id: '2',
        title: 'Inglês A2 - Tarde',
        teacher: 'Prof. João Silva',
        teacherId: 'user-1',
        book: 'English Basic - Book 2',
        dayOfWeek: 1, // Segunda
        startTime: '14:00',
        endTime: '16:00',
        room: 'Sala 102',
        currentDay: 8,
        totalDays: 35,
        studentsCount: 10,
        maxStudents: 15,
        unitId: '1'
      },
      {
        id: '3',
        title: 'Inglês B1 - Noite',
        teacher: 'Prof. Maria Santos',
        teacherId: 'user-2',
        book: 'English Intermediate - Book 1',
        dayOfWeek: 1, // Segunda
        startTime: '19:00',
        endTime: '21:00',
        room: 'Sala 103',
        currentDay: 3,
        totalDays: 40,
        studentsCount: 8,
        maxStudents: 12,
        unitId: '1'
      },
      {
        id: '4',
        title: 'Espanhol A1',
        teacher: 'Prof. Maria Santos',
        teacherId: 'user-2',
        book: 'Español Básico - Libro 1',
        dayOfWeek: 2, // Terça
        startTime: '18:00',
        endTime: '20:00',
        room: 'Sala 201',
        currentDay: 4,
        totalDays: 25,
        studentsCount: 9,
        maxStudents: 12,
        unitId: '1'
      },
      {
        id: '5',
        title: 'Inglês B2 - Manhã',
        teacher: 'Prof. Ana Costa',
        teacherId: 'user-7',
        book: 'English Intermediate - Book 2',
        dayOfWeek: 2, // Terça
        startTime: '10:00',
        endTime: '12:00',
        room: 'Sala 104',
        currentDay: 12,
        totalDays: 42,
        studentsCount: 13,
        maxStudents: 15,
        unitId: '1'
      },
      {
        id: '6',
        title: 'Inglês A3 - Tarde',
        teacher: 'Prof. Ana Costa',
        teacherId: 'user-7',
        book: 'English Basic - Book 3',
        dayOfWeek: 3, // Quarta
        startTime: '15:00',
        endTime: '17:00',
        room: 'Sala 105',
        currentDay: 18,
        totalDays: 40,
        studentsCount: 11,
        maxStudents: 15,
        unitId: '1'
      },
      {
        id: '7',
        title: 'Inglês Avançado',
        teacher: 'Prof. Felipe Rodrigues',
        teacherId: 'user-8',
        book: 'English Advanced - Book 1',
        dayOfWeek: 4, // Quinta
        startTime: '19:00',
        endTime: '21:00',
        room: 'Sala 301',
        currentDay: 22,
        totalDays: 45,
        studentsCount: 7,
        maxStudents: 10,
        unitId: '2'
      },
      {
        id: '8',
        title: 'Espanhol A2',
        teacher: 'Prof. Patricia Lima',
        teacherId: 'user-9',
        book: 'Español Básico - Libro 2',
        dayOfWeek: 5, // Sexta
        startTime: '16:00',
        endTime: '18:00',
        room: 'Sala 202',
        currentDay: 15,
        totalDays: 28,
        studentsCount: 10,
        maxStudents: 12,
        unitId: '1'
      },
      // Aulas sobrepostas no mesmo horário para demonstrar
      {
        id: '9',
        title: 'Inglês A1 - Tarde',
        teacher: 'Prof. Patricia Lima',
        teacherId: 'user-9',
        book: 'English Basic - Book 1',
        dayOfWeek: 2, // Terça
        startTime: '14:00',
        endTime: '16:00',
        room: 'Sala 203',
        currentDay: 7,
        totalDays: 30,
        studentsCount: 14,
        maxStudents: 15,
        unitId: '1'
      }
    ];

    // Filter classes by selected teacher and unit
    const filteredClasses = mockAdminSchedule.filter(classItem => {
      if (selectedTeacherFilter !== 'all' && classItem.teacherId !== selectedTeacherFilter) return false;
      if (selectedUnitFilter !== 'all' && classItem.unitId !== selectedUnitFilter) return false;
      return true;
    });

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

          <div className="flex items-center space-x-4">
            <Select value={selectedUnitFilter} onValueChange={setSelectedUnitFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                <SelectItem value="1">Unidade Centro</SelectItem>
                <SelectItem value="2">Unidade Vila Nova</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTeacherFilter} onValueChange={setSelectedTeacherFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os professores</SelectItem>
                <SelectItem value="user-1">João Silva</SelectItem>
                <SelectItem value="user-2">Maria Santos</SelectItem>
                <SelectItem value="user-7">Ana Costa</SelectItem>
                <SelectItem value="user-8">Felipe Rodrigues</SelectItem>
                <SelectItem value="user-9">Patricia Lima</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
          <div className="grid grid-cols-8 gap-0 min-w-[900px]">
            {/* Header row */}
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
                  {/* Time label */}
                  <div key={`time-${timeSlot}`} className="p-3 text-xs font-medium text-center bg-gray-50 border-b border-r text-gray-600">
                    {timeSlot}
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const dayClasses = filteredClasses.filter(classItem => {
                      if (classItem.dayOfWeek !== day.getDay()) return false;
                      const classHour = parseInt(classItem.startTime.split(':')[0]);
                      return classHour === parseInt(hour);
                    });

                    return (
                      <div key={`${day.toISOString()}-${timeSlot}`} className="min-h-[80px] p-1 border-b border-r border-gray-100 relative">
                        <div className="space-y-1">
                          {dayClasses.map((classItem, index) => (
                            <div
                              key={classItem.id}
                              className="p-3 rounded-lg text-sm cursor-pointer transition-all hover:shadow-md border border-opacity-30 h-full flex items-center justify-center"
                              style={{
                                backgroundColor: adminCourseColors[classItem.title] + '20',
                                borderColor: adminCourseColors[classItem.title],
                                color: '#000'
                              }}
                              onClick={() => handleClassClick({
                                ...classItem,
                                bookColor: adminCourseColors[classItem.title]
                              })}
                              data-testid={`admin-class-${classItem.id}`}
                            >
                              <div className="font-semibold text-center leading-tight">{classItem.title}</div>
                            </div>
                          ))}
                        </div>

                        {/* Add class button for empty slots or when admin */}
                        {dayClasses.length === 0 && isAdminView && (
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-gray-50 bg-opacity-50"
                            onClick={() => handleNewClass()}
                          >
                            <Button size="sm" variant="outline" className="text-xs">
                              + Adicionar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Legenda dos Cursos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(adminCourseColors).map(([courseName, color]) => (
              <div key={courseName} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sm">{courseName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherCalendarView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);

    // Dados específicos do professor
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
                            className="p-3 rounded-lg text-sm cursor-pointer transition-all hover:shadow-md border border-opacity-30 h-full flex items-center justify-center"
                            style={{
                              backgroundColor: teacherCourseColors[classItem.title] + '20',
                              borderColor: teacherCourseColors[classItem.title],
                              color: '#000'
                            }}
                            onClick={() => handleClassClick({
                              ...classItem,
                              bookColor: teacherCourseColors[classItem.title],
                              teacher: 'Prof. Ivan Silva'
                            })}
                            data-testid={`teacher-class-${classItem.id}`}
                          >
                            <div className="font-semibold text-center leading-tight">{classItem.title}</div>
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

        {/* Legenda de cores dos cursos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Legenda dos Cursos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(teacherCourseColors).map(([courseName, color]) => (
              <div key={courseName} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sm">{courseName}</span>
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
              {user?.role === 'teacher'
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
                <Button onClick={handleNewClass} data-testid="button-new-class">
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
            {user?.role === 'teacher' && <TabsTrigger value="teacher">Minhas Aulas</TabsTrigger>}
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
                    <Badge variant="secondary">
                      Todas as turmas e professores
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderAdminCalendarView()}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.role === 'teacher' && (
            <TabsContent value="teacher" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-chalkboard-teacher text-primary"></i>
                    <span>Minhas Aulas</span>
                    <Badge variant="secondary">
                      Prof. Ivan Silva
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTeacherCalendarView()}
                </CardContent>
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
      />

      {/* Class Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={handleCloseClassModal}
        classToEdit={editingClass}
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