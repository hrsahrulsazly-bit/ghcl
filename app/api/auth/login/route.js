import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const password = body.password || "";

  let valid;
  try {
    valid = checkPassword(password);
  } catch {
    return NextResponse.json(
      { error: "Admin belum disetup (ADMIN_PASSWORD tiada)" },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
