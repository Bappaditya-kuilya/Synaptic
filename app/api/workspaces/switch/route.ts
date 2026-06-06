import { NextResponse } from "next/server";
import { switchWorkspaceSchema } from "@/lib/schemas";
import { switchCurrentWorkspaceForOwner } from "@/lib/workspace-store";
import { attachOwnerCookie, getOrCreateOwnerId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
    const body = await request.json();
    const { workspaceId } = switchWorkspaceSchema.parse(body);
    const workspace = await switchCurrentWorkspaceForOwner(ownerId, workspaceId);
    const response = NextResponse.json({ workspace, currentWorkspaceId: workspace.id });
    if (needsSetCookie) {
      attachOwnerCookie(response, ownerId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not switch workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
