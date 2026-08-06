# jorgeav527 — personal site

Static site: **Zola 0.22** + **Tailwind v4** (CSS-only, no JS bundler).

## Quick start

```sh
make setup       # npm install + download Zola binary
make dev         # zola serve + Tailwind watch (concurrent)
make build       # zola build + Tailwind minify
```

## Build quirks

- Output dir is `docs/` (not `public/`). Set in `config.toml`.
- Production CSS goes to `docs/style.css`; dev CSS to `static/style.css`.
- `compile_sass = false` in config — Tailwind v4 replaces Sass.
- Prettier formats Tera templates via `prettier-plugin-tera`.

## Deploy

- GitHub Actions on `main` push: build → commit updated `docs/` back to `main`.
- No other branches are built/deployed.

## Content

- Zola sections: `content/posts/`, `content/blog/`, `content/projects/`
- Templates in `templates/` (Tera, `.html` files)
- Custom shortcodes in `templates/shortcodes/`
- Theme: Catppuccin Mocha (dark) / Latte (light), toggled via localStorage.

## Tests

- `npm test` is a placeholder — no tests in this repo.
- No lint/typecheck step for site code.

## D3.js Architecture Diagrams

Interactive architecture diagrams rendered with D3.js, embedded via custom shortcode.

### Quick start — new diagram

1. Create `data/architectures/<name>.json` — define containers, nodes, links
2. In any Markdown page, add: `{{ d3_architecture(id="<name>") }}`

No JS/CSS changes needed. The renderer is fully data-driven.

### Data model (`data/architectures/*.json`)

Three sections:

**`containers`** — background groupings (VPC, K8s cluster, etc.)
```json
{ "id": "k8s", "label": "Kubernetes Cluster", "x": 250, "y": 100, "w": 600, "h": 500, "type": "cluster" }
```

**`nodes`** — individual services. Explicit x/y/w/h in the 1100×830 viewBox.
```json
{ "id": "webhook", "label": "Webhook", "x": 285, "y": 145, "w": 140, "h": 46, "type": "app" }
```
Types and their accent colors: `env` (cyan), `app` (indigo), `data` (purple), `vpc` (orange), `obs` (green), `infra` (yellow). Unknown types fall back to cyan.

Optional node fields (Kroma diagrams):
- `icon` — Material Symbol icon key, resolved via a unicode fallback map in the renderer
- `layer` — zone/container id this node belongs to (used for grouping)

Node sizing: `w`/`h` are optional. If omitted, the renderer auto-sizes the node — fixed height 46px, width derived from the label length (`nodeSize()` in `d3-architecture.js`). Explicit `w`/`h` still win when present. Containers always use explicit sizes.

**`links`** — connections between nodes or containers.
```json
{ "source": "webhook", "target": "workflow-engine", "animated": true, "label": "Trigger", "style": "solid", "color": "data" }
```
Styles: `solid`, `dashed` (response path), `dotted`.
Flow colors via `color`: `dns` (blue), `data` (green), `auth` (orange), `alert` (red), `deploy` (purple). Solid links get a matching arrow marker; dashed links get a dimmer response arrow. `animated: true` adds glowing particles (flow-colored links keep both the flow color and the particles).

### Interactive features

- **Zoom**: scroll wheel to zoom in/out (0.3×–3×)
- **Pan**: click + drag the diagram
- **Particles**: glowing dots travel along animated links (2 per link, staggered phase)
- **Pulse**: status dots breathe every 2.5s on env nodes and workflow-engine
- **Hover highlight**: hovering a node or link dims unrelated nodes/links and thickens+glows the connected lines (stroke-width 4 + `#glow` filter); hovering a link also brightens its two endpoint nodes
- **Legend**: bottom-right overlay inside the SVG lists node-type colors and link flow colors; it recolors on theme toggle
- **Zone march**: zone container borders animate with a dashed "march"
- **Theme sync**: automatically matches Catppuccin dark/light toggle

### File structure

```
data/architectures/           ← JSON definitions (one per diagram)
static/js/diagrams/
  d3.min.js                   ← D3.js v7 (274 KB)
  d3-architecture.js          ← Renderer (19 KB) — containers, nodes, links, particles, zoom
static/css/diagrams/
  architecture.css            ← Responsive sizing, theme backgrounds, user-select: none
templates/shortcodes/
  d3_architecture.html        ← Shortcode: loads JSON at build time, embeds as <script>
```

### Performance notes

- D3.js (274 KB) is loaded only on pages that use `{{ d3_architecture() }}`
- Particles use `requestAnimationFrame` — auto-pauses when tab is hidden
- Pulse uses `setInterval` — cleaned up via `container._archCleanup()`
- Large diagrams (>50 nodes): reduce `particleDensity` in the JSON
