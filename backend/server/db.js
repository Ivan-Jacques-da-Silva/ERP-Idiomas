import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import * as schema from "../shared/schema.js";
// Load .env file, overriding empty environment variables
const envConfig = dotenv.config();
if (envConfig.parsed) {
    Object.keys(envConfig.parsed).forEach((key) => {
        if (!process.env[key] || process.env[key]?.trim() === '') {
            process.env[key] = envConfig.parsed[key];
        }
    });
}
// Check if DATABASE_URL is set and not empty
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
export const pool = new Pool({
    connectionString: databaseUrl,
});
export const db = drizzle(pool, { schema });
