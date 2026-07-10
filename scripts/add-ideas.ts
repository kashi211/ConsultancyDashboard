import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS consultancy_ideas (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      category    TEXT NOT NULL DEFAULT 'general',
      status      TEXT NOT NULL DEFAULT 'idea',
      priority    TEXT NOT NULL DEFAULT 'medium',
      color       TEXT NOT NULL DEFAULT 'white',
      tags        TEXT,
      pinned      INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at  TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("Done — consultancy_ideas table ready.");
}

run().catch(err => { console.error(err); process.exit(1); });
