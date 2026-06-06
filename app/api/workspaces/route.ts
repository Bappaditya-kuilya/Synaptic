import { NextResponse } from "next/server";
import { createWorkspaceSchema } from "@/lib/schemas";
import { createWorkspaceForOwner, listWorkspacesByOwner, readCurrentWorkspace } from "@/lib/workspace-store";
import { attachOwnerCookie, getOrCreateOwnerId } from "@/lib/session";

export async function GET() {
  const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
  const [workspaces, current] = await Promise.all([
    listWorkspacesByOwner(ownerId),
    readCurrentWorkspace(ownerId)
  ]);

  const response = NextResponse.json({
    workspaces,
    currentWorkspaceId: current.id
  });
  if (needsSetCookie) {
    attachOwnerCookie(response, ownerId);
  }
  return response;
}

export async function POST(request: Request) {
  try {
    const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
    const body = await request.json().catch(() => ({}));
    const parsed = createWorkspaceSchema.parse(body);
    const workspace = await createWorkspaceForOwner(ownerId, parsed);
    const workspaces = await listWorkspacesByOwner(ownerId);
    const response = NextResponse.json({
      workspace,
      workspaces,
      currentWorkspaceId: workspace.id
    });
    if (needsSetCookie) {
      attachOwnerCookie(response, ownerId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
