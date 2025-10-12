/**
 * Setup do PostgreSQL (VPS/Local)
 * - Conecta como superuser (postgres/admin)
 * - Cria usuário da app (school_admin/forte)
 * - Cria DB (school_system) + extensões
 * - Cria schema completo + seeds básicos
 * - Aplica GRANTs e Default Privileges
 * 
 * Uso:
 *   node setup.js
 *   node setup.js --reset   (drop + recria)
 *   node setup.js --delete  (apenas drop)
 */

import dotenv from "dotenv";
dotenv.config();

import os from "os";
import pkg from "pg";
const { Pool } = pkg;

// ===================== ENV ALVO =====================
const TARGET_DB       = process.env.DB_NAME_TARGET  || "school_system";
const TARGET_USER     = process.env.DB_USER_TARGET  || "school_admin";
const TARGET_PASSWORD = process.env.DB_PASS_TARGET  || "SchoolSys2024!@#";

// ===================== ENV ADMIN ====================
const ADMIN_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin", // ← superuser: **admin**
  database: process.env.DB_NAME || "postgres",
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 3,
};

// ===================== HELPERS ======================
const isWin   = os.platform() === "win32";
const isLinux = os.platform() === "linux";

const poolAdmin = (database = "postgres") =>
  new Pool({ ...ADMIN_CONFIG, database });

const poolTarget = () =>
  new Pool({
    host: ADMIN_CONFIG.host,
    port: ADMIN_CONFIG.port,
    user: TARGET_USER,
    password: TARGET_PASSWORD,
    database: TARGET_DB,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 5,
  });

async function exec(pool, sql, title) {
  try {
    console.log(`→ ${title}`);
    await pool.query(sql);
    console.log(`✅ ${title}`);
  } catch (e) {
    console.error(`❌ ${title}: ${e.message}`);
    if (e.code === "ECONNREFUSED") {
      console.log("💡 Verifique o serviço PostgreSQL:");
      if (isWin) console.log("   - services.msc / pgAdmin / porta 5432");
      if (isLinux) {
        console.log("   - sudo systemctl status postgresql");
        console.log("   - sudo systemctl start postgresql");
      }
    }
    throw e;
  }
}

// ===================== SQL (SCHEMA) =================
const SQL_ENUMS = `
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin','secretary','teacher','student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open','in_progress','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

const SQL_TABLES = `
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

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

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  -- campo de senha para autenticação (hash bcrypt)
  password VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  -- mantém coluna role legada e role_id (o código usa role_id)
  role user_role DEFAULT 'student',
  role_id VARCHAR REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS role_permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id VARCHAR REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id VARCHAR REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_role_permission ON role_permissions(role_id, permission_id);

CREATE TABLE IF NOT EXISTS user_permissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  permission_id VARCHAR REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  is_granted BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_permission ON user_permissions(user_id, permission_id);

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

CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_from_support BOOLEAN DEFAULT false,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

// Ajustes de schema idempotentes para bases já criadas anteriormente
const SQL_ALTER = `
DO $$ BEGIN
  -- adiciona coluna password se não existir
  BEGIN
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password VARCHAR;
  EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_column THEN NULL; END;
END $$;
`;

const SQL_SEEDS_MIN = `

-- Categorias
INSERT INTO permission_categories (id,name,display_name,description,is_system_category) VALUES
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

-- Roles
INSERT INTO roles (id,name,display_name,description,is_system_role) VALUES
('role-1','admin','Administrativo','Acesso total ao sistema',true),
('role-2','secretary','Secretário','Acesso amplo',true),
('role-3','teacher','Professor','Acesso focado',true),
('role-4','student','Aluno','Acesso limitado',true)
ON CONFLICT (name) DO NOTHING;

-- Usuário admin da app (exemplo)
INSERT INTO users (id,email,first_name,last_name,role,role_id)
VALUES ('admin-1','admin@escola.com','Carlos','Silva','admin','role-1')
ON CONFLICT (email) DO NOTHING;

-- Unidade exemplo
INSERT INTO units (id,name,address,phone,email,manager_id)
VALUES ('unit-1','Unidade Centro','Av. Paulista, 1578 - São Paulo - SP','(11) 3251-8900','centro@visionidiomas.com.br','admin-1')
ON CONFLICT (id) DO NOTHING;
`;

