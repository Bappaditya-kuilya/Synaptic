import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/auth";
import { attachAuthCookie } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);
    const { user, sessionId } = await createUser(email, password);
    const response = NextResponse.json({ user });
    attachAuthCookie(response, sessionId);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
