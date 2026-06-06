import type {
  GraphExtractionResult,
  WorkspaceEdge,
  WorkspaceEntry,
  WorkspaceNode,
  WorkspaceState
} from "@/lib/types";

const NODE_LIMIT = 32;

export function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function makeEdgeId(sourceNodeId: string, targetNodeId: string) {
  return [sourceNodeId, targetNodeId].sort().join("__");
}

export function createEntry(rawInput: string, summary: string, inputType: WorkspaceEntry["inputType"]) {
  return {
    id: crypto.randomUUID(),
    rawInput,
    inputType,
    createdAt: new Date().toISOString(),
    aiStatus: "ready" as const,
    summary
  };
}

export function mergeExtraction(
  workspace: WorkspaceState,
  result: GraphExtractionResult,
  entry: WorkspaceEntry
) {
  const existingById = new Map(workspace.nodes.map((node) => [node.id, node]));
  const existingByLabel = new Map(
    workspace.nodes.map((node) => [normalizeLabel(node.label), node])
  );

  const nextNodes: WorkspaceNode[] = workspace.nodes.map((node) => ({ ...node }));

  for (const incoming of result.nodes) {
    const normalized = normalizeLabel(incoming.label);
    const match = existingById.get(incoming.id) ?? existingByLabel.get(normalized);

    if (match) {
      match.updatedAt = entry.createdAt;
      match.importance = Math.min(3, Math.max(match.importance, incoming.importance)) as 1 | 2 | 3;
      match.summary = incoming.summary || match.summary;
      if (!match.sourceEntryIds.includes(entry.id)) {
        match.sourceEntryIds = [...match.sourceEntryIds, entry.id];
      }
      continue;
    }

    nextNodes.push({
      id: incoming.id,
      label: incoming.label,
      normalizedLabel: normalized,
      category: incoming.category,
      importance: incoming.importance,
      summary: incoming.summary,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
      sourceEntryIds: [entry.id]
    });
  }

  const nodeIndex = new Set(nextNodes.map((node) => node.id));
  const nextEdges: WorkspaceEdge[] = [...workspace.edges];

  for (const edge of result.edges) {
    if (!nodeIndex.has(edge.source) || !nodeIndex.has(edge.target) || edge.source === edge.target) {
      continue;
    }

    const id = makeEdgeId(edge.source, edge.target);
    const existing = nextEdges.find((item) => item.id === id);

    if (existing) {
      existing.strength = Math.max(existing.strength, edge.strength);
      existing.relationType = edge.relationType || existing.relationType;
      continue;
    }

    nextEdges.push({
      id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      strength: edge.strength,
      relationType: edge.relationType
    });
  }

  const prunedNodes = pruneNodes(nextNodes, nextEdges);
  const prunedNodeIds = new Set(prunedNodes.map((node) => node.id));
  const prunedEdges = nextEdges.filter(
    (edge) => prunedNodeIds.has(edge.sourceNodeId) && prunedNodeIds.has(edge.targetNodeId)
  );

  return {
    ...workspace,
    updatedAt: entry.createdAt,
    summary: result.summary || workspace.summary,
    nodes: prunedNodes,
    edges: prunedEdges,
    entries: [entry, ...workspace.entries].slice(0, 24)
  };
}

function pruneNodes(nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  if (nodes.length <= NODE_LIMIT) {
    return nodes;
  }

  const degrees = new Map<string, number>();
  for (const node of nodes) {
    degrees.set(node.id, 0);
  }
  for (const edge of edges) {
    degrees.set(edge.sourceNodeId, (degrees.get(edge.sourceNodeId) ?? 0) + 1);
    degrees.set(edge.targetNodeId, (degrees.get(edge.targetNodeId) ?? 0) + 1);
  }

  return [...nodes]
    .sort((a, b) => {
      const degreeDiff = (degrees.get(b.id) ?? 0) - (degrees.get(a.id) ?? 0);
      if (degreeDiff !== 0) {
        return degreeDiff;
      }
      return a.createdAt.localeCompare(b.createdAt);
    })
    .slice(0, NODE_LIMIT);
}

export function getConnectedNodes(workspace: WorkspaceState, nodeId: string) {
  const relatedIds = workspace.edges.flatMap((edge) => {
    if (edge.sourceNodeId === nodeId) {
      return [edge.targetNodeId];
    }
    if (edge.targetNodeId === nodeId) {
      return [edge.sourceNodeId];
    }
    return [];
  });

  return workspace.nodes.filter((node) => relatedIds.includes(node.id));
}
