import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`DROP TABLE IF EXISTS task_comments CASCADE`;
  await sql`DROP TABLE IF EXISTS tasks CASCADE`;
  await sql`DO $$ BEGIN CREATE TYPE task_status AS ENUM ('todo','in_progress','done','blocked'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('low','medium','high'); EXCEPTION WHEN duplicate_object THEN null; END $$`;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status task_status NOT NULL DEFAULT 'todo',
      priority task_priority NOT NULL DEFAULT 'medium',
      assignee TEXT,
      due_date TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS task_comments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      parent_id INTEGER,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

  console.log("Tasks tables created.");
}

run().catch(err => { console.error(err); process.exit(1); });
