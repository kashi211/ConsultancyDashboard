import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { targets } from "@/lib/schema";
import { eq } from "drizzle-orm";

// body: { ids: number[] } — ordered list of target ids
export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json() as { ids: number[] };
    await Promise.all(
      ids.map((id, index) =>
        db.update(targets).set({ position: index }).where(eq(targets.id, id))
      )
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
