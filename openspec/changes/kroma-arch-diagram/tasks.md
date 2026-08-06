## 1. Renderer: flow-colored directed links

- [x] 1.1 Add a `FLOW_COLORS` map (dns, data, auth, alert, deploy) to `d3-architecture.js` with dark/light variants sourced from the standalone prototype palette
- [x] 1.2 Resolve each link's stroke/marker color from `link.color` (flow key) with fallback to the theme link color for unknown keys
- [x] 1.3 Render solid flow-colored links with a matching arrow marker; dashed links use a dimmer arrow marker for response paths
- [x] 1.4 Keep `animated: true` particle rendering when combined with a flow color

## 2. Renderer: node metadata (icon / layer / desc)

- [x] 2.1 Add a Material-Symbol icon key resolution map with a unicode fallback for unknown icons
- [x] 2.2 Draw the node icon from `node.icon` and render multi-line labels via `node.label` when no icon is present (existing behavior)
- [x] 2.3 Store `node.layer` and `node.desc` on the rendered node group for tooltip use

## 3. Renderer: dashed marching zones

- [x] 3.1 Use existing `containers` as zones, drawing dashed rounded-rectangle borders with the zone label
- [x] 3.2 Animate the zone dash offset continuously (dash "march") via the animation loop or CSS class
- [x] 3.3 Attach a hover tooltip showing the zone label

## 4. Renderer: hover highlighting and tooltips

- [x] 4.1 Build a link neighbor index mapping each node id to its incident links and neighbor nodes
- [x] 4.2 On node hover, dim unrelated nodes/links and keep the hovered node's neighbors at full opacity (neighbor highlight)
- [x] 4.3 On mouse leave, restore full opacity to all nodes and links
- [x] 4.4 Implement a single in-SVG tooltip group that rebuilds content on hover, clamped to diagram bounds
- [x] 4.5 Wire node tooltip (name + `desc` + layer label), link tooltip (`source -> target`, label, flow name), and zone tooltip (label)

## 5. Renderer: theme sync for new elements

- [x] 5.1 Extend the MutationObserver theme sync to re-color flow link markers, dashed zone borders, and tooltip styling on dark/light toggle

## 6. Data: Kroma architecture JSON

- [x] 6.1 Rewrite `data/architectures/kroma-app.json` with the full 20-node Kroma stack (labels, icons, desc, layer assignments) per the renderer schema
- [x] 6.2 Add all 28 connections with source, target, flow color, label, and solid/dashed style
- [x] 6.3 Add container zone definitions for edge, identity, compute, ops, and infra with human-readable labels
- [x] 6.4 Keep the schema backward-compatible by retaining existing fields and adding new ones only

## 7. CSS and page integration

- [x] 7.1 Add dashed "march" border animation and tooltip styles to `architecture.css` with dark/light variants
- [x] 7.2 Verify the shortcode renders the Kroma diagram from the new JSON and that existing n8n diagrams render unchanged
- [x] 7.3 Update `AGENTS.md` to document the new node fields (icon/layer/desc), flow-colored links, and zone behavior

## 8. Verification

- [x] 8.1 Build with `make build` and confirm no build errors
- [x] 8.2 Manually verify hover highlight, node/connection/zone tooltips, dashed marching zones, and theme toggle in the browser
- [x] 8.3 Confirm the particle and pulse animations still run for animated links
