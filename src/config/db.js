import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Safely parses and normalizes the DATABASE_URL, URL-encoding any special characters
 * (like @ or #) in the password so that the URI parser doesn't break.
 */
const getNormalizedDatabaseUrl = (rawUrl) => {
  if (!rawUrl) return '';

  // Remove surrounding quotes if present
  let cleanUrl = rawUrl.trim().replace(/^["']|["']$/g, '');

  try {
    // Matches: postgresql://<user>:<password>@<hostAndPortAndDb><query>
    const match = cleanUrl.match(/^postgresql:\/\/([^:]+):(.*)@([^@]+:\d+\/[^?]+)(\?.*)?$/);
    if (match) {
      const user = match[1];
      const rawPassword = match[2];
      const hostAndDb = match[3];
      const query = match[4] || '';

      if (rawPassword.includes('@') || rawPassword.includes('#')) {
        const encodedPassword = encodeURIComponent(rawPassword);
        cleanUrl = `postgresql://${user}:${encodedPassword}@${hostAndDb}${query}`;
      }
    }
  } catch (err) {
    // If regex parsing fails, fallback to original string
  }

  return cleanUrl;
};

const connectionString = getNormalizedDatabaseUrl(process.env.DATABASE_URL);

if (!connectionString) {
  console.warn('[WARN] [DRIZZLE] DATABASE_URL is missing in .env');
}

/**
 * 1. PostgreSQL client connection
 * `prepare: false` is required for Supabase transaction pooler (port 6543)
 */
export const queryClient = postgres(connectionString, {
  prepare: false,
  ssl: 'require',
});

/**
 * 2. Drizzle ORM instance
 * Import and use `db` anywhere in your project to query tables
 */
export const db = drizzle(queryClient);

/**
 * Helper function to test PostgreSQL connectivity
 */
export const testDrizzleConnection = async () => {
  try {
    if (!connectionString) {
      return { ok: false, message: 'DATABASE_URL not configured' };
    }
    // Execute a fast ping query
    await queryClient`SELECT 1`;
    return { ok: true, message: 'Drizzle connected to PostgreSQL successfully' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
