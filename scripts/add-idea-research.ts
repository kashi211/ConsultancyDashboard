import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS consultancy_idea_research (
      id         SERIAL PRIMARY KEY,
      idea_id    INTEGER NOT NULL REFERENCES consultancy_ideas(id) ON DELETE CASCADE,
      version    INTEGER NOT NULL DEFAULT 1,
      content    TEXT NOT NULL DEFAULT '',
      note       TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("Done — consultancy_idea_research table ready.");
}

run().catch(err => { console.error(err); process.exit(1); });
