
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurações do banco
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin', // Senha padrão do PostgreSQL no ambiente
  database: 'postgres' // Conecta ao banco padrão primeiro
};

const TARGET_DB = 'school_system';
const TARGET_USER = 'school_admin';
const TARGET_PASSWORD = 'SchoolSys2024!@#';

// Função para executar comandos SQL
async function executeSQL(pool, sql, description) {
  try {
    console.log(`Executando: ${description}`);
    await pool.query(sql);
    console.log(`✅ ${description} - Sucesso`);
  } catch (error) {
    console.error(`❌ ${description} - Erro:`, error.message);
    throw error;
  }
}

// SQL para criar o banco e usuário
const CREATE_DATABASE_SQL = `
-- Criar usuário se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${TARGET_USER}') THEN
    CREATE ROLE ${TARGET_USER} LOGIN PASSWORD '${TARGET_PASSWORD}';
  END IF;
END $$;

-- Criar banco se não existir
SELECT 'CREATE DATABASE ${TARGET_DB} OWNER ${TARGET_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${TARGET_DB}')\\gexec
`;

// SQL para criar todas as tabelas baseado no schema
const CREATE_TABLES_SQL = `
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar ENUMs
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'secretary', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de sessões (obrigatória para Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Tabela de categorias de permissões
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

-- Tabela de permissões
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

-- Tabela de roles
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

-- Tabela de usuários
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

-- Tabela de unidades
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

-- Tabela de funcionários
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

-- Tabela de estudantes
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  student_id VARCHAR UNIQUE,
  unit_id VARCHAR REFERENCES units(id),
  enrollment_date TIMESTAMP,
  status VARCHAR DEFAULT 'active',
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de cursos
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

-- Tabela de livros
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

-- Tabela de turmas
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

-- Tabela de matrículas
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

-- Tabela de aulas
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

-- Tabela de permissões de roles
CREATE TABLE IF NOT EXISTS role_permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id VARCHAR REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id VARCHAR REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS UQ_role_permission ON role_permissions(role_id, permission_id);

-- Tabela de permissões individuais de usuários
CREATE TABLE IF NOT EXISTS user_permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  permission_id VARCHAR REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  is_granted BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS UQ_user_permission ON user_permissions(user_id, permission_id);

-- Tabela de configurações de usuário
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

-- Tabela de tickets de suporte
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

-- Tabela de respostas de tickets
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_from_support BOOLEAN DEFAULT false,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

// SQL para inserir dados iniciais
const INSERT_INITIAL_DATA_SQL = `
-- Inserir categorias de permissões
INSERT INTO permission_categories (id, name, display_name, description, is_system_category) VALUES
('cat-1', 'dashboard', 'Dashboard', 'Acesso ao painel principal', true),
('cat-2', 'units', 'Unidades', 'Gerenciamento de unidades', true),
('cat-3', 'staff', 'Funcionários', 'Gerenciamento de funcionários', true),
('cat-4', 'students', 'Estudantes', 'Gerenciamento de estudantes', true),
('cat-5', 'courses', 'Cursos', 'Gerenciamento de cursos e livros', true),
('cat-6', 'classes', 'Turmas', 'Gerenciamento de turmas', true),
('cat-7', 'schedule', 'Agenda', 'Gerenciamento de horários e aulas', true),
('cat-8', 'financial', 'Financeiro', 'Módulo financeiro', true),
('cat-9', 'support', 'Suporte', 'Sistema de suporte', true),
('cat-10', 'settings', 'Configurações', 'Configurações do sistema', true),
('cat-11', 'permissions', 'Permissões', 'Gerenciamento de permissões', true)
ON CONFLICT (name) DO NOTHING;

-- Inserir todas as permissões CRUD
INSERT INTO permissions (id, name, display_name, description, category_id, category) VALUES
-- Dashboard
('perm-1', 'access_dashboard', 'Acesso ao Dashboard', 'Visualizar painel principal', 'cat-1', 'dashboard'),
('perm-2', 'view_dashboard_stats', 'Ver Estatísticas', 'Visualizar estatísticas do dashboard', 'cat-1', 'dashboard'),

-- Unidades - CRUD
('perm-3', 'access_units', 'Acesso a Unidades', 'Visualizar módulo de unidades', 'cat-2', 'units'),
('perm-4', 'create_units', 'Criar Unidades', 'Criar novas unidades', 'cat-2', 'units'),
('perm-5', 'read_units', 'Visualizar Unidades', 'Visualizar informações das unidades', 'cat-2', 'units'),
('perm-6', 'update_units', 'Editar Unidades', 'Editar informações das unidades', 'cat-2', 'units'),
('perm-7', 'delete_units', 'Excluir Unidades', 'Excluir unidades do sistema', 'cat-2', 'units'),

