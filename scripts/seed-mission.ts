import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  // Mission
  await sql`
    UPDATE mission SET
      content = 'We are an AI consulting studio run by two brothers — building production-grade AI applications for clients and stepping into existing products to make them smarter. We stay ahead of the curve on models, frameworks, and tooling so our clients don''t have to. Whether it''s a full-stack AI app from scratch, integrating LLMs into an existing product, or fixing what''s broken — we ship fast and we ship right.',
      updated_at = NOW()
    WHERE id = 1
  `;

  // Targets
  await sql`
    INSERT INTO targets (title, description, duration, status) VALUES

    -- Long-term
    (
      'Establish a reputation as go-to AI consultants',
      'Be known in the market for delivering production-quality AI apps — not demos. Build a track record through portfolio projects, client referrals, and public presence (GitHub, LinkedIn, case studies).',
      'Long-term (12 months)',
      'active'
    ),
    (
      'Build a repeatable client pipeline',
      'Have a steady flow of inbound leads from Upwork, LinkedIn, referrals, and cold outreach. Goal: 2–3 active clients at any given time with no dry spells.',
      'Long-term (12 months)',
      'active'
    ),
    (
      'Grow to $10k/month revenue',
      'Between consulting engagements and retainers, reach $10k/month combined. Mix of fixed-price projects and ongoing maintenance/improvement contracts.',
      'Long-term (12–18 months)',
      'active'
    ),

    -- Short-term
    (
      'Land first paying client',
      'Close the first client engagement — even a small fixed-price project. Proof of concept for the business. Target: freelance platforms (Upwork, Toptal), LinkedIn outreach, and warm network.',
      'Short-term (4–6 weeks)',
      'active'
    ),
    (
      'Polish and publish portfolio',
      'Make AgentOS, SmartCartCommerce, and SWE Daily presentable to potential clients — clean READMEs, live demos stable, short case study writeups for each.',
      'Short-term (1–2 weeks)',
      'active'
    ),
    (
      'Create pitch decks and service packages',
      'Define 3 service offerings with clear scope and pricing: (1) AI app from scratch, (2) LLM integration into existing product, (3) AI audit + fix engagement. Build a deck for each.',
      'Short-term (2–3 weeks)',
      'active'
    ),
    (
      'Start active outreach',
      'Send 10 personalised pitches per week on LinkedIn and Upwork. Focus on startups and SMBs that would benefit from AI but lack the in-house expertise. Track responses here.',
      'Short-term (ongoing from now)',
      'active'
    )
  `;

  console.log("Mission and targets seeded.");
}

seed().catch(err => { console.error(err); process.exit(1); });
