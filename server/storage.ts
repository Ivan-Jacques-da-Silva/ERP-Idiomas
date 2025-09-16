import type {
  InsertUnit,
  InsertStaff,
  InsertStudent,
  InsertCourse,
  InsertClass,
  InsertLesson,
  Unit,
  Staff,
  Student,
  Course,
  Class,
  Lesson,
  User,
  UpsertUser,
  StaffWithUser,
  StudentWithUser,
  ClassWithDetails,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Demo data in memory - no database needed
let demoUnits: Unit[] = [{
  id: '1',
  name: 'Unidade Centro',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 3456-7890',
  email: 'centro@edumanage.com',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: '2',
  name: 'Unidade Vila Nova',
  address: 'Av. Principal, 456 - Vila Nova',
  phone: '(11) 3456-7891',
  email: 'vilanova@edumanage.com',
  createdAt: new Date('2024-02-10'),
  updatedAt: new Date('2024-02-10'),
}, ];

let demoStaff: Staff[] = [{
  id: '1',
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@edumanage.com',
  phone: '(11) 99999-1111',
  role: 'teacher',
  unitId: '1',
  specialization: 'Inglês Avançado',
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
}, {
  id: '2',
  firstName: 'Maria',
  lastName: 'Santos',
  email: 'maria@edumanage.com',
  phone: '(11) 99999-2222',
  role: 'teacher',
  unitId: '1',
  specialization: 'Espanhol',
  createdAt: new Date('2024-01-22'),
  updatedAt: new Date('2024-01-22'),
}, {
  id: '3',
  firstName: 'Carlos',
  lastName: 'Oliveira',
  email: 'carlos@edumanage.com',
  phone: '(11) 99999-3333',
  role: 'secretary',
  unitId: '2',
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, ];

let demoStudents: Student[] = [{
  id: '1',
  firstName: 'Ana',
  lastName: 'Costa',
  email: 'ana@email.com',
  phone: '(11) 98888-1111',
  dateOfBirth: '1995-03-15',
  unitId: '1',
  enrollmentDate: '2024-01-15',
  status: 'active',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}, {
  id: '2',
  firstName: 'Pedro',
  lastName: 'Fernandes',
  email: 'pedro@email.com',
  phone: '(11) 98888-2222',
  dateOfBirth: '1988-07-22',
  unitId: '1',
  enrollmentDate: '2024-02-01',
  status: 'active',
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}, {
  id: '3',
  firstName: 'Lucia',
  lastName: 'Martins',
  email: 'lucia@email.com',
  phone: '(11) 98888-3333',
  dateOfBirth: '1992-11-08',
  unitId: '2',
  enrollmentDate: '2024-01-20',
  status: 'active',
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
}, ];

let demoCourses: Course[] = [{
  id: '1',
  name: 'Inglês Básico',
  description: 'Curso de inglês para iniciantes',
  duration: 120,
  level: 'Básico',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '2',
  name: 'Inglês Intermediário',
  description: 'Curso de inglês para nível intermediário',
  duration: 150,
  level: 'Intermediário',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
}, {
  id: '3',
  name: 'Espanhol Básico',
  description: 'Curso de espanhol para iniciantes',
  duration: 100,
  level: 'Básico',
  createdAt: new Date('2024-01-12'),
  updatedAt: new Date('2024-01-12'),
}, ];

let demoClasses: Class[] = [{
  id: '1',
  name: 'Turma Inglês A1',
  courseId: '1',
  teacherId: '1',
  unitId: '1',
  schedule: 'Segunda e Quarta 19:00-21:00',
  capacity: 15,
  enrolledStudents: 12,
  startDate: '2024-02-01',
  endDate: '2024-05-30',
  status: 'active',
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
}, {
  id: '2',
  name: 'Turma Espanhol B1',
  courseId: '3',
  teacherId: '2',
  unitId: '1',
  schedule: 'Terça e Quinta 18:00-20:00',
  capacity: 12,
  enrolledStudents: 8,
  startDate: '2024-02-15',
  endDate: '2024-06-15',
  status: 'active',
  createdAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
}, ];

let demoLessons: Lesson[] = [{
  id: '1',
  classId: '1',
  teacherId: '1',
  date: '2024-02-26',
  startTime: '19:00',
  endTime: '21:00',
  topic: 'Present Simple Tense',
  notes: 'Aula sobre tempo presente simples',
  status: 'completed',
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-02-26'),
}, {
  id: '2',
  classId: '1',
  teacherId: '1',
  date: '2024-02-28',
  startTime: '19:00',
  endTime: '21:00',
  topic: 'Present Continuous',
  notes: 'Aula sobre presente contínuo',
  status: 'scheduled',
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-02-20'),
}, {
  id: '3',
  classId: '2',
  teacherId: '2',
  date: '2024-02-27',
  startTime: '18:00',
  endTime: '20:00',
  topic: 'Verbos Irregulares',
  notes: 'Conjugação de verbos irregulares',
  status: 'completed',
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
  getLessonsByClass(classId: string): Promise < Lesson[] > ;
  getLessonsByTeacher(teacherId: string): Promise < Lesson[] > ;
  getTodaysLessons(): Promise < Lesson[] > ;
  createLesson(lesson: InsertLesson): Promise < Lesson > ;
  updateLesson(id: string, lesson: Partial < InsertLesson > ): Promise < Lesson > ;
  deleteLesson(id: string): Promise < void > ;

  // Dashboard stats
  getDashboardStats(): Promise < {
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  } > ;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise < User | undefined > {
    // Demo mode - returning a dummy user for login demonstration
    if (id === 'demo-user-id') {
      return {
        id: 'demo-user-id',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: undefined,
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
      ...user,
      id: user.id || crypto.randomUUID(),
      role: user.role || 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      ...unit,
      id,
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

  // Staff
  async getStaff(): Promise < StaffWithUser[] > {
    return demoStaff.map(staff => ({
      ...staff,
      user: { // Mock user data for staff
        id: staff.id, // Assuming staff ID can be used as a mock user ID
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        profileImageUrl: undefined, // Add if needed
        role: staff.role,
        isActive: true, // Assuming active staff are active users
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      }
    }));
  }

  async getStaffMember(id: string): Promise < StaffWithUser | undefined > {
    const staff = demoStaff.find(staff => staff.id === id);
    if (!staff) return undefined;

    return {
      ...staff,
      user: { // Mock user data for staff
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        profileImageUrl: undefined,
        role: staff.role,
        isActive: true,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      }
    };
  }

  async createStaff(staffData: InsertStaff): Promise < Staff > {
    const id = crypto.randomUUID();
    const newStaff: Staff = {
      ...staffData,
      id,
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
    return demoStudents.map(student => ({
      ...student,
      user: { // Mock user data for student
        id: student.id, // Assuming student ID can be used as a mock user ID
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        profileImageUrl: undefined,
        role: student.status === 'active' ? 'student' : 'inactive_student', // Example role mapping
        isActive: student.status === 'active',
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      }
    }));
  }

  async getStudent(id: string): Promise < StudentWithUser | undefined > {
    const student = demoStudents.find(student => student.id === id);
    if (!student) return undefined;

    return {
      ...student,
      user: { // Mock user data for student
        id: student.id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        profileImageUrl: undefined,
        role: student.status === 'active' ? 'student' : 'inactive_student',
        isActive: student.status === 'active',
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      }
    };
  }

  async createStudent(studentData: InsertStudent): Promise < Student > {
    const id = crypto.randomUUID();
    const newStudent: Student = {
      ...studentData,
      id,
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
      ...courseData,
      id,
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
    const index = demoCourses.findIndex(course => course.id === id);
    if (index !== -1) {
      demoCourses.splice(index, 1);
    }
  }

  // Classes
  async getClasses(): Promise < ClassWithDetails[] > {
    return demoClasses.map(cls => ({
      ...cls,
      course: demoCourses.find(c => c.id === cls.courseId) || {} as Course, // Mock course
      teacher: demoStaff.find(s => s.id === cls.teacherId) || {} as Staff, // Mock teacher
      unit: demoUnits.find(u => u.id === cls.unitId) || {} as Unit, // Mock unit
      enrollments: [], // No enrollments in demo
    }));
  }

  async getClass(id: string): Promise < ClassWithDetails | undefined > {
    const cls = demoClasses.find(cls => cls.id === id);
    if (!cls) return undefined;

    return {
      ...cls,
      course: demoCourses.find(c => c.id === cls.courseId) || {} as Course,
      teacher: demoStaff.find(s => s.id === cls.teacherId) || {} as Staff,
      unit: demoUnits.find(u => u.id === cls.unitId) || {} as Unit,
      enrollments: [],
    };
  }

  async getClassesByTeacher(teacherId: string): Promise < ClassWithDetails[] > {
    return demoClasses.filter(cls => cls.teacherId === teacherId).map(cls => ({
      ...cls,
      course: demoCourses.find(c => c.id === cls.courseId) || {} as Course,
      teacher: demoStaff.find(s => s.id === cls.teacherId) || {} as Staff,
      unit: demoUnits.find(u => u.id === cls.unitId) || {} as Unit,
      enrollments: [],
    }));
  }

  async createClass(classData: InsertClass): Promise < Class > {
    const id = crypto.randomUUID();
    const newClass: Class = {
      ...classData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoClasses.push(newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial < InsertClass > ): Promise < Class > {
    const index = demoClasses.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Class not found');

    const updatedClass = {
      ...demoClasses[index],
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

  async getLessonsByClass(classId: string): Promise < Lesson[] > {
    return demoLessons.filter(lesson => lesson.classId === classId);
  }

  async getLessonsByTeacher(teacherId: string): Promise < Lesson[] > {
    return demoLessons.filter(lesson => lesson.teacherId === teacherId);
  }

  async getTodaysLessons(): Promise < Lesson[] > {
    const today = new Date().toISOString().split('T')[0];
    return demoLessons.filter(lesson => lesson.date === today);
  }

  async createLesson(lessonData: InsertLesson): Promise < Lesson > {
    const id = crypto.randomUUID();
    const newLesson: Lesson = {
      ...lessonData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    demoLessons.push(newLesson);
    return newLesson;
  }

  async updateLesson(id: string, lessonData: Partial < InsertLesson > ): Promise < Lesson > {
    const index = demoLessons.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lesson not found');

    const updatedLesson = {
      ...demoLessons[index],
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

  // Dashboard stats
  async getDashboardStats(): Promise < {
    totalStudents: number;
    activeTeachers: number;
    todaysClasses: number;
    monthlyRevenue: number;
  } > {
    const activeTeachers = demoStaff.filter(staff => staff.role === 'teacher').length;
    const todaysLessons = demoLessons.filter(lesson => lesson.date === new Date().toISOString().split('T')[0]).length;

    return {
      totalStudents: demoStudents.length,
      activeTeachers: activeTeachers,
      todaysClasses: todaysLessons,
      monthlyRevenue: 47200, // Placeholder - would calculate from payments table
    };
  }
}

export const storage = new DatabaseStorage();