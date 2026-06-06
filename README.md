# Synaptic

Synaptic is an AI-powered thinking workspace that turns raw notes and ideas into a living knowledge graph.

Instead of giving you a one-time answer and moving on, Synaptic helps you build a space where concepts stay connected, workspaces remain persistent, and your thinking gets easier to revisit over time.

## Why Synaptic

Most tools are good at one of these:
- note capture
- AI answers
- visual mapping

Synaptic combines them into one workflow:
- write or paste a thought
- let the system extract concepts and relationships
- grow that into a graph you can explore later
- keep separate workspaces for different topics

## What You Can Do

- create multiple workspaces
- capture thoughts, notes, or research snippets
- expand them into a concept graph
- search and filter ideas
- switch between workspaces
- import and export workspace data
- sign in with a local account and keep your workspaces tied to your session

## How To Use It

1. Create an account or continue as a local guest.
2. Open or create a workspace.
3. Paste a note, paragraph, or idea.
4. Select `Expand Graph`.
5. Explore the generated concept map.
6. Keep adding ideas to build a deeper workspace over time.

For a more detailed walkthrough, read [USER_GUIDE.md](/home/kisuke/Codebase/Synaptic/USER_GUIDE.md:1).

## Project Highlights

- premium launch-style frontend
- persistent SQLite-backed workspaces
- multi-workspace support
- local auth and session handling
- event-aware backend foundation
- AI concept extraction with graceful fallback behavior

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Synaptic uses SQLite for local persistence.
- Authentication is local and session-based in the current version.
- The product is still evolving, but the current build is already usable as a serious idea workspace.
