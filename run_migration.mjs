import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  host: 'db.jchcpswvlpdatudrstzl.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Aborami@323',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected! Running migration...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');
    const result = await client.query(sql);
    
    // Get last result
    if (Array.isArray(result)) {
      const last = result[result.length - 1];
      if (last.rows && last.rows[0]) {
        console.log(last.rows[0].result);
      }
    } else if (result.rows && result.rows[0]) {
      console.log(result.rows[0].result);
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
