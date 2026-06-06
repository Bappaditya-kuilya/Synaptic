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
      <div className="app-scene">
        <div className="scene-ribbon scene-ribbon-left" />
        <div className="scene-ribbon scene-ribbon-right" />

        <header className="site-nav">
          <div className="site-brand">
            <div className="brand-mark">S</div>
            <span>Synaptic</span>
          </div>

          <nav className="site-links">
            <button className="nav-link" onClick={loadDemoWorkspace}>Workspace</button>
            <button className="nav-link" onClick={exportWorkspace}>Export</button>
            <button className="nav-link" onClick={triggerImport}>Import</button>
            <button className="nav-link" onClick={clearWorkspace}>Reset</button>
          </nav>

          <button className="site-cta" onClick={loadDemoWorkspace}>Get Started</button>
        </header>

        <main className="hero-page">
          <section className="hero-shell reveal reveal-1">
            <div className="hero-badge">Persistent AI workspace</div>
            <h1 className="hero-title">
              The thinking layer that brings
              {" "}
              <span>clarity</span>
              {" "}
              to complexity
            </h1>
            <p className="hero-subtitle">
              Capture ideas, structure them into a living graph, and keep building a workspace that gets smarter over time.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" onClick={loadDemoWorkspace}>Open Workspace</button>
              <button className="hero-secondary" onClick={() => setFocusMode((value) => !value)}>
                {focusMode ? "Release Focus" : "Focus Selection"}
              </button>
            </div>
            <div className="hero-proof">
              <div className="proof-item">
                <span>Concepts</span>
                <strong>{workspace.nodes.length}</strong>
              </div>
              <div className="proof-item">
                <span>Connected edges</span>
                <strong>{workspace.edges.length}</strong>
              </div>
              <div className="proof-item">
                <span>Saved entries</span>
                <strong>{workspace.entries.length}</strong>
              </div>
            </div>
          </section>

          <section className="showcase-frame reveal reveal-2">
            <div className="showcase-toolbar">
              <div className="toolbar-block">
                <span className="toolbar-label">Search</span>
                <input
                  ref={searchRef}
                  className="toolbar-search"
                  placeholder="Search concepts"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="toolbar-chips">
                {CATEGORY_LABELS.map((category) => (
                  <button
                    key={category}
                    className="toolbar-chip"
                    data-active={workspace.viewport.activeFilters.includes(category)}
                    onClick={() => toggleFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="showcase-canvas">
              <div className="canvas-radial" />
              <div className="canvas-beam canvas-beam-top" />
              <div className="canvas-beam canvas-beam-bottom" />
              <div className="canvas-grid" />
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

              <aside className="floating-card floating-left">
                <div className="floating-label">Workspace</div>
                <input
                  className="floating-title"
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
                <div className="floating-stats">
                  <div>
                    <span>Concepts</span>
                    <strong>{workspace.nodes.length}</strong>
                  </div>
                  <div>
                    <span>Entries</span>
                    <strong>{workspace.entries.length}</strong>
                  </div>
                </div>
              </aside>

              <aside className="floating-card floating-right">
                <div className="floating-label">Selection</div>
                {selectedNode ? (
                  <>
                    <h3>{selectedNode.label}</h3>
                    <p>{selectedNode.summary}</p>
                    <div className="floating-meta">
                      <span>{selectedNode.category}</span>
                      <span>importance {selectedNode.importance}</span>
                    </div>
                  </>
                ) : (
                  <p>Select a node to inspect it.</p>
                )}
              </aside>

              <div className="composer-rail">
                <div className="composer-panel">
                  <div className="composer-head">
                    <div>
                      <span className="toolbar-label">Compose</span>
                      <h2>Add a note, thought, or paragraph</h2>
                    </div>
                    <span className="composer-shortcut">Ctrl/Cmd + Enter</span>
                  </div>

                  <textarea
                    className="composer-input"
                    placeholder="Paste a note, product thought, research snippet, or unfinished idea."
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />

                  <div className="composer-actions">
                    <button className="hero-primary" disabled={isPending} onClick={submitInput}>
                      {isPending ? "Structuring..." : "Expand Graph"}
                    </button>
                    <button className="hero-secondary" onClick={loadDemoWorkspace}>Load Starter</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="preset-strip reveal reveal-3">
            {WORKSPACE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="preset-tile"
                onClick={() => loadPreset(preset)}
              >
                <strong>{preset.title}</strong>
                <p>{preset.summary}</p>
              </button>
            ))}
          </section>
        </main>
      </div>

      <input
        ref={fileInputRef}
        hidden
        accept="application/json"
        type="file"
        onChange={importWorkspace}
      />

      {toast ? <div className="toast-premium">{toast}</div> : null}
    </>
  );
}
