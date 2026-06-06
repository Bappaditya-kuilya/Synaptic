import { z } from "zod";

export const categorySchema = z.enum([
  "systems",
  "product",
  "research",
  "strategy",
  "design",
  "technology",
  "other"
]);

export const workspaceNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  normalizedLabel: z.string().min(1),
  category: categorySchema,
  importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  summary: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  sourceEntryIds: z.array(z.string()),
  x: z.number().optional(),
  y: z.number().optional(),
  vx: z.number().optional(),
  vy: z.number().optional()
});

export const workspaceEdgeSchema = z.object({
  id: z.string().min(1),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  strength: z.number().min(0.1).max(1),
  relationType: z.string().min(1)
});

export const workspaceEntrySchema = z.object({
  id: z.string().min(1),
  rawInput: z.string().min(1),
  inputType: z.enum(["text", "demo"]),
  createdAt: z.string().min(1),
  aiStatus: z.enum(["ready", "error"]),
  summary: z.string().min(1)
});

export const viewportStateSchema = z.object({
  zoom: z.number(),
  panX: z.number(),
  panY: z.number(),
  selectedNodeId: z.string().nullable(),
  activeFilters: z.array(categorySchema)
});

export const workspaceStateSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  title: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  version: z.number().int().nonnegative(),
  summary: z.string().min(1),
  nodes: z.array(workspaceNodeSchema),
  edges: z.array(workspaceEdgeSchema),
  entries: z.array(workspaceEntrySchema),
  viewport: viewportStateSchema
});

export const workspaceSummarySchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  updatedAt: z.string().min(1),
  version: z.number().int().nonnegative(),
  nodeCount: z.number().int().nonnegative(),
  entryCount: z.number().int().nonnegative()
});

export const workspaceEventSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  type: z.enum(["created", "updated", "extract", "reset", "imported", "deleted", "switched"]),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().min(1)
});

export const graphExtractionNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: categorySchema,
  importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  summary: z.string().min(1)
});

export const graphExtractionEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  strength: z.number().min(0.1).max(1),
  relationType: z.string().min(1)
});

export const graphExtractionResultSchema = z.object({
  summary: z.string().min(1),
  nodes: z.array(graphExtractionNodeSchema).min(1).max(6),
  edges: z.array(graphExtractionEdgeSchema),
  warnings: z.array(z.string()).optional()
});

export const extractionRequestSchema = z.object({
  workspaceId: z.string().min(1),
  text: z.string().min(10),
  existingContext: z.array(z.string()).default([]),
  sourceMetadata: z.record(z.string(), z.string()).optional()
});

export const importWorkspaceSchema = z.object({
  workspace: workspaceStateSchema
});

export const updateWorkspaceSchema = z.object({
  workspace: workspaceStateSchema
});

export const resetWorkspaceSchema = z.object({
  presetId: z.string().optional(),
  blank: z.boolean().optional()
});

export const createWorkspaceSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  presetId: z.string().optional()
});

export const switchWorkspaceSchema = z.object({
  workspaceId: z.string().min(1)
});
