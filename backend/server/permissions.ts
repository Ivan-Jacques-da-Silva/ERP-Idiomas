// Sistema de mapeamento de cargos para permissões de páginas
import * as storage from './storage.js';

export interface PagePermission {
  page: string;
  allowedRoles: string[];
}

// Função para verificar se um usuário tem permissão para acessar uma página
export async function hasPagePermission(userId: string, page: string): Promise<boolean> {
  try {
    // Buscar o usuário e seu role
    const user = await storage.getUserById(userId);
    if (!user) {
      return false;
    }

    const roles = await storage.getRoles();
    const userRole = roles.find(r => r.id === user.roleId);
    if (!userRole) {
      return false;
    }

    // Admin sempre tem acesso global
    if (userRole.name === 'admin') {
      return true;
    }

    // Buscar permissões de páginas do banco de dados
    const allowedPages = await storage.getRoleAllowedPages(userRole.id);
    return allowedPages.some(p => p.name === page);
  } catch (error) {
    console.error('Erro ao verificar permissão de página:', error);
    return false;
  }
}

// Função para obter todas as páginas que um usuário pode acessar
export async function getUserAllowedPages(userId: string): Promise<string[]> {
  try {
    // Buscar o usuário e seu role
    const user = await storage.getUserById(userId);
    if (!user) {
      return [];
    }

    const roles = await storage.getRoles();
    const userRole = roles.find(r => r.id === user.roleId);
    if (!userRole) {
      return [];
    }

    // Admin tem acesso a todas as páginas
    if (userRole.name === 'admin') {
      const allPages = await storage.getPages();
      return allPages.map(p => p.name);
    }

    // Buscar páginas permitidas do banco de dados
    const allowedPages = await storage.getRoleAllowedPages(userRole.id);
    return allowedPages.map(p => p.name);
  } catch (error) {
    console.error('Erro ao buscar páginas permitidas:', error);
    return [];
  }
}

// Middleware para verificar permissão de página
export function requirePagePermission(page: string) {
  return async (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const hasPermission = await hasPagePermission(user.id, page);
    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Acesso negado: você não tem permissão para acessar esta página' 
      });
    }
    
    next();
  };
}