import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  book: {
    id: string;
    name: string;
    course: {
      id: string;
      name: string;
    };
  };
  teacher: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
}

interface TimeSlot {
  day: string;
  time: string;
  isOccupied: boolean;
  classInfo?: {
    id: string;
    name: string;
    room: string;
    course: string;
  };
}

interface TeacherSchedule {
  teacherId: string;
  teacherName: string;
  occupiedSlots: TimeSlot[];
  availableSlots: TimeSlot[];
}

interface LessonFormData {
  classId: string;
  teacherId: string;
  title: string;
  bookDay: number;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
}

const TeacherScheduleManager: React.FC = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    classId: '',
    teacherId: '',
    title: '',
    bookDay: 1,
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await fetch('/api/teachers');
      if (!response.ok) throw new Error('Erro ao buscar professores');
      return response.json();
    }
  });

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Erro ao buscar turmas');
      return response.json();
    }
  });

  // Fetch teacher schedule
  const { data: schedule, isLoading: scheduleLoading } = useQuery<TeacherSchedule>({
    queryKey: ['teacher-schedule', selectedTeacherId],
    queryFn: async () => {
      const response = await fetch(`/api/teachers/${selectedTeacherId}/schedule`);
      if (!response.ok) throw new Error('Erro ao buscar horários do professor');
      return response.json();
    },
    enabled: !!selectedTeacherId
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: LessonFormData) => {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData)
      });
      if (!response.ok) throw new Error('Erro ao criar aula');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Aula cadastrada com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-schedule', selectedTeacherId] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setLessonForm({
      classId: '',
      teacherId: selectedTeacherId === 'all' ? '' : selectedTeacherId, // Pré-seleciona professor se específico
      title: '',
      bookDay: 1,
      date: '',
      startTime: '',
      endTime: '',
      room: '',
      notes: ''
    });
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isOccupied) {
      toast({
        title: "Horário Ocupado",
        description: `Este horário já está ocupado pela turma ${slot.classInfo?.name}`,
        variant: "destructive"
      });
      return;
    }

    setSelectedSlot(slot);
    resetForm();
    
    // Pré-preenche data e horário baseado no slot clicado
    const today = new Date();
    const dayIndex = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].indexOf(slot.day);
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + ((dayIndex + 1 - today.getDay() + 7) % 7));
    
    setLessonForm(prev => ({
      ...prev,
      teacherId: selectedTeacherId === 'all' ? '' : selectedTeacherId, // Pré-seleciona professor se específico
      date: nextDate.toISOString().split('T')[0],
      startTime: slot.time,
      endTime: getEndTime(slot.time)
    }));
    
    setIsModalOpen(true);
  };

  const getEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + 1;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonForm.classId || !lessonForm.title || !lessonForm.teacherId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createLessonMutation.mutate({
      classId: lessonForm.classId,
      teacherId: lessonForm.teacherId,
      title: lessonForm.title,
      bookDay: lessonForm.bookDay,
      date: lessonForm.date,
      startTime: lessonForm.startTime,
      endTime: lessonForm.endTime,
      room: lessonForm.room,
      notes: lessonForm.notes
    });
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = classes?.find(c => c.id === classId);
    if (selectedClass) {
      setLessonForm(prev => ({
        ...prev,
        classId,
        title: `Aula - ${selectedClass.book.course.name} - ${selectedClass.book.name}`
      }));
    }
  };

  const renderScheduleGrid = () => {
    if (!schedule) return null;

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const hours = Array.from({ length: 13 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);

    const allSlots = [...schedule.occupiedSlots, ...schedule.availableSlots];

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-7 gap-1 mt-4">
          <div className="font-semibold text-center p-2 text-sm md:text-base">Horário</div>
          {days.map(day => (
            <div key={day} className="font-semibold text-center p-2 text-xs md:text-sm lg:text-base">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
          
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-center p-1 md:p-2 border bg-gray-50 text-xs md:text-sm">{hour}</div>
              {days.map(day => {
                const slot = allSlots.find(s => s.day === day && s.time === hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`p-1 md:p-2 border cursor-pointer transition-colors min-h-[40px] md:min-h-[50px] ${
                      slot?.isOccupied
                        ? 'bg-red-100 hover:bg-red-200'
                        : 'bg-green-100 hover:bg-green-200'
                    }`}
                    onClick={() => slot && handleSlotClick(slot)}
                  >
                    {slot?.isOccupied ? (
                      <div className="text-xs">
                        <div className="font-semibold truncate">{slot.classInfo?.name}</div>
                        <div className="truncate">{slot.classInfo?.room}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-center">
                        <span className="hidden md:inline">Disponível</span>
                        <span className="md:hidden">Livre</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Horários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teacher-select">Selecionar Professor</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os professores</SelectItem>
                  {teachers?.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {teachersLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando professores...</span>
              </div>
            )}

            {scheduleLoading && selectedTeacherId && selectedTeacherId !== 'all' && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando horários...</span>
              </div>
            )}

            {selectedTeacherId === 'all' && (
              <div className="text-center p-8 text-gray-500">
                <p>Selecione um professor específico para visualizar os horários</p>
                <p className="text-sm mt-2">Ou clique em "Cadastrar Nova Aula" para agendar uma aula</p>
                <Button 
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Nova Aula
                </Button>
              </div>
            )}

            {schedule && selectedTeacherId !== 'all' && renderScheduleGrid()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Aula</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Campo de seleção de professor - só aparece quando "Todos os professores" está selecionado */}
            {selectedTeacherId === 'all' && (
              <div>
                <Label htmlFor="teacher-select-modal">Professor *</Label>
                <Select value={lessonForm.teacherId} onValueChange={(value) => setLessonForm(prev => ({ ...prev, teacherId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="class-select">Turma *</Label>
              <Select value={lessonForm.classId} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.book.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título da Aula *</Label>
              <Input
                id="title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Aula 1 - Introdução"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookDay">Dia do Livro</Label>
                <Input
                  id="bookDay"
                  type="number"
                  min="1"
                  value={lessonForm.bookDay}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, bookDay: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="room">Sala</Label>
                <Input
                  id="room"
                  value={lessonForm.room}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="Ex: Sala 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={lessonForm.date}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={lessonForm.startTime}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={lessonForm.endTime}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={lessonForm.notes}
                onChange={(e) => setLessonForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a aula..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLessonMutation.isPending}>
                {createLessonMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Aula
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherScheduleManager;