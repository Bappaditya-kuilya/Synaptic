# ⬡ SYNAPTIC — MISSION DOSSIER
### *AI-Powered Living Knowledge Graph — CodeStorm 2026*

---

```
╔══════════════════════════════════════════════════════════════════╗
║  PROJECT     : SYNAPTIC                                          ║
║  STATUS      : MISSION ACTIVE                                    ║
║  STACK       : Vanilla JS · D3.js · Gemini API · Vercel         ║
║  COST        : $0.00                                             ║
║  BUILD TIME  : 12 hours (optimized sequence)                     ║
║  DEMO TIME   : 30 seconds to jaw-drop                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## TABLE OF CONTENTS

```
§0  MISSION BRIEF ................................................ 4
§1  SYSTEM ARCHITECTURE .......................................... 5
§2  TECH STACK & DEPENDENCIES .................................... 6
§3  COMPLETE FILE STRUCTURE ...................................... 7
§4  ENVIRONMENT SETUP ............................................ 8
§5  BUILD PHASES
    ├── Phase 1 : Repo + Deploy Pipeline ........................ 10
    ├── Phase 2 : Living Canvas (Particle System) ............... 12
    ├── Phase 3 : D3 Force Graph Foundation ..................... 16
    ├── Phase 4 : Gemini AI Integration ......................... 24
    ├── Phase 5 : Node Click + Insight Panel .................... 30
    ├── Phase 6 : Visual Polish & Animations .................... 36
    ├── Phase 7 : Demo Data & Pre-loads ......................... 42
    └── Phase 8 : Performance & Edge Cases ...................... 45
§6  TESTING CHECKLIST ............................................ 48
§7  DEMO SCRIPT (word-for-word) .................................. 52
§8  TROUBLESHOOTING GUIDE ........................................ 54
§9  DEPLOYMENT CHECKLIST ......................................... 57
```

---

## §0 — MISSION BRIEF

### What Are We Building?

**Synaptic** is a browser-based AI knowledge graph that turns raw thoughts into a living, breathing neural universe.

The user types anything — a sentence, an article, a shower thought. Gemini AI extracts the core concepts in under 2 seconds. A D3.js physics simulation places them as glowing nodes on a dark canvas. Edges form between related ideas, shimmer like synapses, and pulse with a slow, organic rhythm. Click any node: an AI-powered insight card slides in explaining why that concept matters in the context of everything else the user has added.

The canvas never stops moving. It feels alive because it **is** alive.

### Why This Wins CodeStorm 2026

The theme is **"Websites That Feel Alive."** Every other submission uses a website as a container for a tool. Synaptic IS the theme — the canvas breathes, the nodes pulse, the connections shimmer. A judge types one sentence and watches a universe form in real time. That is your 30-second window. You don't need to explain anything.

### Success Criteria

| Criterion | Target |
|-----------|--------|
| First node appears | < 2.5 seconds after input |
| Graph looks beautiful | From the very first node |
| AI response time | < 2 seconds (Gemini Flash) |
| Demo works offline | Yes (pre-loaded fallback data) |
| Mobile responsive | Basic (judges use laptops) |
| Zero build errors | Mandatory |
| API key exposed | Never |

---

## §1 — SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Canvas     │    │  SVG / D3    │    │   HTML UI    │  │
│  │  (particles) │    │  (graph)     │    │  (panels)    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                  │                   │            │
│         └──────────────────┴───────────────────┘           │
│                            │                               │
│                       app.js (orchestrator)                │
│                       ai.js  (API calls)                   │
│                       graph.js (D3 logic)                  │
│                       ui.js   (panels/cards)               │
│                       data.js (storage/demo)               │
└─────────────────────────┬───────────────────────────────────┘
                          │ fetch('/api/ask')
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL EDGE FUNCTION                      │
│                      api/ask.js                             │
│         (holds GEMINI_API_KEY — never exposed)              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI 1.5 FLASH API                    │
│           (Free: 15 RPM · 1M tokens/day)                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User types text
      │
      ▼
ai.js → POST /api/ask  { text, existingNodeLabels }
      │
      ▼
Edge Function → Gemini API (with engineered prompt)
      │
      ▼
Gemini returns JSON  { nodes[], edges[], summary }
      │
      ▼
graph.js → deduplicates nodes → merges into simulation
      │
      ▼
D3 force simulation → alpha(0.3).restart()
      │
      ▼
SVG re-renders → new nodes burst in with animation
      │
      ▼
Canvas particles continue independently on RAF loop
```

---

## §2 — TECH STACK & DEPENDENCIES

### Zero Install Stack (CDN only)

```html
<!-- D3.js v7 — Force simulation, SVG rendering, drag, zoom -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
```

That's the only external dependency. Everything else is browser-native.

| Layer | Technology | Why |
|-------|-----------|-----|
| Graph physics | D3.js v7 | Industry standard force simulation |
| AI | Gemini 1.5 Flash | Free tier, fast JSON mode, 1M tokens/day |
| Particles | Canvas API | Zero deps, buttery 60fps |
| Proxy | Vercel Edge Function | Free, hides API key, global CDN |
| Hosting | Vercel (hobby) | Free, auto-deploy from GitHub, HTTPS |
| Storage | localStorage | Zero server cost, survives refresh |
| Fonts | Google Fonts (Space Mono + Inter) | Free, loaded via CSS |

### Gemini API Free Tier Limits

```
Model          : gemini-1.5-flash
Requests/min   : 15
Tokens/day     : 1,000,000
Tokens/request : ~500 input + ~200 output = 700 per call
Daily capacity : ~1,428 requests/day → MORE than enough
Cost           : $0.00
```

---

## §3 — COMPLETE FILE STRUCTURE

```
synaptic/
│
├── api/
│   └── ask.js                ← Vercel Edge Function (Gemini proxy)
│
├── public/
│   ├── index.html            ← App shell + layout
│   ├── style.css             ← All styles (dark theme, animations)
│   ├── app.js                ← Orchestrator (init, event listeners)
│   ├── graph.js              ← D3 force simulation + SVG rendering
│   ├── particles.js          ← Canvas particle background
│   ├── ai.js                 ← Gemini API calls + response parsing
│   ├── ui.js                 ← Insight panel, toast, input handling
│   └── data.js               ← localStorage + demo presets
│
├── .env                      ← GEMINI_API_KEY (local dev only)
├── .gitignore                ← node_modules, .env
├── vercel.json               ← Edge function config
└── README.md                 ← Project description for judges
```

---

## §4 — ENVIRONMENT SETUP

### Step 1 — Get Your Free Gemini API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with Google
3. Click **"Create API key"**
4. Copy the key — it looks like: `AIzaSy...`
5. Keep this tab open

### Step 2 — Create GitHub Repository

```bash
# In your terminal:
mkdir synaptic
cd synaptic
git init
git branch -M main
```

### Step 3 — Create .gitignore First (CRITICAL)

```bash
# .gitignore
cat > .gitignore << 'EOF'
.env
node_modules/
.vercel/
*.log
.DS_Store
EOF
```

> **WARNING**: If you commit `.env` to GitHub, your API key is public. The `.gitignore` above prevents this.

### Step 4 — Create Local .env

```bash
# .env  (local only — never committed)
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
```

### Step 5 — Install Vercel CLI

```bash
npm install -g vercel
vercel login   # follow browser auth
```

### Step 6 — Add Key to Vercel (production)

```bash
vercel env add GEMINI_API_KEY
# Paste your key when prompted
# Select: Production, Preview, Development
```

### Step 7 — Create vercel.json

```json
{
  "functions": {
    "api/*.js": {
      "runtime": "edge"
    }
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/public/$1" }
  ]
}
```

---

## §5 — BUILD PHASES

---

## PHASE 1 — Repository & Deploy Pipeline
### ⏱ Time: 30 minutes | Goal: "Hello World" live on Vercel

