import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, varchar, text, integer, boolean, pgEnum, } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// ============================================================================
// ENUMS
// ============================================================================
// User roles - 4 roles fixos do sistema
export const userRoleEnum = pgEnum('user_role', [
    'admin', // Administrativo - acesso total
    'secretary', // Secretário - acesso quase total
    'teacher', // Professor - acesso limitado focado em ensino
    'student' // Aluno - apenas área do aluno
]);
// Gender enum - unificado para staff e students
export const genderEnum = pgEnum('gender', ['masculino', 'feminino', 'outro']);
// Billing type enum
export const billingTypeEnum = pgEnum('billing_type', [
    'mensalidade',
    'trimestral',
    'semestral',
    'anual',
    'avulso'
]);
// Support ticket enums
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);
// ============================================================================
// CORE TABLES
// ============================================================================
// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
}, (table) => [index("IDX_session_expire").on(table.expire)]);
// Users table - base para todos os usuários do sistema
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    email: varchar("email").notNull().unique(),
    password: varchar("password"), // hashed password
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    profileImageUrl: varchar("profile_image_url"),
    roleId: varchar("role_id").references(() => roles.id).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Roles table - 4 roles fixos do sistema
export const roles = pgTable("roles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    // Permite papéis dinâmicos: trocar enum por varchar
    name: varchar("name").notNull().unique(),
    displayName: varchar("display_name").notNull(),
    description: text("description"),
    isSystemRole: boolean("is_system_role").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeletable: boolean("is_deletable").default(true).notNull(), // Controla se o cargo pode ser excluído
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Permission categories table
export const permissionCategories = pgTable("permission_categories", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    displayName: varchar("display_name").notNull(),
    description: text("description"),
    isSystemCategory: boolean("is_system_category").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Permissions table
export const permissions = pgTable("permissions", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    displayName: varchar("display_name").notNull(),
    description: text("description"),
    categoryId: varchar("category_id").references(() => permissionCategories.id, { onDelete: 'cascade' }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Role permissions relationship
export const rolePermissions = pgTable("role_permissions", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    roleId: varchar("role_id").references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    permissionId: varchar("permission_id").references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("UQ_role_permission").on(table.roleId, table.permissionId),
]);
// Tabela de páginas do sistema para controle de acesso
export const pages = pgTable("pages", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // ex: 'units', 'staff', 'students'
    displayName: varchar("display_name").notNull(), // ex: 'Unidades', 'Colaboradores', 'Alunos'
    description: text("description"),
    route: varchar("route").notNull(), // ex: '/units', '/staff', '/students'
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Tabela de permissões de páginas por cargo
export const rolePagePermissions = pgTable("role_page_permissions", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    roleId: varchar("role_id").references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    pageId: varchar("page_id").references(() => pages.id, { onDelete: 'cascade' }).notNull(),
    canAccess: boolean("can_access").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("UQ_role_page_permission").on(table.roleId, table.pageId),
]);
// User permissions table - override de permissões por usuário
export const userPermissions = pgTable("user_permissions", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    permissionId: varchar("permission_id").references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
    isGranted: boolean("is_granted").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("UQ_user_permission").on(table.userId, table.permissionId),
]);
// ============================================================================
// ORGANIZATIONAL TABLES
// ============================================================================
// Units table - unidades/filiais
export const units = pgTable("units", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull(),
    address: text("address"),
    phone: varchar("phone"),
    email: varchar("email"),
    managerId: varchar("manager_id").references(() => users.id),
    // Dados do Franqueado
    franchiseeName: varchar("franchisee_name"),
    franchiseeCpf: varchar("franchisee_cpf"),
    franchiseeCpfDoc: varchar("franchisee_cpf_doc"),
    franchiseeRg: varchar("franchisee_rg"),
    franchiseeRgDoc: varchar("franchisee_rg_doc"),
    franchiseeResidenceAddress: text("franchisee_residence_address"),
    franchiseeResidenceDoc: varchar("franchisee_residence_doc"),
    franchiseeMaritalStatus: varchar("franchisee_marital_status"),
    franchiseeMaritalStatusDoc: varchar("franchisee_marital_status_doc"),
    franchiseeCurriculumDoc: varchar("franchisee_curriculum_doc"),
    franchiseeAssetsDoc: varchar("franchisee_assets_doc"),
    franchiseeIncomeDoc: varchar("franchisee_income_doc"),
    // Dados PJ
    franchiseeSocialContractDoc: varchar("franchisee_social_contract_doc"),
    franchiseeCnpj: varchar("franchisee_cnpj"),
    franchiseeCnpjDoc: varchar("franchisee_cnpj_doc"),
    franchiseeStateRegistration: varchar("franchisee_state_registration"),
    franchiseeStateRegistrationDoc: varchar("franchisee_state_registration_doc"),
    franchiseePartnersDocsDoc: varchar("franchisee_partners_docs_doc"),
    franchiseeCertificatesDoc: varchar("franchisee_certificates_doc"),
    // Dados Financeiros
    financialCapitalDoc: varchar("financial_capital_doc"),
    financialCashFlowDoc: varchar("financial_cash_flow_doc"),
    financialTaxReturnsDoc: varchar("financial_tax_returns_doc"),
    financialBankReferences: text("financial_bank_references"),
    financialBankReferencesDoc: varchar("financial_bank_references_doc"),
    // Dados Imobiliários
    realEstateLocation: text("real_estate_location"),
    realEstatePropertyDoc: varchar("real_estate_property_doc"),
    realEstateLeaseDoc: varchar("real_estate_lease_doc"),
    realEstateFloorPlanDoc: varchar("real_estate_floor_plan_doc"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Staff table - funcionários
export const staff = pgTable("staff", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    unitId: varchar("unit_id").references(() => units.id),
    // Informações pessoais
    cpf: varchar("cpf", { length: 14 }),
    birthDate: timestamp("birth_date"),
    gender: genderEnum("gender"),
    // Contatos
    phone: varchar("phone"),
    whatsapp: varchar("whatsapp"),
    // Endereço
    cep: varchar("cep", { length: 9 }),
    address: text("address"),
    number: varchar("number"),
    complement: varchar("complement"),
    neighborhood: varchar("neighborhood"),
    city: varchar("city"),
    state: varchar("state"),
    // Informações profissionais - position agora é varchar livre
    position: varchar("position"), // ex: "Professor de Inglês", "Coordenador", etc
    department: varchar("department"),
    hireDate: timestamp("hire_date"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Guardians table - responsáveis legais
export const guardians = pgTable("guardians", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    // Informações pessoais
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    cpf: varchar("cpf", { length: 14 }),
    birthDate: timestamp("birth_date"),
    gender: genderEnum("gender"),
    // Contatos
    email: varchar("email"),
    phone: varchar("phone"),
    whatsapp: varchar("whatsapp"),
    // Endereço
    cep: varchar("cep", { length: 9 }),
    address: text("address"),
    number: varchar("number"),
    complement: varchar("complement"),
    neighborhood: varchar("neighborhood"),
    city: varchar("city"),
    state: varchar("state"),
    // Relação com o aluno
    relationship: varchar("relationship"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Financial Responsibles table
export const financialResponsibles = pgTable("financial_responsibles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    guardianId: varchar("guardian_id").references(() => guardians.id, { onDelete: 'cascade' }).notNull(),
    // Informações pessoais
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    cpf: varchar("cpf", { length: 14 }),
    birthDate: timestamp("birth_date"),
    gender: genderEnum("gender"),
    // Contatos
    email: varchar("email"),
    phone: varchar("phone"),
    whatsapp: varchar("whatsapp"),
    // Endereço
    cep: varchar("cep", { length: 9 }),
    address: text("address"),
    number: varchar("number"),
    complement: varchar("complement"),
    neighborhood: varchar("neighborhood"),
    city: varchar("city"),
    state: varchar("state"),
    // Relação com o responsável legal
    relationship: varchar("relationship"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Students table
export const students = pgTable("students", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    studentId: varchar("student_id").unique(),
    unitId: varchar("unit_id").references(() => units.id),
    // Informações pessoais
    cpf: varchar("cpf", { length: 14 }),
    birthDate: timestamp("birth_date"),
    gender: genderEnum("gender"),
    // Contatos
    phone: varchar("phone"),
    whatsapp: varchar("whatsapp"),
    // Endereço
    cep: varchar("cep", { length: 9 }),
    address: text("address"),
    number: varchar("number"),
    complement: varchar("complement"),
    neighborhood: varchar("neighborhood"),
    city: varchar("city"),
    state: varchar("state"),
    // Informações de cobrança
    billingType: billingTypeEnum("billing_type"),
    // Responsável (se menor de idade)
    guardianId: varchar("guardian_id").references(() => guardians.id),
    enrollmentDate: timestamp("enrollment_date"),
    status: varchar("status").default('active').notNull(),
    emergencyContact: text("emergency_contact"),
    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// ============================================================================
// ACADEMIC TABLES
// ============================================================================
// Courses table
export const courses = pgTable("courses", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    language: varchar("language").notNull(),
    level: varchar("level").notNull(),
    duration: integer("duration"),
    price: integer("price"),
    teachingGuideUrl: varchar("teaching_guide_url"),
    teachingGuideType: varchar("teaching_guide_type"),
    suggestedWeeklyHours: varchar("suggested_weekly_hours"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Books table - livros dentro de cada curso
export const books = pgTable("books", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    courseId: varchar("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    pdfUrl: varchar("pdf_url"),
    color: varchar("color").notNull().default('#3b82f6'),
    displayOrder: integer("display_order").default(1).notNull(),
    totalDays: integer("total_days").default(30).notNull(),
    weeklyHours: varchar("weekly_hours"),
    hasConversation: boolean("has_conversation").default(false).notNull(),
    hasListening: boolean("has_listening").default(false).notNull(),
    hasCheckpoint: boolean("has_checkpoint").default(false).notNull(),
    hasReview: boolean("has_review").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Classes table (turmas)
export const classes = pgTable("classes", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
    teacherId: varchar("teacher_id").references(() => users.id).notNull(),
    unitId: varchar("unit_id").references(() => units.id).notNull(),
    name: varchar("name").notNull(),
    schedule: text("schedule"),
    dayOfWeek: integer("day_of_week"),
    startTime: varchar("start_time"),
    endTime: varchar("end_time"),
    room: varchar("room"),
    maxStudents: integer("max_students").default(15).notNull(),
    currentStudents: integer("current_students").default(0).notNull(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    currentDay: integer("current_day").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Class enrollments
export const classEnrollments = pgTable("class_enrollments", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    classId: varchar("class_id").references(() => classes.id, { onDelete: 'cascade' }).notNull(),
    studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }).notNull(),
    enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
    status: varchar("status").default('active').notNull(),
    finalGrade: varchar("final_grade"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Lessons table
export const lessons = pgTable("lessons", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    classId: varchar("class_id").references(() => classes.id, { onDelete: 'cascade' }).notNull(),
    title: varchar("title").notNull(),
    bookDay: integer("book_day").notNull(),
    date: timestamp("date").notNull(),
    startTime: varchar("start_time").notNull(),
    endTime: varchar("end_time").notNull(),
    room: varchar("room"),
    status: varchar("status").default('scheduled').notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Course Units table
export const courseUnits = pgTable("course_units", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    displayOrder: integer("display_order").notNull(),
    unitType: varchar("unit_type").default('lesson').notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Course Videos table
export const courseVideos = pgTable("course_videos", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    unitId: varchar("unit_id").references(() => courseUnits.id, { onDelete: 'cascade' }).notNull(),
    dayNumber: integer("day_number").notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    videoUrl: varchar("video_url").notNull(),
    thumbnailUrl: varchar("thumbnail_url"),
    duration: integer("duration"),
    hasSubtitles: boolean("has_subtitles").default(false).notNull(),
    subtitlesUrl: varchar("subtitles_url"),
    displayOrder: integer("display_order").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Course Activities table
export const courseActivities = pgTable("course_activities", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    videoId: varchar("video_id").references(() => courseVideos.id, { onDelete: 'cascade' }).notNull(),
    activityType: varchar("activity_type").notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    instruction: text("instruction"),
    content: text("content").notNull(),
    correctAnswer: text("correct_answer"),
    points: integer("points").default(10).notNull(),
    displayOrder: integer("display_order").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Course Workbooks table
export const courseWorkbooks = pgTable("course_workbooks", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    pdfUrl: varchar("pdf_url"),
    content: text("content"),
    displayOrder: integer("display_order").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Course Exams table
export const courseExams = pgTable("course_exams", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
    unitId: varchar("unit_id").references(() => courseUnits.id),
    title: varchar("title").notNull(),
    description: text("description"),
    examType: varchar("exam_type").notNull(),
    content: text("content").notNull(),
    totalPoints: integer("total_points").default(100).notNull(),
    passingScore: integer("passing_score").default(70).notNull(),
    timeLimit: integer("time_limit"),
    displayOrder: integer("display_order").notNull(),
    requiresTeacherReview: boolean("requires_teacher_review").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Student Progress table
export const studentProgress = pgTable("student_progress", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }).notNull(),
    videoId: varchar("video_id").references(() => courseVideos.id),
    activityId: varchar("activity_id").references(() => courseActivities.id),
    examId: varchar("exam_id").references(() => courseExams.id),
    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
    score: integer("score"),
    attempts: integer("attempts").default(0).notNull(),
    studentAnswer: text("student_answer"),
    teacherFeedback: text("teacher_feedback"),
    watchedDuration: integer("watched_duration"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Student Course Enrollments
export const studentCourseEnrollments = pgTable("student_course_enrollments", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }).notNull(),
    courseId: varchar("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
    enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
    currentBookId: varchar("current_book_id").references(() => books.id),
    currentUnitId: varchar("current_unit_id").references(() => courseUnits.id),
    status: varchar("status").default('active').notNull(),
    overallProgress: integer("overall_progress").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// ============================================================================
// SUPPORT & SETTINGS TABLES
// ============================================================================
// User Settings table
export const userSettings = pgTable("user_settings", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
    theme: varchar("theme").default('light').notNull(),
    language: varchar("language").default('pt-BR').notNull(),
    timezone: varchar("timezone").default('America/Sao_Paulo').notNull(),
    dateFormat: varchar("date_format").default('DD/MM/YYYY').notNull(),
    currency: varchar("currency").default('BRL').notNull(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    pushNotifications: boolean("push_notifications").default(false).notNull(),
    systemAlerts: boolean("system_alerts").default(true).notNull(),
    lessonReminders: boolean("lesson_reminders").default(true).notNull(),
    weeklyReports: boolean("weekly_reports").default(false).notNull(),
    autoSave: boolean("auto_save").default(true).notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    sessionTimeout: integer("session_timeout").default(30).notNull(),
    loginAlerts: boolean("login_alerts").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    title: varchar("title").notNull(),
    description: text("description").notNull(),
    category: varchar("category").notNull(),
    priority: ticketPriorityEnum("priority").default('medium').notNull(),
    status: ticketStatusEnum("status").default('open').notNull(),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    assignedTo: varchar("assigned_to").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Support ticket responses table
export const supportTicketResponses = pgTable("support_ticket_responses", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    ticketId: varchar("ticket_id").references(() => supportTickets.id, { onDelete: 'cascade' }).notNull(),
    message: text("message").notNull(),
    isFromSupport: boolean("is_from_support").default(false).notNull(),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Franchise Units Registration table - simplificado
export const franchiseUnits = pgTable("franchise_units", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(),
    // Dados básicos
    fullName: text("full_name"),
    cpf: varchar("cpf"),
    cnpj: varchar("cnpj"),
    // Documentos (JSON com URLs)
    documents: text("documents"), // JSON com todos os documentos
    // Status
    status: varchar("status").default('pending').notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// ============================================================================
// RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
    staff: one(staff, {
        fields: [users.id],
        references: [staff.userId],
    }),
    student: one(students, {
        fields: [users.id],
        references: [students.userId],
    }),
    userPermissions: many(userPermissions),
    userSettings: one(userSettings, {
        fields: [users.id],
        references: [userSettings.userId],
    }),
}));
export const rolesRelations = relations(roles, ({ many }) => ({
    users: many(users),
    rolePermissions: many(rolePermissions),
}));
export const permissionCategoriesRelations = relations(permissionCategories, ({ many }) => ({
    permissions: many(permissions),
}));
export const permissionsRelations = relations(permissions, ({ one, many }) => ({
    category: one(permissionCategories, {
        fields: [permissions.categoryId],
        references: [permissionCategories.id],
    }),
    rolePermissions: many(rolePermissions),
    userPermissions: many(userPermissions),
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
    guardian: one(guardians, {
        fields: [students.guardianId],
        references: [guardians.id],
    }),
    classEnrollments: many(classEnrollments),
    courseEnrollments: many(studentCourseEnrollments),
    progress: many(studentProgress),
}));
export const guardiansRelations = relations(guardians, ({ one, many }) => ({
    students: many(students),
    financialResponsible: one(financialResponsibles, {
        fields: [guardians.id],
        references: [financialResponsibles.guardianId],
    }),
}));
export const financialResponsiblesRelations = relations(financialResponsibles, ({ one }) => ({
    guardian: one(guardians, {
        fields: [financialResponsibles.guardianId],
        references: [guardians.id],
    }),
}));
export const coursesRelations = relations(courses, ({ many }) => ({
    books: many(books),
    studentEnrollments: many(studentCourseEnrollments),
}));
export const booksRelations = relations(books, ({ one, many }) => ({
    course: one(courses, {
        fields: [books.courseId],
        references: [courses.id],
    }),
    classes: many(classes),
    units: many(courseUnits),
    workbooks: many(courseWorkbooks),
    exams: many(courseExams),
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
export const courseUnitsRelations = relations(courseUnits, ({ one, many }) => ({
    book: one(books, {
        fields: [courseUnits.bookId],
        references: [books.id],
    }),
    videos: many(courseVideos),
    exams: many(courseExams),
}));
export const courseVideosRelations = relations(courseVideos, ({ one, many }) => ({
    unit: one(courseUnits, {
        fields: [courseVideos.unitId],
        references: [courseUnits.id],
    }),
    activities: many(courseActivities),
    progress: many(studentProgress),
}));
export const courseActivitiesRelations = relations(courseActivities, ({ one, many }) => ({
    video: one(courseVideos, {
        fields: [courseActivities.videoId],
        references: [courseVideos.id],
    }),
    progress: many(studentProgress),
}));
export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
    student: one(students, {
        fields: [studentProgress.studentId],
        references: [students.id],
    }),
    video: one(courseVideos, {
        fields: [studentProgress.videoId],
        references: [courseVideos.id],
    }),
    activity: one(courseActivities, {
        fields: [studentProgress.activityId],
        references: [courseActivities.id],
    }),
    exam: one(courseExams, {
        fields: [studentProgress.examId],
        references: [courseExams.id],
    }),
}));
export const studentCourseEnrollmentsRelations = relations(studentCourseEnrollments, ({ one }) => ({
    student: one(students, {
        fields: [studentCourseEnrollments.studentId],
        references: [students.id],
    }),
    course: one(courses, {
        fields: [studentCourseEnrollments.courseId],
        references: [courses.id],
    }),
    currentBook: one(books, {
        fields: [studentCourseEnrollments.currentBookId],
        references: [books.id],
    }),
    currentUnit: one(courseUnits, {
        fields: [studentCourseEnrollments.currentUnitId],
        references: [courseUnits.id],
    }),
}));
// ============================================================================
// SCHEMAS
// ============================================================================
// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertRoleSchema = createInsertSchema(roles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertPermissionCategorySchema = createInsertSchema(permissionCategories).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertPermissionSchema = createInsertSchema(permissions).omit({
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
export const insertPageSchema = createInsertSchema(pages).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertRolePagePermissionSchema = createInsertSchema(rolePagePermissions).omit({
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
export const insertGuardianSchema = createInsertSchema(guardians).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Permite que birthDate seja uma string ISO que será convertida para Date
    birthDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertFinancialResponsibleSchema = createInsertSchema(financialResponsibles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Permite que birthDate seja uma string ISO que será convertida para Date
    birthDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertStudentSchema = createInsertSchema(students).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Permite que birthDate seja uma string ISO que será convertida para Date
    birthDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertCourseSchema = createInsertSchema(courses).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertBookSchema = createInsertSchema(books).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertClassSchema = createInsertSchema(classes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertLessonSchema = createInsertSchema(lessons).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertCourseUnitSchema = createInsertSchema(courseUnits).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertCourseVideoSchema = createInsertSchema(courseVideos).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertCourseActivitySchema = createInsertSchema(courseActivities).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertCourseWorkbookSchema = createInsertSchema(courseWorkbooks).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertCourseExamSchema = createInsertSchema(courseExams).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertStudentProgressSchema = createInsertSchema(studentProgress).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertStudentCourseEnrollmentSchema = createInsertSchema(studentCourseEnrollments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertSupportTicketResponseSchema = createInsertSchema(supportTicketResponses).omit({
    id: true,
    createdAt: true,
});
export const insertFranchiseUnitSchema = createInsertSchema(franchiseUnits).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
