import type {
  InsertUnit,
  InsertStaff,
  InsertStudent,
  InsertCourse,
  InsertClass,
  InsertLesson,
  InsertBook,
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
  ClassWithRelations,
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
  id: 'user-1',
  email: 'joao@edumanage.com',
  firstName: 'João',
  lastName: 'Silva',
  profileImageUrl: null,
  role: 'teacher',
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
  isActive: true,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, {
  id: 'user-4',
  email: 'ana@email.com',
  firstName: 'Ana',
  lastName: 'Costa',
  profileImageUrl: null,
  role: 'student',
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
  color: '#3b82f6',
  displayOrder: 1,
  totalDays: 30,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '2',
  courseId: '2',
  name: 'English Intermediate - Book 1',
  description: 'Livro de inglês intermediário',
  pdfUrl: '/books/english-intermediate-1.pdf',
  color: '#10b981',
  displayOrder: 1,
  totalDays: 40,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '3',
  courseId: '3',
  name: 'Español Básico - Libro 1',
  description: 'Livro básico de espanhol',
  pdfUrl: '/books/spanish-basic-1.pdf',
  color: '#f59e0b',
  displayOrder: 1,
  totalDays: 25,
  isActive: true,
  createdAt: new Date('2024-01-12'),
  updatedAt: new Date('2024-01-12'),
}];

let demoClasses: Class[] = [{
  id: '1',
  bookId: '1',
  teacherId: 'user-1',
  unitId: '1',
  name: 'Turma Inglês A1',
  schedule: 'Segunda e Quarta 19:00-21:00',
  dayOfWeek: 1, // Monday
  startTime: '19:00',
  endTime: '21:00',
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
  bookId: '3',
  teacherId: 'user-2',
  unitId: '1',
  name: 'Turma Espanhol B1',
  schedule: 'Terça e Quinta 18:00-20:00',
  dayOfWeek: 2, // Tuesday
  startTime: '18:00',
  endTime: '20:00',
  room: 'Sala 102',
  maxStudents: 12,
  currentStudents: 8,
  startDate: new Date('2024-02-15'),
  endDate: new Date('2024-06-15'),
  currentDay: 3,
  isActive: true,
  createdAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
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
  getClassesByTeacher(teacherId: string): Promise < ClassWithRelations[] > ;
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
    // Demo mode - returning a dummy user for login demonstration
    if (id === 'demo-user-id') {
      return {
        id: 'demo-user-id',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null,
        role: 'student', // or 'teacher', 'admin'
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
    return {
      id: user.id || crypto.randomUUID(),
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImageUrl: user.profileImageUrl || null,
      role: user.role || 'student',
      isActive: user.isActive ?? true,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
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

  async getClassesByTeacher(teacherId: string): Promise < ClassWithRelations[] > {
    const classes = demoClasses.filter(cls => cls.teacherId === teacherId && cls.isActive);

    return classes.map(cls => {
      const book = demoBooks.find(b => b.id === cls.bookId);
      const unit = demoUnits.find(u => u.id === cls.unitId);
      const course = book ? demoCourses.find(c => c.id === book.courseId) : undefined;
      const teacher = demoUsers.find(u => u.id === cls.teacherId);

      return {
        ...cls,
        book: book ? { ...book, course: course || demoCourses[0] } : demoBooks[0],
        unit: unit || demoUnits[0],
        teacher: teacher
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
      throw new Error(`Cannot create class for inactive book: ${book.name}`);
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
}

export const storage = new DatabaseStorage();