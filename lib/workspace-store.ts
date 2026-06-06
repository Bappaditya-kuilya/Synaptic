import { db } from "@/lib/db";
import { DEMO_WORKSPACE, WORKSPACE_PRESETS } from "@/lib/mock-data";
import { workspaceStateSchema } from "@/lib/schemas";
import type {
  ViewportState,
  WorkspaceEdge,
  WorkspaceEntry,
  WorkspaceNode,
  WorkspaceState
} from "@/lib/types";

const CURRENT_WORKSPACE_ID = "synaptic-current";

type WorkspaceRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  summary: string;
  viewport_json: string;
};

type NodeRow = {
  id: string;
  workspace_id: string;
  label: string;
  normalized_label: string;
  category: WorkspaceNode["category"];
  importance: WorkspaceNode["importance"];
  summary: string;
  created_at: string;
  updated_at: string;
  source_entry_ids_json: string;
  x: number | null;
  y: number | null;
  vx: number | null;
  vy: number | null;
};

type EdgeRow = {
  id: string;
  workspace_id: string;
  source_node_id: string;
  target_node_id: string;
  strength: number;
  relation_type: string;
};

type EntryRow = {
  id: string;
  workspace_id: string;
  raw_input: string;
  input_type: WorkspaceEntry["inputType"];
  created_at: string;
  ai_status: WorkspaceEntry["aiStatus"];
  summary: string;
};

function cloneWorkspace(workspace: WorkspaceState): WorkspaceState {
  return JSON.parse(JSON.stringify(workspace)) as WorkspaceState;
}

function createBlankWorkspace(): WorkspaceState {
  const now = new Date().toISOString();
  return {
    id: CURRENT_WORKSPACE_ID,
    title: "Untitled Workspace",
    createdAt: now,
    updatedAt: now,
    summary: "A fresh workspace ready for a new line of thought.",
    nodes: [],
    edges: [],
    entries: [],
    viewport: {
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedNodeId: null,
      activeFilters: []
    }
  };
}

function toWorkspaceState(
  workspaceRow: WorkspaceRow,
  nodeRows: NodeRow[],
  edgeRows: EdgeRow[],
  entryRows: EntryRow[]
): WorkspaceState {
  const workspace: WorkspaceState = {
    id: workspaceRow.id,
    title: workspaceRow.title,
    createdAt: workspaceRow.created_at,
    updatedAt: workspaceRow.updated_at,
    summary: workspaceRow.summary,
    nodes: nodeRows.map((node) => ({
      id: node.id,
      label: node.label,
      normalizedLabel: node.normalized_label,
      category: node.category,
      importance: node.importance,
      summary: node.summary,
      createdAt: node.created_at,
      updatedAt: node.updated_at,
      sourceEntryIds: JSON.parse(node.source_entry_ids_json) as string[],
      x: node.x ?? undefined,
      y: node.y ?? undefined,
      vx: node.vx ?? undefined,
      vy: node.vy ?? undefined
    })),
    edges: edgeRows.map((edge) => ({
      id: edge.id,
      sourceNodeId: edge.source_node_id,
      targetNodeId: edge.target_node_id,
      strength: edge.strength,
      relationType: edge.relation_type
    })),
    entries: entryRows.map((entry) => ({
      id: entry.id,
      rawInput: entry.raw_input,
      inputType: entry.input_type,
      createdAt: entry.created_at,
      aiStatus: entry.ai_status,
      summary: entry.summary
    })),
    viewport: JSON.parse(workspaceRow.viewport_json) as ViewportState
  };

  return workspaceStateSchema.parse(workspace);
}

