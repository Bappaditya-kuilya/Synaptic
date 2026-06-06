import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { DEMO_WORKSPACE, WORKSPACE_PRESETS } from "@/lib/mock-data";
import {
  workspaceEventSchema,
  workspaceStateSchema,
  workspaceSummarySchema
} from "@/lib/schemas";
import type {
  ViewportState,
  WorkspaceEdge,
  WorkspaceEntry,
  WorkspaceEvent,
  WorkspaceNode,
  WorkspaceState,
  WorkspaceSummary
} from "@/lib/types";

const APP_STATE_CURRENT_WORKSPACE = "current_workspace_id";
const DEFAULT_OWNER_ID = "local-user";

type WorkspaceRow = {
  id: string;
  owner_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  version: number;
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

type WorkspaceEventRow = {
  id: string;
  workspace_id: string;
  type: WorkspaceEvent["type"];
  payload_json: string;
  created_at: string;
};

type WorkspaceSummaryRow = {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  updated_at: string;
  version: number;
  node_count: number;
  entry_count: number;
};

function cloneWorkspace(workspace: WorkspaceState): WorkspaceState {
  return JSON.parse(JSON.stringify(workspace)) as WorkspaceState;
}

function createBlankWorkspace(title = "Untitled Workspace"): WorkspaceState {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    ownerId: DEFAULT_OWNER_ID,
    title,
    createdAt: now,
    updatedAt: now,
    version: 1,
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
  return workspaceStateSchema.parse({
    id: workspaceRow.id,
    ownerId: workspaceRow.owner_id,
    title: workspaceRow.title,
    createdAt: workspaceRow.created_at,
    updatedAt: workspaceRow.updated_at,
    version: workspaceRow.version,
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
  });
}

function toWorkspaceSummary(row: WorkspaceSummaryRow): WorkspaceSummary {
  return workspaceSummarySchema.parse({
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    summary: row.summary,
    updatedAt: row.updated_at,
    version: row.version,
    nodeCount: row.node_count,
    entryCount: row.entry_count
  });
}

function toWorkspaceEvent(row: WorkspaceEventRow): WorkspaceEvent {
  return workspaceEventSchema.parse({
    id: row.id,
    workspaceId: row.workspace_id,
    type: row.type,
    payload: JSON.parse(row.payload_json) as Record<string, unknown>,
    createdAt: row.created_at
  });
}

function appStateKey(ownerId: string) {
  return `${APP_STATE_CURRENT_WORKSPACE}:${ownerId}`;
}

function getCurrentWorkspaceId(ownerId: string) {
  const row = db
    .prepare("SELECT value FROM app_state WHERE key = ?")
    .get(appStateKey(ownerId)) as { value: string } | undefined;
  return row?.value ?? null;
}

function setCurrentWorkspaceId(ownerId: string, workspaceId: string) {
  db.prepare(
    `
      INSERT INTO app_state (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `
  ).run(appStateKey(ownerId), workspaceId);
}

function persistEvent(workspaceId: string, type: WorkspaceEvent["type"], payload: Record<string, unknown>) {
  db.prepare(
    `
      INSERT INTO workspace_events (id, workspace_id, type, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(randomUUID(), workspaceId, type, JSON.stringify(payload), new Date().toISOString());
}

function persistWorkspace(
  workspace: WorkspaceState,
  options?: { eventType?: WorkspaceEvent["type"]; eventPayload?: Record<string, unknown>; setCurrent?: boolean }
) {
  const parsed = workspaceStateSchema.parse(workspace);

  const transaction = db.transaction((next: WorkspaceState) => {
    const existingRow = db
      .prepare("SELECT version FROM workspaces WHERE id = ?")
      .get(next.id) as { version: number } | undefined;

    const nextVersion = existingRow ? existingRow.version + 1 : 1;
    if (existingRow && next.version !== existingRow.version) {
      throw new Error("Workspace has changed in another session. Refresh and try again.");
    }

    db.prepare(
      `
        INSERT INTO workspaces (id, owner_id, title, created_at, updated_at, version, summary, viewport_json)
        VALUES (@id, @ownerId, @title, @createdAt, @updatedAt, @version, @summary, @viewportJson)
        ON CONFLICT(id) DO UPDATE SET
          owner_id = excluded.owner_id,
          title = excluded.title,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          version = excluded.version,
          summary = excluded.summary,
          viewport_json = excluded.viewport_json
      `
    ).run({
      id: next.id,
      ownerId: next.ownerId,
      title: next.title,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt,
      version: nextVersion,
      summary: next.summary,
      viewportJson: JSON.stringify(next.viewport)
    });

    db.prepare("DELETE FROM nodes WHERE workspace_id = ?").run(next.id);
    db.prepare("DELETE FROM edges WHERE workspace_id = ?").run(next.id);
    db.prepare("DELETE FROM entries WHERE workspace_id = ?").run(next.id);

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
        workspaceId: next.id,
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
        workspaceId: next.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        strength: edge.strength,
        relationType: edge.relationType
      });
    }

    for (const entry of next.entries) {
      insertEntry.run({
        id: entry.id,
        workspaceId: next.id,
        rawInput: entry.rawInput,
        inputType: entry.inputType,
        createdAt: entry.createdAt,
        aiStatus: entry.aiStatus,
        summary: entry.summary
      });
    }

    if (options?.setCurrent !== false) {
      setCurrentWorkspaceId(next.ownerId, next.id);
    }

    if (options?.eventType) {
      persistEvent(next.id, options.eventType, options.eventPayload ?? {});
    }
  });

  transaction(parsed);
  return {
    ...parsed,
    version: (db.prepare("SELECT version FROM workspaces WHERE id = ?").get(parsed.id) as { version: number }).version
  };
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

export async function listWorkspaces() {
  return listWorkspacesByOwner(DEFAULT_OWNER_ID);
}

export async function listWorkspacesByOwner(ownerId: string) {
  const rows = db.prepare(
    `
      SELECT
        w.id,
        w.owner_id,
        w.title,
        w.summary,
        w.updated_at,
        w.version,
        COALESCE(n.node_count, 0) AS node_count,
        COALESCE(e.entry_count, 0) AS entry_count
      FROM workspaces w
      LEFT JOIN (
        SELECT workspace_id, COUNT(*) AS node_count
        FROM nodes
        GROUP BY workspace_id
      ) n ON n.workspace_id = w.id
      LEFT JOIN (
        SELECT workspace_id, COUNT(*) AS entry_count
        FROM entries
        GROUP BY workspace_id
      ) e ON e.workspace_id = w.id
      WHERE w.owner_id = ?
      ORDER BY w.updated_at DESC
    `
  ).all(ownerId) as WorkspaceSummaryRow[];

  return rows.map(toWorkspaceSummary);
}

export async function readWorkspace(workspaceId: string, ownerId?: string) {
  const workspace = fetchWorkspaceById(workspaceId);
  if (!workspace) {
    return null;
  }
  if (ownerId && workspace.ownerId !== ownerId) {
    return null;
  }
  return workspace;
}

export async function readCurrentWorkspace(ownerId = DEFAULT_OWNER_ID) {
  const currentId = getCurrentWorkspaceId(ownerId);
  if (currentId) {
    const existing = fetchWorkspaceById(currentId);
    if (existing && existing.ownerId === ownerId) {
      return existing;
    }
  }

  const seeded = {
    ...cloneWorkspace(DEMO_WORKSPACE),
    ownerId,
    version: 1
  };
  return persistWorkspace(seeded, {
    eventType: "created",
    eventPayload: { source: "demo-seed" }
  });
}

export async function writeWorkspace(workspace: WorkspaceState, options?: { eventType?: WorkspaceEvent["type"]; eventPayload?: Record<string, unknown> }) {
  return persistWorkspace(workspace, {
    eventType: options?.eventType ?? "updated",
    eventPayload: options?.eventPayload ?? {}
  });
}

export async function writeCurrentWorkspace(workspace: WorkspaceState) {
  return writeWorkspace(workspace);
}

export async function createWorkspace(options?: { title?: string; presetId?: string }) {
  return createWorkspaceForOwner(DEFAULT_OWNER_ID, options);
}

export async function createWorkspaceForOwner(ownerId: string, options?: { title?: string; presetId?: string }) {
  const preset = options?.presetId
    ? WORKSPACE_PRESETS.find((item) => item.id === options.presetId)
    : null;

  const base = preset ? cloneWorkspace(preset) : createBlankWorkspace(options?.title ?? "Untitled Workspace");
  const now = new Date().toISOString();
  const workspace = {
    ...base,
    id: randomUUID(),
    ownerId,
    title: options?.title?.trim() || base.title,
    createdAt: now,
    updatedAt: now
  };

  return persistWorkspace(workspace, {
    eventType: "created",
    eventPayload: { presetId: options?.presetId ?? null }
  });
}

export async function switchCurrentWorkspace(workspaceId: string) {
  return switchCurrentWorkspaceForOwner(DEFAULT_OWNER_ID, workspaceId);
}

export async function switchCurrentWorkspaceForOwner(ownerId: string, workspaceId: string) {
  const workspace = fetchWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (workspace.ownerId !== ownerId) {
    throw new Error("Workspace not found");
  }
  setCurrentWorkspaceId(ownerId, workspaceId);
  persistEvent(workspaceId, "switched", {});
  return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
  return deleteWorkspaceForOwner(DEFAULT_OWNER_ID, workspaceId);
}

export async function deleteWorkspaceForOwner(ownerId: string, workspaceId: string) {
  const workspace = fetchWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (workspace.ownerId !== ownerId) {
    throw new Error("Workspace not found");
  }

  db.transaction(() => {
    db.prepare("DELETE FROM workspace_events WHERE workspace_id = ?").run(workspaceId);
    db.prepare("DELETE FROM entries WHERE workspace_id = ?").run(workspaceId);
    db.prepare("DELETE FROM edges WHERE workspace_id = ?").run(workspaceId);
    db.prepare("DELETE FROM nodes WHERE workspace_id = ?").run(workspaceId);
    db.prepare("DELETE FROM workspaces WHERE id = ?").run(workspaceId);
  })();

  const nextCurrent = getCurrentWorkspaceId(ownerId);
  if (nextCurrent === workspaceId) {
    const remaining = await listWorkspacesByOwner(ownerId);
    if (remaining[0]) {
      setCurrentWorkspaceId(ownerId, remaining[0].id);
    } else {
      const created = await createWorkspaceForOwner(ownerId, { title: "Untitled Workspace" });
      setCurrentWorkspaceId(ownerId, created.id);
    }
  }
}

export async function resetWorkspace(workspaceId: string, options?: { presetId?: string; blank?: boolean }) {
  return resetWorkspaceForOwner(DEFAULT_OWNER_ID, workspaceId, options);
}

export async function resetWorkspaceForOwner(ownerId: string, workspaceId: string, options?: { presetId?: string; blank?: boolean }) {
  const current = fetchWorkspaceById(workspaceId);
  if (!current) {
    throw new Error("Workspace not found");
  }
  if (current.ownerId !== ownerId) {
    throw new Error("Workspace not found");
  }

  const next =
    options?.blank
      ? { ...createBlankWorkspace(current.title), id: current.id, createdAt: current.createdAt }
      : (() => {
          const preset = options?.presetId
            ? WORKSPACE_PRESETS.find((item) => item.id === options.presetId) ?? DEMO_WORKSPACE
            : DEMO_WORKSPACE;
          const cloned = cloneWorkspace(preset);
          return {
            ...cloned,
            id: current.id,
            title: current.title,
            createdAt: current.createdAt,
            updatedAt: new Date().toISOString()
          };
        })();

  return persistWorkspace(next, {
    eventType: "reset",
    eventPayload: { presetId: options?.presetId ?? null, blank: Boolean(options?.blank) }
  });
}

export async function importWorkspace(workspace: WorkspaceState) {
  return importWorkspaceForOwner(DEFAULT_OWNER_ID, workspace);
}

export async function importWorkspaceForOwner(ownerId: string, workspace: WorkspaceState) {
  const imported = {
    ...workspace,
    id: randomUUID(),
    ownerId,
    version: 1,
    updatedAt: new Date().toISOString()
  };

  return persistWorkspace(imported, {
    eventType: "imported",
    eventPayload: { title: workspace.title }
  });
}

export async function listWorkspaceEvents(workspaceId: string) {
  return listWorkspaceEventsForOwner(DEFAULT_OWNER_ID, workspaceId);
}

export async function listWorkspaceEventsForOwner(ownerId: string, workspaceId: string) {
  const workspace = fetchWorkspaceById(workspaceId);
  if (!workspace || workspace.ownerId !== ownerId) {
    return [];
  }

  const rows = db.prepare(
    `
      SELECT * FROM workspace_events
      WHERE workspace_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `
  ).all(workspaceId) as WorkspaceEventRow[];

  return rows.map(toWorkspaceEvent);
}

export function listWorkspacePresets() {
  return WORKSPACE_PRESETS.map((preset) => ({
    id: preset.id,
    title: preset.title,
    summary: preset.summary
  }));
}
