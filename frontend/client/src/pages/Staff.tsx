import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { StaffModal } from "@/components/StaffModal";

export default function Staff() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const { data: staff, isLoading } = useQuery<any[]>({
    queryKey: ["/api/staff"],
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

  // Check permissions - agora apenas admin pode gerenciar
  const canManageStaff = user?.role === 'admin';
  const canManagePermissions = user?.role === 'admin';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'fas fa-crown';
      case 'teacher': return 'fas fa-chalkboard-teacher';
      case 'secretary': return 'fas fa-user-tie';
      case 'student': return 'fas fa-user-graduate';
      default: return 'fas fa-user';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'teacher': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'secretary': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'student': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };


  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Colaboradores</h2>
            <p className="text-sm text-muted-foreground">Gerencie a equipe da escola</p>
          </div>
          
          {canManageStaff && (
            <Button 
              onClick={() => {
                setSelectedStaff(null);
                setModalOpen(true);
              }}
              data-testid="button-new-staff"
            >
              <i className="fas fa-plus mr-2"></i>
              Novo Colaborador
            </Button>
          )}
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
        ) : !staff || staff.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-users text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum colaborador encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {canManageStaff 
                  ? "Comece adicionando sua equipe." 
                  : "Não há colaboradores cadastrados no sistema."}
              </p>
              {canManageStaff && (
                <Button 
                  onClick={() => {
                    setSelectedStaff(null);
                    setModalOpen(true);
                  }}
                  data-testid="button-create-first-staff"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Adicionar primeiro colaborador
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="staff-grid">
            {staff.map((member: any) => (
              <Card key={member.id} className="card-hover transition-smooth" data-testid={`card-staff-${member.id}`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.user?.profileImageUrl} />
                      <AvatarFallback>
                        <i className={`${getRoleIcon(member.user?.role)} text-lg`}></i>
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {member.user?.firstName} {member.user?.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(member.user?.role)}>
                          <i className={`${getRoleIcon(member.user?.role)} mr-1`}></i>
                          {member.user?.role === 'admin' && 'Administrativo'}
                          {member.user?.role === 'teacher' && 'Professor'}
                          {member.user?.role === 'secretary' && 'Secretario'}
                          {member.user?.role === 'student' && 'Aluno'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {member.user?.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-envelope mr-2 w-4"></i>
                        <span className="truncate">{member.user.email}</span>
                      </div>
                    )}
                    {member.position && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-briefcase mr-2 w-4"></i>
                        <span>{member.position}</span>
                      </div>
                    )}
                    {member.department && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-building mr-2 w-4"></i>
                        <span>{member.department}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <i className="fas fa-circle mr-2 w-4 text-green-500"></i>
                      <span>{member.isActive ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  {canManageStaff && (
                    <div className="mt-4 flex space-x-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member);
                          setModalOpen(true);
                        }}
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-eye mr-2"></i>
                        Ver detalhes
                      </Button>
                      {canManagePermissions && (
                        <Link to="/permissions">
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-permissions-${member.id}`}
                          >
                            <i className="fas fa-shield-alt mr-2"></i>
                            Gerenciar Permissões
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <StaffModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedStaff(null);
        }}
        staffMember={selectedStaff}
      />
    </Layout>
  );
}
