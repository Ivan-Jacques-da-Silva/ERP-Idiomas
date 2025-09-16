import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', [
  'developer',
  'admin', 
  'secretary',
  'financial',
  'teacher',
  'student'
]);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('student'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Units table
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  managerId: varchar("manager_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff table (extends users with additional info)
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  unitId: varchar("unit_id").references(() => units.id),
  employeeId: varchar("employee_id").unique(),
  position: varchar("position"),
  department: varchar("department"),
  salary: integer("salary"),
  hireDate: timestamp("hire_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  studentId: varchar("student_id").unique(),
  unitId: varchar("unit_id").references(() => units.id),
  enrollmentDate: timestamp("enrollment_date"),
  status: varchar("status").default('active'), // active, inactive, graduated
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  language: varchar("language").notNull(),
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  duration: integer("duration"), // duration in hours
  price: integer("price"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  unitId: varchar("unit_id").references(() => units.id).notNull(),
  name: varchar("name").notNull(),
  schedule: text("schedule"), // JSON string with schedule info
  maxStudents: integer("max_students").default(15),
  currentStudents: integer("current_students").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Class enrollments
export const classEnrollments = pgTable("class_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: varchar("status").default('active'), // active, dropped, completed
  finalGrade: varchar("final_grade"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schedule/Lessons table
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  title: varchar("title").notNull(),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  room: varchar("room"),
  status: varchar("status").default('scheduled'), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  staff: one(staff, {
    fields: [users.id],
    references: [staff.userId],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  teachingClasses: many(classes),
  managedUnits: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  manager: one(users, {
    fields: [units.managerId],
    references: [users.id],
  }),
  staff: many(staff),
  students: many(students),
  classes: many(classes),
}));

export const staffRelations = relations(staff, ({ one }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [staff.unitId],
    references: [units.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [students.unitId],
    references: [units.id],
  }),
  enrollments: many(classEnrollments),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  course: one(courses, {
    fields: [classes.courseId],
    references: [courses.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [classes.unitId],
    references: [units.id],
  }),
  enrollments: many(classEnrollments),
  lessons: many(lessons),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  student: one(students, {
    fields: [classEnrollments.studentId],
    references: [students.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  class: one(classes, {
    fields: [lessons.classId],
    references: [classes.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Unit = typeof units.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;

// Extended types with relations
export type UserWithRole = User;
export type StaffWithUser = Staff & { user: User };
export type StudentWithUser = Student & { user: User };
export type ClassWithDetails = Class & { 
  course: Course; 
  teacher: User; 
  unit: Unit;
  enrollments: (ClassEnrollment & { student: StudentWithUser })[];
};
