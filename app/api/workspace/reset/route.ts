import { NextResponse } from "next/server";
import { resetWorkspaceSchema } from "@/lib/schemas";
import { readCurrentWorkspace, resetWorkspaceForOwner } from "@/lib/workspace-store";
import { attachOwnerCookie, getOrCreateOwnerId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
    const body = await request.json().catch(() => ({}));
    const parsed = resetWorkspaceSchema.parse(body);
    const current = await readCurrentWorkspace(ownerId);
    const workspace = await resetWorkspaceForOwner(ownerId, current.id, parsed);
    const response = NextResponse.json({ workspace });
    if (needsSetCookie) {
      attachOwnerCookie(response, ownerId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
