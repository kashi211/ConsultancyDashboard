import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`ALTER TABLE targets ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0`;
  await sql`UPDATE targets SET position = id WHERE position = 0`;
  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
