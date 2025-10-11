import type {
  InsertUnit,
  InsertStaff,
  InsertStudent,
  InsertCourse,
  InsertClass,
  InsertLesson,
  InsertBook,
  InsertPermission,
  InsertPermissionCategory,
  InsertRole,
  InsertRolePermission,
  InsertUserPermission,
  InsertUserSettings,
  InsertSupportTicket,
  InsertSupportTicketResponse,
  InsertUser,
  InsertGuardian,
  InsertFinancialResponsible,
  InsertFranchiseUnit,
  InsertCourseUnit,
  InsertCourseVideo,
  InsertCourseActivity,
  InsertStudentProgress,
  InsertStudentCourseEnrollment,
  Unit,
  Staff,
  Student,
  Course,
  Class,
  Lesson,
  Book,
  User,
  UpsertUser,
  Guardian,
  FinancialResponsible,
  FranchiseUnit,
  StaffWithUser,
  StudentWithUser,
  ClassWithDetails,
  Permission,
  PermissionCategory,
  Role,
  RolePermission,
  UserPermission,
  UserWithPermissions,
  RoleWithPermissions,
  PermissionsByCategory,
  UserSettings,
  SupportTicket,
  SupportTicketResponse,
  SupportTicketWithResponses,
  CourseUnit,
  CourseVideo,
  CourseActivity,
  StudentProgress,
  StudentCourseEnrollment,
  GuardianWithFinancial,
} from "../shared/schema.js";
import {
  units,
  users,
  staff,
  students,
  guardians,
  financialResponsibles,
  courses,
  classes,
  lessons,
  books,
  permissions,
  permissionCategories,
  roles,
  rolePermissions,
  userPermissions,
  userSettings,
  supportTickets,
  supportTicketResponses,
  franchiseUnits,
  courseUnits,
  courseVideos,
  courseActivities,
  studentProgress,
  studentCourseEnrollments,
} from "../shared/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db.js";

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function createUser(data: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

export async function getUsers(): Promise<User[]> {
  return await db.select().from(users);
}

// ============================================================================
// ROLE OPERATIONS
// ============================================================================

export async function createRole(data: InsertRole): Promise<Role> {
  const [role] = await db.insert(roles).values(data).returning();
  return role;
}

export async function getRoleByName(name: string): Promise<Role | undefined> {
  const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  return role;
}

export async function getRoles(): Promise<Role[]> {
  return await db.select().from(roles).where(eq(roles.isActive, true));
}

export async function getRolePermissionsByName(roleName: string): Promise<(RolePermission & { permission: Permission })[]> {
  const role = await getRoleByName(roleName);
  if (!role) return [];

  return await db
    .select({
      id: rolePermissions.id,
      roleId: rolePermissions.roleId,
      permissionId: rolePermissions.permissionId,
      createdAt: rolePermissions.createdAt,
      permission: permissions,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, role.id));
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    // Remove permissões existentes
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    
    // Adiciona novas permissões
    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(
        permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        }))
      );
    }
  });
}

// ============================================================================
// PERMISSION OPERATIONS
// ============================================================================

export async function getPermissions(): Promise<Permission[]> {
  return await db.select().from(permissions).where(eq(permissions.isActive, true));
}

export async function getPermissionsByCategory(): Promise<PermissionsByCategory> {
  const allPermissions = await getPermissions();
  const result: PermissionsByCategory = {};
  
  for (const permission of allPermissions) {
    const category = await getPermissionCategory(permission.categoryId);
    const categoryName = category?.name || 'uncategorized';
    
    if (!result[categoryName]) {
      result[categoryName] = [];
    }
    result[categoryName].push(permission);
  }
  
  return result;
}

export async function getPermissionCategories(): Promise<PermissionCategory[]> {
  return await db.select().from(permissionCategories).where(eq(permissionCategories.isActive, true));
}

export async function getPermissionCategory(id: string): Promise<PermissionCategory | undefined> {
  const [category] = await db.select().from(permissionCategories).where(eq(permissionCategories.id, id)).limit(1);
  return category;
}

export async function createPermissionCategory(data: InsertPermissionCategory): Promise<PermissionCategory> {
  const [category] = await db.insert(permissionCategories).values(data).returning();
  return category;
}

export async function createPermission(data: InsertPermission): Promise<Permission> {
  const [permission] = await db.insert(permissions).values(data).returning();
  return permission;
}

