import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  await sql`
    INSERT INTO tasks (title, description, status, priority) VALUES
    (
      'Upload HD pic on Upwork',
      'Replace current profile photo with a high-quality, professional headshot. Clear background, good lighting, face clearly visible.',
      'todo',
      'high'
    ),
    (
      'Update rest of profile according to audit',
      'Go through the full Upwork profile audit checklist — title, overview, skills, hourly rate, portfolio items, certifications. Make sure everything reflects AI consulting expertise.',
      'todo',
      'high'
    ),
    (
      'Start pitching and track analytics',
      'Begin sending proposals on Upwork and LinkedIn. Track: proposals sent, response rate, interview rate, conversion rate. Review weekly and adjust pitch based on what works.',
      'todo',
      'medium'
    )
  `;
  console.log("Tasks seeded.");
}

seed().catch(err => { console.error(err); process.exit(1); });
