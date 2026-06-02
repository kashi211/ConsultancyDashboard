import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    DO $$ BEGIN
      ALTER TYPE opp_status ADD VALUE IF NOT EXISTS 'pitch_submitted';
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
