import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  await sql`UPDATE tasks SET description = NULL`;
  console.log("Done.");
}
run().catch(err => { console.error(err); process.exit(1); });
