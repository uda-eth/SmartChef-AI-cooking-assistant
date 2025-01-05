import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import * as schema from './schema';
import postgres from 'postgres';

const isDevelopment = process.env.NODE_ENV === 'development';

export let db: any;

if (isDevelopment) {
  const sqlite = new Database('sqlite.db');
  db = drizzle(sqlite, { schema });
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }

  const client = postgres(process.env.DATABASE_URL);
  db = drizzlePg(client, { schema });
}

export { schema };