function persistWorkspace(workspace: WorkspaceState) {
  const parsed = workspaceStateSchema.parse({
    ...workspace,
    id: CURRENT_WORKSPACE_ID
  });

  const transaction = db.transaction((next: WorkspaceState) => {
    db.prepare(
      `
        INSERT INTO workspaces (id, title, created_at, updated_at, summary, viewport_json)
        VALUES (@id, @title, @createdAt, @updatedAt, @summary, @viewportJson)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          summary = excluded.summary,
          viewport_json = excluded.viewport_json
      `
    ).run({
      id: CURRENT_WORKSPACE_ID,
      title: next.title,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt,
      summary: next.summary,
      viewportJson: JSON.stringify(next.viewport)
    });

    db.prepare("DELETE FROM nodes WHERE workspace_id = ?").run(CURRENT_WORKSPACE_ID);
    db.prepare("DELETE FROM edges WHERE workspace_id = ?").run(CURRENT_WORKSPACE_ID);
    db.prepare("DELETE FROM entries WHERE workspace_id = ?").run(CURRENT_WORKSPACE_ID);

    const insertNode = db.prepare(
      `
        INSERT INTO nodes (
          id, workspace_id, label, normalized_label, category, importance, summary,
          created_at, updated_at, source_entry_ids_json, x, y, vx, vy
        ) VALUES (
          @id, @workspaceId, @label, @normalizedLabel, @category, @importance, @summary,
          @createdAt, @updatedAt, @sourceEntryIdsJson, @x, @y, @vx, @vy
        )
      `
    );

    const insertEdge = db.prepare(
      `
        INSERT INTO edges (
          id, workspace_id, source_node_id, target_node_id, strength, relation_type
        ) VALUES (
          @id, @workspaceId, @sourceNodeId, @targetNodeId, @strength, @relationType
        )
      `
    );

    const insertEntry = db.prepare(
      `
        INSERT INTO entries (
          id, workspace_id, raw_input, input_type, created_at, ai_status, summary
        ) VALUES (
          @id, @workspaceId, @rawInput, @inputType, @createdAt, @aiStatus, @summary
        )
      `
    );

    for (const node of next.nodes) {
      insertNode.run({
        id: node.id,
        workspaceId: CURRENT_WORKSPACE_ID,
        label: node.label,
        normalizedLabel: node.normalizedLabel,
        category: node.category,
        importance: node.importance,
        summary: node.summary,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        sourceEntryIdsJson: JSON.stringify(node.sourceEntryIds),
        x: node.x ?? null,
        y: node.y ?? null,
        vx: node.vx ?? null,
        vy: node.vy ?? null
      });
    }

    for (const edge of next.edges) {
      insertEdge.run({
        id: edge.id,
        workspaceId: CURRENT_WORKSPACE_ID,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        strength: edge.strength,
        relationType: edge.relationType
      });
    }

    for (const entry of next.entries) {
      insertEntry.run({
        id: entry.id,
        workspaceId: CURRENT_WORKSPACE_ID,
        rawInput: entry.rawInput,
        inputType: entry.inputType,
        createdAt: entry.createdAt,
        aiStatus: entry.aiStatus,
        summary: entry.summary
      });
    }
  });

  transaction(parsed);
  return parsed;
}

function fetchWorkspaceById(workspaceId: string) {
  const workspaceRow = db
    .prepare("SELECT * FROM workspaces WHERE id = ?")
    .get(workspaceId) as WorkspaceRow | undefined;

  if (!workspaceRow) {
    return null;
  }

  const nodeRows = db
    .prepare("SELECT * FROM nodes WHERE workspace_id = ? ORDER BY created_at ASC")
    .all(workspaceId) as NodeRow[];
  const edgeRows = db
    .prepare("SELECT * FROM edges WHERE workspace_id = ?")
    .all(workspaceId) as EdgeRow[];
  const entryRows = db
    .prepare("SELECT * FROM entries WHERE workspace_id = ? ORDER BY created_at DESC")
    .all(workspaceId) as EntryRow[];

  return toWorkspaceState(workspaceRow, nodeRows, edgeRows, entryRows);
}

export async function readCurrentWorkspace() {
  const existing = fetchWorkspaceById(CURRENT_WORKSPACE_ID);
  if (existing) {
    return existing;
  }

  return writeCurrentWorkspace(cloneWorkspace(DEMO_WORKSPACE));
}

export async function writeCurrentWorkspace(workspace: WorkspaceState) {
  return persistWorkspace(workspace);
}

export async function resetCurrentWorkspace(options?: { presetId?: string; blank?: boolean }) {
  if (options?.blank) {
    return writeCurrentWorkspace(createBlankWorkspace());
  }

  const preset = options?.presetId
    ? WORKSPACE_PRESETS.find((item) => item.id === options.presetId) ?? DEMO_WORKSPACE
    : DEMO_WORKSPACE;

  return writeCurrentWorkspace(cloneWorkspace(preset));
}

export function listWorkspacePresets() {
  return WORKSPACE_PRESETS.map((preset) => ({
    id: preset.id,
    title: preset.title,
    summary: preset.summary
  }));
}