// ============================================================================
// UNIT OPERATIONS
// ============================================================================

export async function createUnit(data: InsertUnit): Promise<Unit> {
  const [unit] = await db.insert(units).values(data).returning();
  return unit;
}

export async function getUnits(): Promise<Unit[]> {
  return await db.select().from(units).where(eq(units.isActive, true));
}

export async function getUnit(id: string): Promise<Unit | undefined> {
  const [unit] = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return unit;
}

export async function updateUnit(id: string, data: Partial<InsertUnit>): Promise<Unit> {
  const [unit] = await db
    .update(units)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(units.id, id))
    .returning();
  return unit;
}

export async function deleteUnit(id: string): Promise<void> {
  await db.delete(units).where(eq(units.id, id));
}

// ============================================================================
// STAFF OPERATIONS
// ============================================================================

export async function createStaff(data: InsertStaff): Promise<Staff> {
  const [staffMember] = await db.insert(staff).values(data).returning();
  return staffMember;
}

export async function getStaff(): Promise<StaffWithUser[]> {
  const result = await db
    .select({
      staff: staff,
      user: users,
      unit: units,
    })
    .from(staff)
    .innerJoin(users, eq(staff.userId, users.id))
    .leftJoin(units, eq(staff.unitId, units.id))
    .where(eq(staff.isActive, true));

  return result.map(r => ({ ...r.staff, user: r.user, unit: r.unit || undefined }));
}

export async function getStaffMember(id: string): Promise<StaffWithUser | undefined> {
  const [result] = await db
    .select({
      staff: staff,
      user: users,
      unit: units,
    })
    .from(staff)
    .innerJoin(users, eq(staff.userId, users.id))
    .leftJoin(units, eq(staff.unitId, units.id))
    .where(eq(staff.id, id))
    .limit(1);

  if (!result) return undefined;
  return { ...result.staff, user: result.user, unit: result.unit || undefined };
}

export async function updateStaff(id: string, data: Partial<InsertStaff>): Promise<Staff> {
  const [staffMember] = await db
    .update(staff)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(staff.id, id))
    .returning();
  return staffMember;
}

export async function deleteStaff(id: string): Promise<void> {
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  if (staffMember.length > 0) {
    await db.delete(staff).where(eq(staff.id, id));
    await db.delete(users).where(eq(users.id, staffMember[0].userId));
  }
}

// ============================================================================
// GUARDIAN & FINANCIAL RESPONSIBLE OPERATIONS
// ============================================================================

export async function createGuardian(data: InsertGuardian): Promise<Guardian> {
  const [guardian] = await db.insert(guardians).values(data).returning();
  return guardian;
}

export async function getGuardian(id: string): Promise<Guardian | undefined> {
  const [guardian] = await db.select().from(guardians).where(eq(guardians.id, id)).limit(1);
  return guardian;
}

export async function updateGuardian(id: string, data: Partial<InsertGuardian>): Promise<Guardian> {
  const [guardian] = await db
    .update(guardians)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(guardians.id, id))
    .returning();
  return guardian;
}

export async function getGuardianWithFinancial(id: string): Promise<GuardianWithFinancial | undefined> {
  const [result] = await db
    .select({
      guardian: guardians,
      financialResponsible: financialResponsibles,
    })
    .from(guardians)
    .leftJoin(financialResponsibles, eq(financialResponsibles.guardianId, guardians.id))
    .where(eq(guardians.id, id))
    .limit(1);

  if (!result) return undefined;
  return {
    ...result.guardian,
    financialResponsible: result.financialResponsible || undefined,
  };
}

export async function createFinancialResponsible(data: InsertFinancialResponsible): Promise<FinancialResponsible> {
  const [responsible] = await db.insert(financialResponsibles).values(data).returning();
  return responsible;
}

export async function updateFinancialResponsible(id: string, data: Partial<InsertFinancialResponsible>): Promise<FinancialResponsible> {
  const [responsible] = await db
    .update(financialResponsibles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(financialResponsibles.id, id))
    .returning();
  return responsible;
}

// ============================================================================
// STUDENT OPERATIONS
// ============================================================================

export async function createStudent(data: InsertStudent): Promise<Student> {
  const [student] = await db.insert(students).values(data).returning();
  return student;
}

