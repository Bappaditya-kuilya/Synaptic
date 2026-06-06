import { NextResponse } from "next/server";
import { deleteWorkspace, listWorkspaces, listWorkspaceEvents, readWorkspace } from "@/lib/workspace-store";

type Params = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { workspaceId } = await params;
  const workspace = await readWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const events = await listWorkspaceEvents(workspaceId);
  return NextResponse.json({ workspace, events });
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { workspaceId } = await params;
    await deleteWorkspace(workspaceId);
    const workspaces = await listWorkspaces();
    return NextResponse.json({ workspaces });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