### 1.1 — Create the Skeleton

**`public/index.html`** — Complete file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Synaptic — Your Ideas, Alive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- Particle background layer -->
  <canvas id="particle-canvas"></canvas>

  <!-- D3 graph layer -->
  <svg id="graph-svg">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-strong">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g id="edges-group"></g>
    <g id="nodes-group"></g>
  </svg>

  <!-- UI Layer -->
  <div id="ui-layer">

    <!-- Top bar -->
    <header id="topbar">
      <div id="logo">⬡ SYNAPTIC</div>
      <div id="node-count">0 concepts</div>
      <div id="header-actions">
        <button id="btn-clear" title="Clear graph">Clear</button>
        <button id="btn-demo" title="Load demo">Demo</button>
      </div>
    </header>

    <!-- Empty state -->
    <div id="empty-state">
      <h1>What's on your mind?</h1>
      <p>Type a thought, paste an article, drop an idea.<br />Watch your knowledge come alive.</p>
    </div>

    <!-- Input bar -->
    <div id="input-bar">
      <textarea
        id="thought-input"
        placeholder="Type anything... a concept, a paragraph, a question"
        rows="1"
      ></textarea>
      <button id="btn-submit" aria-label="Submit">
        <span id="btn-submit-icon">→</span>
        <span id="btn-submit-loading" style="display:none">⟳</span>
      </button>
    </div>

    <!-- Toast notification -->
    <div id="toast" aria-live="polite"></div>

    <!-- Insight panel (slides in on node click) -->
    <aside id="insight-panel" class="panel-hidden">
      <button id="insight-close" aria-label="Close">×</button>
      <div id="insight-node-label"></div>
      <div id="insight-connections"></div>
      <div id="insight-summary"></div>
      <div id="insight-ai-text"></div>
    </aside>

  </div>

  <!-- Scripts — order matters -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <script src="data.js"></script>
  <script src="particles.js"></script>
  <script src="graph.js"></script>
  <script src="ai.js"></script>
  <script src="ui.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### 1.2 — First Deploy Test

```bash
git add .
git commit -m "feat: project skeleton"
vercel --prod
# Vercel gives you a URL like: https://synaptic-xyz.vercel.app
# Open it — you should see a blank dark page with no errors
```

**Checkpoint**: Open browser console. Zero errors = Phase 1 complete. ✓

---

## PHASE 2 — The Living Canvas
### ⏱ Time: 1.5 hours | Goal: Beautiful particle background that breathes

### 2.1 — Full CSS (Style Everything Now)

**`public/style.css`** — Complete file:

```css
/* ═══════════════════════════════
   RESET & BASE
═══════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #080810;
  --bg-panel:    #0f0f1a;
  --bg-input:    #13131f;
  --border:      rgba(255,255,255,0.08);
  --border-glow: rgba(127,119,221,0.4);
  --text-primary:   #e8e6f0;
  --text-secondary: #7a7890;
  --text-muted:     #3d3c52;
  --accent:         #7F77DD;
  --accent-teal:    #1D9E75;
  --accent-amber:   #EF9F27;
  --accent-coral:   #D85A30;
  --accent-pink:    #D4537E;
  --accent-blue:    #378ADD;
  --font-display: 'Space Mono', monospace;
  --font-body:    'Inter', sans-serif;
  --panel-w: 320px;
  --input-h: 72px;
  --radius:  12px;
  --trans:   0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* ═══════════════════════════════
   LAYER STACK
═══════════════════════════════ */
#particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

#graph-svg {
  position: fixed;
  inset: 0;
  z-index: 1;
  width: 100%; height: 100%;
  overflow: visible;
}

#ui-layer {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none; /* children opt-in */
}

/* ═══════════════════════════════
   TOPBAR
═══════════════════════════════ */
#topbar {
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(8,8,16,0.7);
  backdrop-filter: blur(12px);
}

#logo {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--accent);
}

#node-count {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-display);
  letter-spacing: 0.06em;
  flex: 1;
}

#header-actions { display: flex; gap: 8px; }

#header-actions button {
  pointer-events: all;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.08em;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--trans);
}

#header-actions button:hover {
  border-color: var(--border-glow);
  color: var(--accent);
}

/* ═══════════════════════════════
   EMPTY STATE
═══════════════════════════════ */
#empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  text-align: center;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

#empty-state.hidden { opacity: 0; }

#empty-state h1 {
  font-family: var(--font-display);
  font-size: clamp(22px, 4vw, 38px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 12px;
}

#empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* ═══════════════════════════════
   INPUT BAR
═══════════════════════════════ */
#input-bar {
  pointer-events: all;
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(640px, calc(100vw - 48px));
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 12px 12px 16px;
  transition: border-color var(--trans);
}

#input-bar:focus-within {
  border-color: var(--border-glow);
  box-shadow: 0 0 0 1px rgba(127,119,221,0.15),
              0 8px 32px rgba(0,0,0,0.4);
}

#thought-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
  overflow-y: auto;
}

#thought-input::placeholder { color: var(--text-muted); }

#btn-submit {
  flex-shrink: 0;
  width: 36px; height: 36px;
  border-radius: 8px;
  background: var(--accent);
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  color: #fff;
  transition: all var(--trans);
}

#btn-submit:hover { background: #9088e8; transform: scale(1.05); }
#btn-submit:active { transform: scale(0.95); }
#btn-submit:disabled { background: var(--text-muted); cursor: not-allowed; transform: none; }

#btn-submit-loading {
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ═══════════════════════════════
   INSIGHT PANEL
═══════════════════════════════ */
#insight-panel {
  pointer-events: all;
  position: absolute;
  top: 60px;
  right: 0;
  width: var(--panel-w);
  height: calc(100vh - 60px);
  background: var(--bg-panel);
  border-left: 1px solid var(--border);
  padding: 24px 20px;
  overflow-y: auto;
  transform: translateX(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

#insight-panel.panel-hidden {
  transform: translateX(100%);
  pointer-events: none;
}

#insight-close {
  position: absolute;
  top: 16px; right: 16px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 28px; height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--trans);
}

#insight-close:hover { border-color: var(--border-glow); color: var(--accent); }

#insight-node-label {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-right: 36px;
  word-break: break-word;
}

#insight-connections {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-display);
  letter-spacing: 0.06em;
  margin-bottom: 20px;
}

#insight-summary {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding: 12px;
  background: rgba(127,119,221,0.06);
  border: 1px solid rgba(127,119,221,0.15);
  border-radius: 8px;
  margin-bottom: 16px;
}

#insight-ai-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

#insight-ai-text.loading::after {
  content: ' ▋';
  animation: blink 1s infinite;
}

@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ═══════════════════════════════
   TOAST
═══════════════════════════════ */
#toast {
  pointer-events: none;
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: var(--bg-panel);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font-display);
  padding: 8px 16px;
  border-radius: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  white-space: nowrap;
  letter-spacing: 0.04em;
}

#toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ═══════════════════════════════
   D3 GRAPH ELEMENTS
═══════════════════════════════ */
.edge {
  stroke-dasharray: 6 4;
  stroke-opacity: 0.45;
  fill: none;
  stroke-linecap: round;
  animation: edgeDash 3s linear infinite;
}

@keyframes edgeDash { to { stroke-dashoffset: -20; } }

.node-group { cursor: pointer; }

.node-circle {
  stroke-width: 1.5;
  fill-opacity: 0.15;
  transition: fill-opacity 0.3s, r 0.3s;
}

.node-circle:hover { fill-opacity: 0.3; }

.node-pulse {
  fill-opacity: 0;
  stroke-width: 1;
  animation: nodePulse 3s ease-out infinite;
}

@keyframes nodePulse {
  0%   { r: var(--base-r); stroke-opacity: 0.5; }
  100% { r: calc(var(--base-r) + 18px); stroke-opacity: 0; }
}

.node-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  fill: var(--text-primary, #e8e6f0);
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
  letter-spacing: 0.02em;
}

.node-group.selected .node-circle { fill-opacity: 0.4; }

/* ═══════════════════════════════
   NODE BIRTH ANIMATION
═══════════════════════════════ */
@keyframes nodeBirth {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.node-group.new-node { animation: nodeBirth 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }

/* ═══════════════════════════════
   SCROLLBAR
═══════════════════════════════ */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
```

