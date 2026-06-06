import { NextResponse } from "next/server";
import { updateWorkspaceSchema } from "@/lib/schemas";
import { readCurrentWorkspace, writeCurrentWorkspace } from "@/lib/workspace-store";
import { attachOwnerCookie, getOrCreateOwnerId } from "@/lib/session";

export async function GET() {
  const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
  const workspace = await readCurrentWorkspace(ownerId);
  const response = NextResponse.json({ workspace });
  if (needsSetCookie) {
    attachOwnerCookie(response, ownerId);
  }
  return response;
}

export async function PUT(request: Request) {
  try {
    const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
    const body = await request.json();
    const { workspace } = updateWorkspaceSchema.parse(body);
    const saved = await writeCurrentWorkspace({ ...workspace, ownerId });
    const response = NextResponse.json({ workspace: saved });
    if (needsSetCookie) {
      attachOwnerCookie(response, ownerId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid workspace update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
