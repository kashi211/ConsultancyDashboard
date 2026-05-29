import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Migrating schema...");

  // drop old
  await sql`DROP TABLE IF EXISTS target_comments CASCADE`;
  await sql`DROP TABLE IF EXISTS targets CASCADE`;
  await sql`DROP TABLE IF EXISTS mission CASCADE`;
  await sql`DROP TABLE IF EXISTS services CASCADE`;
  await sql`DROP TABLE IF EXISTS portfolio CASCADE`;
  await sql`DROP TABLE IF EXISTS comments CASCADE`;
  await sql`DROP TABLE IF EXISTS opportunities CASCADE`;
  await sql`DROP TYPE IF EXISTS opp_type CASCADE`;
  await sql`DROP TYPE IF EXISTS opp_status CASCADE`;
  await sql`DROP TYPE IF EXISTS target_status CASCADE`;
  await sql`DROP TYPE IF EXISTS service_status CASCADE`;

  await sql`CREATE TYPE opp_type AS ENUM ('freelance', 'pitch', 'job')`;
  await sql`CREATE TYPE opp_status AS ENUM ('pending', 'approved', 'needs_edit', 'in_progress', 'closed')`;
  await sql`CREATE TYPE target_status AS ENUM ('active', 'completed', 'paused')`;
  await sql`CREATE TYPE service_status AS ENUM ('active', 'evaluating', 'cancelled')`;

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
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      parent_id INTEGER,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE mission (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
  await sql`INSERT INTO mission (content) VALUES ('')`;

  await sql`
    CREATE TABLE targets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      status target_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE target_comments (
      id SERIAL PRIMARY KEY,
      target_id INTEGER NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      url TEXT,
      status service_status NOT NULL DEFAULT 'active',
      cost TEXT,
      category TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE portfolio (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      repo_url TEXT,
      skills TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  console.log("Done.");
}

migrate().catch(err => { console.error(err); process.exit(1); });