-- Funcionários - CRUD
('perm-8', 'access_staff', 'Acesso a Funcionários', 'Visualizar módulo de funcionários', 'cat-3', 'staff'),
('perm-9', 'create_staff', 'Criar Funcionários', 'Cadastrar novos funcionários', 'cat-3', 'staff'),
('perm-10', 'read_staff', 'Visualizar Funcionários', 'Visualizar informações dos funcionários', 'cat-3', 'staff'),
('perm-11', 'update_staff', 'Editar Funcionários', 'Editar informações dos funcionários', 'cat-3', 'staff'),
('perm-12', 'delete_staff', 'Excluir Funcionários', 'Remover funcionários do sistema', 'cat-3', 'staff'),

-- Estudantes - CRUD
('perm-13', 'access_students', 'Acesso a Estudantes', 'Visualizar módulo de estudantes', 'cat-4', 'students'),
('perm-14', 'create_students', 'Criar Estudantes', 'Cadastrar novos estudantes', 'cat-4', 'students'),
('perm-15', 'read_students', 'Visualizar Estudantes', 'Visualizar informações dos estudantes', 'cat-4', 'students'),
('perm-16', 'update_students', 'Editar Estudantes', 'Editar informações dos estudantes', 'cat-4', 'students'),
('perm-17', 'delete_students', 'Excluir Estudantes', 'Remover estudantes do sistema', 'cat-4', 'students'),

-- Cursos - CRUD
('perm-18', 'access_courses', 'Acesso a Cursos', 'Visualizar módulo de cursos', 'cat-5', 'courses'),
('perm-19', 'create_courses', 'Criar Cursos', 'Criar novos cursos e livros', 'cat-5', 'courses'),
('perm-20', 'read_courses', 'Visualizar Cursos', 'Visualizar informações dos cursos', 'cat-5', 'courses'),
('perm-21', 'update_courses', 'Editar Cursos', 'Editar informações dos cursos', 'cat-5', 'courses'),
('perm-22', 'delete_courses', 'Excluir Cursos', 'Remover cursos do sistema', 'cat-5', 'courses'),

-- Turmas - CRUD
('perm-23', 'access_classes', 'Acesso a Turmas', 'Visualizar módulo de turmas', 'cat-6', 'classes'),
('perm-24', 'create_classes', 'Criar Turmas', 'Criar novas turmas', 'cat-6', 'classes'),
('perm-25', 'read_classes', 'Visualizar Turmas', 'Visualizar informações das turmas', 'cat-6', 'classes'),
('perm-26', 'update_classes', 'Editar Turmas', 'Editar informações das turmas', 'cat-6', 'classes'),
('perm-27', 'delete_classes', 'Excluir Turmas', 'Remover turmas do sistema', 'cat-6', 'classes'),

-- Agenda/Aulas - CRUD
('perm-28', 'access_schedule', 'Acesso à Agenda', 'Visualizar módulo de agenda', 'cat-7', 'schedule'),
('perm-29', 'create_lessons', 'Criar Aulas', 'Criar novas aulas', 'cat-7', 'schedule'),
('perm-30', 'read_lessons', 'Visualizar Aulas', 'Visualizar informações das aulas', 'cat-7', 'schedule'),
('perm-31', 'update_lessons', 'Editar Aulas', 'Editar informações das aulas', 'cat-7', 'schedule'),
('perm-32', 'delete_lessons', 'Excluir Aulas', 'Remover aulas do sistema', 'cat-7', 'schedule'),

-- Financeiro - CRUD
('perm-33', 'access_financial', 'Acesso ao Financeiro', 'Visualizar módulo financeiro', 'cat-8', 'financial'),
('perm-34', 'create_financial', 'Criar Registros Financeiros', 'Criar novos registros financeiros', 'cat-8', 'financial'),
('perm-35', 'read_financial', 'Visualizar Financeiro', 'Visualizar informações financeiras', 'cat-8', 'financial'),
('perm-36', 'update_financial', 'Editar Financeiro', 'Editar informações financeiras', 'cat-8', 'financial'),
('perm-37', 'delete_financial', 'Excluir Financeiro', 'Remover registros financeiros', 'cat-8', 'financial'),

