import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, BookOpen, Upload, Edit, Trash2, Eye, Palette, Music, Video, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, extractErrorMessage } from "@/lib/queryClient";
import { API_BASE } from "@/lib/api";
import type { Course, Book, CourseWithDetails, BookWithDetails } from "@shared/schema";

import { z } from "zod";

export default function Courses() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);
  const [uploadingBook, setUploadingBook] = useState<string | null>(null);

  // Extended schemas for form validation
  const courseFormSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    language: z.string().min(1, "Idioma é obrigatório"),
    level: z.string().min(1, "Nível é obrigatório"),
    duration: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    totalDuration: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    workloadHours: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    workloadWeeks: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    price: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    teachingGuideType: z.string().optional(),
    teachingGuideUrl: z.string().optional(),
    suggestedWeeklyHours: z.string().optional(),
    isActive: z.boolean().default(true)
  });

  const bookFormSchema = z.object({
    courseId: z.string().min(1, "Curso é obrigatório"),
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    numberOfUnits: z.coerce.number().min(1, "Número de unidades deve ser pelo menos 1"),
    displayOrder: z.coerce.number().min(1, "Ordem deve ser pelo menos 1"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar em formato hexadecimal válido"),
    isActive: z.boolean().default(true)
  });

  // Course form
  const courseForm = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      language: "English",
      level: "Básico",
      duration: undefined,
      totalDuration: undefined,
      workloadHours: undefined,
      workloadWeeks: undefined,
      price: undefined,
      teachingGuideType: "",
      teachingGuideUrl: "",
      suggestedWeeklyHours: "",
      isActive: true
    }
  });

  // Book form
  const bookForm = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      courseId: "",
      name: "",
      description: "",
      numberOfUnits: 10,
      color: "#3b82f6",
      displayOrder: 1,
      isActive: true
    }
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  // Fetch books
  const { data: books = [], isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    retry: false,
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (data: z.infer<typeof courseFormSchema>) => apiRequest("POST", "/api/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Curso criado com sucesso!" });
      setIsCreateCourseOpen(false);
      courseForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar curso", description: extractErrorMessage(error), variant: "destructive" });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: z.infer<typeof courseFormSchema> }) => apiRequest("PUT", `/api/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Curso atualizado com sucesso!" });
      setEditingCourse(null);
      courseForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar curso", description: extractErrorMessage(error), variant: "destructive" });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Curso excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir curso", variant: "destructive" });
    }
  });

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: (data: z.infer<typeof bookFormSchema>) => apiRequest("POST", "/api/books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Livro criado com sucesso!" });
      setIsCreateBookOpen(false);
      bookForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar livro", description: extractErrorMessage(error), variant: "destructive" });
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<z.infer<typeof bookFormSchema>> }) => apiRequest("PUT", `/api/books/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Livro atualizado com sucesso!" });
      setEditingBook(null);
      bookForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar livro", description: extractErrorMessage(error), variant: "destructive" });
    }
  });

  // PDF upload mutation
  const uploadPdfMutation = useMutation({
    mutationFn: async ({ bookId, file }: { bookId: string, file: File }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/books/${bookId}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "PDF enviado com sucesso!" });
      setUploadingPdf(null);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao enviar PDF", description: extractErrorMessage(error), variant: "destructive" });
      setUploadingPdf(null);
    }
  });

  // Audio upload mutation
  const uploadAudioMutation = useMutation({
    mutationFn: async ({ bookId, files }: { bookId: string, files: FileList }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('audio', file);
      });
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/books/${bookId}/upload-audio`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Áudios enviados com sucesso!" });
      setUploadingBook(null);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao enviar áudios", description: extractErrorMessage(error), variant: "destructive" });
      setUploadingBook(null);
    }
  });

  // Video upload mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async ({ bookId, files }: { bookId: string, files: FileList }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('video', file);
      });
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/books/${bookId}/upload-video`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Vídeos enviados com sucesso!" });
      setUploadingBook(null);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao enviar vídeos", description: extractErrorMessage(error), variant: "destructive" });
      setUploadingBook(null);
    }
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Livro excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir livro", variant: "destructive" });
    }
  });

  const handleCreateCourse = (_data: z.infer<typeof courseFormSchema>) => {
    const values = courseForm.getValues() as any;
    // Converter campos numéricos explicitamente
    const courseData = {
      ...values,
      duration: values.duration ? Number(values.duration) : undefined,
      totalDuration: values.totalDuration ? Number(values.totalDuration) : undefined,
      workloadHours: values.workloadHours ? Number(values.workloadHours) : undefined,
      workloadWeeks: values.workloadWeeks ? Number(values.workloadWeeks) : undefined,
      price: values.price ? Number(values.price) : undefined,
    };
    createCourseMutation.mutate(courseData);
  };

  const handleUpdateCourse = (_data: z.infer<typeof courseFormSchema>) => {
    if (!editingCourse) return;
    const values = courseForm.getValues() as any;
    // Converter campos numéricos explicitamente
    const courseData = {
      ...values,
      duration: values.duration ? Number(values.duration) : undefined,
      totalDuration: values.totalDuration ? Number(values.totalDuration) : undefined,
      workloadHours: values.workloadHours ? Number(values.workloadHours) : undefined,
      workloadWeeks: values.workloadWeeks ? Number(values.workloadWeeks) : undefined,
      price: values.price ? Number(values.price) : undefined,
    };
    updateCourseMutation.mutate({ id: editingCourse.id, data: courseData });
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.reset({
      name: course.name,
      description: course.description || "",
      language: course.language,
      level: course.level,
      duration: course.duration || undefined,
      totalDuration: course.totalDuration || undefined,
      workloadHours: course.workloadHours || undefined,
      workloadWeeks: course.workloadWeeks || undefined,
      price: course.price || undefined,
      teachingGuideType: (course as any).teachingGuideType || "",
      teachingGuideUrl: (course as any).teachingGuideUrl || "",
      suggestedWeeklyHours: (course as any).suggestedWeeklyHours || "",
      isActive: course.isActive
    });
  };

  const handleCreateBook = (data: z.infer<typeof bookFormSchema>) => {
    createBookMutation.mutate(data);
  };

  const handleUpdateBook = (_data: z.infer<typeof bookFormSchema>) => {
    if (!editingBook) return;
    const values = bookForm.getValues() as any;
    updateBookMutation.mutate({ id: editingBook.id, data: values });
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    bookForm.reset({
      courseId: book.courseId || "",
      name: book.name,
      description: book.description || "",
      numberOfUnits: book.numberOfUnits,
      color: book.color,
      displayOrder: book.displayOrder ?? 1,
      isActive: book.isActive
    });
  };

  const handlePdfUpload = (bookId: string, file: File) => {
    setUploadingPdf(bookId);
    uploadPdfMutation.mutate({ bookId, file });
  };

  const handleAudioUpload = (bookId: string, files: FileList) => {
    setUploadingBook(bookId);
    uploadAudioMutation.mutate({ bookId, files });
  };

  const handleVideoUpload = (bookId: string, files: FileList) => {
    setUploadingBook(bookId);
    uploadVideoMutation.mutate({ bookId, files });
  };

  const openPdfFileDialog = (bookId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && file.type === 'application/pdf') {
          handlePdfUpload(bookId, file);
        } else {
          toast({ title: "Erro", description: "Por favor, selecione um arquivo PDF", variant: "destructive" });
        }
      };
      fileInputRef.current.click();
    }
  };

  const openAudioFileDialog = (bookId: string) => {
    if (audioInputRef.current) {
      audioInputRef.current.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          handleAudioUpload(bookId, files);
        }
      };
      audioInputRef.current.click();
    }
  };

  const openVideoFileDialog = (bookId: string) => {
    if (videoInputRef.current) {
      videoInputRef.current.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          handleVideoUpload(bookId, files);
        }
      };
      videoInputRef.current.click();
    }
  };

  const predefinedColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const getBooksByCourseid = (courseId: string) => {
    if (!Array.isArray(books)) return [];
    return books.filter(book => book.courseId === courseId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Gerenciar Cursos</h1>
            <p className="text-muted-foreground">Administre cursos, livros e conteúdo educacional</p>
          </div>
        </div>

        <Tabs defaultValue="courses" className="w-full" onValueChange={(value) => {
          // Reset selected course quando mudar de aba
          if (value === 'courses') {
            setSelectedCourse(null);
          }
        }}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="courses">Cursos</TabsTrigger>
              <TabsTrigger value="books">Livros</TabsTrigger>
            </TabsList>
          </div>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsCreateCourseOpen(true)}
                className="gap-2"
                data-testid="button-create-course"
              >
                <Plus className="w-4 h-4" />
                Novo Curso
              </Button>
            </div>
            {coursesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando cursos...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(courses) && courses.map((course) => (
                  <Card key={course.id} className="glassmorphism-card hover:shadow-lg transition-shadow" data-testid={`card-course-${course.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCourse(course)}
                            data-testid={`button-edit-course-${course.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCourseMutation.mutate(course.id)}
                            data-testid={`button-delete-course-${course.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{course.language}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Duração: {course.duration}h</span>
                        <span className="font-semibold">R$ {course.price}</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm mb-2">Livros: {getBooksByCourseid(course.id).length}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedCourse(course); document.querySelector('[data-state="inactive"][data-value="books"]')?.dispatchEvent(new MouseEvent('click', { bubbles:true })); }}
                          className="w-full"
                          data-testid={`button-view-books-${course.id}`}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Ver Livros
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedCourse ? `Livros do curso: ${selectedCourse.name}` : "Selecione um curso para gerenciar livros"}
              </p>
              {selectedCourse && (
                <Button
                  onClick={() => setIsCreateBookOpen(true)}
                  size="sm"
                  className="gap-2"
                  data-testid="button-create-book"
                >
                  <Plus className="w-4 h-4" />
                  Novo Livro
                </Button>
              )}
            </div>

            {selectedCourse ? (
              booksLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getBooksByCourseid(selectedCourse.id).map((book) => (
                    <Card key={book.id} className="glassmorphism-card" data-testid={`card-book-${book.id}`}>
                      <CardHeader style={{ borderLeftWidth: '4px', borderLeftColor: book.color }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{book.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {book.numberOfUnits} unidades
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBook(book)}
                              data-testid={`button-edit-book-${book.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBookMutation.mutate(book.id)}
                              data-testid={`button-delete-book-${book.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {book.description && (
                          <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
                        )}

                        <div className="space-y-2 mb-4">
                          {book.pdfUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-primary" />
                              <span>PDF anexado</span>
                            </div>
                          )}
                          {book.audioUrls && book.audioUrls.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Music className="h-4 w-4 text-primary" />
                              <span>{book.audioUrls.length} áudio(s)</span>
                            </div>
                          )}
                          {book.videoUrls && book.videoUrls.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Video className="h-4 w-4 text-primary" />
                              <span>{book.videoUrls.length} vídeo(s)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => openPdfFileDialog(book.id)}
                              disabled={uploadingPdf === book.id}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => openAudioFileDialog(book.id)}
                              disabled={uploadingBook === book.id}
                            >
                              <Music className="h-4 w-4 mr-1" />
                              Áudio
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => openVideoFileDialog(book.id)}
                              disabled={uploadingBook === book.id}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Vídeo
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Selecione um curso na aba "Cursos" para gerenciar seus livros</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Course Dialog */}
        <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
          <DialogContent data-testid="dialog-create-course">
            <DialogHeader>
              <DialogTitle>Criar Novo Curso</DialogTitle>
            </DialogHeader>
            <Form {...courseForm}>
              <form onSubmit={courseForm.handleSubmit(handleCreateCourse)} className="space-y-4">
                <FormField
                  control={courseForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Curso</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Inglês Básico"
                          data-testid="input-course-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do curso"
                          data-testid="input-course-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormLabel>Idioma</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-course-language">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">Inglês</SelectItem>
                            <SelectItem value="Spanish">Espanhol</SelectItem>
                            <SelectItem value="French">Francês</SelectItem>
                            <SelectItem value="German">Alemão</SelectItem>
                            <SelectItem value="Italian">Italiano</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-course-level">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Básico">Básico</SelectItem>
                            <SelectItem value="Intermediário">Intermediário</SelectItem>
                            <SelectItem value="Avançado">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Guia de Ensino */}
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Guia de Ensino (tipo)</FormLabel>
                    <Select onValueChange={(v) => courseForm.setValue('teachingGuideType' as any, v as any)}>
                      <FormControl>
                        <SelectTrigger data-testid="select-course-teaching-guide-type">
                          <SelectValue placeholder="PDF ou Vídeo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  <FormItem>
                    <FormLabel>URL do Guia de Ensino</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." data-testid="input-course-teaching-guide-url" {...courseForm.register('teachingGuideUrl' as any)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Carga Sugerida (ex: 1h semanal)</FormLabel>
                  <FormControl>
                    <Input placeholder="1h semanal" data-testid="input-course-suggested-weekly-hours" {...courseForm.register('suggestedWeeklyHours' as any)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="workloadHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carga Horária (horas)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            data-testid="input-course-workload-hours"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="workloadWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semanas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12"
                            data-testid="input-course-workload-weeks"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="299"
                            data-testid="input-course-price"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateCourseOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isPending || !courseForm.formState.isValid}
                    data-testid="button-save-course"
                  >
                    {createCourseMutation.isPending ? 'Criando...' : 'Criar Curso'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create Book Dialog */}
        <Dialog open={isCreateBookOpen} onOpenChange={setIsCreateBookOpen}>
          <DialogContent data-testid="dialog-create-book" className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBook ? 'Editar Livro' : 'Novo Livro'}
              </DialogTitle>
            </DialogHeader>
            <Form {...bookForm}>
              <form onSubmit={bookForm.handleSubmit(editingBook ? handleUpdateBook : handleCreateBook)} className="space-y-4">
                <FormField
                  control={bookForm.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={selectedCourse?.id || field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-book-course">
                            <SelectValue placeholder="Selecione um curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(courses) && courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Livro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: English Basic - Book 1"
                          data-testid="input-book-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do livro"
                          data-testid="input-book-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bookForm.control}
                    name="numberOfUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Unidades</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            data-testid="input-book-units"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bookForm.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de Exibição</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            data-testid="input-book-order"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bookForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do Livro</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {/* Color Preview */}
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-md border-2 border-muted shadow-sm"
                              style={{ backgroundColor: field.value }}
                            ></div>
                            <span className="text-sm text-muted-foreground">Preview da cor</span>
                          </div>

                          {/* Predefined Color Swatches */}
                          <div className="grid grid-cols-10 gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${field.value === color ? 'border-primary ring-2 ring-primary' : 'border-muted'
                                  }`}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                          </div>

                          {/* Color Input and Hex Input */}
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 rounded border cursor-pointer"
                              data-testid="input-book-color"
                            />
                            <Input
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              placeholder="#3b82f6"
                              data-testid="input-book-color-hex"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seção de Upload de Materiais */}
                {editingBook && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Materiais do Livro
                    </h3>

                    {/* PDF Upload */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        PDF do Livro
                      </Label>
                      {editingBook.pdfUrl ? (
                        <div className="flex items-center gap-2 p-3 bg-background rounded-md border">
                          <FileText className="w-5 h-5 text-red-500" />
                          <span className="flex-1 text-sm">PDF anexado</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(editingBook.pdfUrl!, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openPdfFileDialog(editingBook.id)}
                            disabled={uploadingPdf === editingBook.id}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {uploadingPdf === editingBook.id ? 'Enviando...' : 'Substituir'}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openPdfFileDialog(editingBook.id)}
                          disabled={uploadingPdf === editingBook.id}
                          className="w-full h-24 border-dashed"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                            <span>{uploadingPdf === editingBook.id ? 'Enviando...' : 'Clique para selecionar PDF'}</span>
                          </div>
                        </Button>
                      )}
                    </div>

                    {/* Audio Upload */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-500" />
                        Áudios ({editingBook.audioUrls?.length || 0} arquivo(s))
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openAudioFileDialog(editingBook.id)}
                        disabled={uploadingBook === editingBook.id}
                        className="w-full h-20 border-dashed"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Music className="w-7 h-7 text-muted-foreground" />
                          <span>{uploadingBook === editingBook.id ? 'Enviando...' : 'Clique para selecionar áudios (múltiplos)'}</span>
                        </div>
                      </Button>
                    </div>

                    {/* Video Upload */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-500" />
                        Vídeos ({editingBook.videoUrls?.length || 0} arquivo(s))
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openVideoFileDialog(editingBook.id)}
                        disabled={uploadingBook === editingBook.id}
                        className="w-full h-20 border-dashed"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Video className="w-7 h-7 text-muted-foreground" />
                          <span>{uploadingBook === editingBook.id ? 'Enviando...' : 'Clique para selecionar vídeos (múltiplos)'}</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateBookOpen(false);
                      setEditingBook(null);
                      bookForm.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBookMutation.isPending || updateBookMutation.isPending || !bookForm.formState.isValid}
                    data-testid="button-save-book"
                  >
                    {editingBook
                      ? (updateBookMutation.isPending ? 'Atualizando...' : 'Atualizar Livro')
                      : (createBookMutation.isPending ? 'Criando...' : 'Criar Livro')
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => {
          if (!open) {
            setEditingCourse(null);
            courseForm.reset();
          }
        }}>
          <DialogContent data-testid="dialog-edit-course">
            <DialogHeader>
              <DialogTitle>Editar Curso</DialogTitle>
            </DialogHeader>

            <Form {...courseForm}>
              <form onSubmit={courseForm.handleSubmit(handleUpdateCourse)} className="space-y-4">
                <FormField
                  control={courseForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Curso</FormLabel>
                      <FormControl>
                        <Input data-testid="input-edit-course-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea data-testid="input-edit-course-description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-course-language">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">Inglês</SelectItem>
                            <SelectItem value="Spanish">Espanhol</SelectItem>
                            <SelectItem value="French">Francês</SelectItem>
                            <SelectItem value="German">Alemão</SelectItem>
                            <SelectItem value="Italian">Italiano</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-course-level">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Básico">Básico</SelectItem>
                            <SelectItem value="Intermediário">Intermediário</SelectItem>
                            <SelectItem value="Avançado">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Guia de Ensino */}
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Guia de Ensino (tipo)</FormLabel>
                    <Select onValueChange={(v) => courseForm.setValue('teachingGuideType' as any, v as any)}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-course-teaching-guide-type">
                          <SelectValue placeholder="PDF ou Vídeo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  <FormItem>
                    <FormLabel>URL do Guia de Ensino</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." data-testid="input-edit-course-teaching-guide-url" {...courseForm.register('teachingGuideUrl' as any)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Carga Sugerida (ex: 1h semanal)</FormLabel>
                  <FormControl>
                    <Input placeholder="1h semanal" data-testid="input-edit-course-suggested-weekly-hours" {...courseForm.register('suggestedWeeklyHours' as any)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="workloadHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carga Horária (horas)</FormLabel>
                        <FormControl>
                          <Input type="number" data-testid="input-edit-course-workload-hours" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="workloadWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semanas</FormLabel>
                        <FormControl>
                          <Input type="number" data-testid="input-edit-course-workload-weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" data-testid="input-edit-course-price" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setEditingCourse(null); courseForm.reset(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateCourseMutation.isPending} data-testid="button-update-course">
                    {updateCourseMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>


        {/* Edit Book Dialog */}
        <Dialog open={!!editingBook} onOpenChange={(open) => {
          if (!open) {
            setEditingBook(null);
            bookForm.reset();
          }
        }}>
          <DialogContent data-testid="dialog-edit-book">
            <DialogHeader>
              <DialogTitle>Editar Livro</DialogTitle>
            </DialogHeader>

            <Form {...bookForm}>
              <form onSubmit={bookForm.handleSubmit(handleUpdateBook)} className="space-y-4">
                <FormField
                  control={bookForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Livro</FormLabel>
                      <FormControl>
                        <Input data-testid="input-edit-book-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea data-testid="input-edit-book-description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bookForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Livro</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-center">
                            <Input type="color" className="w-12 h-10 p-1" value={field.value} onChange={(e) => field.onChange(e.target.value)} data-testid="input-edit-book-color" />
                            <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#3b82f6" data-testid="input-edit-book-color-hex" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bookForm.control}
                    name="totalDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Dias</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" data-testid="input-edit-book-total-days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setEditingBook(null); bookForm.reset(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateBookMutation.isPending} data-testid="button-update-book">
                    {updateBookMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>


        {/* Hidden file inputs for uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          style={{ display: 'none' }}
        />
      </div>
    </Layout>
  );
}