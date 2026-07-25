import { NextResponse } from "next/server";
import { listLinks, addLink } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const links = await listLinks();
  return NextResponse.json(links);
}

export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }

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

  const link = await addLink(title, url);
  return NextResponse.json(link, { status: 201 });
}