-- Suporte - CRUD
('perm-38', 'access_support', 'Acesso ao Suporte', 'Visualizar sistema de suporte', 'cat-9', 'support'),
('perm-39', 'create_support', 'Criar Tickets', 'Criar tickets de suporte', 'cat-9', 'support'),
('perm-40', 'read_support', 'Visualizar Suporte', 'Visualizar tickets de suporte', 'cat-9', 'support'),
('perm-41', 'update_support', 'Editar Suporte', 'Editar tickets de suporte', 'cat-9', 'support'),
('perm-42', 'delete_support', 'Excluir Suporte', 'Remover tickets de suporte', 'cat-9', 'support'),

-- Configurações - CRUD
('perm-43', 'access_settings', 'Acesso às Configurações', 'Visualizar configurações', 'cat-10', 'settings'),
('perm-44', 'create_settings', 'Criar Configurações', 'Criar novas configurações', 'cat-10', 'settings'),
('perm-45', 'read_settings', 'Visualizar Configurações', 'Visualizar configurações', 'cat-10', 'settings'),
('perm-46', 'update_settings', 'Editar Configurações', 'Editar configurações', 'cat-10', 'settings'),
('perm-47', 'delete_settings', 'Excluir Configurações', 'Remover configurações', 'cat-10', 'settings'),

-- Permissões - CRUD
('perm-48', 'access_permissions', 'Acesso às Permissões', 'Visualizar sistema de permissões', 'cat-11', 'permissions'),
('perm-49', 'create_permissions', 'Criar Permissões', 'Criar novas permissões', 'cat-11', 'permissions'),
('perm-50', 'read_permissions', 'Visualizar Permissões', 'Visualizar permissões', 'cat-11', 'permissions'),
('perm-51', 'update_permissions', 'Editar Permissões', 'Editar permissões', 'cat-11', 'permissions'),
('perm-52', 'delete_permissions', 'Excluir Permissões', 'Remover permissões', 'cat-11', 'permissions')
ON CONFLICT (name) DO NOTHING;

-- Inserir roles do sistema
INSERT INTO roles (id, name, display_name, description, is_system_role) VALUES
('role-1', 'admin', 'Administrativo', 'Acesso total ao sistema', true),
('role-2', 'secretary', 'Secretário', 'Acesso completo exceto configurações críticas', true),
('role-3', 'teacher', 'Professor', 'Acesso focado em ensino e turmas', true),
('role-4', 'student', 'Aluno', 'Acesso limitado à área do aluno', true)
ON CONFLICT (name) DO NOTHING;

-- Configurar permissões para ADMIN (todas as permissões)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-1', id FROM permissions
ON CONFLICT DO NOTHING;

-- Configurar permissões para SECRETARY (quase todas exceto delete críticos)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-2', id FROM permissions 
WHERE name NOT IN ('delete_units', 'delete_permissions', 'create_permissions', 'delete_permissions')
ON CONFLICT DO NOTHING;

-- Configurar permissões para TEACHER (foco em turmas e aulas)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-3', id FROM permissions 
WHERE name IN (
  'access_dashboard', 'view_dashboard_stats',
  'read_units', 'read_students', 'read_courses', 
  'access_classes', 'read_classes', 'update_classes',
  'access_schedule', 'create_lessons', 'read_lessons', 'update_lessons', 'delete_lessons',
  'access_support', 'create_support', 'read_support'
)
ON CONFLICT DO NOTHING;

-- Configurar permissões para STUDENT (apenas área do aluno)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-4', id FROM permissions 
WHERE name IN ('access_support', 'create_support', 'read_support')
ON CONFLICT DO NOTHING;

-- Criar usuário administrador padrão
INSERT INTO users (id, email, first_name, last_name, role, role_id) VALUES
('admin-1', 'admin@escola.com', 'Administrador', 'Sistema', 'admin', 'role-1')
ON CONFLICT (email) DO NOTHING;

