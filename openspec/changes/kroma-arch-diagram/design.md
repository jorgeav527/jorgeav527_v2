## Context

The site's reusable architecture shortcode (`templates/shortcodes/d3_architecture.html`) loads a JSON blob from `data/architectures/*.json` at build time, embeds it in a `<script type="application/architecture+json">`, and `d3-architecture.js` renders it into the SVG with Catppuccin dark/light theming, glowing particles, a hidden pulse, plus D3 zoom/pan. The renderer is fully data-driven with backward-compatible fields `title`, `layout`, `containers`, `nodes` (id/label/x/y/w/h/type), and `links` (source/target/animated/style/label).

A standalone prototype `diagram-architecture.html` renders the same concept for a richer Kroma stack with materially different features: 20 services with `desc` strings and Material Symbol icons, 28 connections colored by flow type (DNS, data, auth, alert, deploy), visual zone groupings with dashed "march" borders, and hover interactivity (node/connection tooltips plus neighbor dimming). These richer features are not yet in the renderer.

This change merges the two: the reusable, well-structured shortcode stays; the data comes from the Kroma stack; and the renderer gains the missing capability (node info layering, flow-colored links, dashed zones, hover highlight, tooltips).

## Goals / Non-Goals

**Goals:**
- Keep the shortcode's structure and the data-driven contract intact.
- Enrich `data/architectures/kroma-app.json` with the full Kroma stack whose source of truth is `diagram-architecture.html`.
- Extend the renderer with: node `icon`/`layer`/`desc`, flow-colored directed links (solid vs dashed), dashed marching zone containers, hover neighbor-highlight, and in-SVG tooltips.
- Preserve Catppuccin theme sync and particle/pulse animation.
- Preserve backward compatibility with the existing n8n diagrams.

**Non-Goals:**
- No new build tooling or JS bundler dependencies.
- No rewrite of the shortcode template or its loading mechanism.
- No generalization to auto-layout (`d3.stratify`/`tree`) as the default; the layout stays fixed and explicit.

## Decisions

- **Decision: Enrich data with `icon`/`layer`/`desc` additively, not replace.**
  The `diagram-architecture.html` data is the source for the node/description information and the connection topology. New node fields and new link fields are additive so the renderer keeps re-using the JSON. The JSON is rewritten but stays compatible with the current renderer, and n8n files keep their own shapes.

  - Alternative considered: A schema rewrite with the Material/Symbols-free approach. Rejected: a bigger schema change would force a rewrite of `d3-architecture.js` rendering the whole n8n files.

- **Decision: flow colors are a fixed map, not a palette in the data.**
The renderer defines `FLOW_COLORS = { dns, data, auth, alert, deploy }` (from `diagram-architecture.html`), and each link picks one via a `color` field. The `type`-based accents (env/app/data/vpc/obs/infra) continue to color nodes and containers. An unknown flow key falls back to the theme link color.

  - Alternative considered: encoding colors directly in JSON. Complicated theme sync and it's brittle; the fixed map keeps theming coherent and syncable.

- **Decision: reuse existing `containers` as zones.**
  Each `layer` maps to one zone `container` (edge, identity, compute, ops, infra). The established "containers" group rectangles and the label glyph is reused; the renderer now draws dashed borders with a marching-dash offset (as driven by the `dash-march` keyframe in the standalone prototype) and attaches a hover tooltip.

- **Decision: one in-SVG tooltip element built from repurposed node/link/zone info.**
  A single hidden tooltip `<g>` rebuilt on hover (mirroring the prototype). Node tooltips show name + `desc` + layer label; link tooltips show `source -> target`, label, flow name; zone tooltips show the zone label. Rendered in SVG coordinates so zoom works, and clamped to the view bounds.

- **Decision: hover highlight via data-driven opacity dimming.**
  On node hover, neighbors are computed from the link index and kept at full opacity; all other nodes/links are dimmed. Mouse-leave restores full opacity. This mirrors `diagram-architecture.html` (hover effect + dotted lines).

- **Decision: keep the existing Particle and Pulse renderers as-is.**
  Particle links (animated) are both color-flowed and particle-animated. The pulse stays for env/identity hotspots. No change to the MutationObserver theme sync, but it will also re-color zone borders/link markers/tooltips.

## Risks / Trade-offs

- [Flow colors conflict with node colors] → Keep a separate flow map so link colors never collide with the node type palette; unknown keys fall back to theme link color.
- [Large JSON drifts from source] → The Koma JSON is regenerated from `diagram-architecture.html`'s arrays; review counts (20/28) via `openspec` spec tests.
- [Dashed marching borders add continuous repaint] → Dash offset animation is GPU-friendly CSS/SVG small-scale; only a handful of zones, so repaint cost is low.
- [New node fields confusion among old diagrams] → Fields are additive with defaults; existing n8n JSON renders unchanged and is validated against its schema contract.

## Migration Plan

1. Add FLOW_COLORS, icon/layer/desc node handling, dashed zone borders, hover highlight, and the tooltip to `d3-architecture.js`.
2. Rewrite `data/architectures/kroma-app.json` with the full Kroma stack (20 nodes, 28 links, zones, metadata).
3. Add zone marching-dash CSS and tooltip styles to `architecture.css`.
4. Verify the shortcode still renders the old n8n diagrams unchanged.
5. Manual rollback: keep the previous `kroma-app.json` in version control; reverting data + removing renderer additions restores the prior behavior.

## Open Questions

- Exact Material Symbol names for each node (prototype uses them; the renderer's unicode fallback map covers unknown). Confirm the icon key names in the JSON match the font ligatures used on the page.
- Whether to keep ALL 28 links or prune redundant DNS-alias edges for readability once rendered. Default: keep all 28 (per the prototype), revisit if the diagram is cluttered.