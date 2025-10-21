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
import { Loader2, Plus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Unit {
  id: string;
  name: string;
}

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
  scheduleType: 'fixed' | 'flexible'; // Novo campo para tipo de horário
  isRecurring: boolean; // Novo campo para horários recorrentes
  teacher: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
}

interface ScheduleFormData {
  teacherId: string;
  unitId: string;
  courseName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
  scheduleType: 'fixed' | 'flexible'; // Novo campo para tipo de horário
  isRecurring: boolean; // Novo campo para horários recorrentes
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

const TeacherIndividualScheduleManager: React.FC = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TeacherScheduleEntry | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    teacherId: '',
    unitId: '',
    courseName: '',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    room: '',
    notes: '',
    scheduleType: 'fixed',
    isRecurring: true
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

  // Fetch units
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await fetch('/api/units');
      if (!response.ok) throw new Error('Erro ao buscar unidades');
      return response.json();
    }
  });

  // Fetch teacher individual schedule
  const { data: teacherSchedule = [], isLoading: scheduleLoading } = useQuery<TeacherScheduleEntry[]>({
    queryKey: ['teacher-individual-schedule', selectedTeacherId],
    queryFn: async () => {
      const response = await fetch(`/api/teacher-schedule/${selectedTeacherId}`);
      if (!response.ok) throw new Error('Erro ao buscar agenda do professor');
      return response.json();
    },
    enabled: !!selectedTeacherId
  });

  // Create schedule entry mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: ScheduleFormData) => {
      const response = await fetch('/api/teacher-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar entrada na agenda');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Entrada na agenda criada com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-individual-schedule', selectedTeacherId] });
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

  // Update schedule entry mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ScheduleFormData }) => {
      const response = await fetch(`/api/teacher-schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar entrada na agenda');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Entrada na agenda atualizada com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-individual-schedule', selectedTeacherId] });
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

  // Delete schedule entry mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/teacher-schedule/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir entrada na agenda');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Entrada na agenda excluída com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-individual-schedule', selectedTeacherId] });
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
    setScheduleForm({
      teacherId: selectedTeacherId,
      unitId: '',
      courseName: '',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      room: '',
      notes: '',
      scheduleType: 'fixed',
      isRecurring: true
    });
    setEditingEntry(null);
  };

  const handleOpenModal = (entry?: TeacherScheduleEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setScheduleForm({
        teacherId: entry.teacherId,
        unitId: entry.unitId,
        courseName: entry.courseName,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room,
        notes: entry.notes || '',
        scheduleType: entry.scheduleType || 'fixed',
        isRecurring: entry.isRecurring !== undefined ? entry.isRecurring : true
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacherId) {
      toast({
        title: 'Erro',
        description: 'Selecione um professor primeiro',
        variant: 'destructive'
      });
      return;
    }

    const formData = { ...scheduleForm, teacherId: selectedTeacherId };

    if (editingEntry) {
      updateScheduleMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createScheduleMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrada da agenda?')) {
      deleteScheduleMutation.mutate(id);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || 'Desconhecido';
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  // Group schedule entries by day of week
  const scheduleByDay = teacherSchedule.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) {
      acc[entry.dayOfWeek] = [];
    }
    acc[entry.dayOfWeek].push(entry);
    return acc;
  }, {} as Record<number, TeacherScheduleEntry[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda Individual do Professor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="teacher-select">Selecionar Professor</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um professor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleOpenModal()}
              disabled={!selectedTeacherId}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar Horário</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedTeacherId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Agenda de {teachers?.find(t => t.id === selectedTeacherId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando agenda...</span>
              </div>
            ) : teacherSchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum horário cadastrado para este professor</p>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS_OF_WEEK.map((day) => {
                  const dayEntries = scheduleByDay[day.value] || [];
                  if (dayEntries.length === 0) return null;

                  return (
                    <div key={day.value} className="space-y-2">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        {day.label}
                      </h3>
                      <div className="grid gap-3">
                        {dayEntries
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((entry) => (
                            <Card key={entry.id} className="p-3 md:p-4">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex-1 w-full">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                    </Badge>
                                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                      <MapPin className="h-3 w-3" />
                                      {entry.room}
                                    </Badge>
                                    <Badge 
                                      variant={entry.scheduleType === 'fixed' ? 'default' : 'outline'} 
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {entry.scheduleType === 'fixed' ? (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          Fixo
                                        </>
                                      ) : (
                                        <>
                                          <Calendar className="h-3 w-3" />
                                          Flexível
                                        </>
                                      )}
                                    </Badge>
                                    {entry.isRecurring && (
                                      <Badge variant="outline" className="text-xs">
                                        Recorrente
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm md:text-base">{entry.courseName}</h4>
                                  <p className="text-xs md:text-sm text-muted-foreground">
                                    Unidade: {entry.unit.name}
                                  </p>
                                  {entry.notes && (
                                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                      Observações: {entry.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenModal(entry)}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="ml-1 sm:hidden">Editar</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(entry.id)}
                                    className="text-destructive hover:text-destructive flex-1 sm:flex-none"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-1 sm:hidden">Excluir</span>
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Editar Horário' : 'Adicionar Horário'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="unitId">Unidade</Label>
              <Select
                value={scheduleForm.unitId}
                onValueChange={(value) => setScheduleForm(prev => ({ ...prev, unitId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="courseName">Nome do Curso/Atividade</Label>
              <Input
                id="courseName"
                value={scheduleForm.courseName}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, courseName: e.target.value }))}
                placeholder="Ex: Inglês Básico, Reunião Pedagógica..."
                required
              />
            </div>

            <div>
              <Label htmlFor="dayOfWeek">Dia da Semana</Label>
              <Select
                value={scheduleForm.dayOfWeek.toString()}
                onValueChange={(value) => setScheduleForm(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Horário Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">Horário Fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="room">Sala</Label>
              <Input
                id="room"
                value={scheduleForm.room}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, room: e.target.value }))}
                placeholder="Ex: Sala 101, Online..."
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Configurações de Horário */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm text-foreground">Configurações de Horário</h4>
              
              <div>
                <Label htmlFor="scheduleType">Tipo de Horário</Label>
                <Select
                  value={scheduleForm.scheduleType}
                  onValueChange={(value: 'fixed' | 'flexible') => setScheduleForm(prev => ({ ...prev, scheduleType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Horário Fixo</div>
                          <div className="text-xs text-muted-foreground">Mesmo horário toda semana</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="flexible">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Horário Flexível</div>
                          <div className="text-xs text-muted-foreground">Horário pode variar</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={scheduleForm.isRecurring}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isRecurring" className="text-sm">
                  Horário recorrente (repetir semanalmente)
                </Label>
              </div>

              {scheduleForm.scheduleType === 'flexible' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                    <div className="text-sm text-amber-800">
                      <strong>Horário Flexível:</strong> Este horário serve como base, mas pode ser ajustado conforme necessário. 
                      Ideal para aulas particulares ou atividades que podem ter variações de horário.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
                className="flex-1"
              >
                {(createScheduleMutation.isPending || updateScheduleMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingEntry ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherIndividualScheduleManager;