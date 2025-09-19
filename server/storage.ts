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
  Unit,
  Staff,
  Student,
  Course,
  Class,
  Lesson,
  Book,
  User,
  UpsertUser,
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
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Demo data in memory - no database needed
let demoUnits: Unit[] = [{
  id: '1',
  name: 'Unidade Centro',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 3456-7890',
  email: 'centro@edumanage.com',
  managerId: null,
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: '2',
  name: 'Unidade Vila Nova',
  address: 'Av. Principal, 456 - Vila Nova',
  phone: '(11) 3456-7891',
  email: 'vilanova@edumanage.com',
  managerId: null,
  isActive: true,
  createdAt: new Date('2024-02-10'),
  updatedAt: new Date('2024-02-10'),
}, ];

let demoUsers: User[] = [{
  id: '1', // Admin demo user
  email: 'admin@demo.com',
  firstName: 'Admin',
  lastName: 'Sistema',
  profileImageUrl: null,
  role: 'admin',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}, {
  id: 'user-1',
  email: 'joao@edumanage.com',
  firstName: 'João',
  lastName: 'Silva',
  profileImageUrl: null,
  role: 'teacher',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
}, {
  id: 'user-2',
  email: 'maria@edumanage.com',
  firstName: 'Maria',
  lastName: 'Santos',
  profileImageUrl: null,
  role: 'teacher',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-22'),
  updatedAt: new Date('2024-01-22'),
}, {
  id: 'user-3',
  email: 'carlos@edumanage.com',
  firstName: 'Carlos',
  lastName: 'Oliveira',
  profileImageUrl: null,
  role: 'secretary',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, {
  id: 'user-7',
  email: 'ana.teacher@edumanage.com',
  firstName: 'Ana',
  lastName: 'Costa',
  profileImageUrl: null,
  role: 'teacher',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: 'user-8',
  email: 'felipe@edumanage.com',
  firstName: 'Felipe',
  lastName: 'Rodrigues',
  profileImageUrl: null,
  role: 'teacher',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
}, {
  id: 'user-9',
  email: 'patricia@edumanage.com',
  firstName: 'Patricia',
  lastName: 'Lima',
  profileImageUrl: null,
  role: 'teacher',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-18'),
  updatedAt: new Date('2024-01-18'),
}, {
  id: 'user-4',
  email: 'ana@email.com',
  firstName: 'Ana',
  lastName: 'Aluno',
  profileImageUrl: null,
  role: 'student',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: 'user-5',
  email: 'pedro@email.com',
  firstName: 'Pedro',
  lastName: 'Fernandes',
  profileImageUrl: null,
  role: 'student',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, {
  id: 'user-6',
  email: 'lucia@email.com',
  firstName: 'Lucia',
  lastName: 'Martins',
  profileImageUrl: null,
  role: 'student',
  roleId: null,
  isActive: true,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
}];

let demoStaff: Staff[] = [{
  id: '1',
  userId: 'user-1',
  unitId: '1',
  employeeId: 'EMP001',
  position: 'Professor de Inglês',
  department: 'Ensino',
  salary: 5000,
  hireDate: new Date('2024-01-20'),
  isActive: true,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
}, {
  id: '2',
  userId: 'user-2',
  unitId: '1',
  employeeId: 'EMP002',
  position: 'Professor de Espanhol',
  department: 'Ensino',
  salary: 4800,
  hireDate: new Date('2024-01-22'),
  isActive: true,
  createdAt: new Date('2024-01-22'),
  updatedAt: new Date('2024-01-22'),
}, {
  id: '3',
  userId: 'user-3',
  unitId: '2',
  employeeId: 'EMP003',
  position: 'Secretário',
  department: 'Administrativo',
  salary: 3000,
  hireDate: new Date('2024-02-01'),
  isActive: true,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, {
  id: '4',
  userId: 'user-7',
  unitId: '1',
  employeeId: 'EMP004',
  position: 'Professor de Inglês',
  department: 'Ensino',
  salary: 5200,
  hireDate: new Date('2024-01-15'),
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: '5',
  userId: 'user-8',
  unitId: '2',
  employeeId: 'EMP005',
  position: 'Professor de Inglês',
  department: 'Ensino',
  salary: 4900,
  hireDate: new Date('2024-02-05'),
  isActive: true,
  createdAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
}, {
  id: '6',
  userId: 'user-9',
  unitId: '1',
  employeeId: 'EMP006',
  position: 'Professor de Espanhol',
  department: 'Ensino',
  salary: 4700,
  hireDate: new Date('2024-01-18'),
  isActive: true,
  createdAt: new Date('2024-01-18'),
  updatedAt: new Date('2024-01-18'),
}, ];

let demoStudents: Student[] = [{
  id: '1',
  userId: 'user-4',
  unitId: '1',
  studentId: 'STU001',
  enrollmentDate: new Date('2024-01-15'),
  status: 'active',
  emergencyContact: '(11) 98888-1111 - Contato de emergência',
  notes: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: '2',
  userId: 'user-5',
  unitId: '1',
  studentId: 'STU002',
  enrollmentDate: new Date('2024-02-01'),
  status: 'active',
  emergencyContact: '(11) 98888-2222 - Contato de emergência',
  notes: null,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, {
  id: '3',
  userId: 'user-6',
  unitId: '2',
  studentId: 'STU003',
  enrollmentDate: new Date('2024-01-20'),
  status: 'active',
  emergencyContact: '(11) 98888-3333 - Contato de emergência',
  notes: null,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
}, ];

let demoCourses: Course[] = [{
  id: '1',
  name: 'Inglês Básico',
  description: 'Curso de inglês para iniciantes',
  language: 'English',
  level: 'Básico',
  duration: 120,
  price: 299,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '2',
  name: 'Inglês Intermediário',
  description: 'Curso de inglês para nível intermediário',
  language: 'English',
  level: 'Intermediário',
  duration: 150,
  price: 399,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '3',
  name: 'Espanhol Básico',
  description: 'Curso de espanhol para iniciantes',
  language: 'Spanish',
  level: 'Básico',
  duration: 100,
  price: 259,
  isActive: true,
  createdAt: new Date('2024-01-12'),
  updatedAt: new Date('2024-01-12'),
}, ];

let demoBooks: Book[] = [{
  id: '1',
  courseId: '1',
  name: 'English Basic - Book 1',
  description: 'Livro básico de inglês para iniciantes',
  pdfUrl: '/books/english-basic-1.pdf',
  color: '#3b82f6', // Azul claro
  displayOrder: 1,
  totalDays: 30,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '2',
  courseId: '1',
  name: 'English Basic - Book 2',
  description: 'Segundo livro básico de inglês',
  pdfUrl: '/books/english-basic-2.pdf',
  color: '#1d4ed8', // Azul mais escuro
  displayOrder: 2,
  totalDays: 35,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '3',
  courseId: '2',
  name: 'English Intermediate - Book 1',
  description: 'Livro de inglês intermediário',
  pdfUrl: '/books/english-intermediate-1.pdf',
  color: '#10b981', // Verde
  displayOrder: 1,
  totalDays: 40,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '4',
  courseId: '2',
  name: 'English Intermediate - Book 2',
  description: 'Segundo livro de inglês intermediário',
  pdfUrl: '/books/english-intermediate-2.pdf',
  color: '#059669', // Verde mais escuro
  displayOrder: 2,
  totalDays: 42,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '5',
  courseId: '3',
  name: 'Español Básico - Libro 1',
  description: 'Livro básico de espanhol',
  pdfUrl: '/books/spanish-basic-1.pdf',
  color: '#f59e0b', // Laranja
  displayOrder: 1,
  totalDays: 25,
  isActive: true,
  createdAt: new Date('2024-01-12'),
  updatedAt: new Date('2024-01-12'),
}, {
  id: '6',
  courseId: '3',
  name: 'Español Básico - Libro 2',
  description: 'Segundo livro básico de espanhol',
  pdfUrl: '/books/spanish-basic-2.pdf',
  color: '#d97706', // Laranja mais escuro
  displayOrder: 2,
  totalDays: 28,
  isActive: true,
  createdAt: new Date('2024-01-12'),
  updatedAt: new Date('2024-01-12'),
}, {
  id: '7',
  courseId: '1',
  name: 'English Basic - Book 3',
  description: 'Terceiro livro básico de inglês',
  pdfUrl: '/books/english-basic-3.pdf',
  color: '#1e40af', // Azul ainda mais escuro
  displayOrder: 3,
  totalDays: 40,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '8',
  courseId: '2',
  name: 'English Advanced - Book 1',
  description: 'Livro avançado de inglês',
  pdfUrl: '/books/english-advanced-1.pdf',
  color: '#8b5cf6', // Roxo
  displayOrder: 1,
  totalDays: 45,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}];

let demoClasses: Class[] = [{
  id: '1',
  bookId: '1',
  teacherId: 'user-1',
  unitId: '1',
  name: 'Turma Inglês A1 - Manhã',
  schedule: 'Segunda e Quarta 09:00-11:00',
  dayOfWeek: 1, // Monday
  startTime: '09:00',
  endTime: '11:00',
  room: 'Sala 101',
  maxStudents: 15,
  currentStudents: 12,
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-05-30'),
  currentDay: 5,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, {
  id: '2',
  bookId: '2',
  teacherId: 'user-1',
  unitId: '1',
  name: 'Turma Inglês A2 - Tarde',
  schedule: 'Segunda e Quarta 14:00-16:00',
  dayOfWeek: 1, // Monday
  startTime: '14:00',
  endTime: '16:00',
  room: 'Sala 102',
  maxStudents: 15,
  currentStudents: 10,
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-05-30'),
  currentDay: 8,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, {
  id: '3',
  bookId: '3',
  teacherId: 'user-2',
  unitId: '1',
  name: 'Turma Inglês B1 - Noite',
  schedule: 'Segunda e Quarta 19:00-21:00',
  dayOfWeek: 1, // Monday
  startTime: '19:00',
  endTime: '21:00',
  room: 'Sala 103',
  maxStudents: 12,
  currentStudents: 8,
  startDate: new Date('2024-02-15'),
  endDate: new Date('2024-06-15'),
  currentDay: 3,
  isActive: true,
  createdAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
}, {
  id: '4',
  bookId: '5',
  teacherId: 'user-2',
  unitId: '1',
  name: 'Turma Espanhol A1',
  schedule: 'Terça e Quinta 18:00-20:00',
  dayOfWeek: 2, // Tuesday
  startTime: '18:00',
  endTime: '20:00',
  room: 'Sala 201',
  maxStudents: 12,
  currentStudents: 9,
  startDate: new Date('2024-02-15'),
  endDate: new Date('2024-06-15'),
  currentDay: 4,
  isActive: true,
  createdAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
}, {
  id: '5',
  bookId: '4',
  teacherId: 'user-7',
  unitId: '1',
  name: 'Turma Inglês B2 - Manhã',
  schedule: 'Terça e Quinta 10:00-12:00',
  dayOfWeek: 2, // Tuesday
  startTime: '10:00',
  endTime: '12:00',
  room: 'Sala 104',
  maxStudents: 15,
  currentStudents: 13,
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-05-30'),
  currentDay: 12,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, {
  id: '6',
  bookId: '7',
  teacherId: 'user-7',
  unitId: '1',
  name: 'Turma Inglês A3 - Tarde',
  schedule: 'Quarta e Sexta 15:00-17:00',
  dayOfWeek: 3, // Wednesday
  startTime: '15:00',
  endTime: '17:00',
  room: 'Sala 105',
  maxStudents: 15,
  currentStudents: 11,
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-05-30'),
  currentDay: 18,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, {
  id: '7',
  bookId: '8',
  teacherId: 'user-8',
  unitId: '2',
  name: 'Turma Inglês Avançado',
  schedule: 'Quinta e Sexta 19:00-21:00',
  dayOfWeek: 4, // Thursday
  startTime: '19:00',
  endTime: '21:00',
  room: 'Sala 301',
  maxStudents: 10,
  currentStudents: 7,
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-05-30'),
  currentDay: 22,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, {
  id: '8',
  bookId: '6',
  teacherId: 'user-9',
  unitId: '1',
  name: 'Turma Espanhol A2',
  schedule: 'Sexta 16:00-18:00',
  dayOfWeek: 5, // Friday
  startTime: '16:00',
  endTime: '18:00',
  room: 'Sala 202',
  maxStudents: 12,
  currentStudents: 10,
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-05-30'),
  currentDay: 15,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, ];

let demoLessons: Lesson[] = [{
  id: '1',
  classId: '1',
  title: 'Present Simple Tense',
  bookDay: 5,
  date: new Date('2024-02-26'),
  startTime: '19:00',
  endTime: '21:00',
  room: 'Sala 101',
  status: 'completed',
  notes: 'Aula sobre tempo presente simples',
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-02-26'),
}, {
  id: '2',
  classId: '1',
  title: 'Present Continuous',
  bookDay: 6,
  date: new Date('2024-02-28'),
  startTime: '19:00',
  endTime: '21:00',
  room: 'Sala 101',
  status: 'scheduled',
  notes: 'Aula sobre presente contínuo',
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-02-20'),
}, {
  id: '3',
  classId: '2',
  title: 'Verbos Irregulares',
  bookDay: 3,
  date: new Date('2024-02-27'),
  startTime: '18:00',
  endTime: '20:00',
  room: 'Sala 102',
  status: 'completed',
  notes: 'Conjugação de verbos irregulares',
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-02-27'),
}, ];

// Permission categories demo data - categorias fixas do sistema + possibilidade de adicionar novas
let demoPermissionCategories: PermissionCategory[] = [
  { id: 'cat-1', name: 'dashboard', displayName: 'Dashboard', description: 'Categoria para permissões do dashboard', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', name: 'units', displayName: 'Unidades', description: 'Categoria para permissões de unidades', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-3', name: 'staff', displayName: 'Colaboradores', description: 'Categoria para permissões de colaboradores', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-4', name: 'students', displayName: 'Alunos', description: 'Categoria para permissões de alunos', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-5', name: 'courses', displayName: 'Cursos', description: 'Categoria para permissões de cursos', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-6', name: 'schedule', displayName: 'Agenda', description: 'Categoria para permissões de agenda', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-7', name: 'system', displayName: 'Sistema', description: 'Categoria para permissões do sistema', isSystemCategory: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// Permissions demo data - baseado nas páginas do menu
let demoPermissions: Permission[] = [
  // Páginas principais do menu
  { id: '1', name: 'access_dashboard', displayName: 'Dashboard', description: 'Acesso à página Dashboard', categoryId: 'cat-1', category: 'dashboard', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'access_units', displayName: 'Unidades', description: 'Acesso à página de Unidades', categoryId: 'cat-2', category: 'units', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'access_staff', displayName: 'Colaboradores', description: 'Acesso à página de Colaboradores', categoryId: 'cat-3', category: 'staff', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'access_students', displayName: 'Alunos', description: 'Acesso à página de Alunos', categoryId: 'cat-4', category: 'students', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'access_courses', displayName: 'Cursos', description: 'Acesso à página de Cursos', categoryId: 'cat-5', category: 'courses', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'access_schedule', displayName: 'Agenda', description: 'Acesso à página de Agenda', categoryId: 'cat-6', category: 'schedule', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '8', name: 'access_student_area', displayName: 'Área do Aluno', description: 'Acesso à Área do Aluno', categoryId: 'cat-4', category: 'students', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '9', name: 'access_settings', displayName: 'Configurações', description: 'Acesso às Configurações do sistema', categoryId: 'cat-7', category: 'system', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '10', name: 'access_permissions', displayName: 'Permissões', description: 'Acesso ao gerenciamento de Permissões', categoryId: 'cat-7', category: 'system', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// Roles demo data - roles fixos conforme solicitado
let demoRoles: Role[] = [
  { id: '1', name: 'admin', displayName: 'Administrativo', description: 'Acesso total ao sistema', isSystemRole: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'teacher', displayName: 'Professor', description: 'Acesso a turmas e agenda', isSystemRole: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'secretary', displayName: 'Secretaria', description: 'Gestão de alunos e unidades', isSystemRole: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'student', displayName: 'Aluno', description: 'Acesso à área do aluno', isSystemRole: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// Role permissions demo data
let demoRolePermissions: RolePermission[] = [
  // Admin - acesso total
  { id: '1', roleId: '1', permissionId: '1', createdAt: new Date() }, // Dashboard
  { id: '2', roleId: '1', permissionId: '2', createdAt: new Date() }, // Unidades
  { id: '3', roleId: '1', permissionId: '3', createdAt: new Date() }, // Colaboradores
  { id: '4', roleId: '1', permissionId: '4', createdAt: new Date() }, // Alunos
  { id: '5', roleId: '1', permissionId: '5', createdAt: new Date() }, // Cursos
  { id: '6', roleId: '1', permissionId: '6', createdAt: new Date() }, // Agenda
  { id: '8', roleId: '1', permissionId: '8', createdAt: new Date() }, // Área do Aluno
  { id: '9', roleId: '1', permissionId: '9', createdAt: new Date() }, // Configurações

  // Teacher - acesso limitado
  { id: '10', roleId: '2', permissionId: '1', createdAt: new Date() }, // Dashboard
  { id: '11', roleId: '2', permissionId: '4', createdAt: new Date() }, // Alunos
  { id: '12', roleId: '2', permissionId: '5', createdAt: new Date() }, // Cursos
  { id: '13', roleId: '2', permissionId: '6', createdAt: new Date() }, // Agenda

  // Secretary - gestão de alunos e unidades
  { id: '14', roleId: '3', permissionId: '1', createdAt: new Date() }, // Dashboard
  { id: '15', roleId: '3', permissionId: '2', createdAt: new Date() }, // Unidades
  { id: '16', roleId: '3', permissionId: '4', createdAt: new Date() }, // Alunos
  { id: '17', roleId: '3', permissionId: '5', createdAt: new Date() }, // Cursos
  { id: '18', roleId: '3', permissionId: '6', createdAt: new Date() }, // Agenda

  // Student - área do aluno apenas
  { id: '19', roleId: '4', permissionId: '8', createdAt: new Date() }, // Área do Aluno

  // Financial - financeiro e relatórios
  { id: '20', roleId: '5', permissionId: '1', createdAt: new Date() }, // Dashboard
  { id: '21', roleId: '5', permissionId: '7', createdAt: new Date() }, // Financeiro

  // Developer - acesso total (igual admin)
  { id: '22', roleId: '6', permissionId: '1', createdAt: new Date() }, // Dashboard
  { id: '23', roleId: '6', permissionId: '2', createdAt: new Date() }, // Unidades
  { id: '24', roleId: '6', permissionId: '3', createdAt: new Date() }, // Colaboradores
  { id: '25', roleId: '6', permissionId: '4', createdAt: new Date() }, // Alunos
  { id: '26', roleId: '6', permissionId: '5', createdAt: new Date() }, // Cursos
  { id: '27', roleId: '6', permissionId: '6', createdAt: new Date() }, // Agenda
  { id: '28', roleId: '6', permissionId: '7', createdAt: new Date() }, // Financeiro
  { id: '29', roleId: '6', permissionId: '8', createdAt: new Date() }, // Área do Aluno
  { id: '30', roleId: '6', permissionId: '9', createdAt: new Date() }, // Configurações
];

// User permissions demo data - permissões individuais por usuário (inicialmente vazio)
let demoUserPermissions: UserPermission[] = [];

// User permissions demo data - permissões individuais de usuário

// User settings demo data
let demoUserSettings: UserSettings[] = [];

// Support tickets demo data
let demoSupportTickets: SupportTicket[] = [];

// Support ticket responses demo data
let demoSupportTicketResponses: SupportTicketResponse[] = [];

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise < User | undefined > ;
  upsertUser(user: UpsertUser): Promise < User > ;

  // Units
  getUnits(): Promise < Unit[] > ;
  getUnit(id: string): Promise < Unit | undefined > ;
  createUnit(unit: InsertUnit): Promise < Unit > ;
  updateUnit(id: string, unit: Partial < InsertUnit > ): Promise < Unit > ;
  deleteUnit(id: string): Promise < void > ;

  // Books
  getBooks(): Promise < Book[] > ;
  getBook(id: string): Promise < Book | undefined > ;
  createBook(book: InsertBook): Promise < Book > ;
  updateBook(id: string, book: Partial < InsertBook > ): Promise < Book > ;
  deleteBook(id: string): Promise < void > ;

  // Staff
  getStaff(): Promise < StaffWithUser[] > ;
  getStaffMember(id: string): Promise < StaffWithUser | undefined > ;
  createStaff(staff: InsertStaff): Promise < Staff > ;
  updateStaff(id: string, staff: Partial < InsertStaff > ): Promise < Staff > ;
  deleteStaff(id: string): Promise < void > ;

  // Students
  getStudents(): Promise < StudentWithUser[] > ;
  getStudent(id: string): Promise < StudentWithUser | undefined > ;
  createStudent(student: InsertStudent): Promise < Student > ;
  updateStudent(id: string, student: Partial < InsertStudent > ): Promise < Student > ;
  deleteStudent(id: string): Promise < void > ;

  // Courses
  getCourses(): Promise < Course[] > ;
  getCourse(id: string): Promise < Course | undefined > ;
  createCourse(course: InsertCourse): Promise < Course > ;
  updateCourse(id: string, course: Partial < InsertCourse > ): Promise < Course > ;
  deleteCourse(id: string): Promise < void > ;

  // Classes
  getClasses(): Promise < ClassWithDetails[] > ;
  getClass(id: string): Promise < ClassWithDetails | undefined > ;
  getClassesByTeacher(teacherId: string): Promise < ClassWithDetails[] > ;
  createClass(classData: InsertClass): Promise < Class > ;
  updateClass(id: string, classData: Partial < InsertClass > ): Promise < Class > ;
  deleteClass(id: string): Promise < void > ;

  // Lessons/Schedule
  getLessons(): Promise < Lesson[] > ;
  getLesson(id: string): Promise < Lesson | undefined > ;
  getLessonsByClass(classId: string): Promise < Lesson[] > ;
  getLessonsByTeacher(teacherId: string): Promise < Lesson[] > ;
  getTodaysLessons(): Promise < Lesson[] > ;
  createLesson(lesson: InsertLesson): Promise < Lesson > ;
  updateLesson(id: string, lesson: Partial < InsertLesson > ): Promise < Lesson > ;
  deleteLesson(id: string): Promise < void > ;
  checkLessonConflicts(teacherId: string, date: Date, startTime: string, endTime: string, excludeLessonId?: string): Promise<{ hasConflict: boolean; conflictingLesson?: Lesson }>;

  // Dashboard stats
  getDashboardStats(): Promise < {
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  } > ;

  // Permission Categories
  getPermissionCategories(): Promise<PermissionCategory[]>;
  getPermissionCategory(id: string): Promise<PermissionCategory | undefined>;
  createPermissionCategory(category: InsertPermissionCategory): Promise<PermissionCategory>;
  updatePermissionCategory(id: string, category: Partial<InsertPermissionCategory>): Promise<PermissionCategory>;
  deletePermissionCategory(id: string): Promise<void>;

  // Permissions
  getPermissions(): Promise<Permission[]>;
  getPermission(id: string): Promise<Permission | undefined>;
  getPermissionsByCategory(): Promise<PermissionsByCategory>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: string, permission: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: string): Promise<void>;

  // Roles
  getRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: string): Promise<void>;

  // Role Permissions
  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  addPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
  updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void>;


  // User Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Support Tickets
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketsByUser(userId: string): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicketWithResponses | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  deleteSupportTicket(id: string): Promise<void>;
  
  // Support Ticket Responses
  createSupportTicketResponse(response: InsertSupportTicketResponse): Promise<SupportTicketResponse>;
}

export class DatabaseStorage implements IStorage {
  // Helper function to check for teacher time conflicts
  private checkTeacherTimeConflict(
    teacherId: string,
    dayOfWeek: number | null,
    startTime: string | null,
    endTime: string | null,
    excludeClassId ? : string
  ): { hasConflict: boolean; conflictingClass ? : Class } {
    if (!dayOfWeek || !startTime || !endTime) {
      return { hasConflict: false };
    }

    // Convert time strings to minutes for easy comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartMinutes = timeToMinutes(startTime);
    const newEndMinutes = timeToMinutes(endTime);

    // Find existing classes for this teacher on the same day
    const existingClasses = demoClasses.filter(cls =>
      cls.teacherId === teacherId &&
      cls.dayOfWeek === dayOfWeek &&
      cls.isActive &&
      (excludeClassId ? cls.id !== excludeClassId : true)
    );

    for (const existingClass of existingClasses) {
      if (!existingClass.startTime || !existingClass.endTime) continue;

      const existingStartMinutes = timeToMinutes(existingClass.startTime);
      const existingEndMinutes = timeToMinutes(existingClass.endTime);

      // Check for overlap: new class starts before existing ends AND new class ends after existing starts
      if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
        return { hasConflict: true, conflictingClass: existingClass };
      }
    }

    return { hasConflict: false };
  }

  // Helper function to check for lesson time conflicts
  private checkLessonTimeConflict(
    teacherId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeLessonId ? : string
  ): { hasConflict: boolean; conflictingLesson ? : Lesson } {
    // Convert time strings to minutes for easy comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartMinutes = timeToMinutes(startTime);
    const newEndMinutes = timeToMinutes(endTime);

    // Normalize date for comparison (set to start of day)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Find teacher's classes to get list of classes they teach
    const teacherClasses = demoClasses.filter(cls => cls.teacherId === teacherId);
    const classIds = teacherClasses.map(cls => cls.id);

    // Find existing lessons for this teacher on the same date
    const existingLessons = demoLessons.filter(lesson => {
      if (excludeLessonId && lesson.id === excludeLessonId) return false;
      if (!classIds.includes(lesson.classId)) return false;

      const lessonDate = new Date(lesson.date);
      lessonDate.setHours(0, 0, 0, 0);

      return lessonDate.getTime() === targetDate.getTime();
    });

    for (const existingLesson of existingLessons) {
      const existingStartMinutes = timeToMinutes(existingLesson.startTime);
      const existingEndMinutes = timeToMinutes(existingLesson.endTime);

      // Check for overlap: new lesson starts before existing ends AND new lesson ends after existing starts
      if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
        return { hasConflict: true, conflictingLesson: existingLesson };
      }
    }

    return { hasConflict: false };
  }

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise < User | undefined > {
    // Try to find the user in the demoUsers array (includes admin user with id '1')
    const demoUser = demoUsers.find(u => u.id === id);
    if (demoUser) {
      return demoUser;
    }

    // Demo mode fallback - returning a dummy user for login demonstration
    if (id === 'demo-user-id') {
      return {
        id: 'demo-user-id',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null,
        role: 'student',
        roleId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return undefined;
  }

  async upsertUser(user: UpsertUser): Promise < User > {
    // Demo mode - just log
    console.log('Demo user upserted:', user);
    // In a real app, you'd save this to a database
    const existingUserIndex = demoUsers.findIndex(u => u.id === user.id);
    const newUser: User = {
      id: user.id || crypto.randomUUID(),
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImageUrl: user.profileImageUrl || null,
      role: user.role || 'student',
      roleId: user.roleId || null,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };

    if (existingUserIndex > -1) {
      demoUsers[existingUserIndex] = newUser;
    } else {
      demoUsers.push(newUser);
    }
    return newUser;
  }

  // Units
  async getUnits(): Promise < Unit[] > {
    return [...demoUnits];
  }

  async getUnit(id: string): Promise < Unit | undefined > {
    return demoUnits.find(unit => unit.id === id);
  }

  async createUnit(unit: InsertUnit): Promise < Unit > {
    const id = crypto.randomUUID();
    const newUnit: Unit = {
      id,
      name: unit.name,
      address: unit.address || null,
      phone: unit.phone || null,
      email: unit.email || null,
      managerId: unit.managerId || null,
      isActive: unit.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoUnits.push(newUnit);
    return newUnit;
  }

  async updateUnit(id: string, unit: Partial < InsertUnit > ): Promise < Unit > {
    const index = demoUnits.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Unit not found');

    const updatedUnit = {
      ...demoUnits[index],
      ...unit,
      updatedAt: new Date(),
    };
    demoUnits[index] = updatedUnit;
    return updatedUnit;
  }

  async deleteUnit(id: string): Promise < void > {
    const index = demoUnits.findIndex(unit => unit.id === id);
    if (index !== -1) {
      demoUnits.splice(index, 1);
    }
  }

  // Books
  async getBooks(): Promise < Book[] > {
    return [...demoBooks];
  }

  async getBook(id: string): Promise < Book | undefined > {
    return demoBooks.find(book => book.id === id);
  }

  async createBook(bookData: InsertBook): Promise < Book > {
    // Validate that the course exists and is active
    const course = demoCourses.find(c => c.id === bookData.courseId);
    if (!course) {
      throw new Error(`Course with ID ${bookData.courseId} not found`);
    }
    if (!course.isActive) {
      throw new Error(`Cannot create book for inactive course: ${course.name}`);
    }

    const id = crypto.randomUUID();
    const newBook: Book = {
      id,
      courseId: bookData.courseId,
      name: bookData.name,
      description: bookData.description || null,
      pdfUrl: bookData.pdfUrl || null,
      color: bookData.color || '#3b82f6',
      displayOrder: bookData.displayOrder ?? 1,
      totalDays: bookData.totalDays ?? 30,
      isActive: bookData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoBooks.push(newBook);
    return newBook;
  }

  async updateBook(id: string, bookData: Partial < InsertBook > ): Promise < Book > {
    const index = demoBooks.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');

    // If courseId is being updated, validate that the new course exists and is active
    if (bookData.courseId) {
      const course = demoCourses.find(c => c.id === bookData.courseId);
      if (!course) {
        throw new Error(`Course with ID ${bookData.courseId} not found`);
      }
      if (!course.isActive) {
        throw new Error(`Cannot update book to inactive course: ${course.name}`);
      }
    }

    const updatedBook = {
      ...demoBooks[index],
      ...bookData,
      updatedAt: new Date(),
    };
    demoBooks[index] = updatedBook;
    return updatedBook;
  }

  async deleteBook(id: string): Promise < void > {
    // Check if any classes reference this book
    const referencingClasses = demoClasses.filter(cls => cls.bookId === id);
    if (referencingClasses.length > 0) {
      const classNames = referencingClasses.map(cls => cls.name).join(', ');
      throw new Error(`Cannot delete book: it is being used by the following classes: ${classNames}`);
    }

    const index = demoBooks.findIndex(book => book.id === id);
    if (index !== -1) {
      demoBooks.splice(index, 1);
    }
  }

  // Staff
  async getStaff(): Promise < StaffWithUser[] > {
    return demoStaff.map(staff => {
      const user = demoUsers.find(u => u.id === staff.userId);
      if (!user) throw new Error(`User not found for staff ${staff.id}`);
      return {
        ...staff,
        user
      };
    });
  }

  async getStaffMember(id: string): Promise < StaffWithUser | undefined > {
    const staff = demoStaff.find(staff => staff.id === id);
    if (!staff) return undefined;

    const user = demoUsers.find(u => u.id === staff.userId);
    if (!user) return undefined;

    return {
      ...staff,
      user
    };
  }

  async createStaff(staffData: InsertStaff): Promise < Staff > {
    const id = crypto.randomUUID();
    const newStaff: Staff = {
      id,
      userId: staffData.userId,
      unitId: staffData.unitId || null,
      employeeId: staffData.employeeId || null,
      position: staffData.position || null,
      department: staffData.department || null,
      salary: staffData.salary || null,
      hireDate: staffData.hireDate || null,
      isActive: staffData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoStaff.push(newStaff);
    return newStaff;
  }

  async updateStaff(id: string, staffData: Partial < InsertStaff > ): Promise < Staff > {
    const index = demoStaff.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Staff not found');

    const updatedStaff = {
      ...demoStaff[index],
      ...staffData,
      updatedAt: new Date(),
    };
    demoStaff[index] = updatedStaff;
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise < void > {
    const index = demoStaff.findIndex(staff => staff.id === id);
    if (index !== -1) {
      demoStaff.splice(index, 1);
    }
  }

  // Students
  async getStudents(): Promise < StudentWithUser[] > {
    return demoStudents.map(student => {
      const user = demoUsers.find(u => u.id === student.userId);
      if (!user) throw new Error(`User not found for student ${student.id}`);
      return {
        ...student,
        user
      };
    });
  }

  async getStudent(id: string): Promise < StudentWithUser | undefined > {
    const student = demoStudents.find(student => student.id === id);
    if (!student) return undefined;

    const user = demoUsers.find(u => u.id === student.userId);
    if (!user) return undefined;

    return {
      ...student,
      user
    };
  }

  async createStudent(studentData: InsertStudent): Promise < Student > {
    const id = crypto.randomUUID();
    const newStudent: Student = {
      id,
      userId: studentData.userId,
      studentId: studentData.studentId || null,
      unitId: studentData.unitId || null,
      enrollmentDate: studentData.enrollmentDate || null,
      status: studentData.status || 'active',
      emergencyContact: studentData.emergencyContact || null,
      notes: studentData.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoStudents.push(newStudent);
    return newStudent;
  }

  async updateStudent(id: string, studentData: Partial < InsertStudent > ): Promise < Student > {
    const index = demoStudents.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');

    const updatedStudent = {
      ...demoStudents[index],
      ...studentData,
      updatedAt: new Date(),
    };
    demoStudents[index] = updatedStudent;
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise < void > {
    const index = demoStudents.findIndex(student => student.id === id);
    if (index !== -1) {
      demoStudents.splice(index, 1);
    }
  }

  // Courses
  async getCourses(): Promise < Course[] > {
    return [...demoCourses];
  }

  async getCourse(id: string): Promise < Course | undefined > {
    return demoCourses.find(course => course.id === id);
  }

  async createCourse(courseData: InsertCourse): Promise < Course > {
    const id = crypto.randomUUID();
    const newCourse: Course = {
      id,
      name: courseData.name,
      description: courseData.description || null,
      language: courseData.language,
      level: courseData.level,
      duration: courseData.duration || null,
      price: courseData.price || null,
      isActive: courseData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoCourses.push(newCourse);
    return newCourse;
  }

  async updateCourse(id: string, courseData: Partial < InsertCourse > ): Promise < Course > {
    const index = demoCourses.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Course not found');

    const updatedCourse = {
      ...demoCourses[index],
      ...courseData,
      updatedAt: new Date(),
    };
    demoCourses[index] = updatedCourse;
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise < void > {
    // Check if any books reference this course
    const referencingBooks = demoBooks.filter(book => book.courseId === id);
    if (referencingBooks.length > 0) {
      const bookNames = referencingBooks.map(book => book.name).join(', ');
      throw new Error(`Cannot delete course: it has the following books associated with it: ${bookNames}`);
    }

    const index = demoCourses.findIndex(course => course.id === id);
    if (index !== -1) {
      demoCourses.splice(index, 1);
    }
  }

  // Classes
  async getClasses(): Promise < ClassWithDetails[] > {
    return demoClasses.map(cls => {
      const book = demoBooks.find(b => b.id === cls.bookId);
      const course = book ? demoCourses.find(c => c.id === book.courseId) : undefined;
      const teacher = demoUsers.find(u => u.id === cls.teacherId);
      const unit = demoUnits.find(u => u.id === cls.unitId);

      if (!book || !course || !teacher || !unit) {
        throw new Error(`Missing required data for class ${cls.id}`);
      }

      return {
        ...cls,
        book: { ...book, course },
        teacher,
        unit,
        enrollments: [],
      };
    });
  }

  async getClass(id: string): Promise < ClassWithDetails | undefined > {
    const cls = demoClasses.find(cls => cls.id === id);
    if (!cls) return undefined;

    const book = demoBooks.find(b => b.id === cls.bookId);
    const course = book ? demoCourses.find(c => c.id === book.courseId) : undefined;
    const teacher = demoUsers.find(u => u.id === cls.teacherId);
    const unit = demoUnits.find(u => u.id === cls.unitId);

    if (!book || !course || !teacher || !unit) return undefined;

    return {
      ...cls,
      book: { ...book, course },
      teacher,
      unit,
      enrollments: [],
    };
  }

  async getClassesByTeacher(teacherId: string): Promise < ClassWithDetails[] > {
    const classes = demoClasses.filter(cls => cls.teacherId === teacherId && cls.isActive);

    return classes.map(cls => {
      const book = demoBooks.find(b => b.id === cls.bookId);
      const unit = demoUnits.find(u => u.id === cls.unitId);
      const course = book ? demoCourses.find(c => c.id === book.courseId) : undefined;
      const teacher = demoUsers.find(u => u.id === cls.teacherId);

      return {
        ...cls,
        book: book ? { ...book, course: course || demoCourses[0] } : { ...demoBooks[0], course: demoCourses[0] },
        unit: unit || demoUnits[0],
        teacher: teacher,
        enrollments: []
      };
    });
  }

  async createClass(classData: InsertClass): Promise < Class > {
    // Validate that the book exists and is active
    const book = demoBooks.find(b => b.id === classData.bookId);
    if (!book) {
      throw new Error(`Book with ID ${classData.bookId} not found`);
    }
    if (!book.isActive) {
      throw new Error(`Cannot create class for inactive course: ${book.name}`);
    }

    // Validate that the teacher exists and has teacher role
    const teacher = demoUsers.find(u => u.id === classData.teacherId);
    if (!teacher) {
      throw new Error(`Teacher with ID ${classData.teacherId} not found`);
    }
    if (teacher.role !== 'teacher') {
      throw new Error(`User ${teacher.firstName} ${teacher.lastName} is not a teacher (current role: ${teacher.role})`);
    }
    if (!teacher.isActive) {
      throw new Error(`Cannot assign inactive teacher ${teacher.firstName} ${teacher.lastName} to class`);
    }

    // Check for time conflicts with teacher's existing classes
    const timeConflict = this.checkTeacherTimeConflict(
      classData.teacherId,
      classData.dayOfWeek || null,
      classData.startTime || null,
      classData.endTime || null
    );

    if (timeConflict.hasConflict && timeConflict.conflictingClass) {
      throw new Error(`Teacher ${teacher.firstName} ${teacher.lastName} already has a class "${timeConflict.conflictingClass.name}" at this time (${timeConflict.conflictingClass.startTime}-${timeConflict.conflictingClass.endTime})`);
    }

    const id = crypto.randomUUID();
    const newClass: Class = {
      id,
      bookId: classData.bookId,
      teacherId: classData.teacherId,
      unitId: classData.unitId,
      name: classData.name,
      schedule: classData.schedule || null,
      dayOfWeek: classData.dayOfWeek || null,
      startTime: classData.startTime || null,
      endTime: classData.endTime || null,
      room: classData.room || null,
      maxStudents: classData.maxStudents ?? 15,
      currentStudents: classData.currentStudents ?? 0,
      startDate: classData.startDate || null,
      endDate: classData.endDate || null,
      currentDay: classData.currentDay ?? 1,
      isActive: classData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoClasses.push(newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial < InsertClass > ): Promise < Class > {
    const index = demoClasses.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Class not found');

    const currentClass = demoClasses[index];

    // If teacher, day, or time is being updated, check for conflicts
    const teacherId = classData.teacherId || currentClass.teacherId;
    const dayOfWeek = classData.dayOfWeek !== undefined ? classData.dayOfWeek : currentClass.dayOfWeek;
    const startTime = classData.startTime !== undefined ? classData.startTime : currentClass.startTime;
    const endTime = classData.endTime !== undefined ? classData.endTime : currentClass.endTime;

    if (classData.teacherId || classData.dayOfWeek !== undefined ||
      classData.startTime !== undefined || classData.endTime !== undefined) {

      const timeConflict = this.checkTeacherTimeConflict(
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        id // Exclude current class from conflict check
      );

      if (timeConflict.hasConflict && timeConflict.conflictingClass) {
        const teacher = demoUsers.find(u => u.id === teacherId);
        const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : teacherId;
        throw new Error(`Teacher ${teacherName} already has a class "${timeConflict.conflictingClass.name}" at this time (${timeConflict.conflictingClass.startTime}-${timeConflict.conflictingClass.endTime})`);
      }
    }

    const updatedClass = {
      ...currentClass,
      ...classData,
      updatedAt: new Date(),
    };
    demoClasses[index] = updatedClass;
    return updatedClass;
  }

  async deleteClass(id: string): Promise < void > {
    const index = demoClasses.findIndex(cls => cls.id === id);
    if (index !== -1) {
      demoClasses.splice(index, 1);
    }
  }

  // Lessons/Schedule
  async getLessons(): Promise < Lesson[] > {
    return [...demoLessons].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getLesson(id: string): Promise < Lesson | undefined > {
    return demoLessons.find(lesson => lesson.id === id);
  }

  async getLessonsByClass(classId: string): Promise < Lesson[] > {
    return demoLessons.filter(lesson => lesson.classId === classId);
  }

  async getLessonsByTeacher(teacherId: string): Promise < Lesson[] > {
    // Find classes taught by this teacher, then find lessons for those classes
    const teacherClasses = demoClasses.filter(cls => cls.teacherId === teacherId);
    const classIds = teacherClasses.map(cls => cls.id);
    return demoLessons.filter(lesson => classIds.includes(lesson.classId));
  }

  async getTodaysLessons(): Promise < Lesson[] > {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return demoLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate < tomorrow;
    });
  }

  async createLesson(lessonData: InsertLesson): Promise < Lesson > {
    // Validate that the class exists
    const classData = demoClasses.find(cls => cls.id === lessonData.classId);
    if (!classData) {
      throw new Error(`Class with ID ${lessonData.classId} not found`);
    }

    // Get the teacher ID from the class
    const teacherId = classData.teacherId;

    // Check for lesson conflicts
    const conflictCheck = this.checkLessonTimeConflict(
      teacherId,
      lessonData.date,
      lessonData.startTime,
      lessonData.endTime
    );

    if (conflictCheck.hasConflict && conflictCheck.conflictingLesson) {
      const teacher = demoUsers.find(u => u.id === teacherId);
      const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : teacherId;
      throw new Error(`Professor ${teacherName} já tem uma aula "${conflictCheck.conflictingLesson.title}" neste horário (${conflictCheck.conflictingLesson.startTime}-${conflictCheck.conflictingLesson.endTime})`);
    }

    const id = crypto.randomUUID();
    const newLesson: Lesson = {
      id,
      classId: lessonData.classId,
      title: lessonData.title,
      bookDay: lessonData.bookDay,
      date: lessonData.date,
      startTime: lessonData.startTime,
      endTime: lessonData.endTime,
      room: lessonData.room || null,
      status: lessonData.status || 'scheduled',
      notes: lessonData.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoLessons.push(newLesson);
    return newLesson;
  }

  async updateLesson(id: string, lessonData: Partial < InsertLesson > ): Promise < Lesson > {
    const index = demoLessons.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lesson not found');

    const currentLesson = demoLessons[index];

    // If date, start time, or end time is being updated, check for conflicts
    const date = lessonData.date || currentLesson.date;
    const startTime = lessonData.startTime || currentLesson.startTime;
    const endTime = lessonData.endTime || currentLesson.endTime;
    const classId = lessonData.classId || currentLesson.classId;

    // Get the teacher ID from the class
    const classData = demoClasses.find(cls => cls.id === classId);
    if (!classData) {
      throw new Error(`Class with ID ${classId} not found`);
    }
    const teacherId = classData.teacherId;

    if (lessonData.date || lessonData.startTime || lessonData.endTime) {
      const conflictCheck = this.checkLessonTimeConflict(
        teacherId,
        date,
        startTime,
        endTime,
        id // Exclude current lesson from conflict check
      );

      if (conflictCheck.hasConflict && conflictCheck.conflictingLesson) {
        const teacher = demoUsers.find(u => u.id === teacherId);
        const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : teacherId;
        throw new Error(`Professor ${teacherName} já tem uma aula "${conflictCheck.conflictingLesson.title}" neste horário (${conflictCheck.conflictingLesson.startTime}-${conflictCheck.conflictingLesson.endTime})`);
      }
    }

    const updatedLesson = {
      ...currentLesson,
      ...lessonData,
      updatedAt: new Date(),
    };
    demoLessons[index] = updatedLesson;
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise < void > {
    const index = demoLessons.findIndex(lesson => lesson.id === id);
    if (index !== -1) {
      demoLessons.splice(index, 1);
    }
  }

  async checkLessonConflicts(teacherId: string, date: Date, startTime: string, endTime: string, excludeLessonId ? : string): Promise<{ hasConflict: boolean; conflictingLesson ? : Lesson }> {
    return this.checkLessonTimeConflict(teacherId, date, startTime, endTime, excludeLessonId);
  }

  // Dashboard stats
  async getDashboardStats(): Promise < {
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  } > {
    // Count teachers by checking users with teacher role
    const activeTeachers = demoUsers.filter(user => user.role === 'teacher' && user.isActive).length;

    // Get today's lessons by comparing dates properly
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysLessons = demoLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate < tomorrow;
    }).length;

    return {
      totalStudents: demoStudents.length,
      activeTeachers: activeTeachers,
      todaysClasses: todaysLessons,
      monthlyRevenue: 47200, // Placeholder - would calculate from payments table
    };
  }

  // Permission Categories
  async getPermissionCategories(): Promise<PermissionCategory[]> {
    return [...demoPermissionCategories]
      .filter(c => c.isActive)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async getPermissionCategory(id: string): Promise<PermissionCategory | undefined> {
    return demoPermissionCategories.find(c => c.id === id);
  }

  async createPermissionCategory(categoryData: InsertPermissionCategory): Promise<PermissionCategory> {
    // Check if category name already exists (case-insensitive)
    const existingCategory = demoPermissionCategories.find(c => c.name.toLowerCase() === categoryData.name.toLowerCase());
    if (existingCategory) {
      throw new Error(`Permission category with name "${categoryData.name}" already exists`);
    }

    const id = crypto.randomUUID();
    const newCategory: PermissionCategory = {
      id,
      name: categoryData.name,
      displayName: categoryData.displayName,
      description: categoryData.description || null,
      isSystemCategory: categoryData.isSystemCategory ?? false,
      isActive: categoryData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoPermissionCategories.push(newCategory);
    return newCategory;
  }

  async updatePermissionCategory(id: string, categoryData: Partial<InsertPermissionCategory>): Promise<PermissionCategory> {
    const index = demoPermissionCategories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Permission category not found');

    const existingCategory = demoPermissionCategories[index];
    
    // Prevent editing system categories name
    if (existingCategory.isSystemCategory && categoryData.name) {
      throw new Error('Cannot modify name of system categories');
    }

    // Check if name is being updated and already exists in another category (case-insensitive)
    if (categoryData.name) {
      const duplicateCategory = demoPermissionCategories.find(c => c.name.toLowerCase() === categoryData.name!.toLowerCase() && c.id !== id);
      if (duplicateCategory) {
        throw new Error(`Permission category with name "${categoryData.name}" already exists`);
      }
    }

    const updatedCategory = {
      ...existingCategory,
      ...categoryData,
      updatedAt: new Date(),
    };
    demoPermissionCategories[index] = updatedCategory;
    return updatedCategory;
  }

  async deletePermissionCategory(id: string): Promise<void> {
    const category = demoPermissionCategories.find(c => c.id === id);
    if (!category) throw new Error('Permission category not found');

    // Prevent deleting system categories
    if (category.isSystemCategory) {
      throw new Error('Cannot delete system categories');
    }

    // Check if category has permissions assigned
    const categoryPermissions = demoPermissions.filter(p => p.categoryId === id);
    if (categoryPermissions.length > 0) {
      throw new Error('Cannot delete category that has permissions assigned to it');
    }

    const index = demoPermissionCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      demoPermissionCategories.splice(index, 1);
    }
  }

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    return [...demoPermissions]
      .filter(p => p.isActive)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    return demoPermissions.find(p => p.id === id);
  }

  async getPermissionsByCategory(): Promise<PermissionsByCategory> {
    const permissions = await this.getPermissions();
    const categorized: PermissionsByCategory = {};

    permissions.forEach(permission => {
      if (!categorized[permission.category]) {
        categorized[permission.category] = [];
      }
      categorized[permission.category].push(permission);
    });

    return categorized;
  }

  async createPermission(permissionData: InsertPermission): Promise<Permission> {
    // Check if permission name already exists (case-insensitive)
    const existingPermission = demoPermissions.find(p => p.name.toLowerCase() === permissionData.name.toLowerCase());
    if (existingPermission) {
      throw new Error(`Permission with name "${permissionData.name}" already exists`);
    }

    // Validate that the category exists
    const category = demoPermissionCategories.find(c => c.id === permissionData.categoryId);
    if (!category) {
      throw new Error(`Permission category with id "${permissionData.categoryId}" not found`);
    }

    const id = crypto.randomUUID();
    const newPermission: Permission = {
      id,
      name: permissionData.name,
      displayName: permissionData.displayName,
      description: permissionData.description || null,
      categoryId: permissionData.categoryId,
      category: category.name, // Sync category name for backward compatibility
      isActive: permissionData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoPermissions.push(newPermission);
    return newPermission;
  }

  async updatePermission(id: string, permissionData: Partial<InsertPermission>): Promise<Permission> {
    const index = demoPermissions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Permission not found');

    // Check if name is being updated and already exists in another permission (case-insensitive)
    if (permissionData.name) {
      const existingPermission = demoPermissions.find(p => p.name.toLowerCase() === permissionData.name!.toLowerCase() && p.id !== id);
      if (existingPermission) {
        throw new Error(`Permission with name "${permissionData.name}" already exists`);
      }
    }

    const updatedPermission = {
      ...demoPermissions[index],
      ...permissionData,
      updatedAt: new Date(),
    };
    demoPermissions[index] = updatedPermission;
    return updatedPermission;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = demoPermissions.find(p => p.id === id);
    if (!permission) throw new Error('Permission not found');

    // Check if permission is referenced by any role
    const referencingRolePermissions = demoRolePermissions.filter(rp => rp.permissionId === id);
    if (referencingRolePermissions.length > 0) {
      const roles = referencingRolePermissions.map(rp => {
        const role = demoRoles.find(r => r.id === rp.roleId);
        return role ? role.displayName : 'Unknown Role';
      }).join(', ');
      throw new Error(`Cannot delete permission: it is assigned to the following roles: ${roles}`);
    }

    // Remove permission from all roles (cascade cleanup)
    demoRolePermissions = demoRolePermissions.filter(rp => rp.permissionId !== id);

    const index = demoPermissions.findIndex(p => p.id === id);
    if (index !== -1) {
      demoPermissions.splice(index, 1);
    }
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    return [...demoRoles]
      .filter(r => r.isActive)
      .sort((a, b) => {
        // System roles first, then custom roles, both alphabetically
        if (a.isSystemRole && !b.isSystemRole) return -1;
        if (!a.isSystemRole && b.isSystemRole) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
  }

  async getRole(id: string): Promise<Role | undefined> {
    return demoRoles.find(r => r.id === id);
  }

  async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined> {
    const role = demoRoles.find(r => r.id === id);
    if (!role) return undefined;

    const rolePermissions = demoRolePermissions
      .filter(rp => rp.roleId === id)
      .map(rp => {
        const permission = demoPermissions.find(p => p.id === rp.permissionId);
        return {
          ...rp,
          permission: permission!
        };
      })
      .filter(rp => rp.permission); // Only include valid permissions

    return {
      ...role,
      rolePermissions
    };
  }

  async createRole(roleData: InsertRole): Promise<Role> {
    // Check if role name already exists (case-insensitive)
    const existingRole = demoRoles.find(r => r.name.toLowerCase() === roleData.name.toLowerCase());
    if (existingRole) {
      throw new Error(`Role with name "${roleData.name}" already exists`);
    }

    const id = crypto.randomUUID();
    const newRole: Role = {
      id,
      name: roleData.name,
      displayName: roleData.displayName,
      description: roleData.description || null,
      isSystemRole: roleData.isSystemRole ?? false,
      isActive: roleData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoRoles.push(newRole);
    return newRole;
  }

  async updateRole(id: string, roleData: Partial<InsertRole>): Promise<Role> {
    const index = demoRoles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');

    const currentRole = demoRoles[index];

    // Prevent updating system roles
    if (currentRole.isSystemRole && (roleData.name || roleData.isSystemRole === false)) {
      throw new Error('Cannot modify name or system status of system roles');
    }

    // Check if name is being updated and already exists in another role (case-insensitive)
    if (roleData.name) {
      const existingRole = demoRoles.find(r => r.name.toLowerCase() === roleData.name!.toLowerCase() && r.id !== id);
      if (existingRole) {
        throw new Error(`Role with name "${roleData.name}" already exists`);
      }
    }

    const updatedRole = {
      ...currentRole,
      ...roleData,
      updatedAt: new Date(),
    };
    demoRoles[index] = updatedRole;
    return updatedRole;
  }

  async deleteRole(id: string): Promise<void> {
    const role = demoRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');

    // Prevent deleting system roles
    if (role.isSystemRole) {
      throw new Error('Cannot delete system roles');
    }

    // Set roleId to null for users assigned to this role (cascade cleanup)
    demoUsers.forEach(user => {
      if (user.roleId === id) {
        user.roleId = null;
        user.updatedAt = new Date();
      }
    });

    // Remove all role permissions (cascade cleanup)
    demoRolePermissions = demoRolePermissions.filter(rp => rp.roleId !== id);

    // Remove the role
    const index = demoRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      demoRoles.splice(index, 1);
    }
  }

  // Role Permissions
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return demoRolePermissions.filter(rp => rp.roleId === roleId);
  }

  // Get role permissions by role name (for demo users who use role names)
  async getRolePermissionsByName(roleName: string): Promise<(RolePermission & { permission: Permission })[]> {
    // Admin has access to ALL permissions - total access as requested
    if (roleName === 'admin') {
      const allPermissions = await this.getPermissions();
      return allPermissions.map(permission => ({
        id: crypto.randomUUID(),
        roleId: '1', // admin role ID
        permissionId: permission.id,
        createdAt: new Date(),
        permission
      }));
    }

    // Find the role by name
    const role = demoRoles.find(r => r.name === roleName);
    if (!role) {
      console.warn(`Role '${roleName}' not found`);
      return [];
    }

    // Get role permissions for this role ID
    const rolePermissions = demoRolePermissions.filter(rp => rp.roleId === role.id);
    
    // Join with permissions data to return complete permission information
    const permissionsWithData: (RolePermission & { permission: Permission })[] = [];
    
    for (const rp of rolePermissions) {
      const permission = demoPermissions.find(p => p.id === rp.permissionId && p.isActive);
      if (permission) {
        permissionsWithData.push({
          ...rp,
          permission
        });
      } else {
        console.warn(`Permission ${rp.permissionId} not found or inactive for role ${roleName}`);
      }
    }

    return permissionsWithData;
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    // Check if role exists
    const role = demoRoles.find(r => r.id === roleId);
    if (!role) throw new Error('Role not found');

    // Check if permission exists
    const permission = demoPermissions.find(p => p.id === permissionId);
    if (!permission) throw new Error('Permission not found');

    // Check if permission is already assigned to role
    const existingRolePermission = demoRolePermissions.find(rp => rp.roleId === roleId && rp.permissionId === permissionId);
    if (existingRolePermission) {
      throw new Error('Permission is already assigned to this role');
    }

    const id = crypto.randomUUID();
    const newRolePermission: RolePermission = {
      id,
      roleId,
      permissionId,
      createdAt: new Date(),
    };
    demoRolePermissions.push(newRolePermission);
    return newRolePermission;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const index = demoRolePermissions.findIndex(rp => rp.roleId === roleId && rp.permissionId === permissionId);
    if (index !== -1) {
      demoRolePermissions.splice(index, 1);
    }
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Check if role exists
    const role = demoRoles.find(r => r.id === roleId);
    if (!role) throw new Error('Role not found');

    // Check if all permissions exist
    for (const permissionId of permissionIds) {
      const permission = demoPermissions.find(p => p.id === permissionId);
      if (!permission) throw new Error(`Permission with id ${permissionId} not found`);
    }

    // Remove all current permissions for this role
    demoRolePermissions = demoRolePermissions.filter(rp => rp.roleId !== roleId);

    // Add new permissions
    for (const permissionId of permissionIds) {
      const id = crypto.randomUUID();
      const newRolePermission: RolePermission = {
        id,
        roleId,
        permissionId,
        createdAt: new Date(),
      };
      demoRolePermissions.push(newRolePermission);
    }
  }

  // User Permissions - permissões individuais por usuário
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return demoUserPermissions.filter(up => up.userId === userId);
  }

  async getUserWithPermissions(userId: string): Promise<UserWithPermissions | undefined> {
    try {
      // Find user in the correct demo users array that matches the login IDs
      const loginDemoUsers = [
        { id: '1', email: 'admin@demo.com', firstName: 'Ivan', lastName: 'Silva', role: 'admin' },
        { id: '2', email: 'teacher@demo.com', firstName: 'Ivan', lastName: 'Silva', role: 'teacher' },
        { id: '3', email: 'secretary@demo.com', firstName: 'Ivan', lastName: 'Silva', role: 'secretary' },
        { id: '4', email: 'student@demo.com', firstName: 'Ivan', lastName: 'Silva', role: 'student' },
      ];
      
      const user = loginDemoUsers.find(u => u.id === userId);
      if (!user) {
        return undefined;
      }

      // Find the role object by name
      const role = demoRoles.find(r => r.name === user.role && r.isActive);
      
      if (!role) {
        console.warn(`Role '${user.role}' not found or inactive for user ${userId}`);
        return {
          ...user,
          role: null,
          userPermissions: [],
        };
      }
      
      // Get effective permissions from role
      const rolePermissions = demoRolePermissions.filter(rp => rp.roleId === role.id);
      
      const userPermissions: (UserPermission & { permission: Permission })[] = [];
      
      for (const rp of rolePermissions) {
        const permission = demoPermissions.find(p => p.id === rp.permissionId && p.isActive);
        if (permission) {
          userPermissions.push({
            permission,
            isGranted: true,
            id: crypto.randomUUID(),
            userId: user.id,
            permissionId: permission.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          console.warn(`Permission ${rp.permissionId} not found or inactive for role ${role.name}`);
        }
      }

      return {
        ...user,
        role,
        userPermissions,
      };
    } catch (error) {
      console.error("Error fetching user with permissions:", error);
      throw error;
    }
  }

  async grantUserPermission(userId: string, permissionId: string): Promise<UserPermission> {
    // Check if user exists
    const user = demoUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    // Check if permission exists
    const permission = demoPermissions.find(p => p.id === permissionId);
    if (!permission) throw new Error('Permission not found');

    // Check if permission is already granted to user
    const existingUserPermission = demoUserPermissions.find(up => up.userId === userId && up.permissionId === permissionId);
    if (existingUserPermission) {
      // Update existing permission to granted
      existingUserPermission.isGranted = true;
      existingUserPermission.updatedAt = new Date();
      return existingUserPermission;
    }

    const id = crypto.randomUUID();
    const newUserPermission: UserPermission = {
      id,
      userId,
      permissionId,
      isGranted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoUserPermissions.push(newUserPermission);
    return newUserPermission;
  }

  async revokeUserPermission(userId: string, permissionId: string): Promise<void> {
    const existingUserPermission = demoUserPermissions.find(up => up.userId === userId && up.permissionId === permissionId);
    if (existingUserPermission) {
      // Set to revoked instead of deleting to maintain audit trail
      existingUserPermission.isGranted = false;
      existingUserPermission.updatedAt = new Date();
    }
  }

  async updateUserPermissions(userId: string, permissionIds: string[]): Promise<void> {
    // Check if user exists
    const user = demoUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    // Check if all permissions exist
    for (const permissionId of permissionIds) {
      const permission = demoPermissions.find(p => p.id === permissionId);
      if (!permission) throw new Error(`Permission with id ${permissionId} not found`);
    }

    // Remove all current permissions for this user
    demoUserPermissions = demoUserPermissions.filter(up => up.userId !== userId);

    // Add new permissions
    for (const permissionId of permissionIds) {
      const id = crypto.randomUUID();
      const newUserPermission: UserPermission = {
        id,
        userId,
        permissionId,
        isGranted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      demoUserPermissions.push(newUserPermission);
    }
  }

  async getUsersWithPermissions(): Promise<UserWithPermissions[]> {
    return Promise.all(
      demoUsers.map(async (user) => {
        const userWithPermissions = await this.getUserWithPermissions(user.id);
        return userWithPermissions!;
      })
    );
  }

  // Migration function - sincronizar usuários com permissões baseadas no role atual
  async migrateUsersToIndividualPermissions(): Promise<void> {
    console.log('Iniciando migração de usuários para permissões individuais...');

    // Limpar permissões existentes de usuários
    demoUserPermissions.length = 0;

    // Para cada usuário, criar permissões baseadas no seu role atual
    for (const user of demoUsers) {
      const userRole = user.role; // Role enum do usuário (mantido para compatibilidade)

      if (!userRole) continue;

      // Obter permissões do role correspondente
      let rolePermissionIds: string[] = [];

      switch (userRole) {
        case 'admin':
          // Admin tem acesso a todas as páginas incluindo configurações
          rolePermissionIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9']; // Dashboard, Unidades, Colaboradores, Alunos, Cursos, Agenda, Financeiro, Área do Aluno, Configurações
          break;

        case 'teacher':
          // Professor tem acesso a dashboard, alunos, cursos e agenda
          rolePermissionIds = ['1', '4', '5', '6']; // Dashboard, Alunos, Cursos, Agenda
          break;

        case 'secretary':
          // Secretária tem acesso a dashboard, unidades, alunos, cursos e agenda
          rolePermissionIds = ['1', '2', '4', '5', '6']; // Dashboard, Unidades, Alunos, Cursos, Agenda
          break;


        case 'student':
          // Aluno tem acesso a dashboard e área do aluno
          rolePermissionIds = ['1', '8']; // Dashboard, Área do Aluno
          break;

        default:
          // Role desconhecido, dar apenas dashboard
          rolePermissionIds = ['1']; // Dashboard
      }

      // Criar permissões individuais para o usuário
      for (const permissionId of rolePermissionIds) {
        const id = crypto.randomUUID();
        const userPermission: UserPermission = {
          id,
          userId: user.id,
          permissionId,
          isGranted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        demoUserPermissions.push(userPermission);
      }

      console.log(`Usuário ${user.firstName} ${user.lastName} (${userRole}) migrado com ${rolePermissionIds.length} permissões`);
    }

    console.log(`Migração concluída! ${demoUsers.length} usuários migrados com ${demoUserPermissions.length} permissões individuais`);
  }

  // User Settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return demoUserSettings.find(s => s.userId === userId);
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const id = crypto.randomUUID();
    const newSettings: UserSettings = {
      id,
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoUserSettings.push(newSettings);
    return newSettings;
  }

  async updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const index = demoUserSettings.findIndex(s => s.userId === userId);
    if (index === -1) {
      // Create new settings if they don't exist
      return this.createUserSettings({ userId, ...settings } as InsertUserSettings);
    }

    const updatedSettings = {
      ...demoUserSettings[index],
      ...settings,
      updatedAt: new Date(),
    };
    demoUserSettings[index] = updatedSettings;
    return updatedSettings;
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    return [...demoSupportTickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSupportTicketsByUser(userId: string): Promise<SupportTicket[]> {
    return demoSupportTickets
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSupportTicket(id: string): Promise<SupportTicketWithResponses | undefined> {
    const ticket = demoSupportTickets.find(t => t.id === id);
    if (!ticket) return undefined;

    const user = demoUsers.find(u => u.id === ticket.userId);
    const assignedUser = ticket.assignedTo ? demoUsers.find(u => u.id === ticket.assignedTo) : undefined;
    const responses = demoSupportTicketResponses.filter(r => r.ticketId === id);

    if (!user) return undefined;

    return {
      ...ticket,
      user,
      assignedUser,
      responses,
    };
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = crypto.randomUUID();
    const newTicket: SupportTicket = {
      id,
      ...ticket,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoSupportTickets.push(newTicket);
    return newTicket;
  }

  async updateSupportTicket(id: string, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const index = demoSupportTickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');

    const updatedTicket = {
      ...demoSupportTickets[index],
      ...ticket,
      updatedAt: new Date(),
    };
    demoSupportTickets[index] = updatedTicket;
    return updatedTicket;
  }

  async deleteSupportTicket(id: string): Promise<void> {
    const index = demoSupportTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      demoSupportTickets.splice(index, 1);
      // Also remove associated responses
      for (let i = demoSupportTicketResponses.length - 1; i >= 0; i--) {
        if (demoSupportTicketResponses[i].ticketId === id) {
          demoSupportTicketResponses.splice(i, 1);
        }
      }
    }
  }

  // Support Ticket Responses
  async createSupportTicketResponse(response: InsertSupportTicketResponse): Promise<SupportTicketResponse> {
    const id = crypto.randomUUID();
    const newResponse: SupportTicketResponse = {
      id,
      ...response,
      createdAt: new Date(),
    };
    demoSupportTicketResponses.push(newResponse);
    return newResponse;
  }
}

export const storage = new DatabaseStorage();

