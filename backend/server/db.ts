import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";

const connectionString = process.env.DATABASE_URL;

// Handle the case when DATABASE_URL is not set or invalid
let db = null;

try {
  if (connectionString && connectionString.trim() !== '') {
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
    console.log("✅ Database connected");
  } else {
    console.log("⚠️  DATABASE_URL not set, using demo data");
  }
} catch (error) {
  console.warn("⚠️  Database connection failed, using demo data:", error.message);
  db = null;
}

export { db };