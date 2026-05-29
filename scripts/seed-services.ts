import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  await sql`
    INSERT INTO services (name, description, url, status, cost, category) VALUES

    -- AgentOS + SmartCart shared
    ('Vercel', 'Frontend hosting for AgentOS and SmartCartCommerce. Free hobby tier — check if project limits are approaching.', 'https://vercel.com', 'active', 'Free / $20 per seat (Pro)', 'Hosting'),
    ('Neon', 'Serverless Postgres for AgentOS. Free tier includes 0.5 GB storage and branching. Used for agent memory and task data.', 'https://neon.tech', 'active', 'Free tier', 'Database'),
    ('Pinecone', 'Vector database used in both AgentOS and SmartCartCommerce. Serverless index for embeddings and semantic search. Free tier has 1 index.', 'https://pinecone.io', 'active', 'Free tier (1 index)', 'AI Infrastructure'),
    ('Anthropic (Claude)', 'LLM provider for AgentOS — Claude Opus 4.7 for reasoning, Claude Sonnet 4.6 for fast tasks. Pay-per-token, no subscription.', 'https://console.anthropic.com', 'active', 'Pay per token', 'AI / LLM'),
    ('OpenAI', 'Used in AgentOS (env var present) and SmartCartCommerce (gpt-4o-mini + text-embedding-3-small). Pay-per-token.', 'https://platform.openai.com', 'active', 'Pay per token', 'AI / LLM'),

    -- AgentOS only
    ('Railway', 'Backend hosting for AgentOS FastAPI service. ⚠️ ~18 days left on current plan — check billing before it expires.', 'https://railway.app', 'active', 'Trial / ~$5/mo Hobby', 'Hosting'),
    ('Upstash (Redis)', 'Serverless Redis for AgentOS short-term agent memory and caching. Free tier: 10k commands/day.', 'https://upstash.com', 'active', 'Free tier', 'Database'),
    ('Cloudflare R2', 'Object storage for AgentOS generated artifacts (reports, outputs). Free tier: 10 GB storage, no egress fees.', 'https://www.cloudflare.com/developer-platform/r2/', 'active', 'Free tier (10 GB)', 'Storage')
  `;
  console.log("Services seeded.");
}

seed().catch(err => { console.error(err); process.exit(1); });
