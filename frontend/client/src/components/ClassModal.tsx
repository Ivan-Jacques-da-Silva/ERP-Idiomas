import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, extractErrorMessage } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Trash2 } from "lucide-react";

// Extended schema for class form validation
const classFormSchema = z.object({
  name: z.string().min(1, "Nome da turma é obrigatório"),
  bookId: z.string().min(1, "Livro é obrigatório"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
  unitId: z.string().min(1, "Unidade é obrigatória"),
  dayOfWeek: z.coerce.number().min(0).max(6, "Dia da semana deve ser entre 0-6"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de fim é obrigatório"),
  maxStudents: z.coerce.number().min(1, "Máximo de alunos deve ser pelo menos 1"),
}).refine((data: any) => {
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

type ClassFormData = z.infer<typeof classFormSchema>;

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: any; // Existing class data when editing
  defaultTeacherId?: string; // Pre-select a specific teacher when filter is active
}

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export default function ClassModal({ 
  isOpen, 
  onClose, 
  classToEdit,
  defaultTeacherId
}: ClassModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!classToEdit;

  // Fetch books for dropdown
  const { data: books = [], isLoading: booksLoading } = useQuery<any[]>({
    queryKey: ["/api/books"],
    enabled: isOpen,
  });

  // Fetch teachers for dropdown
  const { data: staff = [], isLoading: staffLoading } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    enabled: isOpen,
  });

  // Fetch units for dropdown
  const { data: units = [], isLoading: unitsLoading } = useQuery<any[]>({
    queryKey: ["/api/units"],
    enabled: isOpen,
  });

  // Filter teachers from staff
  const teachers = staff.filter(s => s.user?.role === 'teacher');

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      bookId: "",
      teacherId: "",
      unitId: "",
      dayOfWeek: 1, // Monday by default
      startTime: "",
      endTime: "",
      room: "",
      maxStudents: 15,
      currentStudents: 0,
    },
  });

  // Reset form when modal opens/closes or when classToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (classToEdit) {
        // Editing existing class
        form.reset({
          name: classToEdit.name,
          bookId: classToEdit.bookId,
          teacherId: classToEdit.teacherId,
          unitId: classToEdit.unitId,
          dayOfWeek: classToEdit.dayOfWeek,
          startTime: classToEdit.startTime,
          endTime: classToEdit.endTime,
          room: classToEdit.room || "",
          maxStudents: classToEdit.maxStudents || 15,
          currentStudents: classToEdit.currentStudents || 0,
        });
      } else {
        // Creating new class
        form.reset({
          name: "",
          bookId: "",
          teacherId: defaultTeacherId || "",
          unitId: "",
          dayOfWeek: 1,
          startTime: "",
          endTime: "",
          room: "",
          maxStudents: 15,
          currentStudents: 0,
        });
      }
    }
  }, [isOpen, classToEdit, defaultTeacherId, form]);

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      return await apiRequest("POST", "/api/classes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/admin"] });
      toast({
        title: "Sucesso!",
        description: "Turma criada com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error) || "Falha ao criar turma. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      return await apiRequest("PUT", `/api/classes/${classToEdit.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/admin"] });
      toast({
        title: "Sucesso!",
        description: "Turma atualizada com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error) || "Falha ao atualizar turma. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/classes/${classToEdit.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/admin"] });
      toast({
        title: "Sucesso!",
        description: "Turma excluída com sucesso.",
      });
      setShowDeleteConfirm(false);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error) || "Falha ao excluir turma. Tente novamente.",
        variant: "destructive",
      });
      setShowDeleteConfirm(false);
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    if (isEditing) {
      updateClassMutation.mutate(data);
    } else {
      createClassMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDeleteConfirm = () => {
    deleteClassMutation.mutate();
  };

  const isSubmitting = createClassMutation.isPending || updateClassMutation.isPending || deleteClassMutation.isPending;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Turma" : "Nova Turma"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Turma</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-class-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Book Selection */}
                <FormField
                  control={form.control}
                  name="bookId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Livro</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={booksLoading}
                          data-testid="select-book"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um livro" />
                          </SelectTrigger>
                          <SelectContent>
                            {books.map((book: any) => (
                              <SelectItem key={book.id} value={book.id}>
                                {book.name} - {book.course?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teacher Selection */}
                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professor</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={staffLoading}
                          data-testid="select-teacher"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um professor" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher: any) => (
                              <SelectItem key={teacher.user.id} value={teacher.user.id}>
                                {teacher.user.firstName} {teacher.user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unit Selection */}
                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={unitsLoading}
                          data-testid="select-unit"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit: any) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Day of Week */}
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Semana</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          data-testid="select-day-of-week"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                {/* Max Students */}
                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Alunos</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          data-testid="input-max-students"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-4">
                <div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isSubmitting}
                      data-testid="button-delete-class"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Turma
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
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
                    disabled={isSubmitting}
                    data-testid="button-save-class"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {deleteClassMutation.isPending ? "Excluindo..." : (isEditing ? "Atualizando..." : "Criando...")}
                      </>
                    ) : (
                      isEditing ? "Atualizar" : "Criar Turma"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a turma "{classToEdit?.name}"? 
              Esta ação não pode ser desfeita e todas as aulas relacionadas também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete" disabled={deleteClassMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteClassMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteClassMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
