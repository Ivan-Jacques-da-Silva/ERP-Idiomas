import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, extractErrorMessage } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRoleSchema } from "@shared/schema";
import {
  Shield,
  Settings,
  Edit,
  Trash2,
  Plus,
  Users,
  Crown,
  UserCheck,
  UserCog,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Tag,
  Info,
  Globe,
  Lock
} from "lucide-react";

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
  const [pagePermissionsModalOpen, setPagePermissionsModalOpen] = useState(false);
  const [selectedPagePermissions, setSelectedPagePermissions] = useState<{[key: string]: boolean}>({});
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);

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

  // Buscar todas as páginas disponíveis
  const { data: pages } = useQuery<any[]>({
    queryKey: ["/api/pages"],
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

  // Buscar permissões de páginas do role selecionado
  const { 
    data: rolePagePermissions, 
    isLoading: rolePagePermissionsLoading 
  } = useQuery({
    queryKey: ["/api/roles", selectedRole?.id, "pages"],
    enabled: !!selectedRole?.id && pagePermissionsModalOpen,
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

  // Mutation para atualizar permissões de páginas do role
  const updateRolePagePermissionsMutation = useMutation({
    mutationFn: async (data: { roleId: string; pagePermissions: {pageId: string; canAccess: boolean}[] }) => {
      await apiRequest("PUT", `/api/roles/${data.roleId}/pages`, { pagePermissions: data.pagePermissions });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles", variables.roleId, "pages"] });
      toast({
        title: "Sucesso!",
        description: "Permissões de páginas do nível atualizadas com sucesso.",
      });
      setPagePermissionsModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões de páginas do nível. Tente novamente.",
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
      if (error.response?.status === 409 || extractErrorMessage(error)?.includes("already exists")) {
        errorMessage = "Nome já em uso ou reservado pelo sistema.";
      } else {
        errorMessage = extractErrorMessage(error) || errorMessage;
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
      if (error.response?.status === 409 || extractErrorMessage(error)?.includes("already exists")) {
        errorMessage = "Nome já em uso ou reservado pelo sistema.";
      } else if (error.response?.status === 403 || extractErrorMessage(error)?.includes("Cannot modify")) {
        errorMessage = "Não é possível modificar níveis de sistema.";
      } else {
        errorMessage = extractErrorMessage(error) || errorMessage;
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
        description: extractErrorMessage(error) || "Erro ao remover nível de acesso. Tente novamente.",
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

  // Abrir modal de permissões de páginas
  const handleManagePagePermissions = (role: any) => {
    setSelectedRole(role);
    setPagePermissionsModalOpen(true);
  };

  // Salvar permissões de páginas
  const handleSavePagePermissions = () => {
    if (!selectedRole?.id || !pages) return;
    
    const pagePermissions = pages.map(page => ({
      pageId: page.id,
      canAccess: selectedPagePermissions[page.id] || false
    }));
    
    updateRolePagePermissionsMutation.mutate({
      roleId: selectedRole.id,
      pagePermissions
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

    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.id);
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
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

  // Inicializar permissões de páginas selecionadas quando modal abre
  useEffect(() => {
    if (pagePermissionsModalOpen && rolePagePermissions && pages) {
      const pagePermissionsMap: {[key: string]: boolean} = {};
      
      // Inicializar todas as páginas como false
      pages.forEach(page => {
        pagePermissionsMap[page.id] = false;
      });
      
      // Marcar as páginas que o role tem acesso
      rolePagePermissions.forEach((rpp: any) => {
        pagePermissionsMap[rpp.pageId] = rpp.canAccess;
      });
      
      setSelectedPagePermissions(pagePermissionsMap);
    }
  }, [pagePermissionsModalOpen, rolePagePermissions, pages]);

  // Limpar estados quando modal de páginas fecha
  useEffect(() => {
    if (!pagePermissionsModalOpen) {
      setSelectedPagePermissions({});
      setSelectedRole(null);
    }
  }, [pagePermissionsModalOpen]);

  // Toggle permissão de página
  const togglePagePermission = (pageId: string) => {
    setSelectedPagePermissions(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  // Toggle permissão
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Mapeamento de permissões para páginas/funcionalidades
  const getPagePermissions = (permissions: any[]) => {
    const pageGroups = [
      {
        title: "Dashboard",
        icon: "📊",
        permissions: permissions.filter(p => p.name === 'dashboard:read')
      },
      {
        title: "Unidades",
        icon: "🏢",
        permissions: permissions.filter(p => p.name.startsWith('units:'))
      },
      {
        title: "Funcionários",
        icon: "👥",
        permissions: permissions.filter(p => p.name.startsWith('staff:'))
      },
      {
        title: "Estudantes",
        icon: "🎓",
        permissions: permissions.filter(p => p.name.startsWith('students:'))
      },
      {
        title: "Cursos",
        icon: "📚",
        permissions: permissions.filter(p => p.name.startsWith('courses:'))
      },
      {
        title: "Livros",
        icon: "📖",
        permissions: permissions.filter(p => p.name.startsWith('books:'))
      },
      {
        title: "Aulas",
        icon: "🏫",
        permissions: permissions.filter(p => p.name.startsWith('classes:'))
      },
      {
        title: "Área do Estudante",
        icon: "📝",
        permissions: permissions.filter(p => p.name.startsWith('lessons:'))
      },
      {
        title: "Financeiro",
        icon: "💰",
        permissions: permissions.filter(p => p.name.startsWith('finance:'))
      },
      {
        title: "Configurações",
        icon: "⚙️",
        permissions: permissions.filter(p => p.name === 'settings:read')
      },
      {
        title: "Suporte",
        icon: "🆘",
        permissions: permissions.filter(p => p.name === 'support:read')
      },
      {
        title: "Gerenciar Permissões",
        icon: "🔐",
        permissions: permissions.filter(p => p.name === 'permissions:manage')
      }
    ].filter(group => group.permissions.length > 0);

    return pageGroups;
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
                      
                      <Button 
                        onClick={() => handleManagePagePermissions(role)}
                        className="w-full"
                        size="sm"
                        variant="outline"
                        data-testid={`button-manage-page-permissions-${role.id}`}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Configurar Páginas
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Configurar Permissões do Nível
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedRole && 
                  `${selectedRole.displayName} - ${selectedRole.description}`
                }
              </p>
              {selectedRole?.isSystemRole && selectedRole?.name === 'admin' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Nível Administrativo
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Este nível possui acesso total ao sistema e não pode ser modificado.
                  </p>
                </div>
              )}
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
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Selecione quais páginas este nível pode acessar:
                  </Label>
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {getPagePermissions(permissions).map((pageGroup) => (
                      <div key={pageGroup.title} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{pageGroup.icon}</span>
                          <h4 className="font-medium text-sm">{pageGroup.title}</h4>
                        </div>
                        <div className="space-y-2 ml-6">
                          {pageGroup.permissions.map((permission: any) => {
                            const isReadOnly = permission.name.endsWith(':read');
                            const isDisabled = selectedRole?.isSystemRole && selectedRole?.name === 'admin';
                            
                            return (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={selectedRole?.isSystemRole && selectedRole?.name === 'admin' ? true : selectedPermissions.includes(permission.id)}
                                  onCheckedChange={() => !isDisabled && togglePermission(permission.id)}
                                  disabled={isDisabled}
                                  data-testid={`checkbox-permission-${permission.name}`}
                                />
                                <Label 
                                  htmlFor={permission.id} 
                                  className={`text-sm cursor-pointer flex-1 ${isDisabled ? 'text-muted-foreground' : ''}`}
                                >
                                  {isReadOnly ? '👁️ Visualizar' : '✏️ Gerenciar'}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({permission.displayName})
                                  </span>
                                </Label>
                              </div>
                            );
                          })}
                        </div>
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
                disabled={updateRolePermissionsMutation.isPending || (selectedRole?.isSystemRole && selectedRole?.name === 'admin')}
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent data-testid="dialog-delete-role">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o nível <strong>"{roleToDelete?.displayName}"</strong>?
                Esta ação não pode ser desfeita e todos os usuários com este nível perderão suas permissões associadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-role">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteRole} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete-role"
              >
                {deleteRoleMutation.isPending ? "Excluindo..." : "Excluir Nível"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Permissões de Páginas */}
        <Dialog open={pagePermissionsModalOpen} onOpenChange={setPagePermissionsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-page-permissions">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configurar Páginas - {selectedRole?.displayName}
              </DialogTitle>
              <DialogDescription>
                Selecione quais páginas este nível pode acessar no sistema.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {pages && pages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pages.map((page: any) => (
                    <div key={page.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`page-${page.id}`}
                        checked={selectedPagePermissions[page.id] || false}
                        onCheckedChange={() => togglePagePermission(page.id)}
                        data-testid={`checkbox-page-${page.id}`}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`page-${page.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {page.displayName}
                        </label>
                        {page.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {page.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma página encontrada</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setPagePermissionsModalOpen(false)}
                data-testid="button-cancel-page-permissions"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePagePermissions}
                disabled={updateRolePagePermissionsMutation.isPending}
                data-testid="button-save-page-permissions"
              >
                {updateRolePagePermissionsMutation.isPending ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
