import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

// Safe rename — ALTER TABLE RENAME preserves all data, indexes,
// sequences and foreign key constraints. No rows are touched.
async function run() {
  const renames: [string, string][] = [
    ["opportunities",   "consultancy_opportunities"],
    ["comments",        "consultancy_comments"],
    ["mission",         "consultancy_mission"],
    ["targets",         "consultancy_targets"],
    ["target_comments", "consultancy_target_comments"],
    ["tasks",           "consultancy_tasks"],
    ["task_comments",   "consultancy_task_comments"],
    ["services",        "consultancy_services"],
    ["portfolio",       "consultancy_portfolio"],
    ["notes",           "consultancy_notes"],
  ];

  for (const [from, to] of renames) {
    // Check if the old name still exists (idempotent)
    const exists = await sql`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${from}
    `;
    if (exists.length > 0) {
      // Identifiers can't be parameterised — these are our own hardcoded strings, safe to interpolate
      await sql.query(`ALTER TABLE "${from}" RENAME TO "${to}"`);
      console.log(`✓ Renamed  ${from}  →  ${to}`);
    } else {
      console.log(`– Skipped  ${from}  (already renamed or doesn't exist)`);
    }
  }

  console.log("\nAll done. Verifying final table list:");
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  tables.forEach((r) => console.log("  •", (r as { table_name: string }).table_name));
}

run().catch(err => { console.error(err); process.exit(1); });
