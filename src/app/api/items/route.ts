import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, NewItem } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  try {
    const query = category
      ? db.select().from(items).where(eq(items.category, category as NewItem["category"])).orderBy(desc(items.createdAt))
      : db.select().from(items).orderBy(desc(items.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db.insert(items).values(body).returning();
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
