import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const usuariosDemo = [
  { email: "admin@demo.com",     first_name: "Admin",      last_name: "Sistema",   role: "admin" },
  { email: "teacher@demo.com",   first_name: "Professor",  last_name: "Demo",      role: "teacher" },
  { email: "secretary@demo.com", first_name: "Secretária", last_name: "Demo",      role: "secretary" },
  { email: "student@demo.com",   first_name: "Aluno",      last_name: "Demo",      role: "student" },
];

const unidadesDemo = [
  { name: "Unidade Centro",    address: "Rua das Flores, 123 - Centro", phone: "(11) 3456-7890", email: "centro@vision.dev.br" },
  { name: "Unidade Vila Nova", address: "Av. Principal, 456 - Vila Nova", phone: "(11) 3456-7891", email: "vilanova@vision.dev.br" },
];

async function obterRoleIdPorNome(client, nome) {
  const r = await client.query(`SELECT id FROM roles WHERE name = $1`, [nome]);
  if (r.rowCount === 0) throw new Error(`Role não encontrada: ${nome}`);
  return r.rows[0].id;
}

async function upsertUsuario(client, u) {
  const roleId = await obterRoleIdPorNome(client, u.role);
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
  const r = await client.query(sql, [u.email, u.first_name, u.last_name, u.role, roleId]);
  return r.rows[0];
}

async function upsertUnidade(client, un) {
  const sql = `
    INSERT INTO units (id, name, address, phone, email, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
      SET name    = EXCLUDED.name,
          address = EXCLUDED.address,
          phone   = EXCLUDED.phone,
          updated_at = NOW()
    RETURNING id, name;
  `;
  const r = await client.query(sql, [un.name, un.address, un.phone, un.email]);
  return r.rows[0];
}

async function upsertStaffPorEmail(client, emailUsuario, unidadeId, cargo, depto, salario) {
  const u = await client.query(`SELECT id FROM users WHERE email = $1`, [emailUsuario]);
  if (u.rowCount === 0) throw new Error(`Usuário não encontrado: ${emailUsuario}`);
  const userId = u.rows[0].id;

  const existe = await client.query(`SELECT id FROM staff WHERE user_id = $1`, [userId]);
  if (existe.rowCount) {
    await client.query(
      `UPDATE staff SET unit_id=$2, position=$3, department=$4, salary=$5, updated_at=NOW() WHERE user_id=$1`,
      [userId, unidadeId, cargo, depto, salario]
    );
  } else {
    await client.query(
      `INSERT INTO staff (id, user_id, unit_id, position, department, salary, hire_date, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), true, NOW(), NOW())`,
      [userId, unidadeId, cargo, depto, salario]
    );
  }
}

async function upsertAlunoPorEmail(client, emailUsuario, studentId, unidadeId) {
  const u = await client.query(`SELECT id FROM users WHERE email = $1`, [emailUsuario]);
  if (u.rowCount === 0) throw new Error(`Usuário não encontrado: ${emailUsuario}`);
  const userId = u.rows[0].id;

  const existe = await client.query(`SELECT id FROM students WHERE user_id = $1`, [userId]);
  if (existe.rowCount) {
    await client.query(
      `UPDATE students SET student_id=$2, unit_id=$3, updated_at=NOW() WHERE user_id=$1`,
      [userId, studentId, unidadeId]
    );
  } else {
    await client.query(
      `INSERT INTO students (id, user_id, student_id, unit_id, enrollment_date, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), 'active', NOW(), NOW())`,
      [userId, studentId, unidadeId]
    );
  }
}

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const usuariosCriados = [];
    for (const u of usuariosDemo) {
      const criado = await upsertUsuario(client, u);
      usuariosCriados.push(criado);
      console.log(`✅ usuário: ${criado.email}`);
    }

    const unidadesCriadas = [];
    for (const un of unidadesDemo) {
      const c = await upsertUnidade(client, un);
      unidadesCriadas.push(c);
      console.log(`✅ unidade: ${c.name}`);
    }

    const unidadePrincipalId = unidadesCriadas[0]?.id;
    if (!unidadePrincipalId) throw new Error("Unidade principal não encontrada para staff");

    await upsertStaffPorEmail(client, "admin@demo.com",     unidadePrincipalId, "diretor",      "Administração", 10000);
    await upsertStaffPorEmail(client, "teacher@demo.com",   unidadePrincipalId, "instrutor",    "Ensino",         5000);
    await upsertStaffPorEmail(client, "secretary@demo.com", unidadePrincipalId, "secretário",   "Administrativo", 3000);
    console.log("✅ staff atualizado");

    await upsertAlunoPorEmail(client, "student@demo.com", "STU001", unidadePrincipalId);
    console.log("✅ aluno atualizado");

    await client.query("COMMIT");
    console.log("🎉 Seed concluído com sucesso!");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Erro no seed:", e.message);
    throw e;
  } finally {
    client.release();
  }
}

export async function verificarTabelas() {
  const client = await pool.connect();
  try {
    const r = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_name IN ('users','units','staff','students')
      ORDER BY table_name
    `);
    console.log("📊 Tabelas:", r.rows.map(x => x.table_name));
    return r.rows.length === 4;
  } finally {
    client.release();
  }
}

async function main() {
  console.log("🚀 Iniciando seed dos usuários demo...");
  const ok = await verificarTabelas();
  if (!ok) {
    console.log("⚠️  Rode primeiro: node setup.js");
    process.exit(1);
  }
  await seedDatabase();
  await pool.end();

  console.log("\n📋 Logins demo:");
  console.log("👤 admin@demo.com (Admin)");
  console.log("👤 teacher@demo.com (Professor)");
  console.log("👤 secretary@demo.com (Secretária)");
  console.log("👤 student@demo.com (Aluno)");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error("💥 Erro fatal:", e.message);
    await pool.end();
    process.exit(1);
  });
}
