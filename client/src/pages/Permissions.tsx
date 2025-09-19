import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Permissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Apenas admin pode acessar (removido developer conforme solicitado)
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Apenas o administrador pode gerenciar permissões do sistema.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Buscar todos os usuários do sistema
  const { data: staff, isLoading } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    retry: false,
  });

  // Buscar todas as permissões disponíveis
  const { data: permissions } = useQuery<any[]>({
    queryKey: ["/api/permissions"],
    retry: false,
  });

  // Buscar permissões do usuário selecionado
  const { 
    data: userWithPermissions, 
    isLoading: userPermissionsLoading 
  } = useQuery({
    queryKey: ["/api/users", selectedUser?.user?.id, "permissions"],
    enabled: !!selectedUser?.user?.id && permissionsModalOpen,
    retry: false,
  });

  // Mutation para atualizar permissões
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
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mapear roles para os 4 tipos fixos
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { 
          icon: 'fas fa-crown', 
          color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
          displayName: 'Administrativo'
        };
      case 'secretary':
        return { 
          icon: 'fas fa-user-tie', 
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
          displayName: 'Secretario'
        };
      case 'teacher':
        return { 
          icon: 'fas fa-chalkboard-teacher', 
          color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
          displayName: 'Professor'
        };
      case 'student':
        return { 
          icon: 'fas fa-user-graduate', 
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
          displayName: 'Aluno'
        };
      default:
        return { 
          icon: 'fas fa-user', 
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
          displayName: role
        };
    }
  };

  // Abrir modal de permissões
  const handleManagePermissions = (staffMember: any) => {
    setSelectedUser(staffMember);
    setPermissionsModalOpen(true);
  };

  // Salvar permissões
  const handleSavePermissions = () => {
    if (!selectedUser?.user?.id) return;
    
    updateUserPermissionsMutation.mutate({
      userId: selectedUser.user.id,
      permissionIds: selectedPermissions
    });
  };

  // Inicializar permissões selecionadas quando modal abre
  useEffect(() => {
    if (permissionsModalOpen && userWithPermissions && (userWithPermissions as any)?.userPermissions) {
      const grantedPermissionIds = (userWithPermissions as any).userPermissions
        .filter((up: any) => up.isGranted)
        .map((up: any) => up.permission.id);
      setSelectedPermissions(grantedPermissionIds);
    }
  }, [permissionsModalOpen, userWithPermissions]);

  // Limpar estados quando modal fecha
  useEffect(() => {
    if (!permissionsModalOpen) {
      setSelectedPermissions([]);
      setSelectedUser(null);
    }
  }, [permissionsModalOpen]);

  // Toggle permissão
  const togglePermission = (permissionId: string) => {
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
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-permissions-title">
              Gerenciamento de Permissões
            </h1>
            <p className="text-muted-foreground">
              Gerencie as permissões de acesso de todos os usuários do sistema
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
            <i className="fas fa-info-circle mr-2"></i>
            Sistema com 4 roles fixos
          </div>
        </div>

        {/* Cards dos usuários */}
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
              </Card>
            ))}
          </div>
        ) : !staff || staff.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-users text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                Não há usuários cadastrados no sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((staffMember: any) => {
              const roleInfo = getRoleInfo(staffMember.user.role);
              return (
                <Card key={staffMember.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={staffMember.user.profileImageUrl || undefined} 
                            alt={`${staffMember.user.firstName} ${staffMember.user.lastName}`}
                          />
                          <AvatarFallback className="text-sm">
                            {staffMember.user.firstName?.[0]}{staffMember.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {staffMember.user.firstName} {staffMember.user.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {staffMember.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={roleInfo.color}>
                        <i className={`${roleInfo.icon} mr-2`}></i>
                        {roleInfo.displayName}
                      </Badge>
                    </div>
                    
                    {staffMember.position && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cargo:</span>
                        <span className="ml-2">{staffMember.position}</span>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => handleManagePermissions(staffMember)}
                      className="w-full"
                      size="sm"
                      data-testid={`button-manage-permissions-${staffMember.id}`}
                    >
                      <i className="fas fa-shield-alt mr-2"></i>
                      Gerenciar Permissões
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal de Permissões */}
        <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Gerenciar Permissões
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedUser?.user && 
                  `${selectedUser.user.firstName} ${selectedUser.user.lastName} - ${getRoleInfo(selectedUser.user.role).displayName}`
                }
              </p>
            </DialogHeader>
            
            <div className="space-y-4">
              {userPermissionsLoading ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Carregando permissões...</Label>
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
                  <p className="text-sm text-muted-foreground">Nenhuma permissão encontrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Selecione as permissões baseadas nas abas do menu:</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {permissions.map((permission: any) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                          data-testid={`checkbox-permission-${permission.name}`}
                        />
                        <Label 
                          htmlFor={permission.id} 
                          className="text-sm cursor-pointer flex-1"
                        >
                          {permission.displayName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPermissionsModalOpen(false)}
                data-testid="button-cancel-permissions"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePermissions}
                disabled={updateUserPermissionsMutation.isPending}
                data-testid="button-save-permissions"
              >
                {updateUserPermissionsMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}