import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  await sql`
  INSERT INTO portfolio (title, description, url, repo_url, skills) VALUES
  (
    'AgentOS',
    'A multi-agent AI system where specialized agents — CEO, Planner, Developer, QA, and Writer — collaborate like an engineering team to execute goals end-to-end. Users input a goal and the coordinated agents plan, build, and deliver outcomes with real-time WebSocket streaming. Built with LangGraph orchestration and dual-model setup: Claude Opus 4.7 for reasoning and Claude Sonnet 4.6 for fast tasks.',
    'https://agent-os-pi.vercel.app/',
    'https://github.com/kashi211/AgentOS',
    'Next.js, FastAPI, LangGraph, Claude API, PostgreSQL, Redis, Pinecone, Vercel AI SDK'
  ),
  (
    'SmartCart Knowledge Assistant',
    'An AI-powered RAG chat application built on SmartCartCommerce''s internal knowledge base — 856 indexed documents covering policies, operations, support playbooks, and brand admin console. Features three personas (Customer, Concierge, Brand Partner), semantic search with source citations, and real-time streaming responses. Deployable immediately with a pre-indexed Pinecone vector store.',
    'https://smart-cart-commerce.vercel.app/chat',
    'https://github.com/kashi211/SmartCartCommerce',
    'Next.js, OpenAI GPT-4o, Pinecone, Vercel AI SDK, TypeScript, Tailwind CSS'
  )
`;
  console.log("Portfolio seeded.");
}

seed().catch(err => { console.error(err); process.exit(1); });