export async function getStudents(): Promise<StudentWithUser[]> {
  const result = await db
    .select({
      student: students,
      user: users,
      unit: units,
      guardian: guardians,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(units, eq(students.unitId, units.id))
    .leftJoin(guardians, eq(students.guardianId, guardians.id))
    .where(eq(students.isActive, true));

  return result.map(r => ({
    ...r.student,
    user: r.user,
    unit: r.unit || undefined,
    guardian: r.guardian || undefined,
  }));
}

export async function getStudent(id: string): Promise<StudentWithUser | undefined> {
  const [result] = await db
    .select({
      student: students,
      user: users,
      unit: units,
      guardian: guardians,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(units, eq(students.unitId, units.id))
    .leftJoin(guardians, eq(students.guardianId, guardians.id))
    .where(eq(students.id, id))
    .limit(1);

  if (!result) return undefined;
  return {
    ...result.student,
    user: result.user,
    unit: result.unit || undefined,
    guardian: result.guardian || undefined,
  };
}

export async function updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student> {
  const [student] = await db
    .update(students)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();
  return student;
}

export async function deleteStudent(id: string): Promise<void> {
  const student = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (student.length > 0) {
    await db.delete(students).where(eq(students.id, id));
    await db.delete(users).where(eq(users.id, student[0].userId));
  }
}

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

export async function createCourse(data: InsertCourse): Promise<Course> {
  const [course] = await db.insert(courses).values(data).returning();
  return course;
}

export async function getCourses(): Promise<Course[]> {
  return await db.select().from(courses).where(eq(courses.isActive, true));
}

export async function getCourse(id: string): Promise<Course | undefined> {
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return course;
}

export async function updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course> {
  const [course] = await db
    .update(courses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courses.id, id))
    .returning();
  return course;
}

export async function deleteCourse(id: string): Promise<void> {
  await db.delete(courses).where(eq(courses.id, id));
}

// ============================================================================
// BOOK OPERATIONS
// ============================================================================

export async function createBook(data: InsertBook): Promise<Book> {
  const [book] = await db.insert(books).values(data).returning();
  return book;
}

export async function getBooks(): Promise<Book[]> {
  return await db.select().from(books).where(eq(books.isActive, true));
}

export async function getBook(id: string): Promise<Book | undefined> {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return book;
}

export async function updateBook(id: string, data: Partial<InsertBook>): Promise<Book> {
  const [book] = await db
    .update(books)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(books.id, id))
    .returning();
  return book;
}

export async function deleteBook(id: string): Promise<void> {
  await db.delete(books).where(eq(books.id, id));
}

// ============================================================================
// CLASS OPERATIONS
// ============================================================================

export async function createClass(data: InsertClass): Promise<Class> {
  const [classItem] = await db.insert(classes).values(data).returning();
  return classItem;
}

export async function getClasses(): Promise<ClassWithDetails[]> {
  const result = await db
    .select({
      class: classes,
      book: books,
      course: courses,
      teacher: users,
      unit: units,
    })
    .from(classes)
    .innerJoin(books, eq(classes.bookId, books.id))
    .innerJoin(courses, eq(books.courseId, courses.id))
    .innerJoin(users, eq(classes.teacherId, users.id))
    .innerJoin(units, eq(classes.unitId, units.id))
    .where(eq(classes.isActive, true));

  return result.map(r => ({
    ...r.class,
    book: { ...r.book, course: r.course },
    teacher: r.teacher,
    unit: r.unit,
    enrollments: [],
  }));
}

export async function getClass(id: string): Promise<ClassWithDetails | undefined> {
  const [result] = await db
    .select({
      class: classes,
      book: books,
      course: courses,
      teacher: users,
      unit: units,
    })
    .from(classes)
    .innerJoin(books, eq(classes.bookId, books.id))
    .innerJoin(courses, eq(books.courseId, courses.id))
    .innerJoin(users, eq(classes.teacherId, users.id))
    .innerJoin(units, eq(classes.unitId, units.id))
    .where(eq(classes.id, id))
    .limit(1);

  if (!result) return undefined;
  return {
    ...result.class,
    book: { ...result.book, course: result.course },
    teacher: result.teacher,
    unit: result.unit,
    enrollments: [],
  };
}

export async function updateClass(id: string, data: Partial<InsertClass>): Promise<Class> {
  const [classItem] = await db
    .update(classes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(classes.id, id))
    .returning();
  return classItem;
}

export async function deleteClass(id: string): Promise<void> {
  await db.delete(classes).where(eq(classes.id, id));
}

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

export async function createLesson(data: InsertLesson): Promise<Lesson> {
  const [lesson] = await db.insert(lessons).values(data).returning();
  return lesson;
}

export async function getLessons(): Promise<Lesson[]> {
  return await db.select().from(lessons).orderBy(desc(lessons.date));
}

export async function getLesson(id: string): Promise<Lesson | undefined> {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return lesson;
}

export async function updateLesson(id: string, data: Partial<InsertLesson>): Promise<Lesson> {
  const [lesson] = await db
    .update(lessons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(lessons.id, id))
    .returning();
  return lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  await db.delete(lessons).where(eq(lessons.id, id));
}

// ============================================================================
// DASHBOARD OPERATIONS
// ============================================================================

export async function getDashboardStats() {
  const [totalStudentsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students)
    .where(eq(students.isActive, true));

  const [totalStaffResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(staff)
    .where(eq(staff.isActive, true));

  const [totalCoursesResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courses)
    .where(eq(courses.isActive, true));

  const [totalClassesResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(classes)
    .where(eq(classes.isActive, true));

  return {
    totalStudents: totalStudentsResult?.count || 0,
    totalStaff: totalStaffResult?.count || 0,
    totalCourses: totalCoursesResult?.count || 0,
    totalClasses: totalClassesResult?.count || 0,
  };
}

// ============================================================================
// SUPPORT TICKET OPERATIONS
// ============================================================================

export async function createSupportTicket(data: InsertSupportTicket & { userId: string }): Promise<SupportTicket> {
  const [ticket] = await db.insert(supportTickets).values(data).returning();
  return ticket;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function getSupportTicket(id: string): Promise<SupportTicketWithResponses | undefined> {
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  if (!ticket) return undefined;

  const responses = await db
    .select()
    .from(supportTicketResponses)
    .where(eq(supportTicketResponses.ticketId, id))
    .orderBy(supportTicketResponses.createdAt);

  const [user] = await db.select().from(users).where(eq(users.id, ticket.userId)).limit(1);
  
  let assignedUser;
  if (ticket.assignedTo) {
    [assignedUser] = await db.select().from(users).where(eq(users.id, ticket.assignedTo)).limit(1);
  }

  return {
    ...ticket,
    responses,
    user,
    assignedUser,
  };
}

export async function updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket> {
  const [ticket] = await db
    .update(supportTickets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(supportTickets.id, id))
    .returning();
  return ticket;
}

export async function createSupportTicketResponse(data: InsertSupportTicketResponse & { ticketId: string; userId: string }): Promise<SupportTicketResponse> {
  const [response] = await db.insert(supportTicketResponses).values(data).returning();
  return response;
}

// ============================================================================
// USER SETTINGS OPERATIONS
// ============================================================================

export async function getUserSettings(userId: string): Promise<UserSettings | undefined> {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return settings;
}

export async function createUserSettings(data: InsertUserSettings & { userId: string }): Promise<UserSettings> {
  const [settings] = await db.insert(userSettings).values(data).returning();
  return settings;
}

export async function updateUserSettings(userId: string, data: Partial<InsertUserSettings>): Promise<UserSettings> {
  const [settings] = await db
    .update(userSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userSettings.userId, userId))
    .returning();
  return settings;
}

// Export all storage functions
export const storage = {
  // Users
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  getUsers,
  
  // Roles
  createRole,
  getRoleByName,
  getRoles,
  getRolePermissionsByName,
  updateRolePermissions,
  
  // Permissions
  getPermissions,
  getPermissionsByCategory,
  getPermissionCategories,
  getPermissionCategory,
  createPermissionCategory,
  createPermission,
  
  // Units
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
  
  // Staff
  createStaff,
  getStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
  
  // Guardians
  createGuardian,
  getGuardian,
  updateGuardian,
  getGuardianWithFinancial,
  createFinancialResponsible,
  updateFinancialResponsible,
  
  // Students
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  
  // Courses
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  
  // Books
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  
  // Classes
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  
  // Lessons
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  
  // Dashboard
  getDashboardStats,
  
  // Support
  createSupportTicket,
  getSupportTickets,
  getSupportTicket,
  updateSupportTicket,
  createSupportTicketResponse,
  
  // User Settings
  getUserSettings,
  createUserSettings,
  updateUserSettings,
};
