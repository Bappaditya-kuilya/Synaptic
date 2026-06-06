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
  title: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  nodes: WorkspaceNode[];
  edges: WorkspaceEdge[];
  entries: WorkspaceEntry[];
  viewport: ViewportState;
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
