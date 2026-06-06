# Synaptic Product Plan

## Vision

Synaptic is a canvas-first AI thinking workspace that turns raw ideas into a persistent, explorable knowledge graph. It should feel like a serious product, not a hackathon demo: visually distinctive, technically rigorous, and useful enough that someone would want to keep using it after the first session.

The portfolio goal is clear:
- show strong product sense
- show unusual frontend execution
- show real systems thinking
- show disciplined AI integration

## Product Positioning

Synaptic should sit at the intersection of:
- interactive websites
- productivity applications
- creative frontend experiments
- real-time web applications
- AI-powered web utilities

It should not try to be five separate products. The core product is one thing: an intelligent workspace for thought.

## Core User Promise

A user can:
- drop in a thought, paragraph, or source
- get structured concepts and relationships back
- grow a visual graph over time
- revisit, refine, search, and focus their ideas later

The graph is not a decorative visualization. It is the primary workspace.

## v1 Outcome

Version one must feel production-grade and portfolio-ready:
- a persistent single-user workspace
- polished desktop-first experience
- stable graph interactions
- AI-assisted concept extraction and merge
- useful node details and workspace history
- onboarding and showcase data that make the product instantly legible

## Non-Goals for v1

These are explicitly out of scope unless the core product is already stable:
- multiplayer collaboration
- full mobile editing parity
- agent-style autonomous workflows
- heavy RAG/vector infrastructure
- complex permission and sharing systems

## Experience Design

### Main surfaces

The app has three coordinated surfaces:

1. Canvas
- live graph workspace
- zoom, pan, drag, focus, selection
- graph motion that feels alive without becoming chaotic

2. Composer
- freeform input area for thoughts and source text
- clear submit and loading states
- history of recent additions

3. Context Panel
- selected node details
- related concepts
- source entries touching that node
- summary and metadata

### UX principles

- the graph must look intentional from the first screen
- utility beats spectacle when they conflict
- motion should clarify state, not distract from it
- AI failures must degrade gracefully
- the user should understand the product in under 30 seconds

## Technical Direction

### Recommended stack

- Next.js
- React
- TypeScript
- Tailwind or a small token-driven CSS system
- D3 for simulation and graph mechanics
- server routes for AI orchestration
- durable storage for workspaces and graph state

### Architectural rule

Graph state must not live inside the renderer as the source of truth.

The source of truth should be normalized application state. The visual engine consumes that state and renders it. This prevents the common failure mode where D3 internals become impossible to persist, test, or evolve.

## Domain Model

### Workspace
- `id`
- `title`
- `theme`
- `createdAt`
- `updatedAt`

### Entry
- `id`
- `workspaceId`
- `rawInput`
- `inputType`
- `createdAt`
- `aiStatus`

### Node
- `id`
- `workspaceId`
- `label`
- `normalizedLabel`
- `category`
- `importance`
- `summary`
- `createdAt`
- `updatedAt`

### Edge
- `id`
- `workspaceId`
- `sourceNodeId`
- `targetNodeId`
- `strength`
- `relationType`

### GraphEvent
- `id`
- `workspaceId`
- `entryId`
- `type`
- `payload`
- `createdAt`

### ViewportState
- `workspaceId`
- `zoom`
- `panX`
- `panY`
- `selectedNodeId`
- `activeFilters`

## AI Contract

### AI responsibilities

AI is responsible for:
- extracting core concepts from unstructured input
- suggesting relationships between concepts
- generating a concise workspace-level summary
- helping avoid duplicate concept creation

AI is not responsible for:
- directly mutating stored data
- owning graph identity rules
- inventing arbitrary schema

### Primary endpoint

`POST /api/graph/extract`

Request:
- `workspaceId`
- `text`
- `existingContext`
- optional `sourceMetadata`

Response:
- `summary`
- `nodes`
- `edges`
- optional `warnings`

### Validation rules

- strict schema validation server-side
- bounded node count per extraction
- fixed category enum in v1
- malformed edges are rejected
- labels and ids are sanitized
- model output is merged only after validation

## Graph Rules

### Merge behavior

