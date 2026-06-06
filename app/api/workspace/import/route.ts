import { NextResponse } from "next/server";
import { importWorkspaceSchema } from "@/lib/schemas";
import { writeCurrentWorkspace } from "@/lib/workspace-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspace } = importWorkspaceSchema.parse(body);
    const saved = await writeCurrentWorkspace(workspace);
    return NextResponse.json({ workspace: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
