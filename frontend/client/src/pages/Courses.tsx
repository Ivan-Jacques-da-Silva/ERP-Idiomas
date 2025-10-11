import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, BookOpen, Upload, Edit, Trash2, Eye, Palette } from "lucide-react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_BASE } from "@/lib/api";
import type { Course, Book, CourseWithDetails, BookWithDetails, InsertCourse, InsertBook } from "@shared/schema";
import { insertCourseSchema, insertBookSchema } from "@shared/schema";
import { z } from "zod";

export default function Courses() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);

  // Extended schemas for form validation
  const courseFormSchema = insertCourseSchema.extend({
    duration: z.coerce.number().positive("Duração deve ser maior que 0").optional(),
    price: z.coerce.number().positive("Preço deve ser maior que 0").optional()
  });

  const bookFormSchema = insertBookSchema.extend({
    totalDays: z.coerce.number().min(1, "Total de dias deve ser pelo menos 1"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar em formato hexadecimal válido")
  });

  // Course form
  const courseForm = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      language: "",
      level: "",
      duration: undefined,
      price: undefined,
      isActive: true
    }
  });

  // Book form
  const bookForm = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      totalDays: 30,
      courseId: "",
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
      toast({ title: "Erro ao criar curso", description: error.message, variant: "destructive" });
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
      toast({ title: "Erro ao atualizar curso", description: error.message, variant: "destructive" });
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
      toast({ title: "Erro ao criar livro", description: error.message, variant: "destructive" });
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
      toast({ title: "Erro ao atualizar livro", description: error.message, variant: "destructive" });
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
      toast({ title: "Erro ao enviar PDF", description: error.message, variant: "destructive" });
      setUploadingPdf(null);
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

  const handleCreateCourse = (data: z.infer<typeof courseFormSchema>) => {
    createCourseMutation.mutate(data);
  };

  const handleUpdateCourse = (data: z.infer<typeof courseFormSchema>) => {
    if (!editingCourse) return;
    updateCourseMutation.mutate({ id: editingCourse.id, data });
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.reset({
      name: course.name,
      description: course.description || "",
      language: course.language,
      level: course.level,
      duration: course.duration || undefined,
      price: course.price || undefined,
      isActive: course.isActive
    });
  };

  const handleCreateBook = (data: z.infer<typeof bookFormSchema>) => {
    if (!selectedCourse) {
      toast({ title: "Erro", description: "Selecione um curso primeiro", variant: "destructive" });
      return;
    }
    const bookData = { ...data, courseId: selectedCourse.id };
    createBookMutation.mutate(bookData);
  };

  const handleUpdateBook = (data: z.infer<typeof bookFormSchema>) => {
    if (!editingBook) return;
    updateBookMutation.mutate({ id: editingBook.id, data });
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    bookForm.reset({
      name: book.name,
      description: book.description || "",
      color: book.color,
      totalDays: book.totalDays ?? 30,
      courseId: book.courseId,
      displayOrder: book.displayOrder ?? 1,
      isActive: book.isActive
    });
  };

  const handlePdfUpload = (bookId: string, file: File) => {
    setUploadingPdf(bookId);
    uploadPdfMutation.mutate({ bookId, file });
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
          <Button
            onClick={() => setIsCreateCourseOpen(true)}
            className="gap-2"
            data-testid="button-create-course"
          >
            <Plus className="w-4 h-4" />
            Novo Curso
          </Button>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="books">Livros</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
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
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-md border-2 border-white shadow-sm ring-1 ring-black/10"
                            style={{ backgroundColor: book.color }}
                            title={`Cor: ${book.color}`}
                          ></div>
                          <CardTitle className="text-base">{book.name}</CardTitle>
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
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{book.description}</p>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>Total de dias:</span>
                            <span className="font-medium">{book.totalDays ?? 30}</span>
                          </div>

                          {/* PDF Section */}
                          <div className="space-y-2">
                            {book.pdfUrl ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-primary" />
                                  <span className="text-sm">PDF disponível</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(book.pdfUrl!, '_blank')}
                                    className="h-7 px-2"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openPdfFileDialog(book.id)}
                                    disabled={uploadingPdf === book.id}
                                    className="h-7 px-2"
                                  >
                                    <Upload className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPdfFileDialog(book.id)}
                                disabled={uploadingPdf === book.id}
                                className="w-full h-8"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                {uploadingPdf === book.id ? 'Enviando...' : 'Upload PDF'}
                              </Button>
                            )}
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
                      <FormItem>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (horas)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            data-testid="input-course-duration"
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
          <DialogContent data-testid="dialog-create-book" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBook ? 'Editar Livro' : `Novo Livro - ${selectedCourse?.name}`}
              </DialogTitle>
            </DialogHeader>
            <Form {...bookForm}>
              <form onSubmit={bookForm.handleSubmit(editingBook ? handleUpdateBook : handleCreateBook)} className="space-y-4">
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
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Livro</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {/* Color Preview */}
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-md border-2 border-muted shadow-sm"
                                style={{ backgroundColor: field.value }}
                              ></div>
                              <span className="text-sm text-muted-foreground">Preview</span>
                            </div>

                            {/* Predefined Color Swatches */}
                            <div className="grid grid-cols-5 gap-2">
                              {predefinedColors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${field.value === color ? 'border-primary' : 'border-muted'
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

                  <FormField
                    control={bookForm.control}
                    name="totalDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Dias</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            data-testid="input-book-total-days"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* PDF Upload Section */}
                {editingBook && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">PDF do Livro</span>
                    </div>

                    {editingBook.pdfUrl ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-sm">PDF disponível</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(editingBook.pdfUrl!, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver PDF
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
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openPdfFileDialog(editingBook.id)}
                        disabled={uploadingPdf === editingBook.id}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingPdf === editingBook.id ? 'Enviando...' : 'Fazer Upload do PDF'}
                      </Button>
                    )}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (horas)</FormLabel>
                        <FormControl>
                          <Input type="number" data-testid="input-edit-course-duration" {...field} />
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


        {/* Hidden file input for PDF uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
        />
      </div>
    </Layout>
  );
}
