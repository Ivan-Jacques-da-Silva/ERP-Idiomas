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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  isSystemRole: boolean;
}

interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export default function Permissions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("roles");
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editPermissionOpen, setEditPermissionOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [managePermissionsOpen, setManagePermissionsOpen] = useState(false);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);

  // Form states
  const [newRole, setNewRole] = useState({
    name: "",
    displayName: "",
    description: "",
    isActive: true
  });

  const [newPermission, setNewPermission] = useState({
    name: "",
    displayName: "",
    description: "",
    isActive: true
  });

  // Queries
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    retry: false,
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
    retry: false,
  });

  // Query for role with permissions when managing permissions
  const { data: roleWithPermissions } = useQuery<RoleWithPermissions>({
    queryKey: [`/api/roles/${selectedRole?.id}/permissions`],
    enabled: !!selectedRole?.id && managePermissionsOpen,
    retry: false,
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (roleData: any) => apiRequest("POST", "/api/roles", roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso",
        description: "Role criado com sucesso!",
      });
      setCreateRoleOpen(false);
      setNewRole({ name: "", displayName: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar role",
        variant: "destructive",
      });
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: (permissionData: any) => apiRequest("POST", "/api/permissions", permissionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Sucesso",
        description: "Permissão criada com sucesso!",
      });
      setCreatePermissionOpen(false);
      setNewPermission({ name: "", displayName: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar permissão",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso",
        description: "Role atualizado com sucesso!",
      });
      setEditRoleOpen(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar role",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso",
        description: "Role excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir role",
        variant: "destructive",
      });
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Sucesso",
        description: "Permissão excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir permissão",
        variant: "destructive",
      });
    },
  });

  const updateRolePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => 
      apiRequest("PUT", `/api/roles/${roleId}/permissions`, { permissionIds }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/roles/${variables.roleId}/permissions`] });
      toast({
        title: "Sucesso",
        description: "Permissões do role atualizadas com sucesso!",
      });
      setManagePermissionsOpen(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar permissões do role",
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

  // Check permissions - admin and developer can access
  const canManagePermissions = user?.role === 'admin' || user?.role === 'developer';

  if (!canManagePermissions) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-shield-alt text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Negado</h3>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar o gerenciamento de permissões. Apenas administradores podem acessar esta área.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getRoleIcon = (role: Role) => {
    if (role.isSystemRole) {
      switch (role.name.toLowerCase()) {
        case 'administrativo': return 'fas fa-crown';
        case 'professor': return 'fas fa-chalkboard-teacher';
        case 'secretaria': return 'fas fa-user-tie';
        case 'aluno': return 'fas fa-graduation-cap';
        default: return 'fas fa-cog';
      }
    }
    return 'fas fa-users-cog';
  };

  const getRoleBadgeColor = (role: Role) => {
    if (role.isSystemRole) {
      switch (role.name.toLowerCase()) {
        case 'administrativo': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        case 'professor': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        case 'secretaria': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        case 'aluno': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      }
    }
    return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
  };

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.displayName) {
      toast({
        title: "Erro",
        description: "Nome e nome de exibição são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const handleCreatePermission = () => {
    if (!newPermission.name || !newPermission.displayName) {
      toast({
        title: "Erro",
        description: "Nome e nome de exibição são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createPermissionMutation.mutate(newPermission);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role as RoleWithPermissions);
    setEditRoleOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setEditPermissionOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystemRole) {
      toast({
        title: "Erro",
        description: "Roles do sistema não podem ser excluídos",
        variant: "destructive",
      });
      return;
    }
    deleteRoleMutation.mutate(role.id);
  };

  const handleDeletePermission = (permission: Permission) => {
    deletePermissionMutation.mutate(permission.id);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role as RoleWithPermissions);
    setManagePermissionsOpen(true);
  };

  const handleSaveRolePermissions = () => {
    if (!selectedRole) return;
    updateRolePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissionIds: selectedRolePermissions
    });
  };

  // Update selected permissions when role with permissions loads
  useEffect(() => {
    if (roleWithPermissions?.permissions) {
      setSelectedRolePermissions(roleWithPermissions.permissions.map(p => p.id));
    }
  }, [roleWithPermissions]);

  const togglePermission = (permissionId: string) => {
    setSelectedRolePermissions(prev => 
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
            <h2 className="text-2xl font-semibold text-foreground">Gerenciamento de Permissões</h2>
            <p className="text-sm text-muted-foreground">Configure roles e permissões do sistema</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" data-testid="tab-roles">
              <i className="fas fa-users-cog mr-2"></i>
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="tab-permissions">
              <i className="fas fa-key mr-2"></i>
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Roles do Sistema</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie os roles e suas permissões. Roles do sistema são protegidos.
                </p>
              </div>
              <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-role">
                    <i className="fas fa-plus mr-2"></i>
                    Novo Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Role</DialogTitle>
                    <DialogDescription>
                      Crie um novo role personalizado para o sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role-name">Nome do Role</Label>
                      <Input
                        id="role-name"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="ex: coordenador"
                        data-testid="input-role-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-display-name">Nome de Exibição</Label>
                      <Input
                        id="role-display-name"
                        value={newRole.displayName}
                        onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                        placeholder="ex: Coordenador"
                        data-testid="input-role-display-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-description">Descrição</Label>
                      <Textarea
                        id="role-description"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Descreva as responsabilidades deste role..."
                        data-testid="textarea-role-description"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="role-active"
                        checked={newRole.isActive}
                        onCheckedChange={(checked) => setNewRole({ ...newRole, isActive: checked })}
                        data-testid="switch-role-active"
                      />
                      <Label htmlFor="role-active">Role ativo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateRoleOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateRole} 
                      disabled={createRoleMutation.isPending}
                      data-testid="button-create-role"
                    >
                      {createRoleMutation.isPending ? "Criando..." : "Criar Role"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {rolesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
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
            ) : !roles || roles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <i className="fas fa-users-cog text-muted-foreground text-6xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum role encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando um novo role personalizado.
                  </p>
                  <Button 
                    onClick={() => setCreateRoleOpen(true)}
                    data-testid="button-create-first-role"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Criar primeiro role
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="roles-grid">
                {roles.map((role) => (
                  <Card key={role.id} className="card-hover transition-smooth" data-testid={`card-role-${role.id}`}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <i className={`${getRoleIcon(role)} text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{role.displayName}</span>
                            {role.isSystemRole && (
                              <Badge variant="secondary">Sistema</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            <Badge className={getRoleBadgeColor(role)}>
                              {role.name}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {role.description && (
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <i className={`fas fa-circle mr-2 w-4 ${role.isActive ? 'text-green-500' : 'text-red-500'}`}></i>
                          <span>{role.isActive ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            data-testid={`button-edit-role-${role.id}`}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            {role.isSystemRole ? 'Ver' : 'Editar'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleManagePermissions(role)}
                            data-testid={`button-permissions-role-${role.id}`}
                          >
                            <i className="fas fa-key mr-1"></i>
                            Permissões
                          </Button>
                          {!role.isSystemRole && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`button-delete-role-${role.id}`}
                                >
                                  <i className="fas fa-trash mr-1"></i>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o role "{role.displayName}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteRole(role)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Permissões do Sistema</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie as permissões que podem ser atribuídas aos roles.
                </p>
              </div>
              <Dialog open={createPermissionOpen} onOpenChange={setCreatePermissionOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-permission">
                    <i className="fas fa-plus mr-2"></i>
                    Nova Permissão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Permissão</DialogTitle>
                    <DialogDescription>
                      Crie uma nova permissão que pode ser atribuída aos roles.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="permission-name">Nome da Permissão</Label>
                      <Input
                        id="permission-name"
                        value={newPermission.name}
                        onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                        placeholder="ex: manage_courses"
                        data-testid="input-permission-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="permission-display-name">Nome de Exibição</Label>
                      <Input
                        id="permission-display-name"
                        value={newPermission.displayName}
                        onChange={(e) => setNewPermission({ ...newPermission, displayName: e.target.value })}
                        placeholder="ex: Gerenciar Cursos"
                        data-testid="input-permission-display-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="permission-description">Descrição</Label>
                      <Textarea
                        id="permission-description"
                        value={newPermission.description}
                        onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                        placeholder="Descreva o que esta permissão permite fazer..."
                        data-testid="textarea-permission-description"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="permission-active"
                        checked={newPermission.isActive}
                        onCheckedChange={(checked) => setNewPermission({ ...newPermission, isActive: checked })}
                        data-testid="switch-permission-active"
                      />
                      <Label htmlFor="permission-active">Permissão ativa</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreatePermissionOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreatePermission} 
                      disabled={createPermissionMutation.isPending}
                      data-testid="button-create-permission"
                    >
                      {createPermissionMutation.isPending ? "Criando..." : "Criar Permissão"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {permissionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
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
            ) : !permissions || permissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <i className="fas fa-key text-muted-foreground text-6xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma permissão encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando uma nova permissão personalizada.
                  </p>
                  <Button 
                    onClick={() => setCreatePermissionOpen(true)}
                    data-testid="button-create-first-permission"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Criar primeira permissão
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="permissions-grid">
                {permissions.map((permission) => (
                  <Card key={permission.id} className="card-hover transition-smooth" data-testid={`card-permission-${permission.id}`}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <i className="fas fa-key text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{permission.displayName}</CardTitle>
                          <CardDescription>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {permission.name}
                            </code>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {permission.description && (
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <i className={`fas fa-circle mr-2 w-4 ${permission.isActive ? 'text-green-500' : 'text-red-500'}`}></i>
                          <span>{permission.isActive ? 'Ativa' : 'Inativa'}</span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPermission(permission)}
                            data-testid={`button-edit-permission-${permission.id}`}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-delete-permission-${permission.id}`}
                              >
                                <i className="fas fa-trash mr-1"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a permissão "{permission.displayName}"? Esta ação não pode ser desfeita e a permissão será removida de todos os roles.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePermission(permission)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Manage Role Permissions Dialog */}
        <Dialog open={managePermissionsOpen} onOpenChange={setManagePermissionsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Permissões - {selectedRole?.displayName}</DialogTitle>
              <DialogDescription>
                Selecione as permissões que este role deve ter acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {permissions && permissions.length > 0 ? (
                permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedRolePermissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                      data-testid={`checkbox-permission-${permission.id}`}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.displayName}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {permission.description || `Código: ${permission.name}`}
                      </p>
                      <div className="flex items-center mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.name}
                        </code>
                        <Badge
                          variant={permission.isActive ? "default" : "secondary"}
                          className="ml-2 text-xs"
                        >
                          {permission.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-key text-muted-foreground text-4xl mb-4"></i>
                  <p className="text-muted-foreground">
                    Nenhuma permissão disponível no sistema.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setManagePermissionsOpen(false);
                  setSelectedRole(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveRolePermissions}
                disabled={updateRolePermissionsMutation.isPending}
                data-testid="button-save-role-permissions"
              >
                {updateRolePermissionsMutation.isPending ? "Salvando..." : "Salvar Permissões"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}