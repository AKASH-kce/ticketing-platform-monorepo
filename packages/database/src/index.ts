import './loadEnv'; // loads .env correctly
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { seed } from './seed';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL environment variable is required');

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export * from './schema';
export { seed };
