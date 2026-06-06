import { NextResponse } from "next/server";
import { listWorkspacePresets } from "@/lib/workspace-store";

export async function GET() {
  return NextResponse.json({ presets: listWorkspacePresets() });
}
