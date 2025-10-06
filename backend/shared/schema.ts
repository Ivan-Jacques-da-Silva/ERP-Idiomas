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

// Staff position enum - cargos disponíveis
export const staffPositionEnum = pgEnum('staff_position', [
  'ceo',
  'diretor',
  'financeiro',
  'administrativo',
  'coordenador',
  'instrutor',
  'recepcionista',
  'comercial',
  'marketing'
]);

// Staff gender enum
export const staffGenderEnum = pgEnum('staff_gender', ['masculino', 'feminino']);

// Student gender enum
export const studentGenderEnum = pgEnum('student_gender', ['masculino', 'feminino']);

// Billing type enum
export const billingTypeEnum = pgEnum('billing_type', ['mensalidade', 'trimestral', 'semestral', 'anual', 'avulso']);

// Support ticket priority and status enums
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);

// Franchisee type enum
export const franchiseeTypeEnum = pgEnum('franchisee_type', ['pessoa_fisica', 'pessoa_juridica']);

// User roles enum - simplificado para 4 roles fixos
export const userRoleEnum = pgEnum('user_role', [
  'admin',     // Administrativo - acesso total
  'secretary', // Secretario - acesso quase total
  'teacher',   // Professor - acesso limitado focado em ensino  
  'student'    // Aluno - apenas área do aluno
]);

