import { NextResponse } from "next/server";
import { createWorkspaceSchema } from "@/lib/schemas";
import { createWorkspace, listWorkspaces, readCurrentWorkspace } from "@/lib/workspace-store";

export async function GET() {
  const [workspaces, current] = await Promise.all([
    listWorkspaces(),
    readCurrentWorkspace()
  ]);

  return NextResponse.json({
    workspaces,
    currentWorkspaceId: current.id
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createWorkspaceSchema.parse(body);
    const workspace = await createWorkspace(parsed);
    const workspaces = await listWorkspaces();
    return NextResponse.json({
      workspace,
      workspaces,
      currentWorkspaceId: workspace.id
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
