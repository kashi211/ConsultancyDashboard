import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const rows = await sql`
    SELECT * FROM consultancy_agent_logs
    WHERE created_at >= NOW() - INTERVAL '5 days'
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agent = "claude", action, details, status = "info" } = body;

  if (!action) return NextResponse.json({ error: "action required" }, { status: 400 });

  // Insert new log
  const [row] = await sql`
    INSERT INTO consultancy_agent_logs (agent, action, details, status)
    VALUES (${agent}, ${action}, ${details ?? null}, ${status})
    RETURNING *
  `;

  // Purge logs older than 5 days
  await sql`
    DELETE FROM consultancy_agent_logs
    WHERE created_at < NOW() - INTERVAL '5 days'
  `;

  return NextResponse.json(row, { status: 201 });
}