// Permission categories table - for dynamic categories
export const permissionCategories = pgTable("permission_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // ex: "dashboard", "units", "custom_reports"
  displayName: varchar("display_name").notNull(), // ex: "Dashboard", "Unidades", "Relatórios Customizados"
  description: text("description"),
  isSystemCategory: boolean("is_system_category").default(false), // true for fixed categories
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table - todas as permissões disponíveis no sistema
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // ex: "access_units", "access_schedule"
  displayName: varchar("display_name").notNull(), // ex: "Acesso a Unidades", "Acesso a Agenda"
  description: text("description"),
  categoryId: varchar("category_id").references(() => permissionCategories.id, { onDelete: 'cascade' }).notNull(),
  category: varchar("category").notNull(), // Keep for backward compatibility, will be synced with categoryId
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roles table - mantido para compatibilidade, mas com foco nos 4 roles fixos
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // "admin", "secretary", "teacher", "student"
  displayName: varchar("display_name").notNull(), // "Administrativo", "Secretario", "Professor", "Aluno"
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(true), // todos os 4 roles são fixos do sistema
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions relationship - quais permissões cada role tem (para os 4 roles fixos)
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
  role: userRoleEnum("role").default('student'), // Sistema simplificado: apenas 4 roles fixos
  roleId: varchar("role_id").references(() => roles.id, { onDelete: 'set null' }), // referência para tabela roles
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
  
  // Tipo de franqueado
  franchiseeType: franchiseeTypeEnum("franchisee_type"),
  
  // Dados Franqueado - Pessoa Física
  franchiseeName: varchar("franchisee_name"),
  franchiseeCpf: varchar("franchisee_cpf"),
  franchiseeCpfDoc: varchar("franchisee_cpf_doc"), // URL do documento
  franchiseeRg: varchar("franchisee_rg"),
  franchiseeRgDoc: varchar("franchisee_rg_doc"), // URL do documento
  franchiseeResidenceAddress: text("franchisee_residence_address"),
  franchiseeResidenceDoc: varchar("franchisee_residence_doc"), // URL do comprovante
  franchiseeMaritalStatus: varchar("franchisee_marital_status"),
  franchiseeMaritalStatusDoc: varchar("franchisee_marital_status_doc"), // URL do documento
  franchiseeCurriculumDoc: varchar("franchisee_curriculum_doc"), // URL do currículo
  franchiseeAssetsDoc: varchar("franchisee_assets_doc"), // URL declaração de bens
  franchiseeIncomeDoc: varchar("franchisee_income_doc"), // URL comprovante de renda
  
  // Dados Franqueado - Pessoa Jurídica
  franchiseeSocialContractDoc: varchar("franchisee_social_contract_doc"), // URL contrato social
  franchiseeCnpj: varchar("franchisee_cnpj"),
  franchiseeCnpjDoc: varchar("franchisee_cnpj_doc"), // URL do documento
  franchiseeStateRegistration: varchar("franchisee_state_registration"),
  franchiseeStateRegistrationDoc: varchar("franchisee_state_registration_doc"), // URL do documento
  franchiseePartnersDocsDoc: varchar("franchisee_partners_docs_doc"), // URL docs dos sócios
  franchiseeCertificatesDoc: varchar("franchisee_certificates_doc"), // URL certidões negativas
  
  // Dados Financeiros
  financialCapitalDoc: varchar("financial_capital_doc"), // URL capital disponível
  financialCashFlowDoc: varchar("financial_cash_flow_doc"), // URL capacidade de giro
  financialTaxReturnsDoc: varchar("financial_tax_returns_doc"), // URL declaração IR
  financialBankReferences: text("financial_bank_references"), // Contatos
  financialBankReferencesDoc: varchar("financial_bank_references_doc"), // URL do documento
  
  // Dados Imobiliários
  realEstateLocation: varchar("real_estate_location"), // Link da localização
  realEstatePropertyDoc: varchar("real_estate_property_doc"), // URL docs do imóvel
  realEstateLeaseDoc: varchar("real_estate_lease_doc"), // URL contrato de locação
  realEstateFloorPlanDoc: varchar("real_estate_floor_plan_doc"), // URL planta baixa
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff table (extends users with additional info)
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  unitId: varchar("unit_id").references(() => units.id),
  
  // Informações pessoais
  cpf: varchar("cpf", { length: 14 }).unique(),
  birthDate: timestamp("birth_date"),
  gender: staffGenderEnum("gender"),
  
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
  
  // Informações profissionais
  position: staffPositionEnum("position"),
  department: varchar("department"),
  salary: integer("salary"),
  hireDate: timestamp("hire_date"),
  
  // Credenciais de acesso
  login: varchar("login").unique(),
  password: varchar("password"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guardians table - responsáveis/tutores legais para menores de idade
export const guardians = pgTable("guardians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Informações pessoais
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(),
  birthDate: timestamp("birth_date"),
  gender: studentGenderEnum("gender"),
  
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
  
  // Relação com o aluno
  relationship: varchar("relationship"), // pai, mãe, tutor, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Responsibles table - responsáveis financeiros/avalistas
export const financialResponsibles = pgTable("financial_responsibles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guardianId: varchar("guardian_id").references(() => guardians.id).notNull(),
  
  // Informações pessoais
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(),
  birthDate: timestamp("birth_date"),
  gender: studentGenderEnum("gender"),
  
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
  
  // Relação com o responsável legal
  relationship: varchar("relationship"), // cônjuge, familiar, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  studentId: varchar("student_id").unique(),
  unitId: varchar("unit_id").references(() => units.id),
  
  // Informações pessoais
  cpf: varchar("cpf", { length: 14 }).unique(),
  birthDate: timestamp("birth_date"),
  gender: studentGenderEnum("gender"),
  
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
  
  // Informações de cobrança
  billingType: billingTypeEnum("billing_type"),
  
  // Credenciais de acesso
  login: varchar("login").unique(),
  password: varchar("password"),
  
  // Responsável (se menor de idade)
  guardianId: varchar("guardian_id").references(() => guardians.id),
  
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

// Course Units table - Unidades dentro de cada book (cada unit tem 6 dias de vídeo)
export const courseUnits = pgTable("course_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name").notNull(), // Unit 01, Unit 02, etc
  description: text("description"),
  displayOrder: integer("display_order").notNull(), // ordem dentro do book
  unitType: varchar("unit_type").default('lesson'), // 'lesson', 'checkpoint', 'review', 'conversation'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Videos table - Vídeos para cada dia da unit (6 vídeos por unit)
export const courseVideos = pgTable("course_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").references(() => courseUnits.id, { onDelete: 'cascade' }).notNull(),
  dayNumber: integer("day_number").notNull(), // 1 a 6
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(), // URL do vídeo
  thumbnailUrl: varchar("thumbnail_url"), // URL da thumbnail
  duration: integer("duration"), // duração em segundos
  hasSubtitles: boolean("has_subtitles").default(false),
  subtitlesUrl: varchar("subtitles_url"), // URL do arquivo de legendas
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Activities table - Atividades para cada dia
export const courseActivities = pgTable("course_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => courseVideos.id, { onDelete: 'cascade' }).notNull(),
  activityType: varchar("activity_type").notNull(), // 'multiple_choice', 'fill_blank', 'speaking', 'listening', 'writing', 'unscramble'
  title: varchar("title").notNull(),
  description: text("description"),
  instruction: text("instruction"), // Instrução específica da atividade
  content: text("content").notNull(), // JSON com o conteúdo da atividade
  correctAnswer: text("correct_answer"), // JSON com a resposta correta
  points: integer("points").default(10),
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Workbooks table - Material de apoio/workbooks
export const courseWorkbooks = pgTable("course_workbooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  pdfUrl: varchar("pdf_url"), // URL do PDF do workbook
  content: text("content"), // Conteúdo em texto/JSON se não for PDF
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Exams table - Provas e checkpoints
export const courseExams = pgTable("course_exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
  unitId: varchar("unit_id").references(() => courseUnits.id), // pode ser associado a uma unit específica
  title: varchar("title").notNull(),
  description: text("description"),
  examType: varchar("exam_type").notNull(), // 'checkpoint', 'final', 'review'
  content: text("content").notNull(), // JSON com as questões
  totalPoints: integer("total_points").default(100),
  passingScore: integer("passing_score").default(70), // nota mínima para passar
  timeLimit: integer("time_limit"), // tempo limite em minutos
  displayOrder: integer("display_order").notNull(),
  requiresTeacherReview: boolean("requires_teacher_review").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student Progress table - Progresso do aluno por vídeo/atividade
export const studentProgress = pgTable("student_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar("video_id").references(() => courseVideos.id),
  activityId: varchar("activity_id").references(() => courseActivities.id),
  examId: varchar("exam_id").references(() => courseExams.id),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  score: integer("score"), // pontuação obtida
  attempts: integer("attempts").default(0),
  studentAnswer: text("student_answer"), // JSON com a resposta do aluno
  teacherFeedback: text("teacher_feedback"),
  watchedDuration: integer("watched_duration"), // para vídeos, tempo assistido em segundos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student Course Enrollments - Matrícula do aluno em cursos específicos
export const studentCourseEnrollments = pgTable("student_course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }).notNull(),
  courseId: varchar("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  currentBookId: varchar("current_book_id").references(() => books.id), // book atual do aluno
  currentUnitId: varchar("current_unit_id").references(() => courseUnits.id), // unit atual do aluno
  status: varchar("status").default('active'), // 'active', 'completed', 'paused'
  overallProgress: integer("overall_progress").default(0), // 0-100
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

// Relations - restauradas para manter compatibilidade
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
  studentProgress: many(studentProgress),
}));

export const courseActivitiesRelations = relations(courseActivities, ({ one, many }) => ({
  video: one(courseVideos, {
    fields: [courseActivities.videoId],
    references: [courseVideos.id],
  }),
  studentProgress: many(studentProgress),
}));

export const courseWorkbooksRelations = relations(courseWorkbooks, ({ one }) => ({
  book: one(books, {
    fields: [courseWorkbooks.bookId],
    references: [books.id],
  }),
}));

export const courseExamsRelations = relations(courseExams, ({ one, many }) => ({
  book: one(books, {
    fields: [courseExams.bookId],
    references: [books.id],
  }),
  unit: one(courseUnits, {
    fields: [courseExams.unitId],
    references: [courseUnits.id],
  }),
  studentProgress: many(studentProgress),
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

export const insertGuardianSchema = createInsertSchema(guardians).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialResponsibleSchema = createInsertSchema(financialResponsibles).omit({
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
export type InsertGuardian = z.infer<typeof insertGuardianSchema>;
export type InsertFinancialResponsible = z.infer<typeof insertFinancialResponsibleSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertCourseUnit = z.infer<typeof insertCourseUnitSchema>;
export type InsertCourseVideo = z.infer<typeof insertCourseVideoSchema>;
export type InsertCourseActivity = z.infer<typeof insertCourseActivitySchema>;
export type InsertCourseWorkbook = z.infer<typeof insertCourseWorkbookSchema>;
export type InsertCourseExam = z.infer<typeof insertCourseExamSchema>;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type InsertStudentCourseEnrollment = z.infer<typeof insertStudentCourseEnrollmentSchema>;
export type InsertPermissionCategory = z.infer<typeof insertPermissionCategorySchema>;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

export type Unit = typeof units.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Guardian = typeof guardians.$inferSelect;
export type FinancialResponsible = typeof financialResponsibles.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Book = typeof books.$inferSelect;
export type CourseUnit = typeof courseUnits.$inferSelect;
export type CourseVideo = typeof courseVideos.$inferSelect;
export type CourseActivity = typeof courseActivities.$inferSelect;
export type CourseWorkbook = typeof courseWorkbooks.$inferSelect;
export type CourseExam = typeof courseExams.$inferSelect;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type StudentCourseEnrollment = typeof studentCourseEnrollments.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type PermissionCategory = typeof permissionCategories.$inferSelect;
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
export type StudentWithGuardian = Student & { 
  user: User;
  guardian: Guardian & { financialResponsible?: FinancialResponsible } | null;
};
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

// Tipos estendidos para área do aluno
export type CourseUnitWithVideos = CourseUnit & {
  videos: (CourseVideo & {
    activities: CourseActivity[];
  })[];
};

export type BookWithUnits = Book & {
  course: Course;
  units: CourseUnitWithVideos[];
  workbooks: CourseWorkbook[];
  exams: CourseExam[];
};

export type StudentCourseEnrollmentWithDetails = StudentCourseEnrollment & {
  course: Course & {
    books: BookWithUnits[];
  };
  currentBook?: Book;
  currentUnit?: CourseUnit;
};

export type VideoWithProgress = CourseVideo & {
  activities: CourseActivity[];
  progress?: StudentProgress;
};

// Tipos para sistema de permissões
export type RoleWithPermissions = Role & {
  rolePermissions: (RolePermission & { permission: Permission })[];
};

export type PermissionsByCategory = Record<string, Permission[]>;

// User Settings table
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  theme: varchar("theme").default('light'), // 'light' | 'dark'
  language: varchar("language").default('pt-BR'),
  timezone: varchar("timezone").default('America/Sao_Paulo'),
  dateFormat: varchar("date_format").default('DD/MM/YYYY'),
  currency: varchar("currency").default('BRL'),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(false),
  systemAlerts: boolean("system_alerts").default(true),
  lessonReminders: boolean("lesson_reminders").default(true),
  weeklyReports: boolean("weekly_reports").default(false),
  autoSave: boolean("auto_save").default(true),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  sessionTimeout: integer("session_timeout").default(30), // minutes
  loginAlerts: boolean("login_alerts").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  priority: ticketPriorityEnum("priority").default('medium'),
  status: ticketStatusEnum("status").default('open'),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support ticket responses table
export const supportTicketResponses = pgTable("support_ticket_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => supportTickets.id, { onDelete: 'cascade' }).notNull(),
  message: text("message").notNull(),
  isFromSupport: boolean("is_from_support").default(false),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Franchise Units Registration table
export const franchiseUnits = pgTable("franchise_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Tipo de cadastro
  entityType: varchar("entity_type").notNull(), // "pessoa_fisica" ou "pessoa_juridica"
  
  // Dados Pessoa Física
  fullName: text("full_name"),
  cpfNumber: varchar("cpf_number"),
  cpfDocument: text("cpf_document"),
  rgNumber: varchar("rg_number"),
  rgDocument: text("rg_document"),
  addressProof: text("address_proof"),
  addressProofDocument: text("address_proof_document"),
  maritalStatus: text("marital_status"),
  maritalStatusDocument: text("marital_status_document"),
  resumeDocument: text("resume_document"),
  assetDeclarationDocument: text("asset_declaration_document"),
  incomeProofDocument: text("income_proof_document"),
  
  // Dados Pessoa Jurídica
  socialContractDocument: text("social_contract_document"),
  cnpjNumber: varchar("cnpj_number"),
  cnpjDocument: text("cnpj_document"),
  stateRegistrationNumber: varchar("state_registration_number"),
  stateRegistrationDocument: text("state_registration_document"),
  partnersDocuments: text("partners_documents"),
  partnersDocumentsNumber: varchar("partners_documents_number"),
  negativeCertificatesDocument: text("negative_certificates_document"),
  
  // Dados Financeiros
  initialCapitalDocument: text("initial_capital_document"),
  cashFlowProofDocument: text("cash_flow_proof_document"),
  taxReturnDocument: text("tax_return_document"),
  bankReferencesContacts: text("bank_references_contacts"),
  bankReferencesDocument: text("bank_references_document"),
  
  // Dados Imobiliários
  desiredLocation: text("desired_location"),
  propertyDocuments: text("property_documents"),
  leaseContractDocument: text("lease_contract_document"),
  floorPlanDocument: text("floor_plan_document"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  assignedTo: true,
  status: true,
});

export const insertSupportTicketResponseSchema = createInsertSchema(supportTicketResponses).omit({
  id: true,
  createdAt: true,
  ticketId: true,
  userId: true,
});

export const insertFranchiseUnitSchema = createInsertSchema(franchiseUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicketResponse = z.infer<typeof insertSupportTicketResponseSchema>;
export type SupportTicketResponse = typeof supportTicketResponses.$inferSelect;
export type InsertFranchiseUnit = z.infer<typeof insertFranchiseUnitSchema>;
export type FranchiseUnit = typeof franchiseUnits.$inferSelect;

// Extended types with relations
export type SupportTicketWithResponses = SupportTicket & {
  responses: SupportTicketResponse[];
  user: User;
  assignedUser?: User;
};
