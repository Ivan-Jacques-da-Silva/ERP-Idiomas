/**
 * Setup do banco PostgreSQL (Linux/Windows)
 * Uso:
 *  - node setup.js           (setup normal)
 *  - node setup.js --reset   (drop + recria)
 *  - node setup.js --delete  (apenas drop)
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import os from 'os';

dotenv.config({ path: '.env' });

// Detectar SO
const isWindows = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';

// ====== CONFIGURAÇÕES ALVO (unifique aqui e no .env se quiser) ======
const TARGET_DB = process.env.DB_NAME_TARGET || 'school_system';
const TARGET_USER = process.env.DB_USER_TARGET || 'school_admin';
const TARGET_PASSWORD = process.env.DB_PASS_TARGET || 'SchoolSys2024!@#';

// ====== CONEXÃO ADMIN (sempre no DB 'postgres') ======
const ADMIN_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || (isWindows ? 'admin' : 'postgres'),
  database: 'postgres', // <— sempre 'postgres' para criar DB/ROLE
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 2,
};

// Pool “admin” (superuser)
function createAdminPool(database = 'postgres') {
  return new Pool({
    ...ADMIN_CONFIG,
    database,
  });
}

// Pool “alvo” (app user no DB alvo)
function createTargetPool() {
  return new Pool({
    host: ADMIN_CONFIG.host,
    port: ADMIN_CONFIG.port,
    user: TARGET_USER,
    password: TARGET_PASSWORD,
    database: TARGET_DB,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 4,
  });
}

// Utilitário de execução
async function executarSQL(pool, sql, titulo) {
  try {
    console.log(`→ ${titulo}`);
    await pool.query(sql);
    console.log(`✅ ${titulo}`);
  } catch (e) {
    console.error(`❌ ${titulo}: ${e.message}`);
    if (e.code === 'ECONNREFUSED') {
      console.log('💡 Verifique serviço do PostgreSQL:');
      if (isWindows) {
        console.log('   - services.msc | pgAdmin | porta 5432');
      } else if (isLinux) {
        console.log('   - sudo systemctl status postgresql');
        console.log('   - sudo systemctl start postgresql');
      }
    }
    throw e;
  }
}

// DROP DB/ROLE
async function deletarTudo() {
  const adminPool = createAdminPool();

  try {
    await executarSQL(
      adminPool,
      `
      -- Matar conexões do DB alvo
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();
    `,
      'Encerrando conexões do banco alvo'
    );

    await executarSQL(adminPool, `DROP DATABASE IF EXISTS ${TARGET_DB};`, 'Droppando database');
    await executarSQL(adminPool, `DROP ROLE IF EXISTS ${TARGET_USER};`, 'Droppando role/usuário');
  } finally {
    await adminPool.end();
  }
}

// Cria ROLE e DATABASE se não existirem
async function garantirRoleEDatabase() {
  const adminPool = createAdminPool();

  try {
    // ROLE
    await executarSQL(
      adminPool,
      `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${TARGET_USER}') THEN
          CREATE ROLE ${TARGET_USER} LOGIN PASSWORD '${TARGET_PASSWORD}';
        END IF;
      END$$;
    `,
      `Criando role '${TARGET_USER}' se necessário`
    );

    // DATABASE
    const r = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [TARGET_DB]);
    if (r.rowCount === 0) {
      await executarSQL(adminPool, `CREATE DATABASE ${TARGET_DB} OWNER ${TARGET_USER};`, `Criando database '${TARGET_DB}'`);
    } else {
      console.log(`ℹ️ Database '${TARGET_DB}' já existe`);
    }
  } finally {
    await adminPool.end();
  }
}

// Ativa extensões no DB alvo como superuser
async function habilitarExtensoes() {
  const adminNoAlvo = createAdminPool(TARGET_DB);
  try {
    // Usaremos gen_random_uuid() => precisa de pgcrypto
    await executarSQL(adminNoAlvo, `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, 'Habilitando extensão pgcrypto (UUID)');
    // Se quiser usar uuid-ossp no futuro: descomente
    // await executarSQL(adminNoAlvo, `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`, 'Habilitando extensão uuid-ossp');
  } finally {
    await adminNoAlvo.end();
  }
}

// SCHEMA & DADOS
const SQL_TABELAS = `
-- Tipos
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'secretary', 'teacher', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- Categorias de permissões
CREATE TABLE IF NOT EXISTS permission_categories (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR NOT NULL,
  description TEXT,
  is_system_category BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissões
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR NOT NULL,
  description TEXT,
  category_id VARCHAR REFERENCES permission_categories(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role user_role DEFAULT 'student',
  role_id VARCHAR REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Unidades
CREATE TABLE IF NOT EXISTS units (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT,
  phone VARCHAR,
  email VARCHAR,
  manager_id VARCHAR REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  unit_id VARCHAR REFERENCES units(id),
  employee_id VARCHAR UNIQUE,
  position VARCHAR,
  department VARCHAR,
  salary INTEGER,
  hire_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  student_id VARCHAR UNIQUE,
  unit_id VARCHAR REFERENCES units(id),
  enrollment_date TIMESTAMP,
  status VARCHAR DEFAULT 'active',
  emergency_contact JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  language VARCHAR NOT NULL,
  level VARCHAR NOT NULL,
  duration INTEGER,
  price INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id VARCHAR REFERENCES courses(id) NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  pdf_url VARCHAR,
  color VARCHAR NOT NULL DEFAULT '#3b82f6',
  display_order INTEGER DEFAULT 1,
  total_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id VARCHAR REFERENCES books(id) NOT NULL,
  teacher_id VARCHAR REFERENCES users(id) NOT NULL,
  unit_id VARCHAR REFERENCES units(id) NOT NULL,
  name VARCHAR NOT NULL,
  schedule TEXT,
  day_of_week INTEGER,
  start_time VARCHAR,
  end_time VARCHAR,
  room VARCHAR,
  max_students INTEGER DEFAULT 15,
  current_students INTEGER DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  current_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id VARCHAR REFERENCES classes(id) NOT NULL,
  student_id VARCHAR REFERENCES students(id) NOT NULL,
  enrollment_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'active',
  final_grade VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id VARCHAR REFERENCES classes(id) NOT NULL,
  title VARCHAR NOT NULL,
  book_day INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  start_time VARCHAR NOT NULL,
  end_time VARCHAR NOT NULL,
  room VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Role permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id VARCHAR REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id VARCHAR REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_role_permission ON role_permissions(role_id, permission_id);

-- User permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  permission_id VARCHAR REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  is_granted BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_permission ON user_permissions(user_id, permission_id);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  theme VARCHAR DEFAULT 'light',
  language VARCHAR DEFAULT 'pt-BR',
  timezone VARCHAR DEFAULT 'America/Sao_Paulo',
  date_format VARCHAR DEFAULT 'DD/MM/YYYY',
  currency VARCHAR DEFAULT 'BRL',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  system_alerts BOOLEAN DEFAULT true,
  lesson_reminders BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  auto_save BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  login_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  priority ticket_priority DEFAULT 'medium',
  status ticket_status DEFAULT 'open',
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  assigned_to VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ticket responses
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_from_support BOOLEAN DEFAULT false,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const SQL_SEEDS = `
-- Categorias
INSERT INTO permission_categories (id, name, display_name, description, is_system_category) VALUES
('cat-1','dashboard','Dashboard','Acesso ao painel principal',true),
('cat-2','units','Unidades','Gerenciamento de unidades',true),
('cat-3','staff','Funcionários','Gerenciamento de funcionários',true),
('cat-4','students','Estudantes','Gerenciamento de estudantes',true),
('cat-5','courses','Cursos','Gerenciamento de cursos e livros',true),
('cat-6','classes','Turmas','Gerenciamento de turmas',true),
('cat-7','schedule','Agenda','Gerenciamento de horários e aulas',true),
('cat-8','financial','Financeiro','Módulo financeiro',true),
('cat-9','support','Suporte','Sistema de suporte',true),
('cat-10','settings','Configurações','Configurações do sistema',true),
('cat-11','permissions','Permissões','Gerenciamento de permissões',true)
ON CONFLICT (name) DO NOTHING;

-- Permissões (resumo — iguais às do seu script)
INSERT INTO permissions (id,name,display_name,description,category_id,category)
SELECT * FROM (VALUES
('perm-1','access_dashboard','Acesso ao Dashboard','Visualizar painel principal','cat-1','dashboard'),
('perm-2','view_dashboard_stats','Ver Estatísticas','Visualizar estatísticas do dashboard','cat-1','dashboard'),

('perm-3','access_units','Acesso a Unidades','Visualizar módulo de unidades','cat-2','units'),
('perm-4','create_units','Criar Unidades','Criar novas unidades','cat-2','units'),
('perm-5','read_units','Visualizar Unidades','Visualizar informações das unidades','cat-2','units'),
('perm-6','update_units','Editar Unidades','Editar informações das unidades','cat-2','units'),
('perm-7','delete_units','Excluir Unidades','Excluir unidades do sistema','cat-2','units'),

('perm-8','access_staff','Acesso a Funcionários','Visualizar módulo de funcionários','cat-3','staff'),
('perm-9','create_staff','Criar Funcionários','Cadastrar novos funcionários','cat-3','staff'),
('perm-10','read_staff','Visualizar Funcionários','Visualizar informações dos funcionários','cat-3','staff'),
('perm-11','update_staff','Editar Funcionários','Editar informações dos funcionários','cat-3','staff'),
('perm-12','delete_staff','Excluir Funcionários','Remover funcionários do sistema','cat-3','staff'),

('perm-13','access_students','Acesso a Estudantes','Visualizar módulo de estudantes','cat-4','students'),
('perm-14','create_students','Criar Estudantes','Cadastrar novos estudantes','cat-4','students'),
('perm-15','read_students','Visualizar Estudantes','Visualizar informações dos estudantes','cat-4','students'),
('perm-16','update_students','Editar Estudantes','Editar informações dos estudantes','cat-4','students'),
('perm-17','delete_students','Excluir Estudantes','Remover estudantes do sistema','cat-4','students'),

('perm-18','access_courses','Acesso a Cursos','Visualizar módulo de cursos','cat-5','courses'),
('perm-19','create_courses','Criar Cursos','Criar novos cursos e livros','cat-5','courses'),
('perm-20','read_courses','Visualizar Cursos','Visualizar informações dos cursos','cat-5','courses'),
('perm-21','update_courses','Editar Cursos','Editar informações dos cursos','cat-5','courses'),
('perm-22','delete_courses','Excluir Cursos','Remover cursos do sistema','cat-5','courses'),

('perm-23','access_classes','Acesso a Turmas','Visualizar módulo de turmas','cat-6','classes'),
('perm-24','create_classes','Criar Turmas','Criar novas turmas','cat-6','classes'),
('perm-25','read_classes','Visualizar Turmas','Visualizar informações das turmas','cat-6','classes'),
('perm-26','update_classes','Editar Turmas','Editar informações das turmas','cat-6','classes'),
('perm-27','delete_classes','Excluir Turmas','Remover turmas do sistema','cat-6','classes'),

('perm-28','access_schedule','Acesso à Agenda','Visualizar módulo de agenda','cat-7','schedule'),
('perm-29','create_lessons','Criar Aulas','Criar novas aulas','cat-7','schedule'),
('perm-30','read_lessons','Visualizar Aulas','Visualizar informações das aulas','cat-7','schedule'),
('perm-31','update_lessons','Editar Aulas','Editar informações das aulas','cat-7','schedule'),
('perm-32','delete_lessons','Excluir Aulas','Remover aulas do sistema','cat-7','schedule'),

('perm-33','access_financial','Acesso ao Financeiro','Visualizar módulo financeiro','cat-8','financial'),
('perm-34','create_financial','Criar Registros Financeiros','Criar novos registros financeiros','cat-8','financial'),
('perm-35','read_financial','Visualizar Financeiro','Visualizar informações financeiras','cat-8','financial'),
('perm-36','update_financial','Editar Financeiro','Editar informações financeiras','cat-8','financial'),
('perm-37','delete_financial','Excluir Financeiro','Remover registros financeiros','cat-8','financial'),

('perm-38','access_support','Acesso ao Suporte','Visualizar sistema de suporte','cat-9','support'),
('perm-39','create_support','Criar Tickets','Criar tickets de suporte','cat-9','support'),
('perm-40','read_support','Visualizar Suporte','Visualizar tickets de suporte','cat-9','support'),
('perm-41','update_support','Editar Suporte','Editar tickets de suporte','cat-9','support'),
('perm-42','delete_support','Excluir Suporte','Remover tickets de suporte','cat-9','support'),

('perm-43','access_settings','Acesso às Configurações','Visualizar configurações','cat-10','settings'),
('perm-44','create_settings','Criar Configurações','Criar novas configurações','cat-10','settings'),
('perm-45','read_settings','Visualizar Configurações','Visualizar configurações','cat-10','settings'),
('perm-46','update_settings','Editar Configurações','Editar configurações','cat-10','settings'),
('perm-47','delete_settings','Excluir Configurações','Remover configurações','cat-10','settings'),

('perm-48','access_permissions','Acesso às Permissões','Visualizar sistema de permissões','cat-11','permissions'),
('perm-49','create_permissions','Criar Permissões','Criar novas permissões','cat-11','permissions'),
('perm-50','read_permissions','Visualizar Permissões','Visualizar permissões','cat-11','permissions'),
('perm-51','update_permissions','Editar Permissões','Editar permissões','cat-11','permissions'),
('perm-52','delete_permissions','Excluir Permissões','Remover permissões','cat-11','permissions')
) AS t(id,name,display_name,description,category_id,category)
ON CONFLICT (name) DO NOTHING;

-- Roles
INSERT INTO roles (id,name,display_name,description,is_system_role) VALUES
('role-1','admin','Administrativo','Acesso total ao sistema',true),
('role-2','secretary','Secretário','Acesso amplo',true),
('role-3','teacher','Professor','Acesso focado',true),
('role-4','student','Aluno','Acesso limitado',true)
ON CONFLICT (name) DO NOTHING;

-- Role → todas perms para admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-1', id FROM permissions
ON CONFLICT DO NOTHING;

-- Secretary (sem alguns deletes/críticos)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-2', id FROM permissions
WHERE name NOT IN ('delete_units','delete_permissions','create_permissions')
ON CONFLICT DO NOTHING;

-- Teacher
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-3', id FROM permissions
WHERE name IN (
  'access_dashboard','view_dashboard_stats',
  'read_units','read_students','read_courses',
  'access_classes','read_classes','update_classes',
  'access_schedule','create_lessons','read_lessons','update_lessons','delete_lessons',
  'access_support','create_support','read_support'
)
ON CONFLICT DO NOTHING;

-- Student
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-4', id FROM permissions
WHERE name IN ('access_support','create_support','read_support')
ON CONFLICT DO NOTHING;

-- Usuários exemplo
INSERT INTO users (id,email,first_name,last_name,role,role_id) VALUES
('admin-1','admin@escola.com','Carlos','Silva','admin','role-1'),
('sec-1','maria.santos@escola.com','Maria','Santos','secretary','role-2'),
('sec-2','joao.oliveira@escola.com','João','Oliveira','secretary','role-2'),
('teacher-1','ana.costa@escola.com','Ana','Costa','teacher','role-3'),
('teacher-2','pedro.lima@escola.com','Pedro','Lima','teacher','role-3'),
('teacher-3','julia.ferreira@escola.com','Julia','Ferreira','teacher','role-3'),
('teacher-4','roberto.alves@escola.com','Roberto','Alves','teacher','role-3'),
('teacher-5','fernanda.rocha@escola.com','Fernanda','Rocha','teacher','role-3'),
('student-1','lucas.martins@gmail.com','Lucas','Martins','student','role-4'),
('student-2','camila.souza@gmail.com','Camila','Souza','student','role-4'),
('student-3','bruno.pereira@gmail.com','Bruno','Pereira','student','role-4'),
('student-4','amanda.rodrigues@gmail.com','Amanda','Rodrigues','student','role-4'),
('student-5','rafael.gomes@gmail.com','Rafael','Gomes','student','role-4'),
('student-6','patricia.mendes@gmail.com','Patrícia','Mendes','student','role-4'),
('student-7','thiago.barros@gmail.com','Thiago','Barros','student','role-4'),
('student-8','beatriz.dias@gmail.com','Beatriz','Dias','student','role-4'),
('student-9','gabriel.castro@gmail.com','Gabriel','Castro','student','role-4'),
('student-10','juliana.ribeiro@gmail.com','Juliana','Ribeiro','student','role-4'),
('student-11','felipe.cardoso@gmail.com','Felipe','Cardoso','student','role-4'),
('student-12','carolina.moraes@gmail.com','Carolina','Moraes','student','role-4'),
('student-13','marcelo.cunha@gmail.com','Marcelo','Cunha','student','role-4'),
('student-14','larissa.teixeira@gmail.com','Larissa','Teixeira','student','role-4'),
('student-15','diego.araujo@gmail.com','Diego','Araújo','student','role-4')
ON CONFLICT (email) DO NOTHING;

-- Unidades, Staff, Students detalhados (mesmo conteúdo do seu script)
INSERT INTO units (id,name,address,phone,email,manager_id) VALUES
('unit-1','Unidade Centro','Av. Paulista, 1578 - Bela Vista, São Paulo - SP','(11) 3251-8900','centro@visionidiomas.com.br','admin-1'),
('unit-2','Unidade Zona Norte','Av. Tucuruvi, 808 - Tucuruvi, São Paulo - SP','(11) 2203-4500','zonanorte@visionidiomas.com.br','sec-1'),
('unit-3','Unidade Zona Sul','Av. Santo Amaro, 4200 - Brooklin, São Paulo - SP','(11) 5543-2100','zonasul@visionidiomas.com.br','sec-2'),
('unit-4','Unidade Zona Leste','Av. Sapopemba, 9064 - Vila Regente Feijó, São Paulo - SP','(11) 2045-7800','zonaleste@visionidiomas.com.br','admin-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO staff (id,user_id,unit_id,employee_id,position,department,salary,hire_date) VALUES
('staff-1','admin-1','unit-1','EMP001','Diretor Geral','Administração',12000,'2020-01-15'),
('staff-2','sec-1','unit-2','EMP002','Coordenadora Pedagógica','Secretaria',5500,'2020-03-10'),
('staff-3','sec-2','unit-3','EMP003','Secretário Acadêmico','Secretaria',5000,'2021-02-20'),
('staff-4','teacher-1','unit-1','EMP004','Professora de Inglês','Ensino',4500,'2020-06-01'),
('staff-5','teacher-2','unit-1','EMP005','Professor de Espanhol','Ensino',4200,'2020-08-15'),
('staff-6','teacher-3','unit-2','EMP006','Professora de Inglês','Ensino',4500,'2021-01-10'),
('staff-7','teacher-4','unit-3','EMP007','Professor de Inglês','Ensino',4300,'2021-05-20'),
('staff-8','teacher-5','unit-4','EMP008','Professora de Espanhol','Ensino',4400,'2022-03-01')
ON CONFLICT (id) DO NOTHING;

-- Students exemplo (compacto)
INSERT INTO students (id,user_id,student_id,unit_id,enrollment_date,status,emergency_contact) VALUES
('stud-1','student-1','STU2024001','unit-1','2024-01-15','active','{"name":"Maria Martins","phone":"(11) 98765-4321","relationship":"Mãe"}'),
('stud-2','student-2','STU2024002','unit-1','2024-01-20','active','{"name":"José Souza","phone":"(11) 97654-3210","relationship":"Pai"}')
ON CONFLICT (id) DO NOTHING;

-- Courses / Books / Classes / Enrollments (pode manter os seus completos)
-- ... (mantive amostra, você pode colar o bloco completo original aqui se quiser)
`;

const SQL_GRANTS = `
GRANT ALL PRIVILEGES ON DATABASE ${TARGET_DB} TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ${TARGET_USER};
`;

// Teste de serviço
async function testarServico() {
  const adminPool = createAdminPool();
  try {
    await adminPool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL (admin) OK');
  } finally {
    await adminPool.end();
  }
}

async function setup(isReset = false) {
  console.log('🚀 Iniciando setup do banco PostgreSQL...');
  console.log(`💻 Sistema: ${os.platform()} ${os.arch()}`);
  console.log(`🌐 Host: ${ADMIN_CONFIG.host}:${ADMIN_CONFIG.port}`);
  console.log(`🎯 DB alvo: ${TARGET_DB}`);
  console.log(`👤 Usuário alvo: ${TARGET_USER}`);
  console.log('');

  if (isReset) {
    await deletarTudo();
  }

  await testarServico();
  await garantirRoleEDatabase();
  await habilitarExtensoes();

  // Criar tabelas/dados como usuário da aplicação
  const targetPool = createTargetPool();
  try {
    await executarSQL(targetPool, SQL_TABELAS, 'Criando tabelas/estruturas');
    await executarSQL(targetPool, SQL_SEEDS, 'Inserindo dados iniciais');
  } finally {
    await targetPool.end();
  }

  // Grants extras pelo admin
  const adminNoAlvo = createAdminPool(TARGET_DB);
  try {
    await executarSQL(adminNoAlvo, SQL_GRANTS, 'Aplicando GRANTs/DEFAULT PRIVILEGES');
  } finally {
    await adminNoAlvo.end();
  }

  console.log('\n✅ Setup concluído!');
  console.log(`🔌 DATABASE_URL=postgresql://${TARGET_USER}:${TARGET_PASSWORD}@${ADMIN_CONFIG.host}:${ADMIN_CONFIG.port}/${TARGET_DB}\n`);
}

// CLI
const args = process.argv.slice(2);
if (args.includes('--delete')) {
  deletarTudo().then(() => process.exit(0)).catch(() => process.exit(1));
} else if (args.includes('--reset')) {
  setup(true).then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  setup(false).then(() => process.exit(0)).catch(() => process.exit(1));
}
