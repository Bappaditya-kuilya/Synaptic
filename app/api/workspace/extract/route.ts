import { NextResponse } from "next/server";
import { extractGraph, parseExtractionRequest } from "@/lib/ai";
import { createEntry, mergeExtraction } from "@/lib/graph-utils";
import { readCurrentWorkspace, writeWorkspace } from "@/lib/workspace-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseExtractionRequest(body);
    const current = await readCurrentWorkspace();
    const result = await extractGraph(input);
    const entry = createEntry(input.text, result.summary, "text");
    const workspace = mergeExtraction(current, result, entry);
    workspace.viewport.selectedNodeId = result.nodes[0]?.id ?? workspace.viewport.selectedNodeId;
    const saved = await writeWorkspace(workspace, {
      eventType: "extract",
      eventPayload: {
        inputLength: input.text.length,
        addedNodes: result.nodes.length,
        addedEdges: result.edges.length
      }
    });
    return NextResponse.json({ workspace: saved, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
