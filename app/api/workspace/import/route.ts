import { NextResponse } from "next/server";
import { importWorkspaceSchema } from "@/lib/schemas";
import { importWorkspaceForOwner } from "@/lib/workspace-store";
import { attachOwnerCookie, getOrCreateOwnerId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { ownerId, needsSetCookie } = await getOrCreateOwnerId();
    const body = await request.json();
    const { workspace } = importWorkspaceSchema.parse(body);
    const saved = await importWorkspaceForOwner(ownerId, workspace);
    const response = NextResponse.json({ workspace: saved });
    if (needsSetCookie) {
      attachOwnerCookie(response, ownerId);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import workspace";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
