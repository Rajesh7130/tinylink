import 'dotenv/config';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // needed for some Neon/Postgres setups
  },
});

// Optional: Setup table if it doesn't exist
export async function setupLinksTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        url TEXT NOT NULL,
        clicks INT DEFAULT 0,
        last_clicked TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Links table is ready");
  } catch (err) {
    console.error("Failed to setup links table:", err);
  } finally {
    client.release();
  }
}

// Call this once to initialize table
// setupLinksTable();
