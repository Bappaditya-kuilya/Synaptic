import type { GraphExtractionResult, NodeCategory } from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "into",
  "your",
  "have",
  "will",
  "they",
  "them",
  "their",
  "about",
  "what",
  "when",
  "where",
  "which",
  "while",
  "could",
  "should",
  "would",
  "there",
  "because",
  "through",
  "using",
  "used",
  "more",
  "than",
  "just",
  "like",
  "make",
  "made",
  "over",
  "under",
  "between",
  "after",
  "before",
  "across"
]);

const CATEGORY_HINTS: Array<[NodeCategory, RegExp]> = [
  ["technology", /\b(ai|model|api|code|software|system|engineer|react|next|data|platform)\b/i],
  ["design", /\b(design|visual|interface|motion|typography|color|layout|experience)\b/i],
  ["product", /\b(product|user|workflow|feature|value|market|recruiter|portfolio)\b/i],
  ["research", /\b(research|knowledge|learning|study|analysis|insight)\b/i],
  ["strategy", /\b(strategy|plan|roadmap|priority|execution|scope)\b/i],
  ["systems", /\b(graph|network|memory|merge|state|architecture|relationship)\b/i]
];

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function classify(label: string): NodeCategory {
  for (const [category, pattern] of CATEGORY_HINTS) {
    if (pattern.test(label)) {
      return category;
    }
  }
  return "other";
}

export function heuristicExtract(text: string, existingContext: string[]): GraphExtractionResult {
  const sentences = text
    .split(/[.!?]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  const words = text
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{2,}/g);

  const scores = new Map<string, number>();
  for (const word of words ?? []) {
    if (STOP_WORDS.has(word) || existingContext.includes(word)) {
      continue;
    }
    scores.set(word, (scores.get(word) ?? 0) + 1);
  }

  const topWords = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  const labels = topWords.length > 0 ? topWords : ["core concept", "supporting idea", "relationship map"];
  const nodes = labels.map((label, index) => {
    const finalLabel = titleCase(label.replace(/-/g, " "));
    return {
      id: label.replace(/[^a-z0-9]+/g, "-"),
      label: finalLabel,
      category: classify(finalLabel),
      importance: (index === 0 ? 3 : index < 3 ? 2 : 1) as 1 | 2 | 3,
      summary: `${finalLabel} is part of the current thinking workspace.`
    };
  });

  const primary = nodes[0];
  const edges = nodes.slice(1).map((node, index) => ({
    source: primary.id,
    target: node.id,
    strength: Math.max(0.45, 0.82 - index * 0.08),
    relationType: "relates-to"
  }));

  return {
    summary:
      sentences[0] ??
      "This workspace capture was converted into a compact concept map for further exploration.",
    nodes,
    edges,
    warnings: ["AI provider unavailable; heuristic extraction used."]
  };
}
