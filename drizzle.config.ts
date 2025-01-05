import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  out: "./migrations",
  schema: "./lib/db/schema.ts",
  driver: isDevelopment ? 'better-sqlite' : 'postgresql',
  dbCredentials: isDevelopment ? {
    url: './sqlite.db'
  } : {
    connectionString: process.env.DATABASE_URL!,
  },
}) satisfies Config;