import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configurar SSL baseado na URL (local vs remoto)
const isLocalConnection = process.env.DATABASE_URL?.includes('localhost') || 
                         process.env.DATABASE_URL?.includes('127.0.0.1');

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocalConnection && process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
export const db = drizzle({ client: pool, schema });
