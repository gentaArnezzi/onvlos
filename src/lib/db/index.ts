import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema';
import * as bookingSchema from './schema-bookings';
import * as proposalSchema from './schema-proposals';
import * as fileSchema from './schema-files';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Connection pool configuration for better performance and reliability
const poolConfig: PoolConfig = {
  connectionString,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 5, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  // SSL configuration (Railway uses SSL by default)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });

const allSchemas = {
  ...schema,
  ...bookingSchema,
  ...proposalSchema,
  ...fileSchema
};

export const db = drizzle(pool, { schema: allSchemas });

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
  console.log('Database connection pool closed');
}
