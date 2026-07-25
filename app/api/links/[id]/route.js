import { NextResponse } from "next/server";
import { deleteLink } from "@/lib/db";

export async function DELETE(request, { params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID tidak sah" }, { status: 400 });
  }

  await deleteLink(id);
  return NextResponse.json({ ok: true });
}
