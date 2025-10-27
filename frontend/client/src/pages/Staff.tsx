import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { StaffModal } from '@/components/StaffModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface StaffMember {
  id: string;
  userId: string;
  position: string;
  department: string;
  isActive: boolean;
  user?: User;
}

export default function Staff() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchName, setSearchName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canManageStaff = user?.role === 'admin' || user?.role === 'secretary';

  // Opções de cargos disponíveis
  const positionOptions = [
    { value: 'all', label: 'Todos os Cargos' },
    { value: 'ceo', label: 'CEO' },
    { value: 'diretor', label: 'Diretor' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'coordenador', label: 'Coordenador' },
    { value: 'instrutor', label: 'Instrutor' },
    { value: 'professor', label: 'Professor(a)' },
    { value: 'recepcionista', label: 'Recepcionista' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'marketing', label: 'Marketing' },
  ];

  useEffect(() => {
    if (!user) return;
    if (!canManageStaff) {
      window.location.href = '/dashboard';
    }
  }, [user, canManageStaff]);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      return await apiRequest('/api/staff');
    },
  });

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    setStaffToDelete({ id: staffId, name: staffName });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;

    setIsDeleting(true);
    try {
      await apiRequest(`/api/staff/${staffToDelete.id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Sucesso!',
        description: 'Colaborador excluído com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir colaborador',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (member: StaffMember) => {
    // Implementar modal de detalhes ou navegação para página de detalhes
    const userName = member.user?.firstName && member.user?.lastName 
      ? `${member.user.firstName} ${member.user.lastName}`
      : 'Nome não informado';
    
    toast({
      title: 'Informação',
      description: `Visualizando detalhes de ${userName}`,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'fas fa-crown';
      case 'secretary': return 'fas fa-user-tie';
      case 'teacher': return 'fas fa-chalkboard-teacher';
      case 'student': return 'fas fa-user-graduate';
      default: return 'fas fa-user';
    }
  };

  const filteredStaff = staff.filter((member: StaffMember) => {
    // Filtro por nome
    const fullName = member.user?.firstName && member.user?.lastName 
      ? `${member.user.firstName} ${member.user.lastName}`
      : '';
    const nameMatch = !searchName || 
      fullName.toLowerCase().includes(searchName.toLowerCase());
    
    // Filtro por cargo
    const positionMatch = selectedPosition === 'all' || 
      member.position === selectedPosition;
    
    return nameMatch && positionMatch;
  });

  if (!canManageStaff) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <Button onClick={() => setModalOpen(true)}>
            <i className="fas fa-plus mr-2"></i>
            Adicionar Colaborador
          </Button>
        </div>

        {/* Filtros e Controles */}
        <div className="flex justify-between items-center">
          <div></div> {/* Espaço vazio à esquerda */}
          
          <div className="flex items-center gap-3">
            {/* Filtro por Nome */}
            <Input
              placeholder="Pesquisar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-64"
            />
            
            {/* Filtro por Cargo */}
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Modo de Visualização - Apenas Ícones */}
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3"
              >
                <i className="fas fa-th"></i>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <i className="fas fa-list"></i>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Carregando colaboradores...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {(searchName || selectedPosition !== 'all') ? 'Nenhum colaborador encontrado com os filtros aplicados.' : 'Nenhum colaborador cadastrado.'}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStaff.map((member: StaffMember) => (
              <Card key={member.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                      <i className={`${getRoleIcon(member.user?.role || '')} text-primary text-lg`}></i>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {member.user?.firstName && member.user?.lastName 
                          ? `${member.user.firstName} ${member.user.lastName}`
                          : 'Nome não informado'
                        }
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {member.user?.role === 'admin' && 'Administrador'}
                        {member.user?.role === 'teacher' && 'Professor'}
                        {member.user?.role === 'secretary' && 'Secretário'}
                        {member.user?.role === 'student' && 'Aluno'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="space-y-2 mb-3">
                    {member.user?.email && (
                      <div className="flex items-center text-sm text-muted-foreground bg-gray-50 p-2 rounded-md">
                        <i className="fas fa-envelope mr-2 w-4 text-gray-400"></i>
                        <span className="truncate flex-1">{member.user.email}</span>
                      </div>
                    )}
                    {member.position && (
                      <div className="flex items-center text-sm text-muted-foreground bg-gray-50 p-2 rounded-md">
                        <i className="fas fa-briefcase mr-2 w-4 text-gray-400"></i>
                        <span className="flex-1">{member.position}</span>
                      </div>
                    )}
                    {member.department && (
                      <div className="flex items-center text-sm text-muted-foreground bg-gray-50 p-2 rounded-md">
                        <i className="fas fa-building mr-2 w-4 text-gray-400"></i>
                        <span className="flex-1">{member.department}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <i className={`fas fa-circle mr-1 text-xs ${member.isActive ? 'text-green-500' : 'text-red-500'}`}></i>
                        {member.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  {canManageStaff && (
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member);
                          setModalOpen(true);
                        }}
                        className="w-full justify-center hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors h-8"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Editar
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(member)}
                          className="justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors h-8"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id, 
                              member.user?.firstName && member.user?.lastName 
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : 'Nome não informado'
                            )}
                          className="justify-center text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors h-8"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Excluir
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Modo Lista
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cargo/Profissão
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredStaff.map((member: StaffMember) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-4 shadow-sm">
                            <i className={`${getRoleIcon(member.user?.role || '')} text-primary text-sm`}></i>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {member.user?.firstName && member.user?.lastName 
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : 'Nome não informado'
                              }
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{member.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.position}</div>
                        <Badge variant="secondary" className="text-xs mt-1 font-medium">
                          {member.user?.role === 'admin' && 'Administrador'}
                          {member.user?.role === 'teacher' && 'Professor'}
                          {member.user?.role === 'secretary' && 'Secretário'}
                          {member.user?.role === 'student' && 'Aluno'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {member.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          member.isActive 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          <i className={`fas fa-circle mr-2 text-xs ${member.isActive ? 'text-green-500' : 'text-red-500'}`}></i>
                          {member.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {canManageStaff && (
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(member);
                                setModalOpen(true);
                              }}
                              className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              title="Editar colaborador"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(member)}
                              className="hover:bg-green-50 hover:text-green-700 transition-colors"
                              title="Ver detalhes"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStaff(member.id, 
                              member.user?.firstName && member.user?.lastName 
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : 'Nome não informado'
                            )}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Excluir colaborador"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza de que deseja excluir o colaborador "${staffToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteStaff}
        isLoading={isDeleting}
        variant="destructive"
      />
    </Layout>
  );
}