### 2.2 — Particle System

**`public/particles.js`** — Complete file:

```javascript
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animFrame = null;

    this.COLORS = ['#7F77DD', '#1D9E75', '#EF9F27', '#D4537E', '#378ADD', '#D85A30'];
    this.COUNT = 90;

    this.resize();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.COUNT; i++) {
      this.particles.push(this.makeParticle());
    }
  }

  makeParticle(atEdge = false) {
    const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    return {
      x:       atEdge ? (Math.random() < 0.5 ? 0 : this.canvas.width)
                      : Math.random() * this.canvas.width,
      y:       atEdge ? (Math.random() < 0.5 ? 0 : this.canvas.height)
                      : Math.random() * this.canvas.height,
      vx:      (Math.random() - 0.5) * 0.35,
      vy:      (Math.random() - 0.5) * 0.35,
      r:       Math.random() * 1.6 + 0.4,
      color,
      opacity: Math.random() * 0.35 + 0.05,
      life:    Math.random(),  // 0-1, for gentle pulsing
      lifeDelta: (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1)
    };
  }

  drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx   = this.particles[i].x - this.particles[j].x;
        const dy   = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.07;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(127,119,221,${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawConnections();

    this.particles.forEach(p => {
      // Life cycle pulsing
      p.life += p.lifeDelta;
      if (p.life > 1 || p.life < 0) p.lifeDelta *= -1;

      // Movement
      p.x += p.vx;
      p.y += p.vy;

      // Boundary bounce
      if (p.x < 0 || p.x > this.canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height)  p.vy *= -1;

      // Draw
      const currentOpacity = p.opacity * (0.7 + 0.3 * p.life);
      const hex = Math.floor(currentOpacity * 255).toString(16).padStart(2, '0');
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + hex;
      this.ctx.fill();
    });

    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animFrame);
  }
}
```

**Checkpoint**: Run `vercel dev` locally. You should see a dark canvas with floating, connecting particles. Looks like space. ✓

---

## PHASE 3 — D3 Force Graph Foundation
### ⏱ Time: 3 hours | Goal: Beautiful physics graph with hardcoded data

This is the hardest phase. Read every comment.

### 3.1 — Color System for Nodes

Node colors are assigned by category, returned by the AI. Map them here:

```javascript
// At top of graph.js
const CATEGORY_COLORS = {
  science:     '#7F77DD',  // purple
  tech:        '#378ADD',  // blue
  art:         '#D4537E',  // pink
  philosophy:  '#1D9E75',  // teal
  history:     '#EF9F27',  // amber
  nature:      '#1D9E75',  // teal
  other:       '#888780',  // gray
};

function nodeColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}
```

### 3.2 — Complete Graph Module

**`public/graph.js`** — Complete file:

