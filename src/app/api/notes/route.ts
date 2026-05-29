import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { desc, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(notes)
      .orderBy(desc(notes.pinned), desc(notes.updatedAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db.insert(notes).values({
      title: body.title ?? "Untitled",
      content: body.content ?? "",
      color: body.color ?? "white",
      pinned: body.pinned ?? 0,
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
