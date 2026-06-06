"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { DEMO_WORKSPACE, WORKSPACE_PRESETS } from "@/lib/mock-data";
import { getConnectedNodes } from "@/lib/graph-utils";
import type { NodeCategory, WorkspaceState, WorkspaceSummary } from "@/lib/types";
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
  const [workspaceList, setWorkspaceList] = useState<WorkspaceSummary[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const [workspaceResponse, listResponse] = await Promise.all([
          fetch("/api/workspace", { cache: "no-store" }),
          fetch("/api/workspaces", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" })
        ]);
        const workspacePayload = await workspaceResponse.json();
        const listPayload = await listResponse.json();
        const authPayload = await (await fetch("/api/auth/me", { cache: "no-store" })).json();
        if (!workspaceResponse.ok) {
          throw new Error(workspacePayload.error || "Could not load workspace");
        }
        if (!listResponse.ok) {
          throw new Error(listPayload.error || "Could not load workspaces");
        }
        if (!cancelled) {
          setWorkspace(workspacePayload.workspace as WorkspaceState);
          setWorkspaceList((listPayload.workspaces as WorkspaceSummary[]) ?? []);
          setUser(authPayload.user ?? null);
        }
      } catch {
        try {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored && !cancelled) {
            setWorkspace(JSON.parse(stored) as WorkspaceState);
          }
        } catch {
          if (!cancelled) {
            setToast("Could not restore saved workspace.");
          }
        }
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
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
        const response = await fetch("/api/workspace/extract", {
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
        setWorkspace(payload.workspace as WorkspaceState);
        await refreshWorkspaceList();
        setDraft("");
        setToast(payload.result?.warnings?.[0] ?? "Graph expanded.");
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
    void resetWorkspace();
  }

  function loadPreset(workspacePreset: WorkspaceState) {
    void resetWorkspace(workspacePreset.id);
  }

  async function refreshWorkspaceList() {
    try {
      const response = await fetch("/api/workspaces", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not load workspaces");
      }
      setWorkspaceList((payload.workspaces as WorkspaceSummary[]) ?? []);
    } catch {
      // Keep existing list if refresh fails.
    }
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
    void resetWorkspace(undefined, true);
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
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as WorkspaceState;
        const response = await fetch("/api/workspace/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ workspace: parsed })
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Import failed");
        }
        setWorkspace(payload.workspace as WorkspaceState);
        await refreshWorkspaceList();
        setFocusMode(false);
        setToast(`Imported ${(payload.workspace as WorkspaceState).title}.`);
      } catch (error) {
        setToast(error instanceof Error ? error.message : "Import failed. Select a valid Synaptic workspace JSON file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  async function resetWorkspace(presetId?: string, blank = false) {
    try {
      const response = await fetch("/api/workspace/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          presetId,
          blank
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not reset workspace");
      }
      setWorkspace(payload.workspace as WorkspaceState);
      await refreshWorkspaceList();
      setFocusMode(false);
      setToast(blank ? "Workspace cleared." : "Workspace restored.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not reset workspace");
    }
  }

  async function createWorkspace() {
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newWorkspaceTitle.trim() || undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not create workspace");
      }
      setWorkspace(payload.workspace as WorkspaceState);
      setWorkspaceList((payload.workspaces as WorkspaceSummary[]) ?? []);
      setNewWorkspaceTitle("");
      setToast("Workspace created.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not create workspace");
    }
  }

  async function handleAuth(mode: "register" | "login") {
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `Could not ${mode}`);
      }
      setUser(payload.user ?? null);
      await refreshWorkspaceList();
      setAuthPassword("");
      setToast(mode === "register" ? "Account created." : "Signed in.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setToast("Signed out.");
    } catch {
      setToast("Could not sign out.");
    }
  }

  async function switchWorkspace(workspaceId: string) {
    try {
      const response = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ workspaceId })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not switch workspace");
      }
      setWorkspace(payload.workspace as WorkspaceState);
      setToast("Workspace switched.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not switch workspace");
    }
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

          {user ? (
            <div className="auth-pill">
              <span>{user.email}</span>
              <button className="auth-pill-button" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <div className="auth-inline">
              <input
                className="auth-input"
                placeholder="Email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
              />
              <input
                className="auth-input"
                placeholder="Password"
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
              />
              <button className="auth-action" onClick={() => void handleAuth("login")}>Sign in</button>
              <button className="site-cta" onClick={() => void handleAuth("register")}>Create account</button>
            </div>
          )}
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

            <div className="workspace-switcher">
              <div className="workspace-switcher-head">
                <div>
                  <span className="toolbar-label">Workspaces</span>
                  <h3>Pick up where you left off</h3>
                </div>
                <div className="workspace-create">
                  <input
                    className="workspace-create-input"
                    placeholder="New workspace title"
                    value={newWorkspaceTitle}
                    onChange={(event) => setNewWorkspaceTitle(event.target.value)}
                  />
                  <button className="workspace-create-button" onClick={createWorkspace}>
                    Create
                  </button>
                </div>
              </div>

              <div className="workspace-list">
                {workspaceList.map((item) => (
                  <button
                    key={item.id}
                    className="workspace-list-item"
                    data-active={item.id === workspace.id}
                    onClick={() => switchWorkspace(item.id)}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.nodeCount} nodes · {item.entryCount} entries</span>
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
