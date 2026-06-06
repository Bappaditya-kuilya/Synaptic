import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";
import { clearAuthCookie } from "@/lib/session";

const AUTH_SESSION_COOKIE = "synaptic_session";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