```javascript
const Graph = (() => {
  // ─── STATE ───────────────────────────────────────────────────
  let nodes      = [];   // { id, label, size, category, x, y, ... }
  let edges      = [];   // { id, source, target, strength }
  let simulation = null;
  let svg        = null;
  let nodesGroup = null;
  let edgesGroup = null;
  let width      = window.innerWidth;
  let height     = window.innerHeight;
  let onNodeClick = null; // callback

  const NODE_SIZES   = { 1: 14, 2: 20, 3: 28 };  // radius by importance
  const MAX_NODES    = 28;   // cap for performance

  const CATEGORY_COLORS = {
    science:    '#7F77DD',
    tech:       '#378ADD',
    art:        '#D4537E',
    philosophy: '#1D9E75',
    history:    '#EF9F27',
    nature:     '#5DCAA5',
    other:      '#888780',
  };

  function nodeColor(cat) { return CATEGORY_COLORS[cat] || CATEGORY_COLORS.other; }

  // ─── INIT ─────────────────────────────────────────────────────
  function init(clickCallback) {
    onNodeClick = clickCallback;

    svg        = d3.select('#graph-svg');
    nodesGroup = svg.select('#nodes-group');
    edgesGroup = svg.select('#edges-group');

    // Responsive resize
    window.addEventListener('resize', () => {
      width  = window.innerWidth;
      height = window.innerHeight;
      if (simulation) {
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.1).restart();
      }
    });

    // Zoom & pan on the graph (not the UI layer)
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        nodesGroup.attr('transform', event.transform);
        edgesGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Build simulation
    simulation = d3.forceSimulation([])
      .force('link',    d3.forceLink([]).id(d => d.id).distance(d => 100 + (3 - (d.strength || 1)) * 40))
      .force('charge',  d3.forceManyBody().strength(-280).distanceMax(400))
      .force('center',  d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (NODE_SIZES[d.size] || 18) + 20))
      .force('x',       d3.forceX(width  / 2).strength(0.04))
      .force('y',       d3.forceY(height / 2).strength(0.04))
      .alphaDecay(0.035)
      .on('tick', ticked);
  }

  // ─── TICK (called every animation frame by D3) ────────────────
  function ticked() {
    // Update edge positions
    edgesGroup.selectAll('.edge')
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    // Update node positions
    nodesGroup.selectAll('.node-group')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

  // ─── ADD NODES & EDGES ────────────────────────────────────────
  function addData(newNodes, newEdges) {
    let changed = false;

    // Check node cap — remove least-connected if needed
    if (nodes.length + newNodes.length > MAX_NODES) {
      pruneNodes(newNodes.length);
    }

    // Merge nodes (deduplicate by id and by similar label)
    newNodes.forEach(n => {
      const isDuplicate = nodes.some(existing =>
        existing.id === n.id ||
        normalize(existing.label) === normalize(n.label)
      );
      if (!isDuplicate) {
        // Spawn near center with small random offset
        nodes.push({
          ...n,
          x: width  / 2 + (Math.random() - 0.5) * 120,
          y: height / 2 + (Math.random() - 0.5) * 120,
          isNew: true
        });
        changed = true;
      }
    });

    // Merge edges (deduplicate)
    newEdges.forEach(e => {
      const srcId = typeof e.source === 'object' ? e.source.id : e.source;
      const tgtId = typeof e.target === 'object' ? e.target.id : e.target;
      const exists = edges.some(ex => {
        const exSrc = typeof ex.source === 'object' ? ex.source.id : ex.source;
        const exTgt = typeof ex.target === 'object' ? ex.target.id : ex.target;
        return (exSrc === srcId && exTgt === tgtId) || (exSrc === tgtId && exTgt === srcId);
      });
      // Only add edge if both nodes exist
      const srcExists = nodes.some(n => n.id === srcId);
      const tgtExists = nodes.some(n => n.id === tgtId);
      if (!exists && srcExists && tgtExists) {
        edges.push({ ...e, id: `${srcId}--${tgtId}` });
        changed = true;
      }
    });

    if (!changed) return;

    renderEdges();
    renderNodes();

    // ⚠️ KEY PATTERN: update simulation without full restart
    simulation.nodes(nodes);
    simulation.force('link').links(edges);
    simulation.alpha(0.35).restart();

    // Clear "isNew" flag after animation
    setTimeout(() => {
      nodes.forEach(n => { n.isNew = false; });
    }, 600);
  }

  // ─── RENDER EDGES ─────────────────────────────────────────────
  function renderEdges() {
    const sel = edgesGroup.selectAll('.edge').data(edges, d => d.id);

    sel.enter()
      .append('line')
      .attr('class', 'edge')
      .attr('stroke', d => {
        const srcNode = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        return srcNode ? nodeColor(srcNode.category) : '#7F77DD';
      })
      .attr('stroke-width', d => 0.5 + (d.strength || 0.5))
      .style('animation-delay', () => `${Math.random() * 3}s`);

    sel.exit().remove();
  }

  // ─── RENDER NODES ─────────────────────────────────────────────
  function renderNodes() {
    const sel = nodesGroup.selectAll('.node-group').data(nodes, d => d.id);

    // EXIT
    sel.exit()
      .transition().duration(300)
      .attr('transform', d => `translate(${d.x},${d.y}) scale(0)`)
      .remove();

    // ENTER
    const enter = sel.enter()
      .append('g')
      .attr('class', d => `node-group${d.isNew ? ' new-node' : ''}`)
      .attr('transform', d => `translate(${d.x || width/2},${d.y || height/2})`)
      .style('transform-origin', 'center')
      .style('transform-box', 'fill-box');

    // Pulse ring (animated halo)
    enter.append('circle')
      .attr('class', 'node-pulse')
      .attr('r', d => NODE_SIZES[d.size] || 18)
      .attr('fill', 'none')
      .attr('stroke', d => nodeColor(d.category))
      .style('--base-r', d => `${NODE_SIZES[d.size] || 18}px`)
      .style('animation-delay', () => `${Math.random() * 3}s`);

    // Main circle
    enter.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => NODE_SIZES[d.size] || 18)
      .attr('fill', d => nodeColor(d.category))
      .attr('stroke', d => nodeColor(d.category))
      .attr('filter', d => d.size === 3 ? 'url(#glow-strong)' : 'url(#glow)');

    // Label
    enter.append('text')
      .attr('class', 'node-label')
      .attr('y', d => (NODE_SIZES[d.size] || 18) + 12)
      .text(d => d.label);

    // Interactions
    enter
      .call(d3.drag()
        .on('start', dragStart)
        .on('drag',  dragging)
        .on('end',   dragEnd)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        nodesGroup.selectAll('.node-group').classed('selected', false);
        d3.select(event.currentTarget).classed('selected', true);
        if (onNodeClick) onNodeClick(d, getConnections(d));
      });

    // Click on SVG background → deselect
    svg.on('click', () => {
      nodesGroup.selectAll('.node-group').classed('selected', false);
    });
  }

  // ─── DRAG HANDLERS ───────────────────────────────────────────
  function dragStart(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function dragging(event, d) {
    d.fx = event.x; d.fy = event.y;
  }
  function dragEnd(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
  }

  // ─── HELPERS ─────────────────────────────────────────────────
  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function getConnections(node) {
    const connected = [];
    edges.forEach(e => {
      const srcId = typeof e.source === 'object' ? e.source.id : e.source;
      const tgtId = typeof e.target === 'object' ? e.target.id : e.target;
      if (srcId === node.id) {
        const tgt = nodes.find(n => n.id === tgtId);
        if (tgt) connected.push(tgt);
      }
      if (tgtId === node.id) {
        const src = nodes.find(n => n.id === srcId);
        if (src) connected.push(src);
      }
    });
    return connected;
  }

  function pruneNodes(needed) {
    // Count connections per node
    const connectivity = {};
    nodes.forEach(n => { connectivity[n.id] = 0; });
    edges.forEach(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      connectivity[s] = (connectivity[s] || 0) + 1;
      connectivity[t] = (connectivity[t] || 0) + 1;
    });
    // Sort by connectivity (ascending = least connected first)
    nodes.sort((a, b) => (connectivity[a.id] || 0) - (connectivity[b.id] || 0));
    const removeCount = nodes.length + needed - MAX_NODES;
    const removed = nodes.splice(0, removeCount).map(n => n.id);
    // Remove dangling edges
    edges = edges.filter(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      return !removed.includes(s) && !removed.includes(t);
    });
  }

  function clear() {
    nodes = []; edges = [];
    nodesGroup.selectAll('*').remove();
    edgesGroup.selectAll('*').remove();
    simulation.nodes([]);
    simulation.force('link').links([]);
    simulation.alpha(0.01).restart();
  }

  function getNodeLabels() {
    return nodes.map(n => n.label);
  }

  function getNodeCount() { return nodes.length; }

  // ─── PUBLIC API ───────────────────────────────────────────────
  return { init, addData, clear, getNodeLabels, getNodeCount };
})();
```

**Checkpoint**: Load a hardcoded sample in console:
```javascript
Graph.addData(
  [
    { id: 'ai', label: 'Artificial Intelligence', size: 3, category: 'tech' },
    { id: 'ml', label: 'Machine Learning', size: 2, category: 'tech' },
    { id: 'nn', label: 'Neural Networks', size: 2, category: 'science' },
  ],
  [
    { source: 'ai', target: 'ml', strength: 0.9 },
    { source: 'ml', target: 'nn', strength: 0.7 },
  ]
);
```
You should see 3 glowing, pulsing nodes connected by animated edges. ✓

---

## PHASE 4 — Gemini AI Integration
### ⏱ Time: 1.5 hours | Goal: Real concepts extracted from real text

### 4.1 — Vercel Edge Function (API Key Guard)

**`api/ask.js`** — Complete file:

```javascript
export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are a knowledge graph builder. Your job is to extract key concepts from text and return a precise JSON object.

STRICT RULES:
1. Extract exactly 4-6 DISTINCT concepts. Not more, not less.
2. Each concept label: 1-3 words, title case, meaningful.
3. Node size: 3 = the core idea, 2 = important supporting concept, 1 = peripheral detail.
4. Create edges ONLY where a clear conceptual relationship exists.
5. Edge strength: 1.0 = very strong relationship, 0.3 = weak relationship.
6. Category must be one of: science, tech, art, philosophy, history, nature, other.
7. Summary: one sharp sentence capturing the essence.
8. Return ONLY the JSON. No explanation. No markdown fences.`;

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
  }

  const { text, existingLabels = [] } = body;

  if (!text || text.trim().length < 5) {
    return new Response(JSON.stringify({ error: 'Text too short' }), { status: 400, headers });
  }

  const userPrompt = `Extract concepts from this text:

"""
${text.slice(0, 2000)}
"""

${existingLabels.length > 0
  ? `IMPORTANT: These concepts already exist — DO NOT repeat them:\n${existingLabels.join(', ')}\n`
  : ''}

Return this exact JSON structure:
{
  "nodes": [
    { "id": "lowercase-hyphen-id", "label": "Concept Name", "size": 1|2|3, "category": "science|tech|art|philosophy|history|nature|other" }
  ],
  "edges": [
    { "source": "id1", "target": "id2", "strength": 0.3-1.0 }
  ],
  "summary": "One sentence about the core idea."
}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini error:', err);
      return new Response(JSON.stringify({ error: 'AI service error' }), { status: 502, headers });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Empty AI response' }), { status: 502, headers });
    }

    // Defensive parse — strip any accidental fences
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Parse failed:', cleaned);
      return new Response(JSON.stringify({ error: 'Could not parse AI response' }), { status: 502, headers });
    }

    // Validate structure
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return new Response(JSON.stringify({ error: 'Invalid AI response structure' }), { status: 502, headers });
    }

    return new Response(JSON.stringify(parsed), { status: 200, headers });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers });
  }
}
```

### 4.2 — Frontend AI Module

**`public/ai.js`** — Complete file:

