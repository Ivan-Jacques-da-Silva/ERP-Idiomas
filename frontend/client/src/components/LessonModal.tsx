import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertLessonSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Extended schema for lesson form validation
const lessonFormSchema = insertLessonSchema.extend({
  date: z.date({ required_error: "Data é obrigatória" }),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de fim é obrigatório"),
  bookDay: z.coerce.number().min(1, "Dia do livro deve ser pelo menos 1"),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const start = data.startTime.split(':').map(Number);
    const end = data.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: "Horário de fim deve ser posterior ao horário de início",
  path: ["endTime"],
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonToEdit?: any; // Existing lesson data when editing
  defaultClassId?: string; // Pre-select a class when creating from class context
}

export default function LessonModal({ 
  isOpen, 
  onClose, 
  lessonToEdit, 
  defaultClassId 
}: LessonModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [conflictCheck, setConflictCheck] = useState<{ hasConflict: boolean; conflictingLesson?: any } | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const isEditing = !!lessonToEdit;

  // Fetch classes (filtered by teacher if user is a teacher)
  const { data: classes = [], isLoading: classesLoading } = useQuery<any[]>({
    queryKey: user?.role === 'teacher' 
      ? ["/api/classes/teacher", user.id]
      : ["/api/classes"],
    enabled: isOpen,
  });

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      classId: defaultClassId || "",
      title: "",
      bookDay: 1,
      date: new Date(),
      startTime: "",
      endTime: "",
      room: "",
      status: "scheduled",
      notes: "",
    },
  });

  // Reset form when modal opens/closes or when lessonToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (lessonToEdit) {
        // Editing existing lesson
        form.reset({
          classId: lessonToEdit.classId,
          title: lessonToEdit.title,
          bookDay: lessonToEdit.bookDay,
          date: new Date(lessonToEdit.date),
          startTime: lessonToEdit.startTime,
          endTime: lessonToEdit.endTime,
          room: lessonToEdit.room || "",
          status: lessonToEdit.status,
          notes: lessonToEdit.notes || "",
        });
      } else {
        // Creating new lesson
        form.reset({
          classId: defaultClassId || "",
          title: "",
          bookDay: 1,
          date: new Date(),
          startTime: "",
          endTime: "",
          room: "",
          status: "scheduled",
          notes: "",
        });
      }
      setConflictCheck(null);
    }
  }, [isOpen, lessonToEdit, defaultClassId, form]);

  // Check for conflicts when time fields change
  const checkConflicts = async (classId: string, date: Date, startTime: string, endTime: string) => {
    if (!classId || !startTime || !endTime) {
      setConflictCheck(null);
      return;
    }

    // Get teacher ID from selected class
    const selectedClass = classes.find((cls: any) => cls.id === classId);
    if (!selectedClass?.teacher?.id) {
      setConflictCheck(null);
      return;
    }

    setCheckingConflict(true);
    try {
      const conflictResult = await apiRequest('POST', '/api/lessons/check-conflicts', {
        teacherId: selectedClass.teacher.id,
        date: date.toISOString(),
        startTime,
        endTime,
        excludeLessonId: lessonToEdit?.id
      }) as { hasConflict: boolean; conflictingLesson?: any };
      setConflictCheck(conflictResult);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setConflictCheck(null);
    } finally {
      setCheckingConflict(false);
    }
  };

  // Watch form fields for conflict checking
  const watchedClassId = form.watch("classId");
  const watchedDate = form.watch("date");
  const watchedStartTime = form.watch("startTime");
  const watchedEndTime = form.watch("endTime");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkConflicts(watchedClassId, watchedDate, watchedStartTime, watchedEndTime);
    }, 500); // Debounce conflict checking

    return () => clearTimeout(timeoutId);
  }, [watchedClassId, watchedDate, watchedStartTime, watchedEndTime, classes]);

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const lessonData = {
        ...data,
        date: data.date.toISOString(),
      };
      return await apiRequest("POST", "/api/lessons", lessonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons/today"] });
      // Invalidate teacher queries with correct key format
      if (user?.role === 'teacher') {
        queryClient.invalidateQueries({ queryKey: ["/api/lessons/teacher", user.id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/lessons/teacher"] });
      }
      toast({
        title: "Sucesso!",
        description: "Aula criada com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar aula. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const lessonData = {
        ...data,
        date: data.date.toISOString(),
      };
      return await apiRequest("PUT", `/api/lessons/${lessonToEdit.id}`, lessonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons/today"] });
      // Invalidate teacher queries with correct key format
      if (user?.role === 'teacher') {
        queryClient.invalidateQueries({ queryKey: ["/api/lessons/teacher", user.id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/lessons/teacher"] });
      }
      toast({
        title: "Sucesso!",
        description: "Aula atualizada com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar aula. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: LessonFormData) => {
    // Final conflict check before submission
    if (conflictCheck?.hasConflict) {
      toast({
        title: "Conflito de horário",
        description: "Resolve o conflito de horário antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updateLessonMutation.mutate(data);
    } else {
      createLessonMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    setConflictCheck(null);
    onClose();
  };

  const isSubmitting = createLessonMutation.isPending || updateLessonMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Aula" : "Nova Aula"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Selection */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turma</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={classesLoading}
                        data-testid="select-class"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {(classes as any[]).map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} - {cls.book?.name}
                              {user?.role !== 'teacher' && cls.teacher && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({cls.teacher.firstName} {cls.teacher.lastName})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Aula</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-lesson-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Book Day */}
              <FormField
                control={form.control}
                name="bookDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Livro</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        data-testid="input-book-day"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="input-lesson-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              "Selecione uma data"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field}
                        data-testid="input-start-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Fim</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field}
                        data-testid="input-end-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Room */}
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-room" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || "scheduled"} 
                        onValueChange={field.onChange}
                        data-testid="select-status"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="in_progress">Em andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""}
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conflict Warning */}
            {checkingConflict && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando conflitos...</span>
              </div>
            )}

            {conflictCheck?.hasConflict && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <div className="flex items-start space-x-2">
                  <div className="text-destructive">⚠️</div>
                  <div>
                    <h4 className="font-medium text-destructive">Conflito de horário detectado</h4>
                    <p className="text-sm text-destructive/80 mt-1">
                      Já existe uma aula "{conflictCheck.conflictingLesson?.title}" 
                      no horário {conflictCheck.conflictingLesson?.startTime}-{conflictCheck.conflictingLesson?.endTime}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || conflictCheck?.hasConflict}
                data-testid="button-save-lesson"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Atualizando..." : "Criando..."}
                  </>
                ) : (
                  isEditing ? "Atualizar" : "Criar Aula"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}