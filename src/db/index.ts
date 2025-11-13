// Conditionally import server-only if available (for Next.js server components)
// This is optional and won't break if the package isn't installed (e.g., in standalone scripts)
try {
  require("server-only");
} catch {
  // server-only not available - this is fine for standalone scripts
  // In Next.js, it helps prevent accidental client-side imports
}

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Define it in your environment or .env file."
    );
  }

  return new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? "10")
  });
}

// Create pool and db lazily - only when first accessed
// But we need to export them, so we'll create them on first access via a function call
export const pool = globalForDb.pool ?? createPool();
export const db = globalForDb.db ?? drizzle(pool, { schema });

// Store in global for reuse
if (!globalForDb.pool) {
  globalForDb.pool = pool;
}

if (!globalForDb.db) {
  globalForDb.db = db;
}

export type Database = typeof db;
export * from "./schema";

