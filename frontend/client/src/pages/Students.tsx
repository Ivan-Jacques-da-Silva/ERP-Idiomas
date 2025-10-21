import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { displayDateBR } from "@/lib/cpfUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, extractErrorMessage } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentModal } from "@/components/StudentModal";
import { StudentProfileModal } from "@/components/StudentProfileModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Students() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState<any>(null);

  const { data: students, isLoading } = useQuery<any[]>({
    queryKey: ["/api/students"],
    retry: false,
  });

  const { data: courses } = useQuery<any[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Sucesso",
        description: "Aluno deletado com sucesso",
      });
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error) || "Erro ao deletar aluno",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleViewProfile = (student: any) => {
    setStudentToView(student);
    setIsProfileModalOpen(true);
  };

  const handleDelete = (student: any) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete.id);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = "/landing";
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

  // Check permissions
  const canManageStudents = user?.role === 'admin' || user?.role === 'secretary' || user?.role === 'teacher';

  // Get unique courses from student enrollments
  const courseOptions = courses?.filter(course => course.isActive)?.map(course => ({
    value: course.id,
    label: `${course.name} - ${course.level}`
  })) || [];

  // Filter students based on search term and selected course
  const filteredStudents = students?.filter((student: any) => {
    // Filter by search term
    if (searchTerm) {
      const fullName = `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
      const email = student.user?.email?.toLowerCase() || "";
      const studentId = student.studentId?.toLowerCase() || "";
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                           email.includes(searchTerm.toLowerCase()) ||
                           studentId.includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Filter by selected course
     if (selectedCourse && selectedCourse !== "all") {
       // Check if student has enrollments in the selected course
       const hasEnrollment = student.enrollments?.some((enrollment: any) => 
         enrollment.courseId === selectedCourse
       );
       if (!hasEnrollment) return false;
     }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'graduated': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'graduated': return 'Formado';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Alunos</h2>
            <p className="text-sm text-muted-foreground">Gerencie os estudantes da escola</p>
          </div>
          
          {canManageStudents && (
            <Button onClick={handleCreate} data-testid="button-new-student">
              <i className="fas fa-plus mr-2"></i>
              Novo Aluno
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
              <Input
                placeholder="Buscar alunos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-students"
              />
            </div>
            <div className="w-64">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.value} value={course.value}>
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("card")}
              data-testid="button-view-card"
              className="p-2"
            >
              <i className="fas fa-th-large"></i>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
              className="p-2"
            >
              <i className="fas fa-list"></i>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filteredStudents || filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-user-graduate text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(searchTerm || (selectedCourse && selectedCourse !== "all")) ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {(searchTerm || (selectedCourse && selectedCourse !== "all"))
                   ? "Tente ajustar os filtros de busca." 
                   : canManageStudents 
                   ? "Comece cadastrando seus primeiros alunos." 
                   : "Não há alunos cadastrados no sistema."}
              </p>
              {canManageStudents && !searchTerm && !(selectedCourse && selectedCourse !== "all") && (
                <Button onClick={handleCreate} data-testid="button-create-first-student">
                  <i className="fas fa-plus mr-2"></i>
                  Cadastrar primeiro aluno
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno encontrado' : 'alunos encontrados'}
                {(searchTerm || (selectedCourse && selectedCourse !== "all")) && ` (filtrado de ${students?.length || 0} total)`}
              </p>
            </div>
            
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="students-grid">
                {filteredStudents.map((student: any) => (
                  <Card key={student.id} className="card-hover transition-smooth" data-testid={`card-student-${student.id}`}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.user?.profileImageUrl} />
                          <AvatarFallback>
                            <i className="fas fa-user-graduate text-lg"></i>
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {student.user?.firstName} {student.user?.lastName}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <Badge className={getStatusColor(student.status)}>
                              {getStatusText(student.status)}
                            </Badge>
                            {student.studentId && (
                              <span className="text-xs text-muted-foreground">
                                ID: {student.studentId}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {student.user?.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <i className="fas fa-envelope mr-2 w-4"></i>
                            <span className="truncate">{student.user.email}</span>
                          </div>
                        )}
                        {student.enrollmentDate && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <i className="fas fa-calendar mr-2 w-4"></i>
                            <span>Matrícula: {displayDateBR(student.enrollmentDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <i className="fas fa-book mr-2 w-4"></i>
                          <span>0 cursos ativos</span>
                        </div>
                      </div>
                      {canManageStudents && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(student)} data-testid={`button-edit-${student.id}`}>
                            <i className="fas fa-edit mr-2"></i>
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(student)} data-testid={`button-view-${student.id}`}>
                            <i className="fas fa-eye mr-2"></i>
                            Ver perfil
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(student)} data-testid={`button-delete-${student.id}`}>
                            <i className="fas fa-trash mr-2"></i>
                            Excluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg" data-testid="students-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ID do Aluno</TableHead>
                      <TableHead>Data de Matrícula</TableHead>
                      {canManageStudents && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student: any) => (
                      <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.user?.profileImageUrl} />
                              <AvatarFallback>
                                <i className="fas fa-user-graduate text-sm"></i>
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {student.user?.firstName} {student.user?.lastName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.user?.email || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {getStatusText(student.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.studentId || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {displayDateBR(student.enrollmentDate)}
                        </TableCell>
                        {canManageStudents && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(student)} data-testid={`button-edit-${student.id}`}>
                                <i className="fas fa-edit mr-2"></i>
                                Editar
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleViewProfile(student)} data-testid={`button-view-${student.id}`}>
                                <i className="fas fa-eye mr-2"></i>
                                Ver perfil
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(student)} data-testid={`button-delete-${student.id}`}>
                                <i className="fas fa-trash mr-2"></i>
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>

  <StudentModal
    open={isModalOpen}
    onOpenChange={setIsModalOpen}
    student={selectedStudent}
  />

  <StudentProfileModal
    open={isProfileModalOpen}
    onOpenChange={setIsProfileModalOpen}
    student={studentToView}
  />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-student">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno <strong>{studentToDelete?.user?.firstName} {studentToDelete?.user?.lastName}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
