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
function getPool(): Pool {
  if (!globalForDb.pool) {
    globalForDb.pool = createPool();
  }
  return globalForDb.pool;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getPool(), { schema });
  }
  return globalForDb.db;
}

// Export with lazy initialization using Proxy to defer connection until first use
// This prevents errors during Next.js build when DATABASE_URL might not be available
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const actualPool = getPool();
    const value = actualPool[prop as keyof Pool];
    return typeof value === 'function' ? value.bind(actualPool) : value;
  }
}) as Pool;

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const actualDb = getDb();
    const value = actualDb[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
    return typeof value === 'function' ? value.bind(actualDb) : value;
  }
}) as ReturnType<typeof drizzle<typeof schema>>;

export type Database = typeof db;
export * from "./schema";

