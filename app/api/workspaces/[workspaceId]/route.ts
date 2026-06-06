import { NextResponse } from "next/server";
import { deleteWorkspaceForOwner, listWorkspaceEventsForOwner, listWorkspacesByOwner, readWorkspace } from "@/lib/workspace-store";
import { attachOwnerCookie, getOrCreateOwnerId } from "@/lib/session";

type Params = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
  const { workspaceId } = await params;
  const workspace = await readWorkspace(workspaceId, ownerId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const events = await listWorkspaceEventsForOwner(ownerId, workspaceId);
  const response = NextResponse.json({ workspace, events });
  if (needsSetCookie) {
    attachOwnerCookie(response, ownerId);
  }
  return response;
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
    const { workspaceId } = await params;
    await deleteWorkspaceForOwner(ownerId, workspaceId);
    const workspaces = await listWorkspacesByOwner(ownerId);
    const response = NextResponse.json({ workspaces });
    if (needsSetCookie) {
      attachOwnerCookie(response, ownerId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
