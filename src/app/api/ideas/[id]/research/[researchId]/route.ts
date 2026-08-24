import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ideaResearch } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; researchId: string }> }) {
  try {
    const { researchId } = await params;
    const body = await req.json();
    const [row] = await db.update(ideaResearch)
      .set({ content: body.content, note: body.note ?? null })
      .where(eq(ideaResearch.id, parseInt(researchId)))
      .returning();
    return NextResponse.json(row);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; researchId: string }> }) {
  try {
    const { researchId } = await params;
    await db.delete(ideaResearch).where(eq(ideaResearch.id, parseInt(researchId)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
