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

// User roles enum - mantendo para compatibilidade
export const userRoleEnum = pgEnum('user_role', [
  'developer',
  'admin', 
  'secretary',
  'financial',
  'teacher',
  'student'
]);

// Permission categories enum
export const permissionCategoryEnum = pgEnum('permission_category', [
  'dashboard',
  'units',
  'staff',
  'students',
  'courses', 
  'schedule',
  'financial',
  'system'
]);

// Permissions table - todas as permissões disponíveis no sistema
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // ex: "access_units", "access_schedule"
  displayName: varchar("display_name").notNull(), // ex: "Acesso a Unidades", "Acesso a Agenda"
  description: text("description"),
  category: permissionCategoryEnum("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roles table - roles fixos e personalizados
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // ex: "admin", "teacher", "custom_role_1"
  displayName: varchar("display_name").notNull(), // ex: "Administrativo", "Professor"
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(false), // true para roles fixos
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions relationship - quais permissões cada role tem
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permissionId: varchar("permission_id").references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("UQ_role_permission").on(table.roleId, table.permissionId),
]);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('student'), // DEPRECATED: mantendo para compatibilidade temporária
  roleId: varchar("role_id").references(() => roles.id, { onDelete: 'set null' }), // novo sistema de roles - fonte única de verdade
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

// Books table - livros virtuais dentro de cada curso
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  pdfUrl: varchar("pdf_url"), // URL do arquivo PDF do livro
  color: varchar("color").notNull().default('#3b82f6'), // Cor do livro em hex
  displayOrder: integer("display_order").default(1), // Ordem do livro dentro do curso
  totalDays: integer("total_days").default(30), // Quantos dias de aula tem o livro
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table (turmas)
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  unitId: varchar("unit_id").references(() => units.id).notNull(),
  name: varchar("name").notNull(),
  schedule: text("schedule"), // JSON string with schedule info
  dayOfWeek: integer("day_of_week"), // 0=Sunday, 1=Monday, ..., 6=Saturday  
  startTime: varchar("start_time"), // formato HH:mm
  endTime: varchar("end_time"), // formato HH:mm
  room: varchar("room"),
  maxStudents: integer("max_students").default(15),
  currentStudents: integer("current_students").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  currentDay: integer("current_day").default(1), // Qual DIA a turma está atualmente
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
  bookDay: integer("book_day").notNull(), // DIA 1, DIA 2, etc. do livro
  date: timestamp("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  room: varchar("room"),
  status: varchar("status").default('scheduled'), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User permissions table - permissões individuais por usuário baseadas nas páginas do menu
export const userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permissionId: varchar("permission_id").references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  isGranted: boolean("is_granted").default(true).notNull(), // permite negação explícita de permissão
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("UQ_user_permission").on(table.userId, table.permissionId),
]);

// Relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userPermissions: many(userPermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  users: many(users),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  staff: one(staff, {
    fields: [users.id],
    references: [staff.userId],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  teachingClasses: many(classes),
  managedUnits: many(units),
  userPermissions: many(userPermissions),
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
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  course: one(courses, {
    fields: [books.courseId],
    references: [courses.id],
  }),
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  book: one(books, {
    fields: [classes.bookId],
    references: [books.id],
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

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
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
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

export type Unit = typeof units.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserPermission = typeof userPermissions.$inferSelect;

// Extended types with relations
export type UserWithRole = User & { role: Role | null };
export type UserWithPermissions = User & { 
  role: Role | null;
  userPermissions: (UserPermission & { permission: Permission })[];
};
export type StaffWithUser = Staff & { user: User };
export type StudentWithUser = Student & { user: User };
export type ClassWithDetails = Class & { 
  book: Book & { course: Course };
  teacher: User; 
  unit: Unit;
  enrollments: (ClassEnrollment & { student: StudentWithUser })[];
};

// Novo tipo para livros com detalhes do curso
export type BookWithDetails = Book & {
  course: Course;
  classes: Class[];
};

// Novo tipo para cursos com todos os detalhes
export type CourseWithDetails = Course & {
  books: (Book & { classes: Class[] })[];
};

// Tipos para sistema de permissões
export type RoleWithPermissions = Role & {
  rolePermissions: (RolePermission & { permission: Permission })[];
};

export type PermissionsByCategory = {
  [K in 'dashboard' | 'units' | 'staff' | 'students' | 'courses' | 'schedule' | 'financial' | 'system']: Permission[];
};
