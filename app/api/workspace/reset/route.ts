import { NextResponse } from "next/server";
import { resetWorkspaceSchema } from "@/lib/schemas";
import { resetCurrentWorkspace } from "@/lib/workspace-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = resetWorkspaceSchema.parse(body);
    const workspace = await resetCurrentWorkspace(parsed);
    return NextResponse.json({ workspace });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
