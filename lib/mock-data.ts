import type { WorkspaceState } from "@/lib/types";

type PresetNode = Omit<WorkspaceState["nodes"][number], "createdAt" | "updatedAt">;
type PresetEntry = Pick<
  WorkspaceState["entries"][number],
  "id" | "rawInput" | "summary"
>;

function createWorkspaceState(config: {
  id: string;
  title: string;
  summary: string;
  entries: PresetEntry[];
  nodes: PresetNode[];
  edges: WorkspaceState["edges"];
  selectedNodeId: string | null;
}): WorkspaceState {
  const now = new Date().toISOString();
  return {
    id: config.id,
    title: config.title,
    createdAt: now,
    updatedAt: now,
    summary: config.summary,
    nodes: config.nodes.map((node) => ({
      ...node,
      createdAt: now,
      updatedAt: now
    })),
    edges: config.edges,
    entries: config.entries.map((entry) => ({
      ...entry,
      inputType: "demo",
      createdAt: now,
      aiStatus: "ready"
    })),
    viewport: {
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedNodeId: config.selectedNodeId,
      activeFilters: []
    }
  };
}

export const WORKSPACE_PRESETS: WorkspaceState[] = [
  createWorkspaceState({
    id: "synaptic-starter",
    title: "Synaptic Starter Map",
    summary:
      "A living workspace that links product thinking, systems design, research synthesis, and execution.",
    selectedNodeId: "ai-workspace",
    entries: [
      {
        id: "entry-demo-1",
        rawInput:
          "Synaptic is an AI thinking workspace that turns ideas into a persistent knowledge graph with living visual structure.",
        summary:
          "The workspace ties persistent memory, knowledge structure, and visual exploration together."
      }
    ],
    nodes: [
      {
        id: "ai-workspace",
        label: "AI Workspace",
        normalizedLabel: "aiworkspace",
        category: "technology",
        importance: 3,
        summary: "An environment where human thinking is extended by structured AI assistance.",
        sourceEntryIds: ["entry-demo-1"],
        x: 0,
        y: 0
      },
      {
        id: "knowledge-graph",
        label: "Knowledge Graph",
        normalizedLabel: "knowledgegraph",
        category: "systems",
        importance: 2,
        summary: "A graph model that captures concepts and the relationships between them.",
        sourceEntryIds: ["entry-demo-1"],
        x: 120,
        y: 50
      },
      {
        id: "product-memory",
        label: "Product Memory",
        normalizedLabel: "productmemory",
        category: "product",
        importance: 2,
        summary: "Persistent workspace memory that compounds value across sessions.",
        sourceEntryIds: ["entry-demo-1"],
        x: -100,
        y: 80
      },
      {
        id: "visual-intelligence",
        label: "Visual Intelligence",
        normalizedLabel: "visualintelligence",
        category: "design",
        importance: 2,
        summary: "A visual interface that reveals structure, density, and meaning at a glance.",
        sourceEntryIds: ["entry-demo-1"],
        x: -120,
        y: -90
      },
      {
        id: "concept-merge",
        label: "Concept Merge",
        normalizedLabel: "conceptmerge",
        category: "systems",
        importance: 1,
        summary: "The logic that safely folds new AI output into existing graph state.",
        sourceEntryIds: ["entry-demo-1"],
        x: 90,
        y: -80
      }
    ],
    edges: [
      {
        id: "ai-workspace__knowledge-graph",
        sourceNodeId: "ai-workspace",
        targetNodeId: "knowledge-graph",
        strength: 0.92,
        relationType: "structures"
      },
      {
        id: "ai-workspace__product-memory",
        sourceNodeId: "ai-workspace",
        targetNodeId: "product-memory",
        strength: 0.88,
        relationType: "retains"
      },
      {
        id: "ai-workspace__visual-intelligence",
        sourceNodeId: "ai-workspace",
        targetNodeId: "visual-intelligence",
        strength: 0.8,
        relationType: "expresses"
      },
      {
        id: "knowledge-graph__concept-merge",
        sourceNodeId: "knowledge-graph",
        targetNodeId: "concept-merge",
        strength: 0.74,
        relationType: "evolves"
      }
    ]
  }),
  createWorkspaceState({
    id: "systems-portfolio",
    title: "Systems Portfolio Graph",
    summary:
      "A workspace for mapping how product architecture, frontend systems, and delivery choices reinforce one another.",
    selectedNodeId: "frontend-systems",
    entries: [
      {
        id: "entry-demo-2",
        rawInput:
          "Strong product engineers connect architecture, interaction design, resilience, and execution quality rather than treating them as separate disciplines.",
        summary:
          "The strongest portfolio work demonstrates how architecture, product sense, and frontend quality reinforce each other."
      }
    ],
    nodes: [
      {
        id: "frontend-systems",
        label: "Frontend Systems",
        normalizedLabel: "frontendsystems",
        category: "technology",
        importance: 3,
        summary: "Scalable UI architecture that keeps complex interactive products maintainable.",
        sourceEntryIds: ["entry-demo-2"],
        x: 0,
        y: 0
      },
      {
        id: "interaction-design",
        label: "Interaction Design",
        normalizedLabel: "interactiondesign",
        category: "design",
        importance: 2,
        summary: "The layer where state, motion, and usability become legible to the user.",
        sourceEntryIds: ["entry-demo-2"],
        x: 115,
        y: -40
      },
      {
        id: "state-integrity",
        label: "State Integrity",
        normalizedLabel: "stateintegrity",
        category: "systems",
        importance: 2,
        summary: "Reliable state flow prevents visual complexity from degrading into product instability.",
        sourceEntryIds: ["entry-demo-2"],
        x: -120,
        y: 30
      },
      {
        id: "delivery-quality",
        label: "Delivery Quality",
        normalizedLabel: "deliveryquality",
        category: "strategy",
        importance: 2,
        summary: "A product only feels strong when implementation rigor matches its ambition.",
        sourceEntryIds: ["entry-demo-2"],
        x: 40,
        y: 110
      },
      {
        id: "product-judgment",
        label: "Product Judgment",
        normalizedLabel: "productjudgment",
        category: "product",
        importance: 1,
        summary: "Choosing what to build and cut is as important as shipping the code.",
        sourceEntryIds: ["entry-demo-2"],
        x: -80,
        y: -100
      }
    ],
    edges: [
      {
        id: "frontend-systems__interaction-design",
        sourceNodeId: "frontend-systems",
        targetNodeId: "interaction-design",
        strength: 0.9,
        relationType: "enables"
      },
      {
        id: "frontend-systems__state-integrity",
        sourceNodeId: "frontend-systems",
        targetNodeId: "state-integrity",
        strength: 0.92,
        relationType: "depends-on"
      },
      {
        id: "frontend-systems__delivery-quality",
        sourceNodeId: "frontend-systems",
        targetNodeId: "delivery-quality",
        strength: 0.78,
        relationType: "demands"
      },
      {
        id: "interaction-design__product-judgment",
        sourceNodeId: "interaction-design",
        targetNodeId: "product-judgment",
        strength: 0.68,
        relationType: "reveals"
      }
    ]
  }),
  createWorkspaceState({
    id: "research-synthesis",
    title: "Research Synthesis Map",
    summary:
      "A concept graph showing how inputs, evidence, and interpretation become a reusable knowledge asset.",
    selectedNodeId: "synthesis-loop",
    entries: [
      {
        id: "entry-demo-3",
        rawInput:
          "A strong knowledge workspace transforms fragments of research into connected understanding that can be revisited, challenged, and extended.",
        summary:
          "Research value compounds when evidence, interpretation, and memory remain connected instead of disappearing into isolated notes."
      }
    ],
    nodes: [
      {
        id: "synthesis-loop",
        label: "Synthesis Loop",
        normalizedLabel: "synthesisloop",
        category: "research",
        importance: 3,
        summary: "A repeatable flow that turns raw input into connected, reusable understanding.",
        sourceEntryIds: ["entry-demo-3"],
        x: 0,
        y: 0
      },
      {
        id: "evidence-trail",
        label: "Evidence Trail",
        normalizedLabel: "evidencetrail",
        category: "research",
        importance: 2,
        summary: "Source-linked traces that keep the graph accountable to what was actually observed.",
        sourceEntryIds: ["entry-demo-3"],
        x: 100,
        y: 40
      },
      {
        id: "concept-memory",
        label: "Concept Memory",
        normalizedLabel: "conceptmemory",
        category: "systems",
        importance: 2,
        summary: "Persistent storage that lets ideas become long-term assets instead of disposable outputs.",
        sourceEntryIds: ["entry-demo-3"],
        x: -120,
        y: 60
      },
      {
        id: "interpretation-layer",
        label: "Interpretation Layer",
        normalizedLabel: "interpretationlayer",
        category: "product",
        importance: 2,
        summary: "The user-facing layer where raw evidence becomes usable meaning.",
        sourceEntryIds: ["entry-demo-3"],
        x: -80,
        y: -90
      },
      {
        id: "query-surface",
        label: "Query Surface",
        normalizedLabel: "querysurface",
        category: "technology",
        importance: 1,
        summary: "Search, filters, and focus modes that help users inspect dense idea networks.",
        sourceEntryIds: ["entry-demo-3"],
        x: 90,
        y: -70
      }
    ],
    edges: [
      {
        id: "synthesis-loop__evidence-trail",
        sourceNodeId: "synthesis-loop",
        targetNodeId: "evidence-trail",
        strength: 0.86,
        relationType: "grounds"
      },
      {
        id: "synthesis-loop__concept-memory",
        sourceNodeId: "synthesis-loop",
        targetNodeId: "concept-memory",
        strength: 0.9,
        relationType: "persists"
      },
      {
        id: "synthesis-loop__interpretation-layer",
        sourceNodeId: "synthesis-loop",
        targetNodeId: "interpretation-layer",
        strength: 0.82,
        relationType: "surfaces"
      },
      {
        id: "interpretation-layer__query-surface",
        sourceNodeId: "interpretation-layer",
        targetNodeId: "query-surface",
        strength: 0.63,
        relationType: "uses"
      }
    ]
  })
];

export const DEMO_WORKSPACE = WORKSPACE_PRESETS[0];
