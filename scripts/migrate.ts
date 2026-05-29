import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Dropping old schema and creating new...");

  await sql`DROP TABLE IF EXISTS items CASCADE`;
  await sql`DROP TABLE IF EXISTS comments CASCADE`;
  await sql`DROP TABLE IF EXISTS opportunities CASCADE`;
  await sql`DROP TYPE IF EXISTS category CASCADE`;
  await sql`DROP TYPE IF EXISTS status CASCADE`;
  await sql`DROP TYPE IF EXISTS opp_type CASCADE`;
  await sql`DROP TYPE IF EXISTS opp_status CASCADE`;

  await sql`CREATE TYPE opp_type AS ENUM ('freelance', 'pitch', 'job')`;
  await sql`CREATE TYPE opp_status AS ENUM ('pending', 'approved', 'needs_edit', 'in_progress', 'closed')`;

  await sql`
    CREATE TABLE opportunities (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      type opp_type NOT NULL,
      status opp_status NOT NULL DEFAULT 'pending',
      pitch TEXT,
      job_link TEXT,
      mvp_link TEXT,
      budget TEXT,
      deadline TEXT,
      skills TEXT,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      assigned_to TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      parent_id INTEGER,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Migration complete.");
}

migrate().catch(err => { console.error(err); process.exit(1); });
