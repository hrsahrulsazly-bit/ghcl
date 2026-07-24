import { NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

export async function GET() {
  await ensureTable();
  const rows = await sql`SELECT id, title, url, created_at FROM links ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(request) {
  await ensureTable();
  const body = await request.json();
  const title = (body.title || "").trim();
  let url = (body.url || "").trim();

  if (!title || !url) {
    return NextResponse.json({ error: "Title dan link diperlukan" }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Link tidak sah" }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO links (title, url) VALUES (${title}, ${url})
    RETURNING id, title, url, created_at
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
