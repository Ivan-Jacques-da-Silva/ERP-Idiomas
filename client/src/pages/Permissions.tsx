import { useAuth } from "@/hooks/useAuth";

export default function Permissions() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'developer')) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" data-testid="text-permissions-title">
          Gerenciamento de Permissões
        </h1>
        
        <div className="bg-card rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Configuração de Permissões do Sistema
          </h2>
          <p className="text-muted-foreground mb-4">
            Aqui você pode gerenciar as permissões de acesso dos usuários do sistema.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Informação
              </span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 mt-2">
              O gerenciamento detalhado de permissões está disponível na página de Colaboradores.
              Vá para a seção "Colaboradores" para visualizar e editar permissões específicas de cada usuário.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">
              Permissões Disponíveis no Sistema:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-background border rounded-lg p-4">
                <h4 className="font-medium text-sm text-green-600 dark:text-green-400 mb-2">
                  PÁGINAS PRINCIPAIS
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dashboard</li>
                  <li>• Unidades</li>
                  <li>• Colaboradores</li>
                  <li>• Alunos</li>
                  <li>• Cursos</li>
                  <li>• Agenda</li>
                  <li>• Financeiro</li>
                  <li>• Área do Aluno</li>
                </ul>
              </div>
              
              <div className="bg-background border rounded-lg p-4">
                <h4 className="font-medium text-sm text-purple-600 dark:text-purple-400 mb-2">
                  SISTEMA
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Configurações</li>
                  <li>• Permissões</li>
                </ul>
              </div>
              
              <div className="bg-background border rounded-lg p-4">
                <h4 className="font-medium text-sm text-orange-600 dark:text-orange-400 mb-2">
                  USUÁRIO ATUAL
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Nome:</strong> {user.firstName} {user.lastName}</li>
                  <li><strong>Email:</strong> {user.email}</li>
                  <li><strong>Função:</strong> {user.role}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}