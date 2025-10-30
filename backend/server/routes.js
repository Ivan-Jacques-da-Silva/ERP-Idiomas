import express from "express";
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage.js";
import { auth } from "./auth.js";
import { setupVite, serveStatic } from "./vite.js";
import { requirePagePermission } from "./permissions.js";
import { insertUnitSchema, insertStaffSchema, insertStudentSchema, insertCourseSchema, insertClassSchema, insertLessonSchema, insertBookSchema, insertUserSettingsSchema, insertSupportTicketSchema, insertSupportTicketResponseSchema, insertGuardianSchema, insertFinancialResponsibleSchema, staff, } from "../shared/schema.js";
import { z } from "zod";
import { db } from "./db.js";
import { eq } from "drizzle-orm";
const updateRolePermissionsSchema = z.object({
    permissionIds: z.array(z.string())
});
// Configure multer for file uploads
const bookUploads = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = './uploads/books';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const bookId = req.params.id;
            const ext = path.extname(file.originalname);
            cb(null, `book_${bookId}_${Date.now()}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
const audioUploads = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = './uploads/books/audio';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const bookId = req.params.id;
            const ext = path.extname(file.originalname);
            cb(null, `book_${bookId}_audio_${Date.now()}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const audioMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
        if (audioMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});
const videoUploads = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = './uploads/books/video';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const bookId = req.params.id;
            const ext = path.extname(file.originalname);
            cb(null, `book_${bookId}_video_${Date.now()}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const videoMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (videoMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});
const franchiseUploads = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = './uploads/franchise-units';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const fieldName = file.fieldname;
            cb(null, `${fieldName}_${Date.now()}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
export async function registerRoutes(app) {
    // Serve uploaded files
    app.use('/uploads', express.static('uploads'));
    // ============================================================================
    // AUTH ROUTES
    // ============================================================================
    // Login endpoint
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('🔑 Tentativa de login:', { email, password: '***' });
            const result = await auth.authenticateUser(email, password);
            if (!result) {
                console.log('❌ Credenciais inválidas para:', email);
                return res.status(401).json({ message: "Credenciais inválidas" });
            }
            const { user, token } = result;
            // Buscar role para incluir no retorno
            const role = await storage.getRoles();
            const userRole = role.find(r => r.id === user.roleId);
            console.log('✅ Login bem-sucedido para:', email);
            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: userRole?.name || 'student',
                },
                token,
                message: "Login realizado com sucesso"
            });
        }
        catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: "Erro ao realizar login" });
        }
    });
    // Register endpoint - apenas para estudantes (auto-registro)
    app.post('/api/auth/register', async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;
            // Verificar se usuário já existe
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email já cadastrado" });
            }
            // Auto-registro é SEMPRE como student (segurança)
            const studentRole = await storage.getRoleByName('student');
            if (!studentRole) {
                return res.status(500).json({ message: "Role de estudante não configurado" });
            }
            // Hash da senha
            const hashedPassword = await auth.hashPassword(password);
            // Criar usuário
            const user = await storage.createUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roleId: studentRole.id,
                isActive: true,
            });
            // Gerar token
            const token = auth.generateToken(user);
            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: 'student',
                },
                token,
                message: "Usuário criado com sucesso"
            });
        }
        catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ message: "Erro ao criar usuário" });
        }
    });
    // Get current user
    app.get('/api/auth/user', auth.isAuthenticated, async (req, res) => {
        try {
            const user = await storage.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            const role = await storage.getRoles();
            const userRole = role.find(r => r.id === user.roleId);
            res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: userRole?.name || 'student',
            });
        }
        catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ message: "Erro ao buscar usuário" });
        }
    });
    // Get effective permissions for current user
    app.get('/api/auth/effective-permissions', auth.isAuthenticated, async (req, res) => {
        try {
            const user = await storage.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "Usu�rio n�o encontrado" });
            }
            const roles = await storage.getRoles();
            const userRole = roles.find(r => r.id === user.roleId);
            let permissions = [];
            if (userRole) {
                const rolePermissions = await storage.getRolePermissionsByName(userRole.name);
                permissions = rolePermissions.map(rp => rp.permission);
            }
            // Apply user overrides (grants/denies)
            const overrides = await storage.getUserPermissionOverrides(user.id);
            const permMap = new Map();
            for (const p of permissions)
                permMap.set(p.id, p);
            for (const ov of overrides) {
                if (ov.isGranted) {
                    permMap.set(ov.permission.id, ov.permission);
                }
                else {
                    permMap.delete(ov.permission.id);
                }
            }
            res.json({ permissions: Array.from(permMap.values()) });
        }
        catch (error) {
            console.error('Error getting effective permissions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    // ============================================================================
    // UPLOAD ROUTES
    // ============================================================================
    app.post('/api/upload/unit-document', auth.isAuthenticated, franchiseUploads.single('file'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' });
            }
            const fileUrl = `/uploads/franchise-units/${req.file.filename}`;
            res.json({
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            });
        }
        catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: 'Erro ao fazer upload do arquivo' });
        }
    });
    // ============================================================================
    // DASHBOARD ROUTES
    // ============================================================================
    app.get("/api/dashboard/stats", auth.isAuthenticated, async (req, res) => {
        try {
            const stats = await storage.getDashboardStats();
            res.json(stats);
        }
        catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(500).json({ message: "Erro ao buscar estatísticas do painel" });
        }
    });
    app.get("/api/units", auth.isAuthenticated, requirePagePermission('units'), async (req, res) => {
        try {
            const units = await storage.getUnits();
            res.json(units);
        }
        catch (error) {
            console.error("Error fetching units:", error);
            res.status(500).json({ message: "Erro ao buscar unidades" });
        }
    });
    app.get("/api/units/:id", auth.isAuthenticated, requirePagePermission('units'), async (req, res) => {
        try {
            const unit = await storage.getUnit(req.params.id);
            if (!unit) {
                return res.status(404).json({ message: "Unidade não encontrada" });
            }
            res.json(unit);
        }
        catch (error) {
            console.error("Error fetching unit:", error);
            res.status(500).json({ message: "Erro ao buscar unidade" });
        }
    });
    app.post("/api/units", auth.requirePermission('units:write'), requirePagePermission('units'), async (req, res) => {
        try {
            const unitData = insertUnitSchema.parse(req.body);
            const unit = await storage.createUnit(unitData);
            res.status(201).json(unit);
        }
        catch (error) {
            console.error("Error creating unit:", error);
            // Tratamento específico para erros de validação
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao criar unidade" });
        }
    });
    app.put("/api/units/:id", auth.requirePermission('units:write'), async (req, res) => {
        try {
            const unitData = insertUnitSchema.partial().parse(req.body);
            const unit = await storage.updateUnit(req.params.id, unitData);
            res.json(unit);
        }
        catch (error) {
            console.error("Error updating unit:", error);
            // Tratamento específico para erros de validação
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao atualizar unidade" });
        }
    });
    app.delete("/api/units/:id", auth.requirePermission('units:write'), async (req, res) => {
        try {
            await storage.deleteUnit(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting unit:", error);
            res.status(500).json({ message: "Erro ao excluir unidade" });
        }
    });
    // ============================================================================
    // STAFF ROUTES
    // ============================================================================
    app.get("/api/staff", auth.isAuthenticated, requirePagePermission('staff'), async (req, res) => {
        try {
            const staff = await storage.getStaff();
            res.json(staff);
        }
        catch (error) {
            console.error("Error fetching staff:", error);
            res.status(500).json({ message: "Erro ao buscar colaboradores" });
        }
    });
    app.get("/api/staff/:id", auth.isAuthenticated, requirePagePermission('staff'), async (req, res) => {
        try {
            const staffMember = await storage.getStaffMember(req.params.id);
            if (!staffMember) {
                return res.status(404).json({ message: "Colaborador não encontrado" });
            }
            res.json(staffMember);
        }
        catch (error) {
            console.error("Error fetching staff member:", error);
            res.status(500).json({ message: "Erro ao buscar colaborador" });
        }
    });
    app.post("/api/staff", auth.requireAdmin, requirePagePermission('staff'), async (req, res) => {
        try {
            const { firstName, lastName, email, password, ...staffFields } = req.body;
            // Validação: verificar se já existe um colaborador com este CPF (apenas se CPF for fornecido)
            if (staffFields.cpf && staffFields.cpf.trim() !== '') {
                const existingStaffByCpf = await db
                    .select()
                    .from(staff)
                    .where(eq(staff.cpf, staffFields.cpf))
                    .limit(1);
                if (existingStaffByCpf.length > 0) {
                    return res.status(400).json({
                        message: "Já existe um colaborador cadastrado com este CPF"
                    });
                }
            }
            // Normalizar position para minúsculo
            if (staffFields.position) {
                staffFields.position = staffFields.position.toLowerCase();
            }
            // Mapear cargo para role automaticamente
            const getRole = (position) => {
                switch (position?.toLowerCase()) {
                    case 'ceo':
                    case 'diretor':
                        return 'admin';
                    case 'coordenador':
                    case 'administrativo':
                    case 'financeiro':
                    case 'recepcionista':
                    case 'comercial':
                    case 'marketing':
                        return 'secretary';
                    case 'instrutor':
                        return 'teacher';
                    default:
                        return 'teacher'; // padrão
                }
            };
            const role = getRole(staffFields.position);
            // Buscar role
            const userRole = await storage.getRoleByName(role);
            if (!userRole) {
                return res.status(400).json({ message: "Role inválido" });
            }
            // Verificar se já existe um usuário com este email
            const existingUser = await storage.getUserByEmail(email);
            let user;
            if (existingUser) {
                // Atualizar o usuário existente (REMOVIDA validação de staff duplicado por email)
                user = await storage.updateUser(existingUser.id, {
                    firstName,
                    lastName,
                    roleId: userRole.id,
                });
            }
            else {
                // Criar novo usuário
                const hashedPassword = await auth.hashPassword(password);
                user = await storage.createUser({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    roleId: userRole.id,
                });
            }
            // Processar campos de data - converter strings ISO para objetos Date
            const processedStaffFields = { ...staffFields };
            if (processedStaffFields.birthDate && typeof processedStaffFields.birthDate === 'string') {
                processedStaffFields.birthDate = new Date(processedStaffFields.birthDate);
            }
            if (processedStaffFields.hireDate && typeof processedStaffFields.hireDate === 'string') {
                processedStaffFields.hireDate = new Date(processedStaffFields.hireDate);
            }
            // Criar o registro de staff
            const staffMember = await storage.createStaff({
                userId: user.id,
                ...processedStaffFields,
            });
            res.status(201).json(staffMember);
        }
        catch (error) {
            console.error("Error creating staff:", error);
            // Verificar se é erro de validação do Zod
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Dados inválidos",
                    errors: error.errors
                });
            }
            res.status(500).json({ message: "Erro ao criar colaborador" });
        }
    });
    app.put("/api/staff/:id", auth.requireAdmin, async (req, res) => {
        try {
            const { firstName, lastName, email, userId, ...staffFields } = req.body;
            // Atualizar usuário se dados fornecidos
            if (userId && (firstName || lastName || email)) {
                await storage.updateUser(userId, {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(email && { email }),
                });
            }
            // Atualizar staff
            const staffData = insertStaffSchema.partial().parse(staffFields);
            const staff = await storage.updateStaff(req.params.id, staffData);
            res.json(staff);
        }
        catch (error) {
            console.error("Error updating staff member:", error);
            // Tratamento específico para erro de email duplicado
            if (error.message && error.message.includes('users_email_unique')) {
                return res.status(400).json({
                    message: "Este e-mail já está cadastrado no sistema. Por favor, utilize um e-mail diferente."
                });
            }
            // Outros erros de validação do Zod
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao atualizar colaborador" });
        }
    });
    app.delete("/api/staff/:id", auth.requireAdmin, async (req, res) => {
        try {
            await storage.deleteStaff(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting staff member:", error);
            res.status(500).json({ message: "Erro ao excluir colaborador" });
        }
    });
    // ============================================================================
    // STUDENT ROUTES
    // ============================================================================
    app.get("/api/students", auth.isAuthenticated, requirePagePermission('students'), async (req, res) => {
        try {
            const students = await storage.getStudents();
            res.json(students);
        }
        catch (error) {
            console.error("Error fetching students:", error);
            res.status(500).json({ message: "Erro ao buscar estudantes" });
        }
    });
    app.get("/api/students/:id", auth.isAuthenticated, requirePagePermission('students'), async (req, res) => {
        try {
            const student = await storage.getStudent(req.params.id);
            if (!student) {
                return res.status(404).json({ message: "Estudante não encontrado" });
            }
            res.json(student);
        }
        catch (error) {
            console.error("Error fetching student:", error);
            res.status(500).json({ message: "Erro ao buscar estudante" });
        }
    });
    app.post("/api/students", auth.requireAdminOrSecretary, requirePagePermission('students'), async (req, res) => {
        try {
            const { firstName, lastName, email, password, guardian, ...studentFields } = req.body;
            
            // Verificar se CPF já existe (se fornecido)
            if (studentFields.cpf && studentFields.cpf.trim() !== '') {
                const existingStudent = await storage.getStudentByCpf(studentFields.cpf);
                if (existingStudent) {
                    return res.status(400).json({ 
                        message: "Já existe um aluno cadastrado com este CPF" 
                    });
                }
            }
            
            // Buscar role student
            const studentRole = await storage.getRoleByName('student');
            if (!studentRole) {
                return res.status(400).json({ message: "Role de estudante não encontrado" });
            }
            // Hash da senha
            const hashedPassword = await auth.hashPassword(password || 'senha123');
            // Criar usuário primeiro
            const user = await storage.createUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roleId: studentRole.id,
                isActive: true,
            });
            let guardianId = null;
            // Criar guardian se fornecido
            if (guardian) {
                const { financialResponsible, ...guardianFields } = guardian;
                const guardianData = insertGuardianSchema.parse(guardianFields);
                const createdGuardian = await storage.createGuardian(guardianData);
                guardianId = createdGuardian.id;
                // Criar responsável financeiro se fornecido
                if (financialResponsible) {
                    const financialData = insertFinancialResponsibleSchema.parse({
                        ...financialResponsible,
                        guardianId: createdGuardian.id,
                    });
                    await storage.createFinancialResponsible(financialData);
                }
            }
            // Criar student com userId e guardianId
            const studentData = insertStudentSchema.parse({
                ...studentFields,
                userId: user.id,
                guardianId,
            });
            const student = await storage.createStudent(studentData);
            res.status(201).json(student);
        }
        catch (error) {
            console.error("Error creating student:", error);
            // Tratamento específico para erro de email duplicado
            if (error.message && error.message.includes('users_email_unique')) {
                return res.status(400).json({
                    message: "Este e-mail já está cadastrado no sistema. Por favor, utilize um e-mail diferente."
                });
            }
            // Outros erros de validação do Zod
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao cadastrar estudante" });
        }
    });
    app.put("/api/students/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const { firstName, lastName, email, userId, guardian, ...studentFields } = req.body;
            
            // Verificar se CPF já existe (se fornecido e diferente do atual)
            if (studentFields.cpf && studentFields.cpf.trim() !== '') {
                const existingStudent = await storage.getStudentByCpf(studentFields.cpf);
                if (existingStudent && existingStudent.id !== req.params.id) {
                    return res.status(400).json({ 
                        message: "Já existe um aluno cadastrado com este CPF" 
                    });
                }
            }
            
            // Atualizar usuário se dados fornecidos
            if (userId && (firstName || lastName || email)) {
                await storage.updateUser(userId, {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(email && { email }),
                });
            }
            // Tratar atualizações de guardian se fornecido
            if (guardian) {
                const { financialResponsible, ...guardianFields } = guardian;
                // Se estudante já tem guardian, atualizar, senão criar novo
                const currentStudent = await storage.getStudent(req.params.id);
                if (currentStudent?.guardianId) {
                    await storage.updateGuardian(currentStudent.guardianId, guardianFields);
                    // Tratar responsável financeiro
                    if (financialResponsible) {
                        const guardianWithFinancial = await storage.getGuardianWithFinancial(currentStudent.guardianId);
                        if (guardianWithFinancial?.financialResponsible) {
                            await storage.updateFinancialResponsible(guardianWithFinancial.financialResponsible.id, financialResponsible);
                        }
                        else {
                            const financialData = insertFinancialResponsibleSchema.parse({
                                ...financialResponsible,
                                guardianId: currentStudent.guardianId,
                            });
                            await storage.createFinancialResponsible(financialData);
                        }
                    }
                }
                else {
                    // Criar novo guardian
                    const guardianData = insertGuardianSchema.parse(guardianFields);
                    const createdGuardian = await storage.createGuardian(guardianData);
                    studentFields.guardianId = createdGuardian.id;
                    // Criar responsável financeiro se fornecido
                    if (financialResponsible) {
                        const financialData = insertFinancialResponsibleSchema.parse({
                            ...financialResponsible,
                            guardianId: createdGuardian.id,
                        });
                        await storage.createFinancialResponsible(financialData);
                    }
                }
            }
            // Atualizar student
            const studentData = insertStudentSchema.partial().parse(studentFields);
            const student = await storage.updateStudent(req.params.id, studentData);
            res.json(student);
        }
        catch (error) {
            console.error("Error updating student:", error);
            // Tratamento específico para erro de email duplicado
            if (error.message && error.message.includes('users_email_unique')) {
                return res.status(400).json({
                    message: "Este e-mail já está cadastrado no sistema. Por favor, utilize um e-mail diferente."
                });
            }
            // Outros erros de validação do Zod
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao atualizar estudante" });
        }
    });
    app.delete("/api/students/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            await storage.deleteStudent(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting student:", error);
            res.status(500).json({ message: "Erro ao excluir estudante" });
        }
    });
    // ============================================================================
    // STUDENT AREA - COURSE ENROLLMENTS (Netflix-style shelves)
    // ============================================================================
    // Get current student's course enrollments
    app.get('/api/student/courses', auth.isAuthenticated, async (req, res) => {
        try {
            const enrollments = await storage.getStudentCourseEnrollmentsForUser(req.user.id);
            res.json(enrollments);
        }
        catch (error) {
            console.error('Error fetching student enrollments:', error);
            res.status(500).json({ message: 'Erro ao buscar matrículas do estudante' });
        }
    });
    // Get course details with basic books for shelves
    app.get('/api/student/courses/:id', auth.isAuthenticated, async (req, res) => {
        try {
            const course = await storage.getCourseWithBooksBasic(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Curso não encontrado' });
            }
            res.json({ course });
        }
        catch (error) {
            console.error('Error fetching course details for student:', error);
            res.status(500).json({ message: 'Erro ao buscar detalhes do curso' });
        }
    });
    // ============================================================================
    // COURSE ROUTES
    // ============================================================================
    app.get("/api/courses", auth.isAuthenticated, async (req, res) => {
        try {
            const courses = await storage.getCourses();
            res.json(courses);
        }
        catch (error) {
            console.error("Error fetching courses:", error);
            res.status(500).json({ message: "Failed to fetch courses" });
        }
    });
    app.get("/api/courses/:id", auth.isAuthenticated, async (req, res) => {
        try {
            const course = await storage.getCourse(req.params.id);
            if (!course) {
                return res.status(404).json({ message: "Curso não encontrado" });
            }
            res.json(course);
        }
        catch (error) {
            console.error("Error fetching course:", error);
            res.status(500).json({ message: "Erro ao buscar curso" });
        }
    });
    app.post("/api/courses", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const courseData = insertCourseSchema.parse(req.body);
            const course = await storage.createCourse(courseData);
            res.status(201).json(course);
        }
        catch (error) {
            console.error("Error creating course:", error);
            // Tratamento específico para erros de validação
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao criar curso" });
        }
    });
    app.put("/api/courses/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const courseData = insertCourseSchema.partial().parse(req.body);
            const course = await storage.updateCourse(req.params.id, courseData);
            res.json(course);
        }
        catch (error) {
            console.error("Error updating course:", error);
            // Tratamento específico para erros de validação
            if (error.issues) {
                const fieldErrors = error.issues.map((issue) => {
                    const field = issue.path.join('.');
                    return `${field}: ${issue.message}`;
                }).join(', ');
                return res.status(400).json({
                    message: `Dados inválidos: ${fieldErrors}`
                });
            }
            res.status(400).json({ message: error.message || "Erro ao atualizar curso" });
        }
    });
    app.delete("/api/courses/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            await storage.deleteCourse(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting course:", error);
            res.status(500).json({ message: "Failed to delete course" });
        }
    });
    // ============================================================================
    // BOOK ROUTES
    // ============================================================================
    app.get("/api/books", auth.isAuthenticated, async (req, res) => {
        try {
            const books = await storage.getBooks();
            res.json(books);
        }
        catch (error) {
            console.error("Error fetching books:", error);
            res.status(500).json({ message: "Failed to fetch books" });
        }
    });
    app.get("/api/books/:id", auth.isAuthenticated, async (req, res) => {
        try {
            const book = await storage.getBook(req.params.id);
            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }
            res.json(book);
        }
        catch (error) {
            console.error("Error fetching book:", error);
            res.status(500).json({ message: "Failed to fetch book" });
        }
    });
    app.post("/api/books", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const bookData = insertBookSchema.parse(req.body);
            const book = await storage.createBook(bookData);
            res.status(201).json(book);
        }
        catch (error) {
            console.error("Error creating book:", error);
            res.status(400).json({ message: "Invalid book data" });
        }
    });
    app.put("/api/books/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const bookData = insertBookSchema.partial().parse(req.body);
            const book = await storage.updateBook(req.params.id, bookData);
            res.json(book);
        }
        catch (error) {
            console.error("Error updating book:", error);
            res.status(400).json({ message: "Invalid book data" });
        }
    });
    app.delete("/api/books/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            await storage.deleteBook(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting book:", error);
            res.status(500).json({ message: "Failed to delete book" });
        }
    });
    // PDF upload route for books
    app.post("/api/books/:id/upload", auth.requireAdminOrSecretary, bookUploads.single('pdf'), async (req, res) => {
        try {
            const bookId = req.params.id;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No PDF file provided" });
            }
            // Verificar se book existe
            const book = await storage.getBook(bookId);
            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }
            // Atualizar book com nova URL do PDF
            const pdfUrl = `/uploads/books/${file.filename}`;
            const updatedBook = await storage.updateBook(bookId, { pdfUrl });
            res.json({
                message: "PDF uploaded successfully",
                book: updatedBook,
                fileInfo: {
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    url: pdfUrl
                }
            });
        }
        catch (error) {
            console.error("Error uploading PDF:", error);
            if (error.message === 'Only PDF files are allowed!') {
                return res.status(400).json({ message: "Only PDF files are allowed" });
            }
            res.status(500).json({ message: "Failed to upload PDF file" });
        }
    });
    // Audio upload route for books
    app.post("/api/books/:id/upload-audio", auth.requireAdminOrSecretary, audioUploads.array('audio', 10), async (req, res) => {
        try {
            const bookId = req.params.id;
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ message: "No audio files provided" });
            }
            // Verificar se book existe
            const book = await storage.getBook(bookId);
            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }
            // Criar array de URLs dos áudios
            const audioUrls = files.map(file => `/uploads/books/audio/${file.filename}`);
            // Adicionar às URLs existentes (se houver)
            const existingAudioUrls = book.audioUrls || [];
            const updatedAudioUrls = [...existingAudioUrls, ...audioUrls];
            // Atualizar book com novas URLs de áudio
            const updatedBook = await storage.updateBook(bookId, { audioUrls: updatedAudioUrls });
            res.json({
                message: "Audio files uploaded successfully",
                book: updatedBook,
                filesInfo: files.map(file => ({
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                }))
            });
        }
        catch (error) {
            console.error("Error uploading audio files:", error);
            if (error.message === 'Only audio files are allowed!') {
                return res.status(400).json({ message: "Only audio files are allowed" });
            }
            res.status(500).json({ message: "Failed to upload audio files" });
        }
    });
    // Video upload route for books
    app.post("/api/books/:id/upload-video", auth.requireAdminOrSecretary, videoUploads.array('video', 10), async (req, res) => {
        try {
            const bookId = req.params.id;
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ message: "No video files provided" });
            }
            // Verificar se book existe
            const book = await storage.getBook(bookId);
            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }
            // Criar array de URLs dos vídeos
            const videoUrls = files.map(file => `/uploads/books/video/${file.filename}`);
            // Adicionar às URLs existentes (se houver)
            const existingVideoUrls = book.videoUrls || [];
            const updatedVideoUrls = [...existingVideoUrls, ...videoUrls];
            // Atualizar book com novas URLs de vídeo
            const updatedBook = await storage.updateBook(bookId, { videoUrls: updatedVideoUrls });
            res.json({
                message: "Video files uploaded successfully",
                book: updatedBook,
                filesInfo: files.map(file => ({
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                }))
            });
        }
        catch (error) {
            console.error("Error uploading video files:", error);
            if (error.message === 'Only video files are allowed!') {
                return res.status(400).json({ message: "Only video files are allowed" });
            }
            res.status(500).json({ message: "Failed to upload video files" });
        }
    });
    // ============================================================================
    // CLASS ROUTES
    // ============================================================================
    app.get("/api/classes", auth.isAuthenticated, async (req, res) => {
        try {
            const classes = await storage.getClasses();
            res.json(classes);
        }
        catch (error) {
            console.error("Error fetching classes:", error);
            res.status(500).json({ message: "Failed to fetch classes" });
        }
    });
    app.get("/api/classes/:id", auth.isAuthenticated, async (req, res) => {
        try {
            const classItem = await storage.getClass(req.params.id);
            if (!classItem) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.json(classItem);
        }
        catch (error) {
            console.error("Error fetching class:", error);
            res.status(500).json({ message: "Failed to fetch class" });
        }
    });
    app.post("/api/classes", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const classData = insertClassSchema.parse(req.body);
            const classItem = await storage.createClass(classData);
            res.status(201).json(classItem);
        }
        catch (error) {
            console.error("Error creating class:", error);
            res.status(400).json({ message: "Invalid class data" });
        }
    });
    app.put("/api/classes/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const classData = insertClassSchema.partial().parse(req.body);
            const classItem = await storage.updateClass(req.params.id, classData);
            res.json(classItem);
        }
        catch (error) {
            console.error("Error updating class:", error);
            res.status(400).json({ message: "Invalid class data" });
        }
    });
    app.delete("/api/classes/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            await storage.deleteClass(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting class:", error);
            res.status(500).json({ message: "Failed to delete class" });
        }
    });
    // ============================================================================
    // TEACHER SCHEDULE ROUTES
    // ============================================================================
    app.get("/api/teachers", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const teachers = await storage.getTeachers();
            res.json(teachers);
        }
        catch (error) {
            console.error("Error fetching teachers:", error);
            res.status(500).json({ message: "Erro ao buscar professores" });
        }
    });
    app.get("/api/teachers/:id/schedule", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const schedule = await storage.getTeacherSchedule(req.params.id);
            res.json(schedule);
        }
        catch (error) {
            console.error("Error fetching teacher schedule:", error);
            res.status(500).json({ message: "Erro ao buscar horários do professor" });
        }
    });
    // ============================================================================
    // LESSON ROUTES
    // ============================================================================
    app.get("/api/lessons", auth.isAuthenticated, async (req, res) => {
        try {
            const lessons = await storage.getLessons();
            res.json(lessons);
        }
        catch (error) {
            console.error("Error fetching lessons:", error);
            res.status(500).json({ message: "Failed to fetch lessons" });
        }
    });
    app.get("/api/lessons/:id", auth.isAuthenticated, async (req, res) => {
        try {
            const lesson = await storage.getLesson(req.params.id);
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }
            res.json(lesson);
        }
        catch (error) {
            console.error("Error fetching lesson:", error);
            res.status(500).json({ message: "Failed to fetch lesson" });
        }
    });
    app.post("/api/lessons", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const lessonData = insertLessonSchema.parse(req.body);
            const lesson = await storage.createLesson(lessonData);
            res.status(201).json(lesson);
        }
        catch (error) {
            console.error("Error creating lesson:", error);
            res.status(400).json({ message: "Invalid lesson data" });
        }
    });
    app.put("/api/lessons/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            const lessonData = insertLessonSchema.partial().parse(req.body);
            const lesson = await storage.updateLesson(req.params.id, lessonData);
            res.json(lesson);
        }
        catch (error) {
            console.error("Error updating lesson:", error);
            res.status(400).json({ message: "Invalid lesson data" });
        }
    });
    app.delete("/api/lessons/:id", auth.requireAdminOrSecretary, async (req, res) => {
        try {
            await storage.deleteLesson(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting lesson:", error);
            res.status(500).json({ message: "Failed to delete lesson" });
        }
    });
    // ============================================================================
    // PERMISSION & ROLE ROUTES
    // ============================================================================
    app.get("/api/permissions", auth.isAuthenticated, async (req, res) => {
        try {
            const permissions = await storage.getPermissions();
            res.json(permissions);
        }
        catch (error) {
            console.error("Error fetching permissions:", error);
            res.status(500).json({ message: "Failed to fetch permissions" });
        }
    });
    app.get("/api/permissions/by-category", auth.isAuthenticated, async (req, res) => {
        try {
            const permissions = await storage.getPermissionsByCategory();
            res.json(permissions);
        }
        catch (error) {
            console.error("Error fetching permissions by category:", error);
            res.status(500).json({ message: "Failed to fetch permissions" });
        }
    });
    app.get("/api/roles", auth.isAuthenticated, async (req, res) => {
        try {
            const roles = await storage.getRoles();
            res.json(roles);
        }
        catch (error) {
            console.error("Error fetching roles:", error);
            res.status(500).json({ message: "Failed to fetch roles" });
        }
    });
    // Criar novo papel (role) dinâmico
    const upsertRoleSchema = z.object({
        name: z.string().min(2),
        displayName: z.string().min(2),
        description: z.string().optional(),
        isSystemRole: z.boolean().optional(),
        isActive: z.boolean().optional(),
    });
    app.post("/api/roles", auth.requireAdmin, async (req, res) => {
        try {
            const data = upsertRoleSchema.parse(req.body);
            const role = await storage.createRole({
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                isSystemRole: data.isSystemRole ?? false,
                isActive: data.isActive ?? true,
            });
            res.status(201).json(role);
        }
        catch (error) {
            console.error("Error creating role:", error);
            res.status(400).json({ message: "Invalid role data" });
        }
    });
    // Atualizar papel (role)
    app.put("/api/roles/:id", auth.requireAdmin, async (req, res) => {
        try {
            const data = upsertRoleSchema.partial().parse(req.body);
            const role = await storage.updateRole(req.params.id, data);
            res.json(role);
        }
        catch (error) {
            console.error("Error updating role:", error);
            res.status(400).json({ message: "Invalid role data" });
        }
    });
    // Desativar papel (role) - soft delete
    app.delete("/api/roles/:id", auth.requireAdmin, async (req, res) => {
        try {
            await storage.deactivateRole(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting role:", error);
            res.status(500).json({ message: "Failed to delete role" });
        }
    });
    // User permissions (overrides)
    app.get("/api/users/:id/permissions", auth.requirePermission('permissions:manage'), async (req, res) => {
        try {
            const overrides = await storage.getUserPermissionOverrides(req.params.id);
            res.json(overrides);
        }
        catch (error) {
            console.error("Error fetching user permissions:", error);
            res.status(500).json({ message: "Failed to fetch user permissions" });
        }
    });
    const updateUserPermissionsSchema = z.object({
        overrides: z.array(z.object({
            permissionId: z.string(),
            isGranted: z.boolean(),
        }))
    });
    app.put("/api/users/:id/permissions", auth.requirePermission('permissions:manage'), async (req, res) => {
        try {
            const { overrides } = updateUserPermissionsSchema.parse(req.body);
            await storage.updateUserPermissions(req.params.id, overrides);
            res.json({ success: true });
        }
        catch (error) {
            console.error("Error updating user permissions:", error);
            res.status(400).json({ message: "Invalid input" });
        }
    });
    // Get permissions for a specific role
    app.get("/api/roles/:id/permissions", auth.isAuthenticated, async (req, res) => {
        try {
            const rolePermissions = await storage.getRolePermissions(req.params.id);
            res.json(rolePermissions);
        }
        catch (error) {
            console.error("Error fetching role permissions:", error);
            res.status(500).json({ message: "Failed to fetch role permissions" });
        }
    });
    app.put("/api/roles/:id/permissions", auth.requireAdmin, async (req, res) => {
        try {
            const { permissionIds } = updateRolePermissionsSchema.parse(req.body);
            await storage.updateRolePermissions(req.params.id, permissionIds);
            res.json({ message: "Permissions updated successfully" });
        }
        catch (error) {
            console.error("Error updating role permissions:", error);
            res.status(400).json({ message: "Invalid permission data" });
        }
    });
    // ============================================================================
    // PAGES ROUTES
    // ============================================================================
    // Get all pages
    app.get("/api/pages", auth.isAuthenticated, async (req, res) => {
        try {
            const pages = await storage.getPages();
            res.json(pages);
        }
        catch (error) {
            console.error("Error fetching pages:", error);
            res.status(500).json({ message: "Failed to fetch pages" });
        }
    });
    // Create new page
    const upsertPageSchema = z.object({
        name: z.string().min(2),
        displayName: z.string().min(2),
        route: z.string().min(1),
        isActive: z.boolean().optional(),
    });
    app.post("/api/pages", auth.requireAdmin, async (req, res) => {
        try {
            const data = upsertPageSchema.parse(req.body);
            const page = await storage.createPage({
                name: data.name,
                displayName: data.displayName,
                route: data.route,
                isActive: data.isActive ?? true,
            });
            res.status(201).json(page);
        }
        catch (error) {
            console.error("Error creating page:", error);
            res.status(400).json({ message: "Invalid page data" });
        }
    });
    // Update page
    app.put("/api/pages/:id", auth.requireAdmin, async (req, res) => {
        try {
            const data = upsertPageSchema.partial().parse(req.body);
            const page = await storage.updatePage(req.params.id, data);
            res.json(page);
        }
        catch (error) {
            console.error("Error updating page:", error);
            res.status(400).json({ message: "Invalid page data" });
        }
    });
    // Delete page
    app.delete("/api/pages/:id", auth.requireAdmin, async (req, res) => {
        try {
            await storage.deletePage(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting page:", error);
            res.status(500).json({ message: "Failed to delete page" });
        }
    });
    // ============================================================================
    // ROLE PAGE PERMISSIONS ROUTES
    // ============================================================================
    // Get role page permissions
    app.get("/api/roles/:id/pages", auth.isAuthenticated, async (req, res) => {
        try {
            const rolePagePermissions = await storage.getRolePagePermissions(req.params.id);
            res.json(rolePagePermissions);
        }
        catch (error) {
            console.error("Error fetching role page permissions:", error);
            res.status(500).json({ message: "Failed to fetch role page permissions" });
        }
    });
    // Get allowed pages for a role
    app.get("/api/roles/:id/allowed-pages", auth.isAuthenticated, async (req, res) => {
        try {
            const allowedPages = await storage.getRoleAllowedPages(req.params.id);
            res.json(allowedPages);
        }
        catch (error) {
            console.error("Error fetching allowed pages:", error);
            res.status(500).json({ message: "Failed to fetch allowed pages" });
        }
    });
    // Update role page permissions
    const updateRolePagePermissionsSchema = z.object({
        pagePermissions: z.array(z.object({
            pageId: z.string(),
            canAccess: z.boolean(),
        }))
    });
    app.put("/api/roles/:id/pages", auth.requireAdmin, async (req, res) => {
        try {
            const { pagePermissions } = updateRolePagePermissionsSchema.parse(req.body);
            const roleId = req.params.id;
            // Update each page permission
            for (const permission of pagePermissions) {
                const existing = await storage.getRolePagePermission(roleId, permission.pageId);
                if (existing) {
                    await storage.updateRolePagePermission(roleId, permission.pageId, {
                        canAccess: permission.canAccess
                    });
                }
                else {
                    await storage.createRolePagePermission({
                        roleId,
                        pageId: permission.pageId,
                        canAccess: permission.canAccess
                    });
                }
            }
            res.json({ message: "Page permissions updated successfully" });
        }
        catch (error) {
            console.error("Error updating role page permissions:", error);
            res.status(400).json({ message: "Invalid page permission data" });
        }
    });
    // ============================================================================
    // SUPPORT TICKET ROUTES
    // ============================================================================
    app.get("/api/support/tickets", auth.isAuthenticated, async (req, res) => {
        try {
            const tickets = await storage.getSupportTickets();
            res.json(tickets);
        }
        catch (error) {
            console.error("Error fetching support tickets:", error);
            res.status(500).json({ message: "Failed to fetch support tickets" });
        }
    });
    app.get("/api/support/tickets/:id", auth.isAuthenticated, async (req, res) => {
        try {
            const ticket = await storage.getSupportTicket(req.params.id);
            if (!ticket) {
                return res.status(404).json({ message: "Ticket not found" });
            }
            res.json(ticket);
        }
        catch (error) {
            console.error("Error fetching support ticket:", error);
            res.status(500).json({ message: "Failed to fetch support ticket" });
        }
    });
    app.post("/api/support/tickets", auth.isAuthenticated, async (req, res) => {
        try {
            const ticketData = insertSupportTicketSchema.parse(req.body);
            const ticket = await storage.createSupportTicket({
                ...ticketData,
                userId: req.user.id,
            });
            res.status(201).json(ticket);
        }
        catch (error) {
            console.error("Error creating support ticket:", error);
            res.status(400).json({ message: "Invalid ticket data" });
        }
    });
    app.put("/api/support/tickets/:id", auth.isAuthenticated, async (req, res) => {
        try {
            const ticketData = insertSupportTicketSchema.partial().parse(req.body);
            const ticket = await storage.updateSupportTicket(req.params.id, ticketData);
            res.json(ticket);
        }
        catch (error) {
            console.error("Error updating support ticket:", error);
            res.status(400).json({ message: "Invalid ticket data" });
        }
    });
    app.post("/api/support/tickets/:id/responses", auth.isAuthenticated, async (req, res) => {
        try {
            const responseData = insertSupportTicketResponseSchema.parse(req.body);
            const response = await storage.createSupportTicketResponse({
                ...responseData,
                ticketId: req.params.id,
                userId: req.user.id,
            });
            res.status(201).json(response);
        }
        catch (error) {
            console.error("Error creating support ticket response:", error);
            res.status(400).json({ message: "Invalid response data" });
        }
    });
    // ============================================================================
    // USER SETTINGS ROUTES
    // ============================================================================
    app.get("/api/user/settings", auth.isAuthenticated, async (req, res) => {
        try {
            const settings = await storage.getUserSettings(req.user.id);
            if (!settings) {
                // Criar settings padrão se não existir
                const newSettings = await storage.createUserSettings({ userId: req.user.id });
                return res.json(newSettings);
            }
            res.json(settings);
        }
        catch (error) {
            console.error("Error fetching user settings:", error);
            res.status(500).json({ message: "Failed to fetch user settings" });
        }
    });
    app.put("/api/user/settings", auth.isAuthenticated, async (req, res) => {
        try {
            const settingsData = insertUserSettingsSchema.partial().parse(req.body);
            const settings = await storage.updateUserSettings(req.user.id, settingsData);
            res.json(settings);
        }
        catch (error) {
            console.error("Error updating user settings:", error);
            res.status(400).json({ message: "Invalid settings data" });
        }
    });
    // ============================================================================
    // VITE SETUP
    // ============================================================================
    const server = createServer(app);
    // Setup Vite or static serving
    if (process.env.NODE_ENV === "development") {
        await setupVite(app, server);
    }
    else {
        serveStatic(app);
    }
    return server;
}
