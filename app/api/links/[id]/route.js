import { NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

export async function DELETE(request, { params }) {
  await ensureTable();
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID tidak sah" }, { status: 400 });
  }

  await sql`DELETE FROM links WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
