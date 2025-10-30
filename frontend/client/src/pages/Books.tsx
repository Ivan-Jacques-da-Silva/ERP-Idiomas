import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, BookOpen, Upload, Edit, Trash2, FileText, Music, Video, X } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, extractErrorMessage } from "@/lib/queryClient";
import { z } from "zod";

type Book = {
  id: string;
  name: string;
  description?: string | null;
  numberOfUnits: number;
  pdfUrl?: string | null;
  audioUrls?: string[] | null;
  videoUrls?: string[] | null;
  color: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function Books() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploadingBook, setUploadingBook] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const bookFormSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    numberOfUnits: z.coerce.number().min(1).max(10, "Número de unidades deve ser entre 1 e 10"),
    displayOrder: z.coerce.number().min(1, "Ordem deve ser pelo menos 1"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar em formato hexadecimal válido"),
    isActive: z.boolean().default(true)
  });

  const bookForm = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      name: "",
      description: "",
      numberOfUnits: 10,
      displayOrder: 1,
      color: "#3b82f6",
      isActive: true
    }
  });

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    retry: false,
  });

  const createBookMutation = useMutation({
    mutationFn: (data: z.infer<typeof bookFormSchema>) => apiRequest("POST", "/api/books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Livro criado com sucesso!" });
      setIsCreateOpen(false);
      bookForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar livro", description: extractErrorMessage(error), variant: "destructive" });
    }
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<z.infer<typeof bookFormSchema>> }) => 
      apiRequest("PUT", `/api/books/${id}`, data),
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

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Livro excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir livro", description: extractErrorMessage(error), variant: "destructive" });
    }
  });

  const handleCreateBook = (data: z.infer<typeof bookFormSchema>) => {
    createBookMutation.mutate(data);
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
      numberOfUnits: book.numberOfUnits,
      displayOrder: book.displayOrder,
      color: book.color,
      isActive: book.isActive
    });
  };

  const handleUploadPdf = async (bookId: string, file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setUploadingBook(bookId);
      await fetch(`/api/books/${bookId}/upload`, {
        method: 'POST',
        body: formData,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "PDF enviado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao enviar PDF", variant: "destructive" });
    } finally {
      setUploadingBook(null);
    }
  };

  const handleUploadAudio = async (bookId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('audio', file);
    });

    try {
      setUploadingBook(bookId);
      await fetch(`/api/books/${bookId}/upload-audio`, {
        method: 'POST',
        body: formData,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Áudios enviados com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao enviar áudios", variant: "destructive" });
    } finally {
      setUploadingBook(null);
    }
  };

  const handleUploadVideo = async (bookId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('video', file);
    });

    try {
      setUploadingBook(bookId);
      await fetch(`/api/books/${bookId}/upload-video`, {
        method: 'POST',
        body: formData,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Vídeos enviados com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao enviar vídeos", variant: "destructive" });
    } finally {
      setUploadingBook(null);
    }
  };

  return (
    <Layout title="Livros">
      <div className="container mx-auto py-6 space-y-6" data-testid="books-page">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">Gerenciar Livros</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-book">
              <Plus className="mr-2 h-4 w-4" /> Novo Livro
            </Button>
            <DialogContent className="max-w-2xl" data-testid="dialog-create-book">
              <DialogHeader>
                <DialogTitle>Criar Novo Livro</DialogTitle>
              </DialogHeader>
              <Form {...bookForm}>
                <form onSubmit={bookForm.handleSubmit(handleCreateBook)} className="space-y-4">
                  <FormField
                    control={bookForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Livro</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Book I" data-testid="input-book-name" />
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
                          <Textarea {...field} placeholder="Descrição do livro" data-testid="input-book-description" />
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
                          <FormLabel>Número de Unidades (1-10)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} max={10} data-testid="input-book-units" />
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
                            <Input type="number" {...field} min={1} data-testid="input-book-order" />
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
                        <FormLabel>Cor</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-20 h-10" data-testid="input-book-color" />
                            <Input {...field} placeholder="#3b82f6" data-testid="input-book-color-hex" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <Label className="text-sm font-semibold">Materiais do Livro (opcional)</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Você poderá anexar os materiais após criar o livro</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-white dark:bg-gray-900">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">PDF do Livro</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-white dark:bg-gray-900">
                        <Music className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Áudios</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-white dark:bg-gray-900">
                        <Video className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Vídeos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createBookMutation.isPending} data-testid="button-submit">
                      {createBookMutation.isPending ? "Criando..." : "Criar Livro"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card key={book.id} className="dark:bg-gray-800" data-testid={`card-book-${book.id}`}>
                <CardHeader className="pb-3" style={{ borderLeftWidth: '4px', borderLeftColor: book.color }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="dark:text-white">{book.name}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {book.numberOfUnits} unidades
                      </p>
                    </div>
                    <Badge variant={book.isActive ? "default" : "secondary"}>
                      {book.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {book.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{book.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {book.pdfUrl && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FileText className="h-4 w-4" />
                        <span>PDF anexado</span>
                      </div>
                    )}
                    {book.audioUrls && book.audioUrls.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Music className="h-4 w-4" />
                        <span>{book.audioUrls.length} áudio(s)</span>
                      </div>
                    )}
                    {book.videoUrls && book.videoUrls.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Video className="h-4 w-4" />
                        <span>{book.videoUrls.length} vídeo(s)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={pdfInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadPdf(book.id, file);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={uploadingBook === book.id}
                        data-testid={`button-upload-pdf-${book.id}`}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>

                      <input
                        type="file"
                        ref={audioInputRef}
                        className="hidden"
                        accept="audio/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) handleUploadAudio(book.id, files);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={uploadingBook === book.id}
                        data-testid={`button-upload-audio-${book.id}`}
                      >
                        <Music className="h-4 w-4 mr-1" />
                        Áudio
                      </Button>

                      <input
                        type="file"
                        ref={videoInputRef}
                        className="hidden"
                        accept="video/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) handleUploadVideo(book.id, files);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingBook === book.id}
                        data-testid={`button-upload-video-${book.id}`}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Vídeo
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditBook(book)}
                        data-testid={`button-edit-${book.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este livro?")) {
                            deleteBookMutation.mutate(book.id);
                          }
                        }}
                        data-testid={`button-delete-${book.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editingBook && (
          <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
            <DialogContent className="max-w-2xl" data-testid="dialog-edit-book">
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
                          <Input {...field} placeholder="Ex: Book I" data-testid="input-edit-book-name" />
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
                          <Textarea {...field} placeholder="Descrição do livro" data-testid="input-edit-book-description" />
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
                          <FormLabel>Número de Unidades (1-10)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} max={10} data-testid="input-edit-book-units" />
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
                            <Input type="number" {...field} min={1} data-testid="input-edit-book-order" />
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
                        <FormLabel>Cor</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-20 h-10" data-testid="input-edit-book-color" />
                            <Input {...field} placeholder="#3b82f6" data-testid="input-edit-book-color-hex" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditingBook(null)} data-testid="button-cancel-edit">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={updateBookMutation.isPending} data-testid="button-submit-edit">
                      {updateBookMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
