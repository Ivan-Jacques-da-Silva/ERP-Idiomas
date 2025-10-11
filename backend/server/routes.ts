import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage.js";
import { auth } from "./auth.js";
import { setupVite, serveStatic } from "./vite.js";
import { 
  insertUnitSchema, 
  insertStaffSchema, 
  insertStudentSchema,
  insertCourseSchema,
  insertClassSchema,
  insertLessonSchema,
  insertBookSchema,
  insertPermissionCategorySchema,
  insertPermissionSchema,
  insertRoleSchema,
  insertUserSettingsSchema,
  insertSupportTicketSchema,
  insertSupportTicketResponseSchema,
  insertGuardianSchema,
  insertFinancialResponsibleSchema,
  insertFranchiseUnitSchema,
} from "../shared/schema.js";
import { z } from "zod";

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
    } else {
      cb(new Error('Only PDF files are allowed!') as any, false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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
    } else {
      cb(new Error('Only PDF files are allowed!') as any, false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  // Get current user
  app.get('/api/auth/user', auth.isAuthenticated, async (req: any, res) => {
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
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  // Get effective permissions for current user
  app.get('/api/auth/effective-permissions', auth.isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const role = await storage.getRoles();
      const userRole = role.find(r => r.id === user.roleId);
      
      if (!userRole) {
        return res.json({ permissions: [] });
      }

      const rolePermissions = await storage.getRolePermissionsByName(userRole.name);
      const permissions = rolePermissions.map(rp => rp.permission);
      
      res.json({ permissions: permissions || [] });
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // ============================================================================
  // UNIT ROUTES
  // ============================================================================

  app.get("/api/units", auth.isAuthenticated, async (req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:id", auth.isAuthenticated, async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error fetching unit:", error);
      res.status(500).json({ message: "Failed to fetch unit" });
    }
  });

  app.post("/api/units", auth.requireAdmin, async (req, res) => {
    try {
      const unitData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(unitData);
      res.status(201).json(unit);
    } catch (error: any) {
      console.error("Error creating unit:", error);
      res.status(400).json({ 
        message: "Invalid unit data", 
        error: error.message,
        details: error.errors || error.issues || []
      });
    }
  });

  app.put("/api/units/:id", auth.requireAdmin, async (req, res) => {
    try {
      const unitData = insertUnitSchema.partial().parse(req.body);
      const unit = await storage.updateUnit(req.params.id, unitData);
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(400).json({ message: "Invalid unit data" });
    }
  });

  app.delete("/api/units/:id", auth.requireAdmin, async (req, res) => {
    try {
      await storage.deleteUnit(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit" });
    }
  });

  // ============================================================================
  // STAFF ROUTES
  // ============================================================================

  app.get("/api/staff", auth.isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", auth.isAuthenticated, async (req, res) => {
    try {
      const staffMember = await storage.getStaffMember(req.params.id);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      console.error("Error fetching staff member:", error);
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post("/api/staff", auth.requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, password, role = 'teacher', ...staffFields } = req.body;
      
      // Buscar role
      const userRole = await storage.getRoleByName(role);
      if (!userRole) {
        return res.status(400).json({ message: "Role inválido" });
      }

      // Hash da senha
      const hashedPassword = await auth.hashPassword(password || 'senha123');
      
      // Criar usuário primeiro
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: userRole.id,
        isActive: true,
      });
      
      // Criar staff com userId
      const staffData = insertStaffSchema.parse({
        ...staffFields,
        userId: user.id,
      });
      
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error: any) {
      console.error("Error creating staff member:", error);
      res.status(400).json({ message: error.message || "Invalid staff data" });
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
    } catch (error: any) {
      console.error("Error updating staff member:", error);
      res.status(400).json({ message: error.message || "Invalid staff data" });
    }
  });

  app.delete("/api/staff/:id", auth.requireAdmin, async (req, res) => {
    try {
      await storage.deleteStaff(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // ============================================================================
  // STUDENT ROUTES
  // ============================================================================

  app.get("/api/students", auth.isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", auth.isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const { firstName, lastName, email, password, guardian, ...studentFields } = req.body;
      
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
    } catch (error: any) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: error.message || "Invalid student data" });
    }
  });

  app.put("/api/students/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const { firstName, lastName, email, userId, guardian, ...studentFields } = req.body;
      
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
            } else {
              const financialData = insertFinancialResponsibleSchema.parse({
                ...financialResponsible,
                guardianId: currentStudent.guardianId,
              });
              await storage.createFinancialResponsible(financialData);
            }
          }
        } else {
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
    } catch (error: any) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: error.message || "Invalid student data" });
    }
  });

  app.delete("/api/students/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // ============================================================================
  // COURSE ROUTES
  // ============================================================================

  app.get("/api/courses", auth.isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", auth.isAuthenticated, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  app.put("/api/courses/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(req.params.id, courseData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  app.delete("/api/courses/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  app.put("/api/books/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(req.params.id, bookData);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  app.delete("/api/books/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      await storage.deleteBook(req.params.id);
      res.status(204).send();
    } catch (error) {
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
    } catch (error: any) {
      console.error("Error uploading PDF:", error);
      if (error.message === 'Only PDF files are allowed!') {
        return res.status(400).json({ message: "Only PDF files are allowed" });
      }
      res.status(500).json({ message: "Failed to upload PDF file" });
    }
  });

  // ============================================================================
  // CLASS ROUTES
  // ============================================================================

  app.get("/api/classes", auth.isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  app.post("/api/classes", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const classItem = await storage.createClass(classData);
      res.status(201).json(classItem);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.put("/api/classes/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const classData = insertClassSchema.partial().parse(req.body);
      const classItem = await storage.updateClass(req.params.id, classData);
      res.json(classItem);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.delete("/api/classes/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // ============================================================================
  // LESSON ROUTES
  // ============================================================================

  app.get("/api/lessons", auth.isAuthenticated, async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  app.post("/api/lessons", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(400).json({ message: "Invalid lesson data" });
    }
  });

  app.put("/api/lessons/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.partial().parse(req.body);
      const lesson = await storage.updateLesson(req.params.id, lessonData);
      res.json(lesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      res.status(400).json({ message: "Invalid lesson data" });
    }
  });

  app.delete("/api/lessons/:id", auth.requireAdminOrSecretary, async (req, res) => {
    try {
      await storage.deleteLesson(req.params.id);
      res.status(204).send();
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get("/api/permissions/by-category", auth.isAuthenticated, async (req, res) => {
    try {
      const permissions = await storage.getPermissionsByCategory();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions by category:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get("/api/roles", auth.isAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.put("/api/roles/:id/permissions", auth.requireAdmin, async (req, res) => {
    try {
      const { permissionIds } = updateRolePermissionsSchema.parse(req.body);
      await storage.updateRolePermissions(req.params.id, permissionIds);
      res.json({ message: "Permissions updated successfully" });
    } catch (error) {
      console.error("Error updating role permissions:", error);
      res.status(400).json({ message: "Invalid permission data" });
    }
  });

  // ============================================================================
  // SUPPORT TICKET ROUTES
  // ============================================================================

  app.get("/api/support/tickets", auth.isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.post("/api/support/tickets", auth.isAuthenticated, async (req: any, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket({
        ...ticketData,
        userId: req.user.id,
      });
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.put("/api/support/tickets/:id", auth.isAuthenticated, async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateSupportTicket(req.params.id, ticketData);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.post("/api/support/tickets/:id/responses", auth.isAuthenticated, async (req: any, res) => {
    try {
      const responseData = insertSupportTicketResponseSchema.parse(req.body);
      const response = await storage.createSupportTicketResponse({
        ...responseData,
        ticketId: req.params.id,
        userId: req.user.id,
      });
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating support ticket response:", error);
      res.status(400).json({ message: "Invalid response data" });
    }
  });

  // ============================================================================
  // USER SETTINGS ROUTES
  // ============================================================================

  app.get("/api/user/settings", auth.isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      if (!settings) {
        // Criar settings padrão se não existir
        const newSettings = await storage.createUserSettings({ userId: req.user.id });
        return res.json(newSettings);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.put("/api/user/settings", auth.isAuthenticated, async (req: any, res) => {
    try {
      const settingsData = insertUserSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateUserSettings(req.user.id, settingsData);
      res.json(settings);
    } catch (error) {
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
  } else {
    serveStatic(app);
  }

  return server;
}
