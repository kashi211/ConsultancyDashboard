import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

const PITCH_CRITERIA = `**Must have:**
• Payment verified client
• Client has spent more than $0 on Upwork (real spending history)
• Posted under 3 days ago
• Under 15 proposals (ideally fewer than 5 or 5–10)
• Job is relevant to the skillset: Python, AI, LangChain, RAG, agents, OpenAI API, FastAPI, automation

**Avoid:**
• Tutoring or teaching jobs
• $0 client spend history
• 20+ proposals
• Jobs older than 3 days
• Jobs asking for fake credentials (e.g. "ex-OpenAI testimonial")

**Nice to have:**
• Client rating 4.5★ or above
• "Include Rising Talent: Yes"
• "Interviewing" happening (means client is active)
• Client last seen within 24 hours
• Fixed price (easier to close than hourly for a new profile)
• Budget $50–$500 range (low enough that client isn't too picky about reviews)

**Red flags we're ignoring for now:**
• "You don't meet preferred qualifications" — applying anyway on good jobs
• "Hires: 1" — still applying if job is open and client is active`;

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS consultancy_notices (
      id         SERIAL PRIMARY KEY,
      key        TEXT NOT NULL UNIQUE,
      content    TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  await sql`
    INSERT INTO consultancy_notices (key, content)
    VALUES ('pitch_criteria', ${PITCH_CRITERIA})
    ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
  `;
  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