-- Dados demo para teste
INSERT INTO units (id, name, address, phone, email) VALUES
('unit-1', 'Unidade Centro', 'Rua Principal, 123', '(11) 1234-5678', 'centro@escola.com'),
('unit-2', 'Unidade Norte', 'Av. Norte, 456', '(11) 2345-6789', 'norte@escola.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, name, description, language, level) VALUES
('course-1', 'Inglês Básico', 'Curso de inglês para iniciantes', 'English', 'beginner'),
('course-2', 'Español Intermedio', 'Curso de espanhol intermediário', 'Spanish', 'intermediate')
ON CONFLICT (id) DO NOTHING;

INSERT INTO books (id, course_id, name, description, color) VALUES
('book-1', 'course-1', 'English Basic - Level 1', 'Primeiro livro de inglês básico', '#3b82f6'),
('book-2', 'course-2', 'Español Intermedio - Libro 1', 'Primeiro livro de espanhol intermediário', '#ef4444')
ON CONFLICT (id) DO NOTHING;
`;

// SQL para dar permissões completas ao usuário
const GRANT_PERMISSIONS_SQL = `
-- Dar todas as permissões ao usuário school_admin
GRANT ALL PRIVILEGES ON DATABASE ${TARGET_DB} TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${TARGET_USER};

-- Permissões para tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ${TARGET_USER};
`;

// Função para deletar tudo
async function deleteAll() {
  console.log('🗑️  Deletando banco de dados e usuário...');
  
  const pool = new Pool(DB_CONFIG);
  
  try {
    // Desconectar todos os usuários do banco
    await executeSQL(pool, `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();
    `, 'Desconectando usuários ativos');

    // Deletar banco
    await executeSQL(pool, `DROP DATABASE IF EXISTS ${TARGET_DB};`, 'Deletando banco de dados');
    
    // Deletar usuário
    await executeSQL(pool, `DROP ROLE IF EXISTS ${TARGET_USER};`, 'Deletando usuário');
    
    console.log('✅ Banco e usuário deletados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao deletar:', error.message);
  } finally {
    await pool.end();
  }
}

// Função principal de setup
async function setup(isReset = false) {
  console.log(`🚀 Iniciando setup do banco PostgreSQL...`);
  console.log(`📋 Configurações:`);
  console.log(`   - Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`   - Banco: ${TARGET_DB}`);
  console.log(`   - Usuário: ${TARGET_USER}`);
  
  if (isReset) {
    await deleteAll();
  }

  const pool = new Pool(DB_CONFIG);
  
  try {
    // Criar banco e usuário
    await executeSQL(pool, CREATE_DATABASE_SQL, 'Criando banco e usuário');
    await pool.end();
    
    // Conectar ao novo banco
    const targetPool = new Pool({
      ...DB_CONFIG,
      database: TARGET_DB,
      user: TARGET_USER,
      password: TARGET_PASSWORD
    });
    
    // Criar todas as tabelas
    await executeSQL(targetPool, CREATE_TABLES_SQL, 'Criando tabelas e estruturas');
    
    // Inserir dados iniciais
    await executeSQL(targetPool, INSERT_INITIAL_DATA_SQL, 'Inserindo dados iniciais');
    
    await targetPool.end();
    
    // Dar permissões completas
    const adminPool = new Pool(DB_CONFIG);
    await executeSQL(adminPool, GRANT_PERMISSIONS_SQL, 'Configurando permissões');
    await adminPool.end();
    
    console.log('');
    console.log('✅ Setup concluído com sucesso!');
    console.log('');
    console.log('📋 Informações de conexão:');
    console.log(`   DATABASE_URL=postgresql://${TARGET_USER}:${TARGET_PASSWORD}@${DB_CONFIG.host}:${DB_CONFIG.port}/${TARGET_DB}`);
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log(`   - PostgreSQL User: ${TARGET_USER}`);
    console.log(`   - PostgreSQL Password: ${TARGET_PASSWORD}`);
    console.log(`   - Database: ${TARGET_DB}`);
    console.log('');
    console.log('👤 Usuário admin da aplicação:');
    console.log('   Email: admin@escola.com');
    console.log('   Role: admin (acesso total ao sistema)');
    console.log('');
    console.log('📊 Permissões configuradas:');
    console.log('   - Admin: Acesso total (todas as permissões CRUD)');
    console.log('   - Secretary: Acesso quase completo');
    console.log('   - Teacher: Acesso focado em turmas e aulas'); 
    console.log('   - Student: Acesso limitado à área do aluno');
    console.log('');
    console.log('⚠️  Para usar o banco, adicione esta variável ao seu ambiente:');
    console.log(`   export DATABASE_URL="postgresql://${TARGET_USER}:${TARGET_PASSWORD}@${DB_CONFIG.host}:${DB_CONFIG.port}/${TARGET_DB}"`);
    console.log('');
    console.log('🚀 Ou crie um arquivo .env com:');
    console.log(`   DATABASE_URL=postgresql://${TARGET_USER}:${TARGET_PASSWORD}@${DB_CONFIG.host}:${DB_CONFIG.port}/${TARGET_DB}`);
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    process.exit(1);
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--delete')) {
  deleteAll().then(() => process.exit(0));
} else if (args.includes('--reset')) {
  setup(true).then(() => process.exit(0));
} else {
  setup(false).then(() => process.exit(0));
}
