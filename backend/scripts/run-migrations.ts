/**
 * Database migration runner
 * Executes SQL migration files in order
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local in project root
const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  const envFallback = path.join(__dirname, '../../.env');
  if (fs.existsSync(envFallback)) {
    dotenv.config({ path: envFallback });
  }
}

import { getPool } from '../lib/db';

interface Migration {
  version: string;
  filename: string;
  sql: string;
}

async function runMigrations() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get already applied migrations
    const appliedResult = await client.query('SELECT version FROM schema_migrations');
    const appliedVersions = new Set(appliedResult.rows.map((r: any) => r.version));

    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    for (const file of files) {
      const version = file.replace('.sql', '');
      
      if (appliedVersions.has(version)) {
        console.log(`✓ Migration ${version} already applied, skipping`);
        continue;
      }

      console.log(`Running migration ${version}...`);
      
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute migration
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✓ Migration ${version} applied successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

export { runMigrations };
