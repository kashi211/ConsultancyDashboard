import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL DEFAULT 'Untitled',
      content    TEXT NOT NULL DEFAULT '',
      color      TEXT NOT NULL DEFAULT 'white',
      pinned     INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("Notes table ready.");
}

run().catch(err => { console.error(err); process.exit(1); });
