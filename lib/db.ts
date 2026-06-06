import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "synaptic.db");

mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL DEFAULT 'local-user',
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    summary TEXT NOT NULL,
    viewport_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    label TEXT NOT NULL,
    normalized_label TEXT NOT NULL,
    category TEXT NOT NULL,
    importance INTEGER NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    source_entry_ids_json TEXT NOT NULL,
    x REAL,
    y REAL,
    vx REAL,
    vy REAL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    strength REAL NOT NULL,
    relation_type TEXT NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    raw_input TEXT NOT NULL,
    input_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    ai_status TEXT NOT NULL,
    summary TEXT NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS workspace_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_nodes_workspace_id ON nodes(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_edges_workspace_id ON edges(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_entries_workspace_id ON entries(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_workspace_events_workspace_id ON workspace_events(workspace_id);
`);

ensureColumn("workspaces", "owner_id", "TEXT NOT NULL DEFAULT 'local-user'");
ensureColumn("workspaces", "version", "INTEGER NOT NULL DEFAULT 1");

export { db };
