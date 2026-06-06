import { NextResponse } from "next/server";
import { updateWorkspaceSchema } from "@/lib/schemas";
import { readCurrentWorkspace, writeCurrentWorkspace } from "@/lib/workspace-store";

export async function GET() {
  const workspace = await readCurrentWorkspace();
  return NextResponse.json({ workspace });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { workspace } = updateWorkspaceSchema.parse(body);
    const saved = await writeCurrentWorkspace(workspace);
    return NextResponse.json({ workspace: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid workspace update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
