import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { opportunities } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  try {
    const rows = type
      ? await db.select().from(opportunities).where(eq(opportunities.type, type as "freelance" | "pitch" | "job")).orderBy(desc(opportunities.createdAt))
      : await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db.insert(opportunities).values(body).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
