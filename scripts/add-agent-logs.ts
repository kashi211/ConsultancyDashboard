import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS consultancy_agent_logs (
      id         SERIAL PRIMARY KEY,
      agent      TEXT NOT NULL DEFAULT 'claude',
      action     TEXT NOT NULL,
      details    TEXT,
      status     TEXT NOT NULL DEFAULT 'info',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("Done — consultancy_agent_logs table ready.");
}

run().catch(err => { console.error(err); process.exit(1); });
