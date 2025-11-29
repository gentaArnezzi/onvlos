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
// Railway PostgreSQL has a limit of ~100 connections, so we need to be conservative
const poolConfig: PoolConfig = {
  connectionString,
  // Connection pool settings - reduced to prevent "too many clients" error
  max: process.env.NODE_ENV === 'production' ? 10 : 15, // Conservative limits to prevent exhaustion
  min: 1, // Minimum number of clients in the pool
  idleTimeoutMillis: 5000, // Close idle clients after 5 seconds (aggressive cleanup)
  connectionTimeoutMillis: 3000, // Return an error after 3 seconds if connection could not be established
  // Allow pool to wait for available connections
  allowExitOnIdle: false,
  // SSL configuration (Railway uses SSL by default)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in development - just log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Log pool statistics periodically (development only)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      active: pool.totalCount - pool.idleCount
    };
    console.log(`[DB Pool Stats]`, stats);
    
    // Warn if pool is getting full
    if (stats.total >= poolConfig.max! * 0.8) {
      console.warn(`⚠️  [DB Pool] Pool is ${Math.round((stats.total / poolConfig.max!) * 100)}% full!`);
    }
  }, 15000); // Every 15 seconds for better monitoring
}

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
