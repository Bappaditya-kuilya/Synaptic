import { z } from "zod";
import { heuristicExtract } from "@/lib/heuristics";
import { categorySchema, extractionRequestSchema, graphExtractionResultSchema } from "@/lib/schemas";
import type { GraphExtractionResult, NodeCategory } from "@/lib/types";

function sanitizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sanitizeCategory(value: string): NodeCategory {
  const parsed = categorySchema.safeParse(value);
  return parsed.success ? parsed.data : "other";
}

export function parseExtractionRequest(input: unknown) {
  return extractionRequestSchema.parse(input);
}

export async function extractGraph(input: z.infer<typeof extractionRequestSchema>): Promise<GraphExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return heuristicExtract(input.text, input.existingContext.map((item) => item.toLowerCase()));
  }

  const prompt = `
You are an information architect for an AI thinking workspace.
Return JSON only with this exact schema:
{
  "summary": "one concise sentence",
  "nodes": [
    {
      "id": "stable-kebab-id",
      "label": "Short Label",
      "category": "systems|product|research|strategy|design|technology|other",
      "importance": 1|2|3,
      "summary": "one concise sentence"
    }
  ],
  "edges": [
    {
      "source": "node-id",
      "target": "node-id",
      "strength": 0.1-1.0,
      "relationType": "short relation label"
    }
  ]
}

Rules:
- Extract 4 to 6 distinct concepts.
- Avoid repeating any of these existing labels: ${input.existingContext.join(", ") || "none"}.
- Labels must be 1 to 3 words.
- Importance 3 is the main idea.
- Edges must reference returned node ids only.
- Summary must reflect the whole input.

Text:
${input.text}
`.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 700
        }
      })
    }
  );

  if (!response.ok) {
    return heuristicExtract(input.text, input.existingContext.map((item) => item.toLowerCase()));
  }

  const payload = await response.json();
  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    return heuristicExtract(input.text, input.existingContext.map((item) => item.toLowerCase()));
  }

  const parsed = graphExtractionResultSchema.parse(JSON.parse(rawText));
  return {
    ...parsed,
    nodes: parsed.nodes.map((node) => ({
      ...node,
      id: sanitizeId(node.id || node.label),
      category: sanitizeCategory(node.category)
    })),
    edges: parsed.edges.map((edge) => ({
      ...edge,
      source: sanitizeId(edge.source),
      target: sanitizeId(edge.target)
    }))
  };
}
