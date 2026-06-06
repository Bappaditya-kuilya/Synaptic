import { NextResponse } from "next/server";
import { switchWorkspaceSchema } from "@/lib/schemas";
import { switchCurrentWorkspace } from "@/lib/workspace-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId } = switchWorkspaceSchema.parse(body);
    const workspace = await switchCurrentWorkspace(workspaceId);
    return NextResponse.json({ workspace, currentWorkspaceId: workspace.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not switch workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