- dedupe by stable id and normalized label
- reject edges to missing nodes
- merge repeated concepts into existing nodes
- reinforce node importance when concepts recur
- preserve provenance from source entries

### Stability rules

- impose a hard node cap for v1 workspace rendering
- prune low-value nodes only through deterministic rules
- keep labels readable at default zoom
- avoid runaway physics settings that produce chaotic layouts

### Selection behavior

Selecting a node should show:
- label
- category
- importance
- related nodes
- linked source entries
- summary
- recent changes involving that node

## Persistence

### v1 persistence goals

- users can create and revisit workspaces
- graph state reloads accurately
- source entries remain attached to graph growth
- workspace view state can be restored well enough to feel continuous

### Storage direction

Use durable application storage for:
- workspaces
- entries
- nodes
- edges
- graph events

Use client caching only as an acceleration layer, not the canonical store.

## v1 Feature Set

### Must-have

- workspace creation and loading
- polished landing/app shell
- graph canvas with seed/demo data
- text submission flow
- AI extraction and graph merge
- persistent graph state
- node detail panel
- search and basic filters
- recent activity/history
- clear loading/error states

### Strong portfolio additions

- starter showcase workspaces
- export graph snapshot
- keyboard shortcuts
- focus mode for dense graphs
- simple source ingestion beyond plain text if feasible

## Build Phases

### Phase 1: Source of truth

- replace the old dossier mentality with this plan
- define the information architecture
- lock the domain model and API contract

### Phase 2: App shell

- build the visual foundation
- create the three main surfaces
- establish typography, color tokens, spacing, and motion rules

### Phase 3: Canvas engine

- render static graph data first
- implement zoom, pan, drag, selection, focus
- prove graph stability before AI integration

### Phase 4: Persistence layer

- add durable workspace storage
- support create, load, update, restore
- keep render state separated from stored domain state

### Phase 5: AI extraction pipeline

- build the backend extraction route
- validate model output
- merge extracted concepts into workspace state safely

### Phase 6: Productivity layer

- node details from real data
- search and filters
- activity/history
- export or snapshot support

### Phase 7: Final polish

- controlled motion and visual depth
- onboarding
- showcase workspace
- README and presentation assets

## Quality Bar

### Frontend quality

- no generic dashboard feel
- strong visual identity
- graph remains readable and responsive
- motion feels intentional

### Product quality

- the use case is understandable immediately
- the app gives real value beyond visual novelty
- the workspace feels persistent and cumulative

### Engineering quality

- typed contracts across client/server boundaries
- modular subsystem design
- testable merge logic
- validated AI outputs
- no hidden state traps

## Test Plan

### Functional tests

- workspace creation works
- text submission creates valid graph updates
- repeated inputs merge correctly
- node selection stays in sync with context panel
- search and filters narrow the graph correctly

### Persistence tests

- reload restores graph state accurately
- switching workspaces does not leak state
- history remains attached to entries and nodes

### Failure tests

- malformed AI output is rejected cleanly
- failed AI requests do not corrupt stored state
- duplicate concepts do not flood the graph
- invalid edges are ignored safely

### Interaction tests

- zoom, pan, and drag remain smooth
- default zoom preserves label readability
- focus mode behaves predictably
- keyboard flows work alongside pointer interactions

## Portfolio Readiness Criteria

Recruiters should be able to infer all of this within a short demo or repo scan:
- this is a real product, not a toy
- the frontend is unusually thoughtful
- the visual system is custom and deliberate
- the architecture can scale beyond v1
- AI is used as a product capability, not a gimmick

## Future Roadmap

### v1.5

- richer source ingestion
- better node summaries
- smarter revisit suggestions
- shareable snapshots

### v2

- multimodal input
- collaborative workspaces
- realtime sync and presence
- semantic workspace search

### v3

- cross-workspace linking
- publishable public maps
- team knowledge environments
- agent-assisted organization

## Final Standard

If this is built correctly, Synaptic should make someone say:

"This person didn’t just build a graph toy. They built a product with strong taste, strong frontend instincts, and real engineering discipline."
