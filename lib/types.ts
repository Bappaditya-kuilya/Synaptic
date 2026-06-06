export type NodeCategory =
  | "systems"
  | "product"
  | "research"
  | "strategy"
  | "design"
  | "technology"
  | "other";

export type InputType = "text" | "demo";

export interface WorkspaceNode {
  id: string;
  label: string;
  normalizedLabel: string;
  category: NodeCategory;
  importance: 1 | 2 | 3;
  summary: string;
  createdAt: string;
  updatedAt: string;
  sourceEntryIds: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface WorkspaceEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  strength: number;
  relationType: string;
}

export interface WorkspaceEntry {
  id: string;
  rawInput: string;
  inputType: InputType;
  createdAt: string;
  aiStatus: "ready" | "error";
  summary: string;
}

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  activeFilters: NodeCategory[];
}

export interface WorkspaceState {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  summary: string;
  nodes: WorkspaceNode[];
  edges: WorkspaceEdge[];
  entries: WorkspaceEntry[];
  viewport: ViewportState;
}

export interface WorkspaceSummary {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  updatedAt: string;
  version: number;
  nodeCount: number;
  entryCount: number;
}

export interface WorkspaceEvent {
  id: string;
  workspaceId: string;
  type: "created" | "updated" | "extract" | "reset" | "imported" | "deleted" | "switched";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface GraphExtractionNode {
  id: string;
  label: string;
  category: NodeCategory;
  importance: 1 | 2 | 3;
  summary: string;
}

export interface GraphExtractionEdge {
  source: string;
  target: string;
  strength: number;
  relationType: string;
}

export interface GraphExtractionResult {
  summary: string;
  nodes: GraphExtractionNode[];
  edges: GraphExtractionEdge[];
  warnings?: string[];
}
