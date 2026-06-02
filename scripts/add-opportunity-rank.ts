import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    ALTER TABLE consultancy_opportunities
    ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT NULL
  `;
  console.log("Done — rank column added to consultancy_opportunities.");
}

run().catch(err => { console.error(err); process.exit(1); });
