#!/usr/bin/env node
// seed-demo-users.js — cria usuários/unidades demo usando pg (ESM)

import 'dotenv/config';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ========================= CONEXÃO PG ========================= */
// Usa as mesmas variáveis do setup.js
const TARGET_DB       = process.env.DB_NAME_TARGET  || "school_system";
const TARGET_USER     = process.env.DB_USER_TARGET  || "school_admin";
const TARGET_PASSWORD = process.env.DB_PASS_TARGET  || "SchoolSys2024!@#";
const DB_HOST         = process.env.DB_HOST || "127.0.0.1";
const DB_PORT         = parseInt(process.env.DB_PORT || "5432", 10);

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: TARGET_USER,
  password: TARGET_PASSWORD,
  database: TARGET_DB,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5,
});

// log alvo (sem senha)
console.log(
  '🔌 PG alvo:',
  `${TARGET_USER}@${DB_HOST}:${DB_PORT}/${TARGET_DB}`.replace(/:(.*?)@/, '://****@')
);

/* ====================== DADOS DE EXEMPLO ====================== */
const usuariosDemo = [
  { email: 'admin@demo.com',     first_name: 'Admin',      last_name: 'Sistema',  role: 'admin',     password: 'demo123' },
  { email: 'teacher@demo.com',   first_name: 'Professor',  last_name: 'Demo',     role: 'teacher',   password: 'demo123' },
  { email: 'secretary@demo.com', first_name: 'Secretária', last_name: 'Demo',     role: 'secretary', password: 'demo123' },
  { email: 'student@demo.com',   first_name: 'João',       last_name: 'Silva',    role: 'student',   password: 'demo123' },
];

const unidadesDemo = [
  { name: 'Unidade Centro',    address: 'Rua das Flores, 123 - Centro',       phone: '(11) 3456-7890', email: 'centro@vision.dev.br' },
];

/* ======================= FUNÇÕES AUXILIARES ======================= */
async function obterRoleIdPorNome(cli, nome) {
  const r = await cli.query(`SELECT id FROM roles WHERE name = $1`, [nome]);
  if (r.rowCount === 0) throw new Error(`Role não encontrada: ${nome}`);
  return r.rows[0].id;
}

async function upsertUsuario(cli, u) {
  const roleId = await obterRoleIdPorNome(cli, u.role);
  const sql = `
    INSERT INTO users (id, email, first_name, last_name, role, role_id, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
      SET first_name = EXCLUDED.first_name,
          last_name  = EXCLUDED.last_name,
          role       = EXCLUDED.role,
          role_id    = EXCLUDED.role_id,
          updated_at = NOW()
    RETURNING id, email;
  `;
  const r = await cli.query(sql, [u.email, u.first_name, u.last_name, u.role, roleId]);
  return r.rows[0];
}

async function upsertUnidade(cli, un) {
  const existe = await cli.query(`SELECT id, name FROM units WHERE name = $1`, [un.name]);
  if (existe.rowCount) return existe.rows[0];

  const sql = `
    INSERT INTO units (id, name, address, phone, email, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
    RETURNING id, name;
  `;
  const r = await cli.query(sql, [un.name, un.address, un.phone, un.email]);
  return r.rows[0];
}

async function upsertStaffPorEmail(cli, emailUsuario, unidadeId, cargo, depto, salario) {
  const u = await cli.query(`SELECT id FROM users WHERE email = $1`, [emailUsuario]);
  if (!u.rowCount) throw new Error(`Usuário não encontrado: ${emailUsuario}`);
  const userId = u.rows[0].id;

  const existe = await cli.query(`SELECT id FROM staff WHERE user_id = $1`, [userId]);
  if (existe.rowCount) {
    await cli.query(
      `UPDATE staff SET unit_id=$2, position=$3, department=$4, salary=$5, updated_at=NOW() WHERE user_id=$1`,
      [userId, unidadeId, cargo, depto, salario]
    );
  } else {
    await cli.query(
      `INSERT INTO staff (id, user_id, unit_id, position, department, salary, hire_date, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), true, NOW(), NOW())`,
      [userId, unidadeId, cargo, depto, salario]
    );
  }
}