```javascript
const AI = (() => {
  let isLoading = false;
  const TIMEOUT_MS = 10000; // 10 second timeout

  async function extractConcepts(text, existingLabels = []) {
    if (isLoading) return null;
    isLoading = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), existingLabels }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Sanitize nodes
      const nodes = (data.nodes || []).map(n => ({
        id:       String(n.id || '').replace(/[^a-z0-9-]/g, '-').slice(0, 40),
        label:    String(n.label || '').slice(0, 30),
        size:     [1, 2, 3].includes(n.size) ? n.size : 2,
        category: ['science','tech','art','philosophy','history','nature','other']
                    .includes(n.category) ? n.category : 'other',
      })).filter(n => n.id && n.label);

      // Sanitize edges
      const edges = (data.edges || []).map(e => ({
        source:   String(e.source || ''),
        target:   String(e.target || ''),
        strength: Math.min(1, Math.max(0.1, Number(e.strength) || 0.5)),
      })).filter(e => e.source && e.target);

      const summary = String(data.summary || '').slice(0, 200);

      return { nodes, edges, summary };

    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') throw new Error('Request timed out. Try again.');
      throw err;
    } finally {
      isLoading = false;
    }
  }

  function getIsLoading() { return isLoading; }

  return { extractConcepts, getIsLoading };
})();
```

### 4.3 — Test the AI Integration

Open browser console on your local dev server and run:

```javascript
AI.extractConcepts("Quantum computing uses quantum mechanical phenomena like superposition and entanglement to perform computation.")
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
```

Expected output:
```json
{
  "nodes": [
    { "id": "quantum-computing", "label": "Quantum Computing", "size": 3, "category": "tech" },
    { "id": "superposition", "label": "Superposition", "size": 2, "category": "science" },
    { "id": "entanglement", "label": "Entanglement", "size": 2, "category": "science" },
    { "id": "computation", "label": "Computation", "size": 2, "category": "tech" }
  ],
  "edges": [
    { "source": "quantum-computing", "target": "superposition", "strength": 0.9 },
    { "source": "quantum-computing", "target": "entanglement", "strength": 0.9 },
    { "source": "quantum-computing", "target": "computation", "strength": 0.8 }
  ],
  "summary": "Quantum computers leverage superposition and entanglement to process information in fundamentally new ways."
}
```

✓

---

## PHASE 5 — Node Click + Insight Panel
### ⏱ Time: 1 hour | Goal: Click any node → AI insight slides in

### 5.1 — UI Module

**`public/ui.js`** — Complete file:

```javascript
const UI = (() => {
  // Cache DOM elements
  const panel          = document.getElementById('insight-panel');
  const panelLabel     = document.getElementById('insight-node-label');
  const panelConnections = document.getElementById('insight-connections');
  const panelSummary   = document.getElementById('insight-summary');
  const panelAIText    = document.getElementById('insight-ai-text');
  const closeBtn       = document.getElementById('insight-close');
  const toast          = document.getElementById('toast');
  const emptyState     = document.getElementById('empty-state');
  const nodeCount      = document.getElementById('node-count');
  const input          = document.getElementById('thought-input');
  const submitBtn      = document.getElementById('btn-submit');
  const submitIcon     = document.getElementById('btn-submit-icon');
  const submitLoading  = document.getElementById('btn-submit-loading');

  let toastTimer = null;

  // Auto-grow textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Close panel
  closeBtn.addEventListener('click', closePanel);

  function openPanel(node, connections) {
    panelLabel.textContent = node.label;
    panelConnections.textContent =
      connections.length > 0
        ? `Connected to: ${connections.map(c => c.label).join(', ')}`
        : 'No connections yet';

    panelSummary.textContent = node._summary || '';
    panelAIText.textContent  = 'Generating insight...';
    panelAIText.classList.add('loading');

    panel.classList.remove('panel-hidden');

    // Fetch a specific insight for this node
    const context = [node.label, ...connections.map(c => c.label)].join(', ');
    fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Write 2-3 sentences explaining the concept "${node.label}" and how it relates to: ${connections.map(c => c.label).join(', ') || 'the broader field'}. Be insightful, specific, and concise.`,
        existingLabels: [],
        insightMode: true,
      }),
    })
    .then(r => r.json())
    .then(data => {
      panelAIText.classList.remove('loading');
      panelAIText.textContent = data.summary || 'Insight not available.';
    })
    .catch(() => {
      panelAIText.classList.remove('loading');
      panelAIText.textContent = `${node.label} is a key concept in this knowledge graph.`;
    });
  }

  function closePanel() {
    panel.classList.add('panel-hidden');
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitIcon.style.display   = loading ? 'none' : 'block';
    submitLoading.style.display = loading ? 'block' : 'none';
  }

  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function updateNodeCount(count) {
    nodeCount.textContent = `${count} concept${count !== 1 ? 's' : ''}`;
  }

  function hideEmptyState() {
    emptyState.classList.add('hidden');
  }

  function showEmptyState() {
    emptyState.classList.remove('hidden');
  }

  function getInputValue()   { return input.value; }
  function clearInput()      { input.value = ''; input.style.height = 'auto'; }

  return {
    openPanel,
    closePanel,
    setLoading,
    showToast,
    updateNodeCount,
    hideEmptyState,
    showEmptyState,
    getInputValue,
    clearInput,
  };
})();
```

### 5.2 — Handle Insight Mode in the Edge Function

Add this block inside `api/ask.js`, right after parsing `body`:

```javascript
// Insight mode: just return the summary without graph data
if (body.insightMode) {
  // Re-use the same Gemini call structure but with a different prompt
  // The text field IS the prompt in this mode
  const insightRes = await fetch( /* same URL */ ...);
  // Parse and return only { summary: "..." }
}
```

> **Shortcut**: For insight mode, you can just re-use the same endpoint. The edge function already returns `summary`. In insight mode, the frontend just reads `data.summary`. No extra endpoint needed.

---

## PHASE 6 — Visual Polish & Animations
### ⏱ Time: 1 hour | Goal: From "works" to "jaw-dropping"

### 6.1 — Node Birth Particle Burst

When a new node appears, emit particles from its position. Add this to `graph.js`:

```javascript
// Call this inside renderNodes(), after appending new nodes
function emitBurstAt(x, y, color) {
  // We'll dispatch a custom event that particles.js listens to
  window.dispatchEvent(new CustomEvent('node-born', {
    detail: { x, y, color }
  }));
}
```

Add to `particles.js`, inside the class:

```javascript
init() {
  // ... existing init code ...
  window.addEventListener('node-born', (e) => {
    const { x, y, color } = e.detail;
    for (let i = 0; i < 12; i++) {
      const angle   = (Math.PI * 2 * i) / 12;
      const speed   = Math.random() * 2 + 1;
      const burst   = this.makeParticle();
      burst.x       = x;
      burst.y       = y;
      burst.vx      = Math.cos(angle) * speed;
      burst.vy      = Math.sin(angle) * speed;
      burst.r       = Math.random() * 2 + 1;
      burst.color   = color;
      burst.opacity = 0.8;
      burst.life    = 1;
      burst.lifeDelta = -0.025;  // fades out fast
      burst.isBurst = true;
      this.particles.push(burst);
    }
  });
}
```

Update `animate()` to remove dead burst particles:
```javascript
// After the forEach loop in animate():
this.particles = this.particles.filter(p => !(p.isBurst && p.life <= 0));
```

### 6.2 — Edge Shimmer Variation

In `renderEdges()`, vary the animation speed per edge so they don't all pulse together:

```javascript
.style('animation-duration', () => `${2 + Math.random() * 2}s`)
.style('animation-delay',    () => `${Math.random() * 3}s`)
```

### 6.3 — Cursor Aura Effect

Add to `particles.js` — nodes near the cursor glow brighter:

```javascript
// In class constructor:
this.mouse = { x: -999, y: -999 };
document.addEventListener('mousemove', (e) => {
  this.mouse.x = e.clientX;
  this.mouse.y = e.clientY;
});

