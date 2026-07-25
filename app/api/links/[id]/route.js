import { NextResponse } from "next/server";
import { deleteLink } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID tidak sah" }, { status: 400 });
  }

  await deleteLink(id);
  return NextResponse.json({ ok: true });
}
