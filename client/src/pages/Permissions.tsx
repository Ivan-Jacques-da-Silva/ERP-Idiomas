import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRoleSchema } from "@shared/schema";
import { Crown, UserCog, GraduationCap, BookOpen, Shield, Settings, CheckCircle, Tag, Info, Plus, Edit, Trash2 } from "lucide-react";

// Schema baseado no compartilhado com validações específicas da UI
const createRoleSchema = insertRoleSchema
  .omit({ isSystemRole: true }) // Remove campo de sistema para segurança
  .extend({
    name: z.string()
      .min(1, "Nome é obrigatório")
      .max(50, "Nome deve ter no máximo 50 caracteres")
      .regex(/^[a-zA-Z0-9_-]+$/, "Nome deve conter apenas letras, números, underscore e hífen")
      .refine(
        (value) => !['admin', 'secretary', 'teacher', 'student'].includes(value.toLowerCase()),
        "Este nome é reservado pelo sistema"
      ),
    displayName: z.string()
      .min(1, "Nome de exibição é obrigatório")
      .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
    description: z.string()
      .max(500, "Descrição deve ter no máximo 500 caracteres")
      .optional()
  });

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export default function Permissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<any>(null);

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

  // Buscar todos os roles do sistema
  const { data: roles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/roles"],
    retry: false,
  });

  // Buscar todas as permissões disponíveis
  const { data: permissions } = useQuery<any[]>({
    queryKey: ["/api/permissions"],
    retry: false,
  });

  // Buscar permissões do role selecionado
  const { 
    data: roleWithPermissions, 
    isLoading: rolePermissionsLoading 
  } = useQuery({
    queryKey: ["/api/roles", selectedRole?.id, "permissions"],
    enabled: !!selectedRole?.id && permissionsModalOpen,
    retry: false,
  });

  // Mutation para atualizar permissões do role
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async (data: { roleId: string; permissionIds: string[] }) => {
      await apiRequest("PUT", `/api/roles/${data.roleId}/permissions`, { permissionIds: data.permissionIds });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles", variables.roleId, "permissions"] });
      toast({
        title: "Sucesso!",
        description: "Permissões do nível atualizadas com sucesso.",
      });
      setPermissionsModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões do nível. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para criar novo role
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      await apiRequest("POST", "/api/roles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso!",
        description: "Novo nível de acesso criado com sucesso.",
      });
      setCreateRoleModalOpen(false);
      createRoleForm.reset();
    },
    onError: (error: any) => {
      let errorMessage = "Erro ao criar nível de acesso. Tente novamente.";
      
      // Tratar erro 409 (conflito) especificamente
      if (error.response?.status === 409 || error.message?.includes("already exists")) {
        errorMessage = "Nome já em uso ou reservado pelo sistema.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar role
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string; roleData: Partial<CreateRoleFormData> }) => {
      await apiRequest("PUT", `/api/roles/${data.id}`, data.roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso!",
        description: "Nível de acesso atualizado com sucesso.",
      });
      setEditRoleModalOpen(false);
      setRoleToEdit(null);
      editRoleForm.reset();
    },
    onError: (error: any) => {
      let errorMessage = "Erro ao atualizar nível de acesso. Tente novamente.";
      
      // Tratar erro 409 (conflito) especificamente
      if (error.response?.status === 409 || error.message?.includes("already exists")) {
        errorMessage = "Nome já em uso ou reservado pelo sistema.";
      } else if (error.response?.status === 403 || error.message?.includes("Cannot modify")) {
        errorMessage = "Não é possível modificar níveis de sistema.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar role
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await apiRequest("DELETE", `/api/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso!",
        description: "Nível de acesso removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover nível de acesso. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Form para criação de role
  const createRoleForm = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
    },
  });

  // Form para edição de role
  const editRoleForm = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
    },
  });

  // Mapear roles para os 4 tipos fixos
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { 
          icon: Crown, 
          color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
          displayName: 'Administrativo'
        };
      case 'secretary':
        return { 
          icon: UserCog, 
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
          displayName: 'Secretario'
        };
      case 'teacher':
        return { 
          icon: BookOpen, 
          color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
          displayName: 'Professor'
        };
      case 'student':
        return { 
          icon: GraduationCap, 
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
          displayName: 'Aluno'
        };
      default:
        return { 
          icon: UserCog, 
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
          displayName: role
        };
    }
  };

  // Abrir modal de permissões
  const handleManagePermissions = (role: any) => {
    setSelectedRole(role);
    setPermissionsModalOpen(true);
  };

  // Salvar permissões
  const handleSavePermissions = () => {
    if (!selectedRole?.id) return;
    
    updateRolePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissionIds: selectedPermissions
    });
  };

  // Criar novo role
  const handleCreateRole = (data: CreateRoleFormData) => {
    createRoleMutation.mutate(data);
  };

  // Abrir modal de edição
  const handleEditRole = (role: any) => {
    if (role.isSystemRole) {
      toast({
        title: "Não permitido",
        description: "Níveis de sistema não podem ser editados.",
        variant: "destructive",
      });
      return;
    }
    
    setRoleToEdit(role);
    editRoleForm.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
    });
    setEditRoleModalOpen(true);
  };

  // Atualizar role
  const handleUpdateRole = (data: CreateRoleFormData) => {
    if (!roleToEdit?.id) return;
    
    updateRoleMutation.mutate({
      id: roleToEdit.id,
      roleData: data
    });
  };

  // Deletar role
  const handleDeleteRole = (role: any) => {
    if (role.isSystemRole) {
      toast({
        title: "Não permitido",
        description: "Níveis de sistema não podem ser removidos.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Tem certeza que deseja remover o nível "${role.displayName}"? Esta ação não pode ser desfeita.`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  // Inicializar permissões selecionadas quando modal abre
  useEffect(() => {
    if (permissionsModalOpen && roleWithPermissions && (roleWithPermissions as any)?.rolePermissions) {
      const grantedPermissionIds = (roleWithPermissions as any).rolePermissions
        .map((rp: any) => rp.permission.id);
      setSelectedPermissions(grantedPermissionIds);
    }
  }, [permissionsModalOpen, roleWithPermissions]);

  // Limpar estados quando modal fecha
  useEffect(() => {
    if (!permissionsModalOpen) {
      setSelectedPermissions([]);
      setSelectedRole(null);
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
              Gerenciamento de Níveis de Acesso
            </h1>
            <p className="text-muted-foreground">
              Configure as permissões para cada nível de usuário do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setCreateRoleModalOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-create-role"
            >
              <Plus className="w-4 h-4" />
              Adicionar Novo Nível
            </Button>
            
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg flex items-center">
              <Info className="w-4 h-4 mr-2" />
              4 níveis fixos + personalizados
            </div>
          </div>
        </div>

        {/* Cards dos níveis/roles */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : !roles || roles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum nível encontrado</h3>
              <p className="text-muted-foreground">
                Não há níveis de acesso configurados no sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role: any) => {
              const roleInfo = getRoleInfo(role.name);
              const IconComponent = roleInfo.icon;
              return (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${roleInfo.color}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {role.displayName ?? roleInfo.displayName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {role.description ?? 'Nível de acesso do sistema'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {role.isSystemRole ? 'Sistema' : 'Personalizado'}
                      </Badge>
                      {role.isActive && (
                        <Badge variant="secondary" className="text-xs text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleManagePermissions(role)}
                        className="w-full"
                        size="sm"
                        data-testid={`button-manage-permissions-${role.id}`}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar Permissões
                      </Button>
                      
                      {!role.isSystemRole && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditRole(role)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            data-testid={`button-edit-role-${role.id}`}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          
                          <Button
                            onClick={() => handleDeleteRole(role)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                            data-testid={`button-delete-role-${role.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      )}
                    </div>
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
                Configurar Permissões do Nível
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedRole && 
                  `${selectedRole.displayName} - ${selectedRole.description}`
                }
              </p>
            </DialogHeader>
            
            <div className="space-y-4">
              {rolePermissionsLoading ? (
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
                  <Label className="text-sm font-medium">Selecione as permissões para este nível de acesso:</Label>
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
                          {permission.displayName ?? permission.name ?? 'Permissão'}
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
                disabled={updateRolePermissionsMutation.isPending}
                data-testid="button-save-permissions"
              >
                {updateRolePermissionsMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Criação de Role */}
        <Dialog 
          open={createRoleModalOpen} 
          onOpenChange={(open) => {
            if (!open) {
              createRoleForm.reset();
            }
            setCreateRoleModalOpen(open);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Adicionar Novo Nível de Acesso
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Crie um novo nível de acesso personalizado para o sistema
              </p>
            </DialogHeader>
            
            <Form {...createRoleForm}>
              <form onSubmit={createRoleForm.handleSubmit(handleCreateRole)} className="space-y-4">
                <FormField
                  control={createRoleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Interno</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ex: coordinator, supervisor"
                          data-testid="input-role-name"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Apenas letras, números, underscore e hífen
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createRoleForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Exibição</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ex: Coordenador, Supervisor"
                          data-testid="input-role-display-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createRoleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva as responsabilidades deste nível..."
                          rows={3}
                          data-testid="input-role-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setCreateRoleModalOpen(false)}
                    data-testid="button-cancel-create-role"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createRoleMutation.isPending}
                    data-testid="button-submit-create-role"
                  >
                    {createRoleMutation.isPending ? 'Criando...' : 'Criar Nível'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Role */}
        <Dialog 
          open={editRoleModalOpen} 
          onOpenChange={(open) => {
            if (!open) {
              editRoleForm.reset();
              setRoleToEdit(null);
            }
            setEditRoleModalOpen(open);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Editar Nível de Acesso
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {roleToEdit && `Editando: ${roleToEdit.displayName}`}
              </p>
            </DialogHeader>
            
            <Form {...editRoleForm}>
              <form onSubmit={editRoleForm.handleSubmit(handleUpdateRole)} className="space-y-4">
                <FormField
                  control={editRoleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Interno</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ex: coordinator, supervisor"
                          data-testid="input-edit-role-name"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Apenas letras, números, underscore e hífen
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editRoleForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Exibição</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ex: Coordenador, Supervisor"
                          data-testid="input-edit-role-display-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editRoleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva as responsabilidades deste nível..."
                          rows={3}
                          data-testid="input-edit-role-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setEditRoleModalOpen(false)}
                    data-testid="button-cancel-edit-role"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateRoleMutation.isPending}
                    data-testid="button-submit-edit-role"
                  >
                    {updateRoleMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}