## Why

The site currently renders two separate architecture diagrams that never meet: the reusable Zola shortcode (`d3_architecture.html` + `d3-architecture.js`) is cleanly structured but its `kroma-app.json` is a simplified stub, while `diagram-architecture.html` (a standalone one-off) holds a much richer picture of the Kroma AWS stack — 20 services, 28 labeled connections, per-flow colors, service descriptions, and visual zone groupings. They each do half the job. Merge them: keep the reusable shortcode's well-structured data-loading + script structure, Catppuccin theme, typography, and connection animations, but pull all nodes, connections, zones, and service/connection information in from `diagram-architecture.html`.

## What Changes

- Rework `data/architectures/kroma-app.json` to represent the full Kroma map from `diagram-architecture.html` (20 nodes, 28 connections, service `desc`/`icon`/`layer`), while keeping the existing data schema the renderer already reads.
- Extend the `d3-architecture.js` renderer to support:
  - Node `icon`, `layer`, and `desc` fields (Material Symbol icon names with a unicode fallback map).
  - Flow-colored, directed connections (SOLID request flow vs DASHED response flow) with per-flow marker colors — complementing the existing `animated` glow-particle rendering.
  - Zone (container) grouping per layer: dashed/dotted border rectangles with zone labels (`Edge & Content Delivery`, `Identity & API Layer`, etc.), animated dashed "march" borders, and hover tooltips per zone.
  - Hover interactivity from `diagram-architecture.html`: hover on a node highlights its neighbor links/nodes and dims the rest, plus tooltips that reveal the service `desc` and its layer; hover on a connection shows `src -> tgt`, its label, and its flow type.
- Keep the existing shortcode output structure (`{% set data = load_data(...) %}`, `<script type="application/architecture+json">`, `link`/`script` assets) intact — the data-driven approach is preserved. No dependency changes.
- CSS: keep the Catppuccin theme; add zone dash-march animation, zone/connection hover states, and tooltip styling to `architecture.css`.

## Capabilities

### New Capabilities
- `architecture-renderer`: Data-driven diagram renderer enhancements — node `icon`/`layer`/`desc` fields, flow-colored directed links (SOLID vs DASHED) with per-flow markers, dashed "march" zone containers with labels and tooltips, and hover neighbor-highlight + info tooltips — all while preserving the Catppuccin theme and particle animations.
- `kroma-architecture-data`: The Kroma architecture data model — the JSON data from `diagram-architecture.html` transformed into `data/architectures/kroma-app.json` using the renderer's schema (containers, nodes, links) enriched with `icon`, `desc`, `layer`, and `flow`/`style` fields.

### Modified Capabilities
- None (no existing specs in `openspec/specs/`).

## Impact

- Templates: `templates/shortcodes/d3_architecture.html` stays as-is — the loading/render contract does not change.
- JS: `static/js/diagrams/d3-architecture.js` — add flow-colored links, node `desc`/`icon`/`layer` support, zone dash-march, hover highlight, and tooltips.
- Data: `data/architectures/kroma-app.json` — replaced with the full Kroma data. Existing fields (`type`, `title`, `label`, link `label`/`animated`) remain backward-compatible so n8n and other diagrams keep working.
- Assets: `static/css/diagrams/architecture.css` — zone march animation and hover/tooltip states.
- Docs: `AGENTS.md` — document the new node/link fields and flow colors.
