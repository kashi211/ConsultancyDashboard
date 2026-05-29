import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  // Portfolio
  await sql`
    INSERT INTO portfolio (title, description, url, repo_url, skills) VALUES (
      'SWE Daily',
      'AI-powered technical interview prep platform for software engineers targeting Google, Meta, Amazon and similar companies. Covers data structures & algorithms, system design, behavioral, SQL, OS, and networking. Features AI-evaluated answers with instant detailed feedback, adaptive question selection based on performance, progress tracking dashboards, and mock interview sessions. 5,000+ engineers on the platform with a 92% offer rate.',
      'https://swe-daily.fly.dev/',
      'https://github.com/saketpanwar/swe-daily',
      'Next.js, Drizzle ORM, SQLite, OpenAI, NextAuth, Fly.io, Tailwind CSS, TypeScript'
    )
  `;

  // Services
  await sql`
    INSERT INTO services (name, description, url, status, cost, category) VALUES
    (
      'Fly.io',
      'Hosting for SWE Daily. Runs the Next.js app as a Docker container. Free allowance includes 3 shared VMs — check if usage is within limits.',
      'https://fly.io',
      'active',
      'Free tier / Pay-as-you-go',
      'Hosting'
    ),
    (
      'SMTP (Email)',
      'Transactional email for SWE Daily — account verification, password resets. Configured via SMTP_HOST/SMTP_USER env vars (e.g. Gmail SMTP). Check app password expiry.',
      'https://myaccount.google.com/apppasswords',
      'active',
      'Free (Gmail SMTP)',
      'Communication'
    )
  `;

  console.log("SWE Daily portfolio + services seeded.");
}

seed().catch(err => { console.error(err); process.exit(1); });
