import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeacherScheduleEntry {
  id: string;
  teacherId: string;
  unitId: string;
  courseName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  notes?: string;
  isActive: boolean;
  teacher: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

const TeacherScheduleView: React.FC = () => {
  const { user } = useAuth();

  // Fetch teacher's individual schedule
  const { data: teacherSchedule = [], isLoading: scheduleLoading, error } = useQuery<TeacherScheduleEntry[]>({
    queryKey: ['my-teacher-schedule', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/teacher-schedule/my-schedule');
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No schedule found
        }
        throw new Error('Erro ao buscar sua agenda');
      }
      return response.json();
    },
    enabled: !!user?.id && user?.role === 'teacher'
  });

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || 'Desconhecido';
  };

  const getDayShort = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.short || 'N/A';
  };

  // Group schedule entries by day of week
  const scheduleByDay = teacherSchedule.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) {
      acc[entry.dayOfWeek] = [];
    }
    acc[entry.dayOfWeek].push(entry);
    return acc;
  }, {} as Record<number, TeacherScheduleEntry[]>);

  // Get current week dates for display
  const currentWeekStart = startOfWeek(new Date(), { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  if (scheduleLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando sua agenda...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar agenda</h3>
          <p className="text-muted-foreground">
            Não foi possível carregar sua agenda. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (teacherSchedule.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Agenda Vazia</h3>
          <p className="text-muted-foreground">
            Você ainda não possui horários cadastrados em sua agenda.
            <br />
            Entre em contato com a administração para configurar seus horários.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visão Semanal - {format(currentWeekStart, 'dd/MM', { locale: ptBR })} a {format(addDays(currentWeekStart, 6), 'dd/MM/yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[700px] grid grid-cols-7 gap-2">
              {weekDays.map((date, index) => {
                const dayEntries = scheduleByDay[index] || [];
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div
                    key={index}
                    className={`p-2 md:p-3 rounded-lg border ${
                      isToday ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                    }`}
                  >
                    <div className="text-center mb-2">
                      <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                        <span className="hidden sm:inline">{getDayName(index)}</span>
                        <span className="sm:hidden">{getDayShort(index)}</span>
                      </div>
                      <div className={`text-xs ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {format(date, 'dd/MM')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayEntries
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="text-xs p-1 bg-background rounded border"
                          >
                            <div className="font-medium truncate">{entry.courseName}</div>
                            <div className="text-muted-foreground">
                              {formatTime(entry.startTime)}-{formatTime(entry.endTime)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Schedule by Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Agenda Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day) => {
              const dayEntries = scheduleByDay[day.value] || [];
              if (dayEntries.length === 0) return null;

              return (
                <div key={day.value} className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {day.label}
                  </h3>
                  <div className="grid gap-3">
                    {dayEntries
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((entry) => (
                        <Card key={entry.id} className="p-3 md:p-4 bg-muted/30">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs sm:text-sm">
                                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                  </span>
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                  <MapPin className="h-3 w-3" />
                                  <span className="text-xs sm:text-sm">{entry.room}</span>
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-base md:text-lg mb-1">{entry.courseName}</h4>
                              <p className="text-sm md:text-base text-muted-foreground mb-2">
                                <strong>Unidade:</strong> {entry.unit.name}
                              </p>
                              {entry.notes && (
                                <div className="mt-3 p-2 md:p-3 bg-background rounded-md border">
                                  <p className="text-xs md:text-sm">
                                    <strong>Observações:</strong> {entry.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherScheduleView;