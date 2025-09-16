import {
  users,
  units,
  staff,
  students,
  courses,
  classes,
  lessons,
  classEnrollments,
  type User,
  type UpsertUser,
  type Unit,
  type InsertUnit,
  type Staff,
  type InsertStaff,
  type Student,
  type InsertStudent,
  type Course,
  type InsertCourse,
  type Class,
  type InsertClass,
  type Lesson,
  type InsertLesson,
  type StaffWithUser,
  type StudentWithUser,
  type ClassWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Units
  getUnits(): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit>;
  deleteUnit(id: string): Promise<void>;
  
  // Staff
  getStaff(): Promise<StaffWithUser[]>;
  getStaffMember(id: string): Promise<StaffWithUser | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;
  
  // Students
  getStudents(): Promise<StudentWithUser[]>;
  getStudent(id: string): Promise<StudentWithUser | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Classes
  getClasses(): Promise<ClassWithDetails[]>;
  getClass(id: string): Promise<ClassWithDetails | undefined>;
  getClassesByTeacher(teacherId: string): Promise<ClassWithDetails[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;
  
  // Lessons/Schedule
  getLessons(): Promise<Lesson[]>;
  getLessonsByClass(classId: string): Promise<Lesson[]>;
  getLessonsByTeacher(teacherId: string): Promise<Lesson[]>;
  getTodaysLessons(): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Units
  async getUnits(): Promise<Unit[]> {
    return await db.select().from(units).where(eq(units.isActive, true)).orderBy(desc(units.createdAt));
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    const [unit] = await db.select().from(units).where(eq(units.id, id));
    return unit;
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const [newUnit] = await db.insert(units).values(unit).returning();
    return newUnit;
  }

  async updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit> {
    const [updatedUnit] = await db
      .update(units)
      .set({ ...unit, updatedAt: new Date() })
      .where(eq(units.id, id))
      .returning();
    return updatedUnit;
  }

  async deleteUnit(id: string): Promise<void> {
    await db.update(units).set({ isActive: false }).where(eq(units.id, id));
  }

  // Staff
  async getStaff(): Promise<StaffWithUser[]> {
    return await db
      .select()
      .from(staff)
      .leftJoin(users, eq(staff.userId, users.id))
      .where(eq(staff.isActive, true))
      .orderBy(desc(staff.createdAt))
      .then(rows => rows.map(row => ({
        ...row.staff!,
        user: row.users!
      })));
  }

  async getStaffMember(id: string): Promise<StaffWithUser | undefined> {
    const [result] = await db
      .select()
      .from(staff)
      .leftJoin(users, eq(staff.userId, users.id))
      .where(eq(staff.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.staff,
      user: result.users!
    };
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaff(id: string, staffData: Partial<InsertStaff>): Promise<Staff> {
    const [updatedStaff] = await db
      .update(staff)
      .set({ ...staffData, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<void> {
    await db.update(staff).set({ isActive: false }).where(eq(staff.id, id));
  }

  // Students
  async getStudents(): Promise<StudentWithUser[]> {
    return await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .where(eq(students.status, 'active'))
      .orderBy(desc(students.createdAt))
      .then(rows => rows.map(row => ({
        ...row.students!,
        user: row.users!
      })));
  }

  async getStudent(id: string): Promise<StudentWithUser | undefined> {
    const [result] = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.students,
      user: result.users!
    };
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(studentData).returning();
    return newStudent;
  }

  async updateStudent(id: string, studentData: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...studentData, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.update(students).set({ status: 'inactive' }).where(eq(students.id, id));
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true)).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(courseData).returning();
    return newCourse;
  }

  async updateCourse(id: string, courseData: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  // Classes
  async getClasses(): Promise<ClassWithDetails[]> {
    return await db
      .select()
      .from(classes)
      .leftJoin(courses, eq(classes.courseId, courses.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .leftJoin(units, eq(classes.unitId, units.id))
      .where(eq(classes.isActive, true))
      .orderBy(desc(classes.createdAt))
      .then(rows => rows.map(row => ({
        ...row.classes!,
        course: row.courses!,
        teacher: row.users!,
        unit: row.units!,
        enrollments: [] // TODO: Add enrollments if needed
      })));
  }

  async getClass(id: string): Promise<ClassWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(classes)
      .leftJoin(courses, eq(classes.courseId, courses.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .leftJoin(units, eq(classes.unitId, units.id))
      .where(eq(classes.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.classes,
      course: result.courses!,
      teacher: result.users!,
      unit: result.units!,
      enrollments: [] // TODO: Add enrollments if needed
    };
  }

  async getClassesByTeacher(teacherId: string): Promise<ClassWithDetails[]> {
    return await db
      .select()
      .from(classes)
      .leftJoin(courses, eq(classes.courseId, courses.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .leftJoin(units, eq(classes.unitId, units.id))
      .where(and(eq(classes.teacherId, teacherId), eq(classes.isActive, true)))
      .orderBy(desc(classes.createdAt))
      .then(rows => rows.map(row => ({
        ...row.classes!,
        course: row.courses!,
        teacher: row.users!,
        unit: row.units!,
        enrollments: [] // TODO: Add enrollments if needed
      })));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async deleteClass(id: string): Promise<void> {
    await db.update(classes).set({ isActive: false }).where(eq(classes.id, id));
  }

  // Lessons/Schedule
  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(desc(lessons.date));
  }

  async getLessonsByClass(classId: string): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.classId, classId)).orderBy(desc(lessons.date));
  }

  async getLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
    return await db
      .select({
        id: lessons.id,
        classId: lessons.classId,
        title: lessons.title,
        date: lessons.date,
        startTime: lessons.startTime,
        endTime: lessons.endTime,
        room: lessons.room,
        status: lessons.status,
        notes: lessons.notes,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .leftJoin(classes, eq(lessons.classId, classes.id))
      .where(eq(classes.teacherId, teacherId))
      .orderBy(desc(lessons.date));
  }

  async getTodaysLessons(): Promise<Lesson[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db
      .select()
      .from(lessons)
      .where(and(
        eq(lessons.date, today),
        eq(lessons.status, 'scheduled')
      ))
      .orderBy(lessons.startTime);
  }

  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lessonData).returning();
    return newLesson;
  }

  async updateLesson(id: string, lessonData: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db
      .update(lessons)
      .set({ ...lessonData, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  }> {
    // Get total active students
    const studentsResult = await db
      .select({ count: sql`count(*)::integer` })
      .from(students)
      .where(eq(students.status, 'active'));

    // Get active teachers (users with teacher role)
    const teachersResult = await db
      .select({ count: sql`count(*)::integer` })
      .from(users)
      .where(and(eq(users.role, 'teacher'), eq(users.isActive, true)));

    // Get today's lessons count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysResult = await db
      .select({ count: sql`count(*)::integer` })
      .from(lessons)
      .where(eq(lessons.date, today));

    return {
      totalStudents: Number(studentsResult[0]?.count) || 0,
      activeTeachers: Number(teachersResult[0]?.count) || 0,
      todaysClasses: Number(todaysResult[0]?.count) || 0,
      monthlyRevenue: 47200, // Placeholder - would calculate from payments table
    };
  }
}

export const storage = new DatabaseStorage();
