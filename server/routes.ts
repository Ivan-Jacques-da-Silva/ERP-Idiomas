
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertUnitSchema, 
  insertStaffSchema, 
  insertStudentSchema,
  insertCourseSchema,
  insertClassSchema,
  insertLessonSchema,
  insertBookSchema,
  insertUserSettingsSchema,
  insertSupportTicketSchema,
  insertSupportTicketResponseSchema,
} from "@shared/schema";
import { z } from "zod";


const updateUserPermissionsSchema = z.object({
  permissionIds: z.array(z.string())
});

const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string())
});

// Simple demo users for login
const demoUsers = [
  { id: '1', email: 'admin@demo.com', password: 'admin123', firstName: 'Ivan', lastName: 'Silva', role: 'admin' },
  { id: '2', email: 'teacher@demo.com', password: 'teacher123', firstName: 'Ivan', lastName: 'Silva', role: 'teacher' },
  { id: '3', email: 'secretary@demo.com', password: 'secretary123', firstName: 'Ivan', lastName: 'Silva', role: 'secretary' },
  { id: '4', email: 'student@demo.com', password: 'student123', firstName: 'Ivan', lastName: 'Silva', role: 'student' },
];

// Simple middleware to check if user is logged in
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};



// Middleware para permitir apenas admin (novo sistema simplificado)
const requireAdminOnly = (req: any, res: any, next: any) => {
  if (req.session?.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Admin role required" });
};

// Middleware to check if user has admin or secretary role
const requireAdminOrSecretary = (req: any, res: any, next: any) => {
  if (req.session?.user?.role === 'admin' || req.session?.user?.role === 'secretary') {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Admin or Secretary role required" });
};

// Configure multer for file uploads
const bookUploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/books');
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Demo login endpoint
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Store user in session
    (req.session as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    res.json({ user: (req.session as any).user });
  });

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    res.json(req.session.user);
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Units routes
  app.get("/api/units", isAuthenticated, async (req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/units", isAuthenticated, async (req, res) => {
    try {
      const unitData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(unitData);
      res.status(201).json(unit);
    } catch (error) {
      console.error("Error creating unit:", error);
      res.status(400).json({ message: "Invalid unit data" });
    }
  });

  app.put("/api/units/:id", isAuthenticated, async (req, res) => {
    try {
      const unitData = insertUnitSchema.partial().parse(req.body);
      const unit = await storage.updateUnit(req.params.id, unitData);
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(400).json({ message: "Invalid unit data" });
    }
  });

  app.delete("/api/units/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteUnit(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit" });
    }
  });

  // Staff routes
  app.get("/api/staff", isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.getStaffMember(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff member:", error);
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post("/api/staff", isAuthenticated, async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(400).json({ message: "Invalid staff data" });
    }
  });

  app.put("/api/staff/:id", isAuthenticated, async (req, res) => {
    try {
      const staffData = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(req.params.id, staffData);
      res.json(staff);
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(400).json({ message: "Invalid staff data" });
    }
  });

  app.delete("/api/staff/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStaff(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Students routes
  app.get("/api/students", isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/students", isAuthenticated, async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  app.put("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const studentData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, studentData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  app.delete("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Courses routes
  app.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  app.put("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(req.params.id, courseData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Books routes
  app.get("/api/books", isAuthenticated, async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/books", isAuthenticated, async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  app.put("/api/books/:id", isAuthenticated, async (req, res) => {
    try {
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(req.params.id, bookData);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  app.delete("/api/books/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteBook(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // PDF upload route for books
  app.post("/api/books/:id/upload", isAuthenticated, bookUploads.single('pdf'), async (req, res) => {
    try {
      const bookId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No PDF file provided" });
      }

      // Check if book exists
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Update book with new PDF URL
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

  // Classes routes
  app.get("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/classes/teacher/:teacherId", isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getClassesByTeacher(req.params.teacherId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      res.status(500).json({ message: "Failed to fetch teacher classes" });
    }
  });

  app.post("/api/classes", isAuthenticated, requireAdminOrSecretary, async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.put("/api/classes/:id", isAuthenticated, requireAdminOrSecretary, async (req, res) => {
    try {
      const classData = insertClassSchema.partial().parse(req.body);
      const updatedClass = await storage.updateClass(req.params.id, classData);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.delete("/api/classes/:id", isAuthenticated, requireAdminOrSecretary, async (req, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Lessons/Schedule routes
  app.get("/api/lessons", isAuthenticated, async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/today", isAuthenticated, async (req, res) => {
    try {
      const lessons = await storage.getTodaysLessons();
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching today's lessons:", error);
      res.status(500).json({ message: "Failed to fetch today's lessons" });
    }
  });

  app.get("/api/lessons/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/lessons/class/:classId", isAuthenticated, async (req, res) => {
    try {
      const lessons = await storage.getLessonsByClass(req.params.classId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching class lessons:", error);
      res.status(500).json({ message: "Failed to fetch class lessons" });
    }
  });

  app.get("/api/lessons/teacher/:teacherId", isAuthenticated, async (req, res) => {
    try {
      const lessons = await storage.getLessonsByTeacher(req.params.teacherId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching teacher lessons:", error);
      res.status(500).json({ message: "Failed to fetch teacher lessons" });
    }
  });

  app.post("/api/lessons", isAuthenticated, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(400).json({ message: "Invalid lesson data" });
    }
  });

  app.put("/api/lessons/:id", isAuthenticated, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.partial().parse(req.body);
      const lesson = await storage.updateLesson(req.params.id, lessonData);
      res.json(lesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      res.status(400).json({ message: "Invalid lesson data" });
    }
  });

  app.delete("/api/lessons/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLesson(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Check lesson conflicts endpoint
  app.post("/api/lessons/check-conflicts", isAuthenticated, async (req, res) => {
    try {
      const { teacherId, date, startTime, endTime, excludeLessonId } = req.body;
      
      if (!teacherId || !date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing required fields: teacherId, date, startTime, endTime" });
      }

      const conflictCheck = await storage.checkLessonConflicts(
        teacherId,
        new Date(date),
        startTime,
        endTime,
        excludeLessonId
      );

      res.json(conflictCheck);
    } catch (error) {
      console.error("Error checking lesson conflicts:", error);
      res.status(500).json({ message: "Failed to check lesson conflicts" });
    }
  });

  // Schedule/Agenda routes para administração
  app.get("/api/schedule/admin", isAuthenticated, requireAdminOrSecretary, async (req, res) => {
    try {
      // Busca todas as turmas com horários para agenda administrativa
      const classes = await storage.getClasses();
      
      // Formata os dados para agenda (pode ter múltiplas turmas no mesmo horário)
      const scheduleData = classes.map(cls => ({
        id: cls.id,
        title: cls.name,
        teacher: `${cls.teacher.firstName} ${cls.teacher.lastName}`,
        teacherId: cls.teacher.id,
        book: cls.book.name,
        bookColor: cls.book.color,
        dayOfWeek: cls.dayOfWeek,
        startTime: cls.startTime,
        endTime: cls.endTime,
        room: cls.room,
        unit: cls.unit.name,
        currentDay: cls.currentDay,
        totalDays: cls.book.totalDays
      }));
      
      res.json(scheduleData);
    } catch (error) {
      console.error("Error fetching admin schedule:", error);
      res.status(500).json({ message: "Failed to fetch admin schedule" });
    }
  });

  app.get("/api/classes/teacher/:teacherId", isAuthenticated, async (req, res) => {
    try {
      // Busca as turmas do professor específico
      const classes = await storage.getClassesByTeacher(req.params.teacherId);
      
      const classesData = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        book: {
          id: cls.book.id,
          name: cls.book.name,
          color: cls.book.color,
          totalDays: cls.book.totalDays
        },
        schedule: cls.schedule,
        dayOfWeek: cls.dayOfWeek,
        startTime: cls.startTime,
        endTime: cls.endTime,
        room: cls.room,
        maxStudents: cls.maxStudents,
        currentStudents: cls.currentStudents,
        currentDay: cls.currentDay,
        unit: cls.unit
      }));
      
      res.json(classesData);
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      res.status(500).json({ message: "Failed to fetch teacher classes" });
    }
  });

  app.get("/api/schedule/teacher/:teacherId", isAuthenticated, async (req, res) => {
    try {
      // Busca as turmas do professor específico (sem conflito de horário)
      const classes = await storage.getClassesByTeacher(req.params.teacherId);
      
      const scheduleData = classes.map(cls => ({
        id: cls.id,
        title: cls.name,
        book: cls.book.name,
        bookColor: cls.book.color,
        dayOfWeek: cls.dayOfWeek,
        startTime: cls.startTime,
        endTime: cls.endTime,
        room: cls.room,
        unit: cls.unit.name,
        currentDay: cls.currentDay,
        totalDays: cls.book.totalDays,
        studentsCount: cls.currentStudents,
        maxStudents: cls.maxStudents
      }));
      
      res.json(scheduleData);
    } catch (error) {
      console.error("Error fetching teacher schedule:", error);
      res.status(500).json({ message: "Failed to fetch teacher schedule" });
    }
  });


  // Permissions routes - read-only catalog for UI
  app.get("/api/permissions", isAuthenticated, requireAdminOnly, async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  // User permissions route - read-only effective permissions based on role
  app.get("/api/users/:id/permissions", isAuthenticated, async (req: any, res) => {
    try {
      // Users can access their own permissions, admin can access anyone's
      const currentUserId = req.session.user.id;
      const requestedUserId = req.params.id;
      const userRole = req.session.user.role;
      
      if (currentUserId !== requestedUserId && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden - Can only access your own permissions" });
      }
      
      const userWithPermissions = await storage.getUserWithPermissions(req.params.id);
      if (!userWithPermissions) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(userWithPermissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  // Roles routes - manage system roles
  app.get("/api/roles", isAuthenticated, requireAdminOnly, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", isAuthenticated, requireAdminOnly, async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.get("/api/roles/:id/permissions", isAuthenticated, requireAdminOnly, async (req, res) => {
    try {
      const roleWithPermissions = await storage.getRoleWithPermissions(req.params.id);
      if (!roleWithPermissions) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(roleWithPermissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.put("/api/roles/:id/permissions", isAuthenticated, requireAdminOnly, async (req, res) => {
    try {
      const { permissionIds } = updateRolePermissionsSchema.parse(req.body);
      
      // Validate that all permission IDs exist
      if (permissionIds.length > 0) {
        const allPermissions = await storage.getPermissions();
        const validPermissionIds = allPermissions.map(p => p.id);
        const invalidIds = permissionIds.filter(id => !validPermissionIds.includes(id));
        
        if (invalidIds.length > 0) {
          return res.status(400).json({ 
            message: "Invalid permission IDs provided", 
            invalidIds 
          });
        }
      }
      
      await storage.updateRolePermissions(req.params.id, permissionIds);
      
      // Return updated role permissions
      const updatedRolePermissions = await storage.getRoleWithPermissions(req.params.id);
      res.json(updatedRolePermissions);
    } catch (error: any) {
      console.error("Error updating role permissions:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.status(500).json({ message: "Failed to update role permissions" });
    }
  });

  // User Settings routes
  app.get("/api/users/:id/settings", isAuthenticated, async (req: any, res) => {
    try {
      // Users can access their own settings, admin can access anyone's
      const currentUserId = req.session.user.id;
      const requestedUserId = req.params.id;
      const userRole = req.session.user.role;
      
      if (currentUserId !== requestedUserId && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden - Can only access your own settings" });
      }
      
      const settings = await storage.getUserSettings(requestedUserId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.put("/api/users/:id/settings", isAuthenticated, async (req: any, res) => {
    try {
      // Users can update their own settings, admin can update anyone's
      const currentUserId = req.session.user.id;
      const requestedUserId = req.params.id;
      const userRole = req.session.user.role;
      
      if (currentUserId !== requestedUserId && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden - Can only update your own settings" });
      }
      
      const settingsData = insertUserSettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateUserSettings(requestedUserId, settingsData);
      res.json(updatedSettings);
    } catch (error: any) {
      console.error("Error updating user settings:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  // Support Tickets routes
  app.get("/api/support/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const userRole = req.session.user.role;
      
      // Admin can see all tickets, others can see only their own
      let tickets;
      if (userRole === 'admin') {
        tickets = await storage.getSupportTickets();
      } else {
        tickets = await storage.getSupportTicketsByUser(currentUserId);
      }
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get("/api/support/tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const userRole = req.session.user.role;
      
      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Users can only access their own tickets, admin can access all
      if (ticket.userId !== currentUserId && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden - Can only access your own tickets" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.post("/api/support/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const ticketData = insertSupportTicketSchema.parse(req.body);
      
      const newTicket = await storage.createSupportTicket({
        ...ticketData,
        userId: currentUserId,
      });
      
      // TODO: Send email notification to support team
      // This would be implemented server-side using environment variables:
      // if (process.env.SUPPORT_EMAIL) {
      //   await sendEmail({
      //     to: process.env.SUPPORT_EMAIL,
      //     subject: `Novo ticket: ${newTicket.title}`,
      //     body: ticketData.description,
      //     priority: ticketData.priority,
      //   });
      // }
      
      res.status(201).json(newTicket);
    } catch (error: any) {
      console.error("Error creating support ticket:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.put("/api/support/tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const userRole = req.session.user.role;
      
      // Only admin can update ticket status and assignment
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden - Only admin can update tickets" });
      }
      
      const ticketData = insertSupportTicketSchema.partial().parse(req.body);
      const updatedTicket = await storage.updateSupportTicket(req.params.id, ticketData);
      res.json(updatedTicket);
    } catch (error: any) {
      console.error("Error updating support ticket:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  app.post("/api/support/tickets/:ticketId/responses", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const userRole = req.session.user.role;
      const ticketId = req.params.ticketId;
      
      // Check if ticket exists and user has access
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      if (ticket.userId !== currentUserId && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden - Can only respond to your own tickets" });
      }
      
      const responseData = insertSupportTicketResponseSchema.parse(req.body);
      const newResponse = await storage.createSupportTicketResponse({
        ...responseData,
        ticketId,
        userId: currentUserId,
        isFromSupport: userRole === 'admin',
      });
      
      res.status(201).json(newResponse);
    } catch (error: any) {
      console.error("Error creating support ticket response:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
