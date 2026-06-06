import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getUserForSession, type AuthUser } from "@/lib/auth";

const SESSION_COOKIE = "synaptic_owner";
const AUTH_SESSION_COOKIE = "synaptic_session";

export async function getOrCreateOwnerId() {
  const cookieStore = await cookies();
  const authSession = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (authSession) {
    const user = await getUserForSession(authSession);
    if (user) {
      return {
        ownerId: user.id,
        needsSetCookie: false,
        user
      };
    }
  }

  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) {
    return {
      ownerId: existing,
      needsSetCookie: false,
      user: null
    };
  }

  return {
    ownerId: randomUUID(),
    needsSetCookie: true,
    user: null
  };
}

export function attachOwnerCookie(response: NextResponse, ownerId: string) {
  response.cookies.set(SESSION_COOKIE, ownerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}

export function attachAuthCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(AUTH_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const authSession = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (!authSession) {
    return null;
  }
  return getUserForSession(authSession);
}