// In drawParticle() — increase opacity near cursor:
const distToMouse = Math.hypot(p.x - this.mouse.x, p.y - this.mouse.y);
const boost = distToMouse < 100 ? (1 - distToMouse / 100) * 0.4 : 0;
const finalOpacity = Math.min(0.9, p.opacity + boost);
```

### 6.4 — Keyboard Shortcut

```javascript
// In app.js:
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter') && !e.shiftKey && document.activeElement === thoughtInput) {
    e.preventDefault();
    handleSubmit();
  }
  if (e.key === 'Escape') {
    UI.closePanel();
  }
});
```

---

## PHASE 7 — Demo Data & Pre-loads
### ⏱ Time: 45 minutes | Goal: Rehearsal-ready demo with killer content

### 7.1 — Data Module + localStorage

**`public/data.js`** — Complete file:

```javascript
const Data = (() => {
  const STORAGE_KEY = 'synaptic-graph-v1';

  // ─── DEMO PRESETS ─────────────────────────────────────────────
  // These are hand-crafted to produce beautiful, rich graphs.
  // Use them for the hackathon demo.

  const PRESETS = {
    quantum: {
      label: 'Quantum Universe',
      nodes: [
        { id: 'quantum-mechanics', label: 'Quantum Mechanics', size: 3, category: 'science' },
        { id: 'superposition', label: 'Superposition', size: 2, category: 'science' },
        { id: 'entanglement', label: 'Entanglement', size: 2, category: 'science' },
        { id: 'wave-function', label: 'Wave Function', size: 2, category: 'science' },
        { id: 'uncertainty', label: 'Uncertainty Principle', size: 2, category: 'science' },
        { id: 'quantum-computing', label: 'Quantum Computing', size: 2, category: 'tech' },
        { id: 'qubits', label: 'Qubits', size: 1, category: 'tech' },
        { id: 'decoherence', label: 'Decoherence', size: 1, category: 'science' },
      ],
      edges: [
        { source: 'quantum-mechanics', target: 'superposition',    strength: 0.9 },
        { source: 'quantum-mechanics', target: 'entanglement',     strength: 0.9 },
        { source: 'quantum-mechanics', target: 'wave-function',    strength: 0.9 },
        { source: 'quantum-mechanics', target: 'uncertainty',      strength: 0.8 },
        { source: 'superposition',     target: 'quantum-computing', strength: 0.7 },
        { source: 'entanglement',      target: 'quantum-computing', strength: 0.7 },
        { source: 'quantum-computing', target: 'qubits',           strength: 0.9 },
        { source: 'decoherence',       target: 'quantum-computing', strength: 0.6 },
        { source: 'wave-function',     target: 'uncertainty',      strength: 0.6 },
      ],
      summary: 'Quantum mechanics describes how matter behaves at atomic scales, and quantum computers exploit these phenomena to solve impossible problems.',
    },

    consciousness: {
      label: 'Mind & Consciousness',
      nodes: [
        { id: 'consciousness', label: 'Consciousness', size: 3, category: 'philosophy' },
        { id: 'qualia', label: 'Qualia', size: 2, category: 'philosophy' },
        { id: 'free-will', label: 'Free Will', size: 2, category: 'philosophy' },
        { id: 'neuroscience', label: 'Neuroscience', size: 2, category: 'science' },
        { id: 'emergence', label: 'Emergence', size: 2, category: 'science' },
        { id: 'turing-test', label: 'Turing Test', size: 1, category: 'tech' },
        { id: 'hard-problem', label: 'Hard Problem', size: 2, category: 'philosophy' },
        { id: 'self-awareness', label: 'Self-Awareness', size: 1, category: 'philosophy' },
      ],
      edges: [
        { source: 'consciousness', target: 'qualia',       strength: 0.9 },
        { source: 'consciousness', target: 'free-will',    strength: 0.7 },
        { source: 'consciousness', target: 'neuroscience', strength: 0.8 },
        { source: 'consciousness', target: 'hard-problem', strength: 0.9 },
        { source: 'neuroscience',  target: 'emergence',    strength: 0.7 },
        { source: 'emergence',     target: 'consciousness', strength: 0.6 },
        { source: 'turing-test',   target: 'consciousness', strength: 0.5 },
        { source: 'qualia',        target: 'hard-problem', strength: 0.8 },
        { source: 'self-awareness', target: 'consciousness', strength: 0.8 },
      ],
      summary: 'Consciousness remains philosophy\'s hardest problem — how subjective experience arises from physical matter.',
    },

    climate: {
      label: 'Climate Systems',
      nodes: [
        { id: 'climate-change', label: 'Climate Change', size: 3, category: 'science' },
        { id: 'carbon-cycle', label: 'Carbon Cycle', size: 2, category: 'nature' },
        { id: 'feedback-loops', label: 'Feedback Loops', size: 2, category: 'science' },
        { id: 'renewable-energy', label: 'Renewable Energy', size: 2, category: 'tech' },
        { id: 'ocean-acidification', label: 'Ocean Acidification', size: 2, category: 'nature' },
        { id: 'tipping-points', label: 'Tipping Points', size: 2, category: 'science' },
        { id: 'carbon-capture', label: 'Carbon Capture', size: 1, category: 'tech' },
        { id: 'biodiversity', label: 'Biodiversity', size: 1, category: 'nature' },
      ],
      edges: [
        { source: 'climate-change',     target: 'carbon-cycle',        strength: 0.9 },
        { source: 'climate-change',     target: 'feedback-loops',      strength: 0.8 },
        { source: 'climate-change',     target: 'tipping-points',      strength: 0.9 },
        { source: 'carbon-cycle',       target: 'ocean-acidification', strength: 0.7 },
        { source: 'tipping-points',     target: 'feedback-loops',      strength: 0.8 },
        { source: 'renewable-energy',   target: 'carbon-capture',      strength: 0.6 },
        { source: 'climate-change',     target: 'biodiversity',        strength: 0.7 },
        { source: 'feedback-loops',     target: 'ocean-acidification', strength: 0.5 },
      ],
      summary: 'Earth\'s climate is a complex system of feedback loops that humans are pushing toward irreversible tipping points.',
    },
  };

  // ─── LOCALSTORAGE ─────────────────────────────────────────────
  function save(graphState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(graphState));
    } catch { /* storage full — ignore */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getPreset(name) { return PRESETS[name] || null; }
  function getPresetNames() { return Object.keys(PRESETS); }

  return { save, load, clear, getPreset, getPresetNames, PRESETS };
})();
```

### 7.2 — Demo Button

In the header of `index.html`, the "Demo" button calls a preset. Wire it in `app.js`:

```javascript
document.getElementById('btn-demo').addEventListener('click', () => {
  Graph.clear();
  UI.showEmptyState();

  // Cycle through presets for fun
  const presets = Data.getPresetNames();
  const idx     = (window._demoIdx = ((window._demoIdx || -1) + 1) % presets.length);
  const preset  = Data.getPreset(presets[idx]);

  setTimeout(() => {
    Graph.addData(preset.nodes, preset.edges);
    UI.hideEmptyState();
    UI.updateNodeCount(Graph.getNodeCount());
    UI.showToast(`Loaded: ${preset.label}`);
  }, 300);
});
```

---

## PHASE 8 — Performance & Edge Cases
### ⏱ Time: 30 minutes | Goal: Nothing breaks on stage

### 8.1 — Complete app.js (Orchestrator)

**`public/app.js`** — Complete file:

```javascript
// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const particles = new ParticleSystem('particle-canvas');

  // Init graph with node click handler
  Graph.init((node, connections) => {
    UI.openPanel(node, connections);
  });

  // Restore from localStorage
  const saved = Data.load();
  if (saved && saved.nodes && saved.nodes.length > 0) {
    setTimeout(() => {
      Graph.addData(saved.nodes, saved.edges || []);
      UI.hideEmptyState();
      UI.updateNodeCount(Graph.getNodeCount());
    }, 500);
  }

  // ─── SUBMIT HANDLER ────────────────────────────────────────
  async function handleSubmit() {
    const text = UI.getInputValue().trim();
    if (!text || text.length < 5) {
      UI.showToast('Type something first');
      return;
    }
    if (AI.getIsLoading()) {
      UI.showToast('Still thinking...');
      return;
    }

    UI.setLoading(true);
    UI.clearInput();
    UI.hideEmptyState();

    try {
      const existingLabels = Graph.getNodeLabels();
      const result = await AI.extractConcepts(text, existingLabels);

      if (!result || !result.nodes.length) {
        UI.showToast('Could not extract concepts. Try more detail.');
        return;
      }

      // Attach summary to central node for the insight panel
      if (result.nodes.length > 0) {
        result.nodes[0]._summary = result.summary;
      }

      Graph.addData(result.nodes, result.edges);
      UI.updateNodeCount(Graph.getNodeCount());

      // Persist
      Data.save({
        nodes: Graph.getNodeLabels().map((l, i) => ({ id: l, label: l })),
        edges: [],
      });

      UI.showToast(`${result.nodes.length} concepts added`);

    } catch (err) {
      UI.showToast(`Error: ${err.message}`);
      console.error(err);
    } finally {
      UI.setLoading(false);
    }
  }

  // Attach submit events
  document.getElementById('btn-submit').addEventListener('click', handleSubmit);

  document.getElementById('thought-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });

  // Clear button
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (Graph.getNodeCount() === 0) return;
    Graph.clear();
    Data.clear();
    UI.closePanel();
    UI.showEmptyState();
    UI.updateNodeCount(0);
    UI.showToast('Graph cleared');
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') UI.closePanel();
  });

  // Demo button (handler is in data.js section above — add here too)
  document.getElementById('btn-demo').addEventListener('click', () => {
    Graph.clear();
    Data.clear();
    UI.closePanel();

    const presets  = Data.getPresetNames();
    window._demoIdx = ((window._demoIdx || -1) + 1) % presets.length;
    const preset   = Data.getPreset(presets[window._demoIdx]);

    setTimeout(() => {
      Graph.addData(preset.nodes, preset.edges);
      UI.hideEmptyState();
      UI.updateNodeCount(Graph.getNodeCount());
      UI.showToast(`Demo: ${preset.label}`);
    }, 300);
  });
});
```

### 8.2 — Rate Limit Protection

Add to `api/ask.js` — simple in-memory rate limiting:

```javascript
// At module level (resets per cold start, good enough for hackathon)
const rateMap = new Map();

