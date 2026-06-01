import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notices } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const [row] = await db.select().from(notices).where(eq(notices.key, key));
    return NextResponse.json(row ?? { key, content: "" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const { content } = await req.json();
    const existing = await db.select().from(notices).where(eq(notices.key, key));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(notices)
        .set({ content, updatedAt: new Date() })
        .where(eq(notices.key, key))
        .returning();
    } else {
      [row] = await db.insert(notices).values({ key, content }).returning();
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
