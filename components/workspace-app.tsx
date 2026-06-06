"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { DEMO_WORKSPACE, WORKSPACE_PRESETS } from "@/lib/mock-data";
import { createEntry, getConnectedNodes, mergeExtraction } from "@/lib/graph-utils";
import type { GraphExtractionResult, NodeCategory, WorkspaceState } from "@/lib/types";
import { GraphCanvas } from "@/components/graph-canvas";

const STORAGE_KEY = "synaptic.workspace.v1";

const CATEGORY_LABELS: NodeCategory[] = [
  "systems",
  "product",
  "research",
  "strategy",
  "design",
  "technology",
  "other"
];

function makeInitialWorkspace(): WorkspaceState {
  return DEMO_WORKSPACE;
}

export function WorkspaceApp() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(makeInitialWorkspace);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWorkspace(JSON.parse(stored) as WorkspaceState);
      }
    } catch {
      setToast("Could not restore saved workspace.");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedNode =
    workspace.nodes.find((node) => node.id === workspace.viewport.selectedNodeId) ?? null;
  const relatedNodes = selectedNode ? getConnectedNodes(workspace, selectedNode.id) : [];
  const focusNodeIds = selectedNode
    ? new Set([selectedNode.id, ...relatedNodes.map((node) => node.id)])
    : null;

  const visibleNodes = workspace.nodes.filter((node) => {
    const matchesQuery = deferredQuery
      ? `${node.label} ${node.summary}`.toLowerCase().includes(deferredQuery.toLowerCase())
      : true;
    const matchesCategory =
      workspace.viewport.activeFilters.length === 0 ||
      workspace.viewport.activeFilters.includes(node.category);
    const matchesFocus = !focusMode || !focusNodeIds || focusNodeIds.has(node.id);
    return matchesQuery && matchesCategory && matchesFocus;
  });

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = workspace.edges.filter(
    (edge) => visibleNodeIds.has(edge.sourceNodeId) && visibleNodeIds.has(edge.targetNodeId)
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void submitInput();
      }
      if (event.key === "/") {
        const active = document.activeElement;
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
          return;
        }
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setWorkspace((current) => ({
          ...current,
          viewport: {
            ...current.viewport,
            selectedNodeId: null
          }
        }));
        setFocusMode(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function submitInput() {
    const text = draft.trim();
    if (text.length < 10) {
      setToast("Write at least one meaningful sentence.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/graph/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            workspaceId: workspace.id,
            text,
            existingContext: workspace.nodes.map((node) => node.label)
          })
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Extraction failed");
        }

        const result = payload as GraphExtractionResult;
        const entry = createEntry(text, result.summary, "text");
        setWorkspace((current) => ({
          ...mergeExtraction(current, result, entry),
          viewport: {
            ...current.viewport,
            selectedNodeId: result.nodes[0]?.id ?? current.viewport.selectedNodeId
          }
        }));
        setDraft("");
        setToast(result.warnings?.[0] ?? "Graph expanded.");
      } catch (error) {
        setToast(error instanceof Error ? error.message : "Extraction failed");
      }
    });
  }

  function toggleFilter(category: NodeCategory) {
    setWorkspace((current) => {
      const active = current.viewport.activeFilters.includes(category);
      return {
        ...current,
        viewport: {
          ...current.viewport,
          activeFilters: active
            ? current.viewport.activeFilters.filter((item) => item !== category)
            : [...current.viewport.activeFilters, category]
        }
      };
    });
  }

  function loadDemoWorkspace() {
    setWorkspace(makeInitialWorkspace());
    setFocusMode(false);
    setToast("Starter workspace restored.");
  }

  function loadPreset(workspacePreset: WorkspaceState) {
    setWorkspace(workspacePreset);
    setFocusMode(false);
    setToast(`Loaded ${workspacePreset.title}.`);
  }

  function exportWorkspace() {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workspace.title.toLowerCase().replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearWorkspace() {
    setWorkspace({
      ...makeInitialWorkspace(),
      nodes: [],
      edges: [],
      entries: [],
      summary: "A fresh workspace ready for a new line of thought.",
      viewport: {
        zoom: 1,
        panX: 0,
        panY: 0,
        selectedNodeId: null,
        activeFilters: []
      }
    });
    setToast("Workspace cleared.");
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  function importWorkspace(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as WorkspaceState;
        setWorkspace(parsed);
        setFocusMode(false);
        setToast(`Imported ${parsed.title}.`);
      } catch {
        setToast("Import failed. Select a valid Synaptic workspace JSON file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <main className="app-shell">
        <aside className="panel panel-left">
          <div className="panel-header">
            <div className="brand">
              <div className="brand-mark">Synaptic</div>
              <div className="brand-status">Persistent v1</div>
            </div>
            <p className="subtitle">
              AI thinking workspace for building concept maps that stay useful after the first session.
            </p>
          </div>

          <div className="content-stack">
            <section className="hero-card">
              <input
                className="title-input"
                value={workspace.title}
                onChange={(event) =>
                  setWorkspace((current) => ({
                    ...current,
                    title: event.target.value,
                    updatedAt: new Date().toISOString()
                  }))
                }
              />
              <p>{workspace.summary}</p>
              <div className="metrics">
                <div className="metric-card">
                  <span>Concepts</span>
                  <strong>{workspace.nodes.length}</strong>
                </div>
                <div className="metric-card">
                  <span>Links</span>
                  <strong>{workspace.edges.length}</strong>
                </div>
                <div className="metric-card">
                  <span>Entries</span>
                  <strong>{workspace.entries.length}</strong>
                </div>
              </div>
            </section>

            <section className="section">
              <h2>Search</h2>
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Find nodes, summaries, concepts"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <p className="hint-text">Press <code>/</code> to focus search.</p>
            </section>

            <section className="section">
              <h2>Filters</h2>
              <div className="chip-row">
                {CATEGORY_LABELS.map((category) => (
                  <button
                    key={category}
                    className="chip"
                    data-active={workspace.viewport.activeFilters.includes(category)}
                    onClick={() => toggleFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section className="composer-box">
              <h2>Compose</h2>
              <textarea
                className="composer-textarea"
                placeholder="Describe an idea, paste a paragraph, or outline a system you want to think through."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="button-row">
                <button className="button button-primary" disabled={isPending} onClick={submitInput}>
                  {isPending ? "Structuring..." : "Expand Graph"}
                </button>
                <button className="button button-secondary" onClick={loadDemoWorkspace}>
                  Load Starter
                </button>
                <button className="button button-secondary" onClick={exportWorkspace}>
                  Export JSON
                </button>
                <button className="button button-secondary" onClick={triggerImport}>
                  Import JSON
                </button>
                <button className="button button-danger" onClick={clearWorkspace}>
                  Clear Workspace
                </button>
              </div>
              <p className="hint-text">Press <code>Ctrl/Cmd + Enter</code> to submit.</p>
              <input
                ref={fileInputRef}
                hidden
                accept="application/json"
                type="file"
                onChange={importWorkspace}
              />
            </section>

            <section className="section">
              <h2>Showcase Workspaces</h2>
              <div className="preset-grid">
                {WORKSPACE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className="preset-card"
                    onClick={() => loadPreset(preset)}
                  >
                    <strong>{preset.title}</strong>
                    <p>{preset.summary}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>Recent Inputs</h2>
              <div className="entry-list">
                {workspace.entries.length === 0 ? (
                  <p className="empty-state">No entries yet. Start by expanding the graph from a paragraph or idea.</p>
                ) : (
                  workspace.entries.map((entry) => (
                    <article className="entry-card" key={entry.id}>
                      <div className="entry-meta">
                        <span>{entry.inputType}</span>
                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                      <p>{entry.summary}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </aside>

        <section className="panel-main">
          <div className="graph-backdrop" />
          <GraphCanvas
            nodes={visibleNodes}
            edges={visibleEdges}
            selectedNodeId={workspace.viewport.selectedNodeId}
            onNodeSelect={(nodeId) =>
              setWorkspace((current) => ({
                ...current,
                viewport: {
                  ...current.viewport,
                  selectedNodeId: nodeId
                }
              }))
            }
          />
          <div className="canvas-overlay">
            <div className="toolbar">
              <div className="toolbar-card">
                <strong>Canvas-first workspace</strong>
                <span>{workspace.summary}</span>
              </div>
              <div className="toolbar-card">
                <button className="button button-secondary" onClick={() => setFocusMode((value) => !value)}>
                  {focusMode ? "Disable Focus" : "Focus Selection"}
                </button>
              </div>
            </div>
            <div className="canvas-footer">
              <span>Drag nodes. Scroll to zoom. Build memory over time.</span>
              <span>{visibleNodes.length} visible concepts</span>
            </div>
          </div>
        </section>

        <aside className="panel panel-right">
          <div className="right-stack">
            <section className="summary-box">
              <h2>Workspace Summary</h2>
              <p>{workspace.summary}</p>
            </section>

            <section className="section">
              <h2>Selected Node</h2>
              {selectedNode ? (
                <article className="node-card selected">
                  <div className="node-meta">
                    <span>{selectedNode.category}</span>
                    <span>importance {selectedNode.importance}</span>
                  </div>
                  <h3>{selectedNode.label}</h3>
                  <p>{selectedNode.summary}</p>
                  <p className="hint-text">
                    Touched by {selectedNode.sourceEntryIds.length} source
                    {selectedNode.sourceEntryIds.length === 1 ? "" : "s"}.
                  </p>
                </article>
              ) : (
                <p className="empty-state">Select a node to inspect its role in the workspace.</p>
              )}
            </section>

            <section className="section">
              <h2>Related Concepts</h2>
              <div className="related-list">
                {relatedNodes.length === 0 ? (
                  <p className="empty-state">No connected concepts visible yet.</p>
                ) : (
                  relatedNodes.map((node) => (
                    <button
                      className="node-card"
                      key={node.id}
                      onClick={() =>
                        setWorkspace((current) => ({
                          ...current,
                          viewport: {
                            ...current.viewport,
                            selectedNodeId: node.id
                          }
                        }))
                      }
                    >
                      <div className="node-meta">
                        <span>{node.category}</span>
                        <span>importance {node.importance}</span>
                      </div>
                      <h3>{node.label}</h3>
                      <p>{node.summary}</p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>
        </aside>
      </main>
      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}