async function upsertAlunoPorEmail(cli, emailUsuario, studentId, unidadeId) {
  const u = await cli.query(`SELECT id FROM users WHERE email = $1`, [emailUsuario]);
  if (!u.rowCount) throw new Error(`Usuário não encontrado: ${emailUsuario}`);
  const userId = u.rows[0].id;

  const existe = await cli.query(`SELECT id FROM students WHERE user_id = $1`, [userId]);
  if (existe.rowCount) {
    await cli.query(
      `UPDATE students SET student_id=$2, unit_id=$3, updated_at=NOW() WHERE user_id=$1`,
      [userId, studentId, unidadeId]
    );
  } else {
    await cli.query(
      `INSERT INTO students (id, user_id, student_id, unit_id, enrollment_date, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), 'active', NOW(), NOW())`,
      [userId, studentId, unidadeId]
    );
  }
}

/* =========================== EXPORTS =========================== */
export async function verificarTabelas() {
  const cli = await pool.connect();
  try {
    const r = await cli.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
        AND table_name IN ('users','units','staff','students')
      ORDER BY table_name
    `);
    return r.rows.length === 4;
  } finally {
    cli.release();
  }
}

export async function seedDatabase() {
  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');

    // usuários
    for (const u of usuariosDemo) {
      const criado = await upsertUsuario(cli, u);
      console.log(`✅ usuário: ${criado.email}`);
    }

    // unidades
    const unidadesCriadas = [];
    for (const un of unidadesDemo) {
      const c = await upsertUnidade(cli, un);
      unidadesCriadas.push(c);
      console.log(`✅ unidade: ${c.name}`);
    }

    const unidadePrincipalId = unidadesCriadas[0]?.id;
    if (!unidadePrincipalId) throw new Error('Unidade principal não encontrada para staff');

    // staff
    await upsertStaffPorEmail(cli, 'admin@demo.com',     unidadePrincipalId, 'diretor',      'Administração', 10000);
    await upsertStaffPorEmail(cli, 'teacher@demo.com',   unidadePrincipalId, 'instrutor',    'Ensino',         5000);
    await upsertStaffPorEmail(cli, 'secretary@demo.com', unidadePrincipalId, 'recepcionista','Administrativo', 3000);
    console.log('✅ staff atualizado');

    // aluno demo
    await upsertAlunoPorEmail(cli, 'student@demo.com', 'STD001', unidadePrincipalId);
    console.log('✅ aluno demo criado');

    // (opcional) matrícula no curso "Journey - English for Life"
    const studentData = await cli.query(`
      SELECT s.id FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE u.email = $1
    `, ['student@demo.com']);

    const courseData = await cli.query(`
      SELECT id FROM courses WHERE name = $1
    `, ['Journey - English for Life']);

    if (studentData.rows.length && courseData.rows.length) {
      const studentId = studentData.rows[0].id;
      const courseId  = courseData.rows[0].id;

      const bookData = await cli.query(`
        SELECT id FROM books WHERE course_id = $1 ORDER BY display_order LIMIT 1
      `, [courseId]);

      const unitData = await cli.query(`
        SELECT id FROM course_units WHERE book_id = $1 ORDER BY display_order LIMIT 1
      `, [bookData.rows[0]?.id]);

      await cli.query(`
        INSERT INTO student_course_enrollments
          (id, student_id, course_id, current_book_id, current_unit_id, enrollment_date, status, overall_progress, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), 'active', 0, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [studentId, courseId, bookData.rows[0]?.id, unitData.rows[0]?.id]);

      console.log('✅ aluno matriculado no curso Journey');
    }

    await cli.query('COMMIT');
    console.log('🎉 Seed concluído com sucesso!');
  } catch (e) {
    await cli.query('ROLLBACK');
    console.error('❌ Erro no seed:', e.message);
    throw e;
  } finally {
    cli.release();
  }
}

/* ============================ CLI ============================ */
async function main() {
  console.log('🚀 Iniciando seed dos usuários demo...');
  const ok = await verificarTabelas();
  if (!ok) {
    console.log('⚠️  Rode primeiro: node setup.js');
    process.exit(1);
  }
  await seedDatabase();
  await pool.end();

  console.log('\n📋 Logins demo:');
  console.log('👤 admin@demo.com / demo123 (Admin)');
  console.log('👤 teacher@demo.com / demo123 (Professor)');
  console.log('👤 secretary@demo.com / demo123 (Secretária)');
  console.log('🎓 student@demo.com / demo123 (Aluno - Curso Journey)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error('💥 Erro fatal:', e.message);
    await pool.end();
    process.exit(1);
  });
}
