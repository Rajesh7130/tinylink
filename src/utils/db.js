import "dotenv/config";
import { Pool } from "pg";

// Create Postgres connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

// Create table on server start
export async function setupLinksTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        url TEXT NOT NULL,
        clicks INT DEFAULT 0,
        last_clicked TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("🟢 Links table ready");
  } catch (err) {
    console.error("🔴 Error setting up links table:", err);
  }
}
