import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mission } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [row] = await db.select().from(mission).where(eq(mission.id, 1));
    return NextResponse.json(row ?? { id: 1, content: "", updatedAt: new Date() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { content } = await req.json();
    const [row] = await db.update(mission)
      .set({ content, updatedAt: new Date() })
      .where(eq(mission.id, 1))
      .returning();
    return NextResponse.json(row);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
