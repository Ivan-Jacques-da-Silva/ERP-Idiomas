import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage.js';
// JWT_SECRET é obrigatório - falha se não estiver definido
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set');
}
const SALT_ROUNDS = 10;
// ============================================================================
// PASSWORD HASHING
// ============================================================================
export async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}
export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
export function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
// ============================================================================
// AUTHENTICATION
// ============================================================================
export async function authenticateUser(email, password) {
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
export function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
}
export function requireAdmin(req, res, next) {
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
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao verificar permissões" });
        }
    });
}
// Permission-based middleware
export function requirePermission(permissionName) {
    return (req, res, next) => {
        isAuthenticated(req, res, async () => {
            try {
                const user = await storage.getUserById(req.user.id);
                if (!user) {
                    return res.status(401).json({ message: "Usuário não encontrado" });
                }
                // Admin tem acesso a tudo
                const roles = await storage.getRoles();
                const userRole = roles.find((r) => r.id === user.roleId);
                if (userRole?.name === 'admin') {
                    return next();
                }
                // Verifica permissões do papel
                const rolePerms = await storage.getRolePermissionsByName(userRole?.name || '');
                let allowed = rolePerms.some((rp) => rp.permission.name === permissionName);
                // Considera overrides por usuário: grant adiciona, deny remove
                const overrides = await storage.getUserPermissionOverrides(user.id);
                for (const ov of overrides) {
                    if (ov.permission.name === permissionName) {
                        allowed = ov.isGranted ? true : false;
                    }
                }
                if (allowed)
                    return next();
                return res.status(403).json({ message: "Acesso negado - permissão requerida", permission: permissionName });
            }
            catch (error) {
                return res.status(500).json({ message: "Erro ao verificar permissões" });
            }
        });
    };
}
export function requireAdminOrSecretary(req, res, next) {
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
        }
        catch (error) {
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
    requirePermission,
    requireAdminOrSecretary,
};