function checkRate(ip) {
  const now   = Date.now();
  const entry = rateMap.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60000; }
  entry.count++;
  rateMap.set(ip, entry);
  return entry.count <= 20;  // 20 requests/minute max per IP
}

// Inside handler, before Gemini call:
const ip = req.headers.get('x-forwarded-for') || 'unknown';
if (!checkRate(ip)) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded. Wait a minute.' }), { status: 429, headers });
}
```

---

## §6 — TESTING CHECKLIST

### ✅ Pre-Deploy Tests (run locally with `vercel dev`)

#### Particle System
- [ ] Particles visible on load, moving smoothly at 60fps
- [ ] Particles do NOT freeze when tab loses focus (expected — fine)
- [ ] Particle connection lines appear between nearby particles
- [ ] Canvas resizes correctly on window resize
- [ ] No canvas-related console errors

#### Input & Submission
- [ ] Textarea grows as user types (max 120px height)
- [ ] Enter key submits (without Shift)
- [ ] Shift+Enter adds a new line (does NOT submit)
- [ ] Submit button disabled during AI call
- [ ] Loading spinner appears during AI call
- [ ] Input clears after successful submission
- [ ] Short text (< 5 chars) shows toast "Type something first"
- [ ] Double-click submit doesn't fire twice

#### AI Integration
- [ ] Real concept extraction works end-to-end
- [ ] Test with: single word ("democracy")
- [ ] Test with: full paragraph (paste any Wikipedia intro)
- [ ] Test with: code snippet ("const x = useState(0)")
- [ ] Response arrives in < 3 seconds
- [ ] Error toast appears on network failure (turn off wifi, try)
- [ ] Timeout toast appears after 10 seconds of no response
- [ ] No API key visible in browser DevTools → Network tab

#### Force Graph
- [ ] Nodes appear with burst animation on first add
- [ ] Nodes physics settle within 5 seconds
- [ ] Nodes don't fly off screen (center force working)
- [ ] Nodes can be dragged (release → spring back to simulation)
- [ ] Edges animated with dashed shimmer
- [ ] Zoom in/out with mouse wheel works
- [ ] Pan by dragging empty space works
- [ ] Selected node gets visual highlight
- [ ] Clicking empty SVG deselects node

#### Deduplication
- [ ] Submit "machine learning" then "ML algorithms" → only 1 ML concept
- [ ] Submit same text twice → no duplicate nodes
- [ ] Node count in header updates correctly after each add
- [ ] Clear button resets count to 0

#### Insight Panel
- [ ] Clicking a node opens the panel
- [ ] Panel shows node label, connections list
- [ ] AI insight text loads (< 3 seconds)
- [ ] Close button (×) hides panel
- [ ] Escape key closes panel
- [ ] Panel doesn't appear behind graph nodes (z-index correct)

#### Demo Presets
- [ ] Demo button cycles through: quantum → consciousness → climate → quantum
- [ ] Each preset loads without errors
- [ ] Graph looks beautiful with preset data
- [ ] Toast shows preset name

#### Performance
- [ ] Add 6+ inputs — graph stays smooth (no jank)
- [ ] Node cap at 28 — 29th concept removes the least-connected one
- [ ] Open task manager during demo — CPU stays below 40%

#### Persistence
- [ ] Refresh page → graph reloads from localStorage
- [ ] Clear button → localStorage is cleared → blank canvas on refresh

### ✅ Pre-Presentation Final Checks
- [ ] `vercel --prod` deployed successfully
- [ ] Production URL opens with no console errors
- [ ] Demo preset "quantum" loads and looks beautiful
- [ ] Test on the actual laptop/screen you'll demo on
- [ ] External monitor connected — graph looks good at that resolution
- [ ] Wi-Fi at venue tested (have 4G hotspot backup)
- [ ] Tab pinned, bookmarked, or on homescreen
- [ ] Browser zoom at 100% (not 90%, not 110%)
- [ ] All other apps closed (no notification interruptions)
- [ ] Screen brightness maximum

---

## §7 — DEMO SCRIPT (word-for-word)

> Practise this until it takes exactly 90 seconds. Do not improvise.

---

**[Open browser to your URL. Graph is empty.]**

**YOU SAY:** "This is Synaptic. The idea is simple — you give it any thought, and it builds a living knowledge universe from it."

**[Click the Demo button — Quantum preset loads, nodes burst in, physics settles]**

**YOU SAY:** "You can see it's already alive — every concept is a node, every relationship is a glowing edge. The whole thing runs on a physics simulation, so you can drag nodes, zoom in, pan around."

**[Drag one node. Zoom in with scroll wheel.]**

**YOU SAY:** "Now watch what happens when I type something completely different."

**[Type in the input: "Black holes warp spacetime so severely that nothing, not even light, can escape"]**

**[Hit Enter. Wait 2 seconds. New nodes burst in and connect to existing ones.]**

**YOU SAY:** "Gemini AI extracted the concepts in real time, found the relationships, and connected them to what was already there. It knows that spacetime connects to quantum mechanics."

**[Click the "Quantum Mechanics" node. Insight panel slides in.]**

**YOU SAY:** "Click any node and you get an AI-generated insight about that concept in context — not just a definition, but how it relates to everything else in your graph."

**[Pause 3 seconds. Let them read.]**

**YOU SAY:** "Everything is free — Gemini's free tier, Vercel's free tier, zero database. The only thing it costs is one thought at a time."

**[Load the Consciousness preset if time allows]**

**YOU SAY:** "This is what it looks like after exploring the philosophy of mind. Every session builds a different universe — yours."

**[STOP. Take questions.]**

---

### Backup Plan (if internet fails)

```javascript
// In app.js, add this BEFORE the real AI call:
// If offline or error, use this mock:
const MOCK_RESPONSE = {
  nodes: [
    { id: 'spacetime', label: 'Spacetime', size: 3, category: 'science' },
    { id: 'gravity', label: 'Gravity', size: 2, category: 'science' },
    { id: 'singularity', label: 'Singularity', size: 2, category: 'science' },
  ],
  edges: [
    { source: 'spacetime', target: 'gravity', strength: 0.9 },
    { source: 'spacetime', target: 'singularity', strength: 0.8 },
  ],
  summary: 'Spacetime curvature governs gravity and reaches its extreme at singularities.',
};
```

Keep this commented out normally. If Wi-Fi fails, uncomment it in 30 seconds.

---

## §8 — TROUBLESHOOTING GUIDE

### "Nodes fly off the screen"

**Cause**: Center force not strong enough, or collision radius too small.
```javascript
// In graph.js, increase these:
.force('x', d3.forceX(width  / 2).strength(0.08))  // was 0.04
.force('y', d3.forceY(height / 2).strength(0.08))  // was 0.04
```

### "Graph stutters / low FPS"

**Cause**: Too many nodes, or alphaDecay too slow.
```javascript
simulation.alphaDecay(0.05)  // settles faster, less CPU
```
Also reduce `COUNT` in `particles.js` from 90 to 60.

### "Gemini returns broken JSON"

**Cause**: Model ignoring JSON mode instruction.
```javascript
// Add to generationConfig in api/ask.js:
responseSchema: {
  type: 'object',
  properties: {
    nodes: { type: 'array' },
    edges: { type: 'array' },
    summary: { type: 'string' }
  }
}
```

### "Vercel deployment fails"

```bash
# Check logs:
vercel logs --prod