const SQL_GRANTS = `
GRANT ALL PRIVILEGES ON DATABASE ${TARGET_DB} TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${TARGET_USER};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${TARGET_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ${TARGET_USER};
`;

// ===================== AÇÕES ========================
async function dropAll() {
  const admin = poolAdmin();
  try {
    await exec(
      admin,
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname='${TARGET_DB}' AND pid <> pg_backend_pid();
      `,
      "Encerrando conexões do banco alvo"
    );
    await exec(admin, `DROP DATABASE IF EXISTS ${TARGET_DB};`, "Droppando database");
    await exec(admin, `DROP ROLE IF EXISTS ${TARGET_USER};`, "Droppando usuário alvo");
  } finally {
    await admin.end();
  }
}

async function ensureRoleAndDb() {
  const admin = poolAdmin();
  try {
    await exec(
      admin,
      `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${TARGET_USER}') THEN
          CREATE ROLE ${TARGET_USER} LOGIN PASSWORD '${TARGET_PASSWORD}';
        END IF;
      END$$;
      `,
      `Criando usuário '${TARGET_USER}' (senha forte) se necessário`
    );

    const r = await admin.query(`SELECT 1 FROM pg_database WHERE datname=$1`, [TARGET_DB]);
    if (r.rowCount === 0) {
      await exec(admin, `CREATE DATABASE ${TARGET_DB} OWNER ${TARGET_USER};`, `Criando banco '${TARGET_DB}'`);
    } else {
      console.log(`ℹ️ Banco '${TARGET_DB}' já existe`);
    }
  } finally {
    await admin.end();
  }
}

async function enableExtensions() {
  const adminOnTarget = poolAdmin(TARGET_DB);
  try {
    await exec(adminOnTarget, `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, "Habilitando extensão pgcrypto (UUID)");
  } finally {
    await adminOnTarget.end();
  }
}

async function testAdmin() {
  const admin = poolAdmin();
  try {
    await admin.query("SELECT NOW()");
    console.log("✅ Conexão com PostgreSQL (superuser) OK");
  } finally {
    await admin.end();
  }
}

// ===================== SETUP FLOW ===================
async function setup(isReset = false) {
  console.log("🚀 Iniciando setup do banco PostgreSQL...");
  console.log(`💻 Sistema: ${os.platform()} ${os.arch()}`);
  console.log(`🌐 Host: ${ADMIN_CONFIG.host}:${ADMIN_CONFIG.port}`);
  console.log(`👑 Superuser: ${ADMIN_CONFIG.user}`);
  console.log(`🎯 DB alvo: ${TARGET_DB}`);
  console.log(`👤 Usuário alvo: ${TARGET_USER}\n`);

  if (isReset) await dropAll();

  await testAdmin();
  await ensureRoleAndDb();
  await enableExtensions();

  const appPool = poolTarget();
  try {
    await exec(appPool, SQL_ENUMS,   "Criando ENUMs");
    await exec(appPool, SQL_TABLES,  "Criando tabelas/estruturas");
    await exec(appPool, SQL_ALTER,   "Ajustando colunas ausentes");
    await exec(appPool, SQL_SEEDS_MIN, "Inserindo dados iniciais");
  } finally {
    await appPool.end();
  }

  const grantPool = poolAdmin(TARGET_DB);
  try {
    await exec(grantPool, SQL_GRANTS, "Aplicando GRANTs e Default Privileges");
  } finally {
    await grantPool.end();
  }

  // Seed externo opcional
  try {
    const { seedDatabase } = await import("./seed-demo-users.js");
    if (typeof seedDatabase === "function") {
      console.log("🌱 Executando seed-demo-users.js...");
      await seedDatabase();
      console.log("✅ Seed externo concluído");
    }
  } catch { /* silencioso se não existir */ }

  console.log("\n✅ Setup concluído!");
  console.log(`🔌 DATABASE_URL (app): ${process.env.DATABASE_URL || "(defina no .env)"}`);
}

// ===================== CLI ==========================
const args = process.argv.slice(2);
const isDelete = args.includes("--delete");
const isReset  = args.includes("--reset");

const run = isDelete ? dropAll : () => setup(isReset);
run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("💥 Erro no setup:", e?.stack || e);
    process.exit(1);
  });
