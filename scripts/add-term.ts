import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`DO $$ BEGIN CREATE TYPE target_term AS ENUM ('long_term', 'short_term'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`ALTER TABLE targets ADD COLUMN IF NOT EXISTS term target_term NOT NULL DEFAULT 'short_term'`;

  // Set the 3 long-term targets (first 3 inserted in seed-mission)
  await sql`
    UPDATE targets SET term = 'long_term'
    WHERE title IN (
      'Establish a reputation as go-to AI consultants',
      'Build a repeatable client pipeline',
      'Grow to $10k/month revenue'
    )
  `;

  // Reset positions per term so ordering is clean within each group
  await sql`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY term ORDER BY position, id) - 1 AS new_pos
      FROM targets
    )
    UPDATE targets SET position = ranked.new_pos FROM ranked WHERE targets.id = ranked.id
  `;

  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