# Most common fix: ensure vercel.json is correct
# Ensure api/ask.js has: export const config = { runtime: 'edge' }
# Ensure GEMINI_API_KEY is set in Vercel dashboard
```

### "API key is visible in Network tab"

**Cause**: You're calling Gemini directly from `ai.js` instead of through the Edge Function.
**Fix**: Check that `ai.js` calls `/api/ask`, NOT `generativelanguage.googleapis.com`. The API key should only appear in the Vercel dashboard, never in any `.js` file.

### "Duplicate nodes appearing"

**Cause**: IDs differ but labels are the same (e.g. "ml" vs "machine-learning" both → "Machine Learning").
```javascript
// Strengthen the deduplication in graph.js addData():
const isDuplicate = nodes.some(existing =>
  existing.id === n.id ||
  normalize(existing.label) === normalize(n.label) ||
  existing.label.toLowerCase().includes(n.label.toLowerCase()) ||
  n.label.toLowerCase().includes(existing.label.toLowerCase())
);
```

### "Insight panel flashes and closes"

**Cause**: Click event on node propagates to SVG, triggering deselect.
```javascript
// Already handled: event.stopPropagation() in node click handler
// If still happening, check that click listener on SVG
// is on #graph-svg, not on #ui-layer (which sits above it)
```

### "Textarea doesn't auto-grow"

**Cause**: CSS `overflow: hidden` missing or height not set to `auto` first.
```javascript
input.style.height = 'auto';                         // reset
input.style.height = input.scrollHeight + 'px';     // then set
```

### "CORS error in console"

**Cause**: Edge function not returning CORS headers.
**Fix**: Every `return new Response(...)` in `api/ask.js` must include the `headers` object with `Access-Control-Allow-Origin: *`.

---

## §9 — DEPLOYMENT CHECKLIST

### Final Deploy Sequence

```bash
# 1. Final check — no console errors locally
vercel dev
# Open http://localhost:3000, check console

# 2. Commit everything
git add -A
git commit -m "feat: synaptic complete — CodeStorm 2026"

# 3. Deploy to production
vercel --prod

# 4. Verify production URL
open https://your-project.vercel.app

# 5. Test production API
curl -X POST https://your-project.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"text":"test quantum physics","existingLabels":[]}'
# Should return JSON with nodes and edges

# 6. Open in incognito (fresh session, no cache)
# Test the demo flow start-to-finish

# 7. Check on mobile (judges may glance)
# Open on phone — ensure layout doesn't break catastrophically
```

### README.md for Judges

```markdown
# Synaptic — Your Ideas, Alive

Synaptic turns any thought into a living, AI-powered knowledge graph.
Type a sentence. Watch your ideas form a neural universe in real time.

## How it works
1. Type any text into the input bar
2. Gemini AI extracts key concepts and their relationships
3. D3.js force simulation places them as glowing, physics-driven nodes
4. Click any node for an AI-generated insight
5. Add more thoughts — the graph grows and connects automatically

## Tech Stack
- **Frontend**: Vanilla JS, D3.js v7, Canvas API
- **AI**: Google Gemini 1.5 Flash (free tier)
- **Hosting**: Vercel (free tier)
- **Cost**: $0.00

## Live Demo
https://your-project.vercel.app

## Team
[Your name] — CodeStorm 2026, Month 2
```

---

## APPENDIX A — Time Budget

```
Phase 1 — Setup & skeleton         30 min
Phase 2 — Particle canvas           90 min
Phase 3 — D3 force graph           180 min  ← most time here
Phase 4 — Gemini integration        90 min
Phase 5 — Insight panel             60 min
Phase 6 — Visual polish             60 min
Phase 7 — Demo data                 45 min
Phase 8 — Edge cases & testing      30 min
Buffer (bugs, breaks, coffee)       60 min
─────────────────────────────────────────
TOTAL                              645 min  (~10.75 hours)
```

Build in order. **Do not skip phases.** Do not start Phase 4 without a working graph. A beautiful static graph is a better submission than a broken dynamic one.

---

## APPENDIX B — Git Commit Strategy

```bash
git commit -m "feat: particle system + dark canvas"
git commit -m "feat: d3 force graph with hardcoded nodes"
git commit -m "feat: gemini api edge function"
git commit -m "feat: real-time concept extraction"
git commit -m "feat: insight panel with ai text"
git commit -m "feat: node birth animations + edge shimmer"
git commit -m "feat: demo presets (quantum, consciousness, climate)"
git commit -m "fix: node deduplication + performance cap"
git commit -m "fix: rate limiting in edge function"
git commit -m "chore: readme + final polish"
```

One commit per phase. If anything breaks, `git revert` gets you back in 10 seconds.

---

## APPENDIX C — If You Get Stuck

| Problem | First thing to try |
|---------|-------------------|
| D3 graph not rendering | Check console — is D3 loaded? Try `d3.version` in console |
| Gemini returns 403 | API key wrong or not set in Vercel env |
| Nodes overlap badly | Increase collision radius in forceCollide |
| Performance bad | Reduce particle count (60), reduce MAX_NODES (20) |
| Graph looks ugly | Load the Quantum preset — if that's ugly, it's a CSS issue |
| Nothing works | `vercel dev` → check terminal for errors |

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   BUILD THE GRAPH.                                           ║
║   MAKE IT BREATHE.                                           ║
║   WIN THE ROOM.                                              ║
║                                                              ║
║   — SYNAPTIC MISSION CONTROL                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

*Document version 1.0 — CodeStorm 2026 Month 2 — Generated for hackathon use*
