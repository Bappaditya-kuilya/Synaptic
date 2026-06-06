import { NextResponse } from "next/server";
import { extractGraph, parseExtractionRequest } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseExtractionRequest(body);
    const result = await extractGraph(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
