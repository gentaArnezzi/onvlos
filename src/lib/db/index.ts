import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as bookingSchema from './schema-bookings';
import * as proposalSchema from './schema-proposals';
import * as fileSchema from './schema-files';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
});

const allSchemas = {
  ...schema,
  ...bookingSchema,
  ...proposalSchema,
  ...fileSchema
};

export const db = drizzle(pool, { schema: allSchemas });
