import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUnitSchema, 
  insertStaffSchema, 
  insertStudentSchema,
  insertCourseSchema,
  insertClassSchema,
  insertLessonSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
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

  const httpServer = createServer(app);
  return httpServer;
}
