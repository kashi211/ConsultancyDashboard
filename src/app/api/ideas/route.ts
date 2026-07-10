import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ideas } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let rows = await db.select().from(ideas)
      .orderBy(desc(ideas.pinned), desc(ideas.updatedAt));

    if (category) rows = rows.filter(r => r.category === category);
    if (status)   rows = rows.filter(r => r.status === status);

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db.insert(ideas).values(body).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(ideas);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
