import { units, users, staff, students, guardians, financialResponsibles, courses, classes, lessons, books, permissions, permissionCategories, roles, rolePermissions, userPermissions, pages, rolePagePermissions, userSettings, supportTickets, supportTicketResponses, studentCourseEnrollments, } from "../shared/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db.js";
// ============================================================================
// USER OPERATIONS
// ============================================================================
export async function createUser(data) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
}
export async function getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
}
export async function getUserById(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
}
export async function updateUser(id, data) {
    const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
    return user;
}
export async function deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
}
export async function getUsers() {
    return await db.select().from(users);
}
export async function upsertUser(data) {
    if (data.id) {
        // Update existing user
        const [user] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, data.id))
            .returning();
        return user;
    }
    else {
        // Create new user
        const [user] = await db.insert(users).values(data).returning();
        return user;
    }
}
// ============================================================================
// ROLE OPERATIONS
// ============================================================================
export async function createRole(data) {
    const [role] = await db.insert(roles).values(data).returning();
    return role;
}
export async function getRoleByName(name) {
    const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return role;
}
export async function getRoles() {
    return await db.select().from(roles).where(eq(roles.isActive, true));
}
export async function getRolePermissions(roleId) {
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
        .where(eq(rolePermissions.roleId, roleId));
}
export async function getRolePermissionsByName(roleName) {
    const role = await getRoleByName(roleName);
    if (!role)
        return [];
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
export async function updateRolePermissions(roleId, permissionIds) {
    await db.transaction(async (tx) => {
        // Remove permissões existentes
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
        // Adiciona novas permissões
        if (permissionIds.length > 0) {
            await tx.insert(rolePermissions).values(permissionIds.map(permissionId => ({
                roleId,
                permissionId,
            })));
        }
    });
}
export async function updateRole(id, data) {
    const [role] = await db
        .update(roles)
        .set({
        ...data,
        updatedAt: sql `NOW()`,
    })
        .where(eq(roles.id, id))
        .returning();
    return role;
}
export async function deactivateRole(id) {
    await db
        .update(roles)
        .set({ isActive: false, updatedAt: sql `NOW()` })
        .where(eq(roles.id, id));
}
// ============================================================================
// USER PERMISSION OVERRIDES
// ============================================================================
export async function getUserPermissionOverrides(userId) {
    return await db
        .select({
        id: userPermissions.id,
        userId: userPermissions.userId,
        permissionId: userPermissions.permissionId,
        isGranted: userPermissions.isGranted,
        createdAt: userPermissions.createdAt,
        updatedAt: userPermissions.updatedAt,
        permission: permissions,
    })
        .from(userPermissions)
        .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
        .where(eq(userPermissions.userId, userId));
}
export async function updateUserPermissions(userId, overrides) {
    await db.transaction(async (tx) => {
        await tx.delete(userPermissions).where(eq(userPermissions.userId, userId));
        if (overrides.length > 0) {
            await tx.insert(userPermissions).values(overrides.map((o) => ({ userId, permissionId: o.permissionId, isGranted: o.isGranted })));
        }
    });
}
// ============================================================================
// PERMISSION OPERATIONS
// ============================================================================
export async function getPermissions() {
    return await db.select().from(permissions).where(eq(permissions.isActive, true));
}
export async function getPermissionsByCategory() {
    const allPermissions = await getPermissions();
    const result = {};
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
export async function getPermissionCategories() {
    return await db.select().from(permissionCategories).where(eq(permissionCategories.isActive, true));
}
export async function getPermissionCategory(id) {
    const [category] = await db.select().from(permissionCategories).where(eq(permissionCategories.id, id)).limit(1);
    return category;
}
export async function createPermissionCategory(data) {
    const [category] = await db.insert(permissionCategories).values(data).returning();
    return category;
}
export async function createPermission(data) {
    const [permission] = await db.insert(permissions).values(data).returning();
    return permission;
}
// ============================================================================
// UNIT OPERATIONS
// ============================================================================
export async function createUnit(data) {
    const [unit] = await db.insert(units).values(data).returning();
    return unit;
}
export async function getUnits() {
    return await db.select().from(units).where(eq(units.isActive, true));
}
export async function getUnit(id) {
    const [unit] = await db.select().from(units).where(eq(units.id, id)).limit(1);
    return unit;
}
export async function updateUnit(id, data) {
    const [unit] = await db
        .update(units)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(units.id, id))
        .returning();
    return unit;
}
export async function deleteUnit(id) {
    // Verificar se existem dependências antes de excluir
    const [staffCount] = await db.select({ count: sql `count(*)` }).from(staff).where(eq(staff.unitId, id));
    const [studentsCount] = await db.select({ count: sql `count(*)` }).from(students).where(eq(students.unitId, id));
    const [classesCount] = await db.select({ count: sql `count(*)` }).from(classes).where(eq(classes.unitId, id));
    const totalDependencies = Number(staffCount.count) + Number(studentsCount.count) + Number(classesCount.count);
    if (totalDependencies > 0) {
        const errorDetails = [];
        if (Number(staffCount.count) > 0)
            errorDetails.push(`${staffCount.count} funcionário(s)`);
        if (Number(studentsCount.count) > 0)
            errorDetails.push(`${studentsCount.count} estudante(s)`);
        if (Number(classesCount.count) > 0)
            errorDetails.push(`${classesCount.count} turma(s)`);
        throw new Error(`Não é possível excluir a unidade. Existem registros vinculados: ${errorDetails.join(', ')}. Remova ou transfira esses registros antes de excluir a unidade.`);
    }
    await db.delete(units).where(eq(units.id, id));
}
// ============================================================================
// STAFF OPERATIONS
// ============================================================================
export async function createStaff(data) {
    const [staffMember] = await db.insert(staff).values(data).returning();
    return staffMember;
}
export async function getStaff() {
    const result = await db
        .select({
        staff: staff,
        user: users,
        unit: units,
    })
        .from(staff)
        .innerJoin(users, eq(staff.userId, users.id))
        .leftJoin(units, eq(staff.unitId, units.id));
    return result.map(r => ({ ...r.staff, user: r.user, unit: r.unit || undefined }));
}
export async function getStaffMember(id) {
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
    if (!result)
        return undefined;
    return { ...result.staff, user: result.user, unit: result.unit || undefined };
}
export async function updateStaff(id, data) {
    const [staffMember] = await db
        .update(staff)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(staff.id, id))
        .returning();
    return staffMember;
}
export async function deleteStaff(id) {
    // Apenas deletar o registro de staff, mantendo o usuário no sistema
    // O usuário pode ter outros papéis ou dados importantes no sistema
    await db.delete(staff).where(eq(staff.id, id));
}
export async function getStaffByUserId(userId) {
    const [result] = await db
        .select({
        staff: staff,
        user: users,
        unit: units,
    })
        .from(staff)
        .innerJoin(users, eq(staff.userId, users.id))
        .leftJoin(units, eq(staff.unitId, units.id))
        .where(eq(staff.userId, userId))
        .limit(1);
    if (!result)
        return undefined;
    return { ...result.staff, user: result.user, unit: result.unit || undefined };
}
// ============================================================================
// GUARDIAN & FINANCIAL RESPONSIBLE OPERATIONS
// ============================================================================
export async function createGuardian(data) {
    const [guardian] = await db.insert(guardians).values(data).returning();
    return guardian;
}
export async function getGuardian(id) {
    const [guardian] = await db.select().from(guardians).where(eq(guardians.id, id)).limit(1);
    return guardian;
}
export async function updateGuardian(id, data) {
    const [guardian] = await db
        .update(guardians)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(guardians.id, id))
        .returning();
    return guardian;
}
export async function getGuardianWithFinancial(id) {
    const [result] = await db
        .select({
        guardian: guardians,
        financialResponsible: financialResponsibles,
    })
        .from(guardians)
        .leftJoin(financialResponsibles, eq(financialResponsibles.guardianId, guardians.id))
        .where(eq(guardians.id, id))
        .limit(1);
    if (!result)
        return undefined;
    return {
        ...result.guardian,
        financialResponsible: result.financialResponsible || undefined,
    };
}
export async function createFinancialResponsible(data) {
    const [responsible] = await db.insert(financialResponsibles).values(data).returning();
    return responsible;
}
export async function updateFinancialResponsible(id, data) {
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
export async function createStudent(data) {
    const [student] = await db.insert(students).values(data).returning();
    return student;
}
export async function getStudents() {
    const result = await db
        .select({
        student: students,
        user: users,
        unit: units,
        guardian: guardians,
        financialResponsible: financialResponsibles,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .leftJoin(units, eq(students.unitId, units.id))
        .leftJoin(guardians, eq(students.guardianId, guardians.id))
        .leftJoin(financialResponsibles, eq(financialResponsibles.guardianId, guardians.id))
        .where(eq(students.isActive, true));
    return result.map(r => ({
        ...r.student,
        user: r.user,
        unit: r.unit || undefined,
        guardian: r.guardian ? {
            ...r.guardian,
            financialResponsible: r.financialResponsible || undefined,
        } : undefined,
    }));
}
export async function getStudent(id) {
    const [result] = await db
        .select({
        student: students,
        user: users,
        unit: units,
        guardian: guardians,
        financialResponsible: financialResponsibles,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .leftJoin(units, eq(students.unitId, units.id))
        .leftJoin(guardians, eq(students.guardianId, guardians.id))
        .leftJoin(financialResponsibles, eq(financialResponsibles.guardianId, guardians.id))
        .where(eq(students.id, id))
        .limit(1);
    if (!result)
        return undefined;
    return {
        ...result.student,
        user: result.user,
        unit: result.unit || undefined,
        guardian: result.guardian ? {
            ...result.guardian,
            financialResponsible: result.financialResponsible || undefined,
        } : undefined,
    };
}
export async function updateStudent(id, data) {
    const [student] = await db
        .update(students)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(students.id, id))
        .returning();
    return student;
}
export async function deleteStudent(id) {
    const student = await db.select().from(students).where(eq(students.id, id)).limit(1);
    if (student.length > 0) {
        await db.delete(students).where(eq(students.id, id));
        await db.delete(users).where(eq(users.id, student[0].userId));
    }
}
// Buscar estudante pelo userId (para área do aluno)
export async function getStudentByUserId(userId) {
    const [result] = await db
        .select({
        student: students,
        user: users,
        unit: units,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .leftJoin(units, eq(students.unitId, units.id))
        .where(eq(students.userId, userId))
        .limit(1);
    if (!result)
        return undefined;
    return { ...result.student, user: result.user, unit: result.unit || undefined };
}
// Buscar estudante pelo CPF
export async function getStudentByCpf(cpf) {
    const [result] = await db
        .select({
        student: students,
        user: users,
        unit: units,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .leftJoin(units, eq(students.unitId, units.id))
        .where(and(eq(students.cpf, cpf), eq(students.isActive, true)))
        .limit(1);
    if (!result)
        return undefined;
    return { ...result.student, user: result.user, unit: result.unit || undefined };
}
// Buscar matrículas de cursos do estudante (para estantes estilo Netflix)
export async function getStudentCourseEnrollmentsForUser(userId) {
    const student = await getStudentByUserId(userId);
    if (!student)
        return [];
    const rows = await db
        .select({
        enrollment: studentCourseEnrollments,
        course: courses,
    })
        .from(studentCourseEnrollments)
        .innerJoin(courses, eq(studentCourseEnrollments.courseId, courses.id))
        .where(eq(studentCourseEnrollments.studentId, student.id));
    return rows.map(r => ({
        ...r.enrollment,
        course: { id: r.course.id, name: r.course.name, level: r.course.level },
    }));
}
// Buscar detalhes de curso com livros básicos (para prateleiras)
export async function getCourseWithBooksBasic(courseId) {
    const course = await getCourse(courseId);
    if (!course)
        return undefined;
    const courseBooks = await db
        .select({
        id: books.id,
        name: books.name,
        description: books.description,
        color: books.color,
    })
        .from(books)
        .where(and(eq(books.courseId, courseId), eq(books.isActive, true)))
        .orderBy(books.name);
    return { ...course, books: courseBooks };
}
// ============================================================================
// COURSE OPERATIONS
// ============================================================================
export async function createCourse(data) {
    const [course] = await db.insert(courses).values(data).returning();
    return course;
}
export async function getCourses() {
    return await db.select().from(courses).where(eq(courses.isActive, true));
}
export async function getCourse(id) {
    const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return course;
}
export async function updateCourse(id, data) {
    const [course] = await db
        .update(courses)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(courses.id, id))
        .returning();
    return course;
}
export async function deleteCourse(id) {
    await db.delete(courses).where(eq(courses.id, id));
}
// ============================================================================
// BOOK OPERATIONS
// ============================================================================
export async function createBook(data) {
    const [book] = await db.insert(books).values(data).returning();
    return book;
}
export async function getBooks() {
    return await db.select().from(books).where(eq(books.isActive, true));
}
export async function getBook(id) {
    const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
    return book;
}
export async function updateBook(id, data) {
    const [book] = await db
        .update(books)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(books.id, id))
        .returning();
    return book;
}
export async function deleteBook(id) {
    await db.delete(books).where(eq(books.id, id));
}
// ============================================================================
// CLASS OPERATIONS
// ============================================================================
export async function createClass(data) {
    const [classItem] = await db.insert(classes).values(data).returning();
    return classItem;
}
export async function getClasses() {
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
export async function getClass(id) {
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
    if (!result)
        return undefined;
    return {
        ...result.class,
        book: { ...result.book, course: result.course },
        teacher: result.teacher,
        unit: result.unit,
        enrollments: [],
    };
}
export async function updateClass(id, data) {
    const [classItem] = await db
        .update(classes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(classes.id, id))
        .returning();
    return classItem;
}
export async function deleteClass(id) {
    await db.delete(classes).where(eq(classes.id, id));
}
export async function getTeachers() {
    const result = await db
        .select({
        staff: staff,
        user: users,
    })
        .from(staff)
        .innerJoin(users, eq(staff.userId, users.id))
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(and(eq(staff.isActive, true), eq(roles.name, 'teacher')));
    return result.map(r => ({
        ...r.staff,
        user: r.user,
    }));
}
export async function getTeacherSchedule(teacherId) {
    // Buscar todas as turmas do professor
    const teacherClasses = await db
        .select({
        class: classes,
        book: books,
        course: courses,
        unit: units,
    })
        .from(classes)
        .innerJoin(books, eq(classes.bookId, books.id))
        .innerJoin(courses, eq(books.courseId, courses.id))
        .innerJoin(units, eq(classes.unitId, units.id))
        .where(and(eq(classes.teacherId, teacherId), eq(classes.isActive, true)));
    // Gerar horários ocupados e disponíveis
    const occupiedSlots = teacherClasses.map(r => ({
        id: r.class.id,
        dayOfWeek: r.class.dayOfWeek,
        startTime: r.class.startTime,
        endTime: r.class.endTime,
        room: r.class.room,
        className: r.class.name,
        courseName: r.course.name,
        bookName: r.book.name,
        unitName: r.unit.name,
        currentStudents: r.class.currentStudents,
        maxStudents: r.class.maxStudents,
        status: 'occupied'
    }));
    // Gerar horários disponíveis (8h às 22h, de segunda a sábado)
    const availableSlots = [];
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
    for (let day = 1; day <= 6; day++) { // Segunda a sábado
        for (let i = 0; i < timeSlots.length - 1; i++) {
            const startTime = timeSlots[i];
            const endTime = timeSlots[i + 1];
            // Verificar se este horário não está ocupado
            const isOccupied = occupiedSlots.some(slot => slot.dayOfWeek === day &&
                slot.startTime === startTime);
            if (!isOccupied) {
                availableSlots.push({
                    dayOfWeek: day,
                    startTime,
                    endTime,
                    status: 'available'
                });
            }
        }
    }
    return {
        teacherId,
        occupiedSlots,
        availableSlots
    };
}
// ============================================================================
// LESSON OPERATIONS
// ============================================================================
export async function createLesson(data) {
    const [lesson] = await db.insert(lessons).values(data).returning();
    return lesson;
}
export async function getLessons() {
    return await db.select().from(lessons).orderBy(desc(lessons.date));
}
export async function getLesson(id) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    return lesson;
}
export async function updateLesson(id, data) {
    const [lesson] = await db
        .update(lessons)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(lessons.id, id))
        .returning();
    return lesson;
}
export async function deleteLesson(id) {
    await db.delete(lessons).where(eq(lessons.id, id));
}
// ============================================================================
// DASHBOARD OPERATIONS
// ============================================================================
export async function getDashboardStats() {
    const [totalStudentsResult] = await db
        .select({ count: sql `count(*)::int` })
        .from(students)
        .where(eq(students.isActive, true));
    const [totalStaffResult] = await db
        .select({ count: sql `count(*)::int` })
        .from(staff)
        .where(eq(staff.isActive, true));
    const [totalCoursesResult] = await db
        .select({ count: sql `count(*)::int` })
        .from(courses)
        .where(eq(courses.isActive, true));
    const [totalClassesResult] = await db
        .select({ count: sql `count(*)::int` })
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
export async function createSupportTicket(data) {
    const [ticket] = await db.insert(supportTickets).values(data).returning();
    return ticket;
}
export async function getSupportTickets() {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}
export async function getSupportTicket(id) {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    if (!ticket)
        return undefined;
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
export async function updateSupportTicket(id, data) {
    const [ticket] = await db
        .update(supportTickets)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(supportTickets.id, id))
        .returning();
    return ticket;
}
export async function createSupportTicketResponse(data) {
    const [response] = await db.insert(supportTicketResponses).values(data).returning();
    return response;
}
// ============================================================================
// USER SETTINGS OPERATIONS
// ============================================================================
export async function getUserSettings(userId) {
    const [settings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);
    return settings;
}
export async function createUserSettings(data) {
    const [settings] = await db.insert(userSettings).values(data).returning();
    return settings;
}
export async function updateUserSettings(userId, data) {
    const [settings] = await db
        .update(userSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId))
        .returning();
    return settings;
}
// ============================================================================
// PAGES OPERATIONS
// ============================================================================
export async function createPage(data) {
    const [page] = await db.insert(pages).values(data).returning();
    return page;
}
export async function getPages() {
    return await db.select().from(pages).orderBy(pages.displayName);
}
export async function getPageByName(name) {
    const [page] = await db
        .select()
        .from(pages)
        .where(eq(pages.name, name))
        .limit(1);
    return page;
}
export async function getPageById(id) {
    const [page] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id))
        .limit(1);
    return page;
}
export async function updatePage(id, data) {
    const [page] = await db
        .update(pages)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pages.id, id))
        .returning();
    return page;
}
export async function deletePage(id) {
    await db.delete(pages).where(eq(pages.id, id));
}
// ============================================================================
// ROLE PAGE PERMISSIONS OPERATIONS
// ============================================================================
export async function createRolePagePermission(data) {
    const [permission] = await db.insert(rolePagePermissions).values(data).returning();
    return permission;
}
export async function getRolePagePermissions(roleId) {
    const query = db.select().from(rolePagePermissions);
    if (roleId) {
        return await query.where(eq(rolePagePermissions.roleId, roleId));
    }
    return await query;
}
export async function getRolePagePermission(roleId, pageId) {
    const [permission] = await db
        .select()
        .from(rolePagePermissions)
        .where(and(eq(rolePagePermissions.roleId, roleId), eq(rolePagePermissions.pageId, pageId)))
        .limit(1);
    return permission;
}
export async function updateRolePagePermission(roleId, pageId, data) {
    const [permission] = await db
        .update(rolePagePermissions)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(rolePagePermissions.roleId, roleId), eq(rolePagePermissions.pageId, pageId)))
        .returning();
    return permission;
}
export async function deleteRolePagePermission(roleId, pageId) {
    await db.delete(rolePagePermissions).where(and(eq(rolePagePermissions.roleId, roleId), eq(rolePagePermissions.pageId, pageId)));
}
export async function getRoleAllowedPages(roleId) {
    return await db
        .select({
        id: pages.id,
        name: pages.name,
        displayName: pages.displayName,
        description: pages.description,
        route: pages.route,
        isActive: pages.isActive,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
    })
        .from(pages)
        .innerJoin(rolePagePermissions, eq(pages.id, rolePagePermissions.pageId))
        .where(and(eq(rolePagePermissions.roleId, roleId), eq(rolePagePermissions.canAccess, true), eq(pages.isActive, true)))
        .orderBy(pages.displayName);
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
    upsertUser,
    // Roles
    createRole,
    getRoleByName,
    getRoles,
    getRolePermissions,
    getRolePermissionsByName,
    updateRolePermissions,
    updateRole,
    deactivateRole,
    // Permissions
    getPermissions,
    getPermissionsByCategory,
    getPermissionCategories,
    getPermissionCategory,
    createPermissionCategory,
    createPermission,
    getUserPermissionOverrides,
    updateUserPermissions,
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
    getStaffByUserId,
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
    getStudentByUserId,
    getStudentCourseEnrollmentsForUser,
    updateStudent,
    deleteStudent,
    // Courses
    getCourseWithBooksBasic,
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
    // Pages
    createPage,
    getPages,
    getPageByName,
    getPageById,
    updatePage,
    deletePage,
    // Role Page Permissions
    createRolePagePermission,
    getRolePagePermissions,
    getRolePagePermission,
    updateRolePagePermission,
    deleteRolePagePermission,
    getRoleAllowedPages,
    // Teacher Schedule
    getTeacherSchedule,
    // Staff with Teachers
    getTeachers,
};
