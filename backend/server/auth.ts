import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage.js';
import type { User } from '../shared/schema.js';

// JWT_SECRET é obrigatório - falha se não estiver definido
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

const SALT_ROUNDS = 10;

// ============================================================================
// PASSWORD HASHING
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ============================================================================
// JWT OPERATIONS
// ============================================================================

export interface JWTPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
  };
  
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET!) as JWTPayload;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await storage.getUserByEmail(email);
  
  if (!user) {
    return null;
  }

  if (!user.password) {
    return null;
  }

  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return null;
  }

  if (!user.isActive) {
    throw new Error('User account is inactive');
  }

  const token = generateToken(user);
  
  return { user, token };
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function isAuthenticated(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function requireAdmin(req: any, res: any, next: any) {
  isAuthenticated(req, res, async () => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      const role = await storage.getRoleByName('admin');
      if (user.roleId === role?.id) {
        return next();
      }
      
      return res.status(403).json({ message: "Acesso negado - Permissão de administrador necessária" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao verificar permissões" });
    }
  });
}

export function requireAdminOrSecretary(req: any, res: any, next: any) {
  isAuthenticated(req, res, async () => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      const adminRole = await storage.getRoleByName('admin');
      const secretaryRole = await storage.getRoleByName('secretary');
      
      if (user.roleId === adminRole?.id || user.roleId === secretaryRole?.id) {
        return next();
      }
      
      return res.status(403).json({ message: "Acesso negado - Permissão de administrador ou secretário necessária" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao verificar permissões" });
    }
  });
}

export const auth = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticateUser,
  isAuthenticated,
  requireAdmin,
  requireAdminOrSecretary,
};
