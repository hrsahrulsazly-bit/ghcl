import { neon } from "@neondatabase/serverless";

let client = null;

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED
  );
}

export async function sql(strings, ...values) {
  if (!client) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error(
        "Tiada DATABASE_URL. Sila sambungkan database Postgres/Neon di Vercel."
      );
    }
    client = neon(connectionString);
  }
  return client(strings, ...values);
}

let tableReady = null;

export function ensureTable() {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  }
  return tableReady;
}
