import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ideaResearch } from "@/lib/schema";
import { eq, desc, max } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db.select().from(ideaResearch)
      .where(eq(ideaResearch.ideaId, parseInt(id)))
      .orderBy(desc(ideaResearch.version));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ideaId = parseInt(id);
    const body = await req.json();
    const { content, note } = body;

    // Get next version number
    const [agg] = await db.select({ maxVersion: max(ideaResearch.version) })
      .from(ideaResearch)
      .where(eq(ideaResearch.ideaId, ideaId));

    const nextVersion = (agg?.maxVersion ?? 0) + 1;

    const [row] = await db.insert(ideaResearch)
      .values({ ideaId, version: nextVersion, content: content ?? "", note: note ?? null })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
