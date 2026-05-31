import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  // ALTER TYPE ... ADD VALUE is idempotent-safe via DO block
  await sql`
    DO $$ BEGIN
      ALTER TYPE opp_status ADD VALUE IF NOT EXISTS 'pitch_approved';
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TYPE opp_status ADD VALUE IF NOT EXISTS 'mvp_submitted';
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  console.log("Done. Current enum values:");
  const rows = await sql`
    SELECT enumlabel FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'opp_status'
    ORDER BY enumsortorder
  `;
  rows.forEach(r => console.log(" •", (r as { enumlabel: string }).enumlabel));
}

run().catch(err => { console.error(err); process.exit(1); });
