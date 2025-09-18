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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Staff() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedStaffMember, setSelectedStaffMember] = useState<any>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const { data: staff, isLoading } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    retry: false,
  });

  // Query for getting all available permissions (pages of the menu)
  const { data: permissions } = useQuery<any[]>({
    queryKey: ["/api/permissions"],
    retry: false,
  });

  // Query for getting user permissions when modal opens
  const { 
    data: userWithPermissions, 
    isLoading: userPermissionsLoading, 
    error: userPermissionsError,
    refetch: refetchUserPermissions 
  } = useQuery({
    queryKey: ["/api/users", selectedStaffMember?.user?.id, "permissions"],
    enabled: !!selectedStaffMember?.user?.id && permissionsModalOpen,
    retry: false,
  });

  // Mutation for updating user permissions
  const updateUserPermissionsMutation = useMutation({
    mutationFn: async (data: { userId: string; permissionIds: string[] }) => {
      await apiRequest("PUT", `/api/users/${data.userId}/permissions`, { permissionIds: data.permissionIds });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", variables.userId, "permissions"] });
      toast({
        title: "Sucesso!",
        description: "Permissões atualizadas com sucesso.",
      });
      setPermissionsModalOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Você foi desconectado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões. Tente novamente.",
        variant: "destructive",
      });
    },
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
  const canManageStaff = user?.role === 'admin' || user?.role === 'developer';
  const canManagePermissions = user?.role === 'admin' || user?.role === 'developer';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'fas fa-crown';
      case 'teacher': return 'fas fa-chalkboard-teacher';
      case 'secretary': return 'fas fa-user-tie';
      case 'financial': return 'fas fa-calculator';
      default: return 'fas fa-user';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'teacher': return 'bg-green-100 text-green-700';
      case 'secretary': return 'bg-blue-100 text-blue-700';
      case 'financial': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Handler for opening permissions modal
  const handleViewPermissions = (staffMember: any) => {
    setSelectedStaffMember(staffMember);
    setHasUserInteracted(false); // Reset interaction flag for clean start
    setPermissionsModalOpen(true);
  };

  // Handler for saving permissions
  const handleSavePermissions = () => {
    if (!selectedStaffMember?.user?.id) return;
    
    updateUserPermissionsMutation.mutate({
      userId: selectedStaffMember.user.id,
      permissionIds: selectedPermissions
    });
  };

  // Initialize selected permissions only once when modal opens and data loads
  useEffect(() => {
    if (permissionsModalOpen && userWithPermissions?.userPermissions && !hasUserInteracted) {
      const grantedPermissionIds = userWithPermissions.userPermissions
        .filter((up: any) => up.isGranted)
        .map((up: any) => up.permission.id);
      setSelectedPermissions(grantedPermissionIds);
    }
  }, [permissionsModalOpen, userWithPermissions, hasUserInteracted]);

  // Reset all states when modal closes
  useEffect(() => {
    if (!permissionsModalOpen) {
      setSelectedPermissions([]);
      setSelectedStaffMember(null);
      setHasUserInteracted(false);
    }
  }, [permissionsModalOpen]);

  // Handler for toggling permission
  const togglePermission = (permissionId: string) => {
    setHasUserInteracted(true);
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
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
            <Button data-testid="button-new-staff">
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
                <Button data-testid="button-create-first-staff">
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
                          {member.user?.role === 'admin' && 'Administrador'}
                          {member.user?.role === 'teacher' && 'Professor'}
                          {member.user?.role === 'secretary' && 'Secretário'}
                          {member.user?.role === 'financial' && 'Financeiro'}
                          {member.user?.role === 'developer' && 'Desenvolvedor'}
                          {member.user?.role === 'student' && 'Estudante'}
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
                    {member.employeeId && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-id-badge mr-2 w-4"></i>
                        <span>ID: {member.employeeId}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <i className="fas fa-circle mr-2 w-4 text-green-500"></i>
                      <span>{member.isActive ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  {canManageStaff && (
                    <div className="mt-4 flex space-x-2 flex-wrap">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit mr-2"></i>
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-eye mr-2"></i>
                        Ver detalhes
                      </Button>
                      {canManagePermissions && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPermissions(member)}
                          data-testid={`button-permissions-${member.id}`}
                        >
                          <i className="fas fa-shield-alt mr-2"></i>
                          Ver Permissões
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Permissions Management Modal */}
      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Permissões
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedStaffMember?.user && 
                `${selectedStaffMember.user.firstName} ${selectedStaffMember.user.lastName}`
              }
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {userPermissionsError ? (
              <div className="text-center py-4">
                <div className="text-red-500 mb-2">
                  <i className="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <p className="text-sm text-red-600 mb-4">
                  Erro ao carregar permissões do usuário
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchUserPermissions()}
                  data-testid="button-retry-permissions"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Tentar novamente
                </Button>
              </div>
            ) : userPermissionsLoading ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Carregando permissões do usuário...</Label>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-2 animate-pulse">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                      <div className="w-32 h-4 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !permissions || permissions.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando permissões...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Selecione as permissões:</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {permissions.map((permission: any) => (
                    <div key={permission.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                        data-testid={`checkbox-permission-${permission.id}`}
                        disabled={userPermissionsLoading || updateUserPermissionsMutation.isPending}
                      />
                      <Label 
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-normal cursor-pointer flex items-center flex-1"
                      >
                        <i className={`${permission.icon} mr-2 w-4`}></i>
                        {permission.name}
                        {permission.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({permission.description})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPermissionsModalOpen(false)}
                data-testid="button-cancel-permissions"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={
                  updateUserPermissionsMutation.isPending || 
                  userPermissionsLoading || 
                  userPermissionsError || 
                  !selectedStaffMember?.user?.id
                }
                data-testid="button-save-permissions"
              >
                {updateUserPermissionsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
