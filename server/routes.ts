
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { 
  insertUnitSchema, 
  insertStaffSchema, 
  insertStudentSchema,
  insertCourseSchema,
  insertClassSchema,
  insertLessonSchema,
  insertBookSchema
} from "@shared/schema";

// Simple demo users for login
const demoUsers = [
  { id: '1', email: 'admin@demo.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
  { id: '2', email: 'teacher@demo.com', password: 'teacher123', firstName: 'João', lastName: 'Silva', role: 'teacher' },
  { id: '3', email: 'secretary@demo.com', password: 'secretary123', firstName: 'Maria', lastName: 'Santos', role: 'secretary' },
  { id: '4', email: 'student@demo.com', password: 'student123', firstName: 'Pedro', lastName: 'Costa', role: 'student' },
];

// Simple middleware to check if user is logged in
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
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
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', require('express').static('uploads'));

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

  app.post("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.put("/api/classes/:id", isAuthenticated, async (req, res) => {
    try {
      const classData = insertClassSchema.partial().parse(req.body);
      const updatedClass = await storage.updateClass(req.params.id, classData);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.delete("/api/classes/:id", isAuthenticated, async (req, res) => {
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

  // Schedule/Agenda routes para administração
  app.get("/api/schedule/admin", isAuthenticated, async (req, res) => {
    try {
      // Busca todas as turmas com horários para agenda administrativa
      const classes = await storage.getClasses();
      
      // Formata os dados para agenda (pode ter múltiplas turmas no mesmo horário)
      const scheduleData = classes.map(cls => ({
        id: cls.id,
        title: cls.name,
        teacher: `${cls.teacher.firstName} ${cls.teacher.lastName}`,
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

  const httpServer = createServer(app);
  return httpServer;
}
