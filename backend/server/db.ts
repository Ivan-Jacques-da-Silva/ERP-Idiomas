import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://school_admin:SchoolSys2024!@#@localhost:5432/school_system",
});

export const db = drizzle(pool);