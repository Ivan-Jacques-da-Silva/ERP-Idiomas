import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Students() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading } = useQuery<any[]>({
    queryKey: ["/api/students"],
    retry: false,
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

  // Check permissions
  const canManageStudents = user?.role === 'admin' || user?.role === 'secretary' || user?.role === 'teacher';

  // Filter students based on search term
  const filteredStudents = students?.filter((student: any) => {
    if (!searchTerm) return true;
    const fullName = `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
    const email = student.user?.email?.toLowerCase() || "";
    const studentId = student.studentId?.toLowerCase() || "";
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase()) ||
           studentId.includes(searchTerm.toLowerCase());
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
            <Button data-testid="button-new-student">
              <i className="fas fa-plus mr-2"></i>
              Novo Aluno
            </Button>
          )}
        </div>

        {/* Search */}
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
          <Button variant="outline">
            <i className="fas fa-filter mr-2"></i>
            Filtros
          </Button>
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
                {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente ajustar os termos de busca." 
                  : canManageStudents 
                  ? "Comece cadastrando seus primeiros alunos." 
                  : "Não há alunos cadastrados no sistema."}
              </p>
              {canManageStudents && !searchTerm && (
                <Button data-testid="button-create-first-student">
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
              </p>
            </div>
            
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
                          <span>Matrícula: {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-book mr-2 w-4"></i>
                        <span>0 cursos ativos</span>
                      </div>
                    </div>
                    {canManageStudents && (
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm">
                          <i className="fas fa-edit mr-2"></i>
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-eye mr-2"></i>
                          Ver perfil
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
