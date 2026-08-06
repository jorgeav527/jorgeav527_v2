## ADDED Requirements

### Requirement: Complete Kroma data model
The data file SHALL be replaced with the complete Kroma AWS stack depicted in the standalone diagram file: all 20 nodes, 28 links, and zone grouping, using the renderer schema (title, layout, containers, nodes, links) enriched with icon, desc, layer, and color/style link fields.

#### Scenario: All Kroma nodes present
- **WHEN** the JSON is loaded by the renderer
- **THEN** all 20 nodes render, each with a label, icon, desc, and layer assignment

#### Scenario: All Kroma links present
- **WHEN** the JSON is loaded
- **THEN** all 28 links render, each with a source, target, flow color, label, and a solid or dashed style

#### Scenario: Services grouped into zones
- **WHEN** the JSON is loaded
- **THEN** services map to zone containers with human-readable labels, for example the edge layer labeled as Edge and Content Delivery

#### Scenario: Backward compatibility preserved
- **WHEN** a diagram that uses only the original schema fields (title, layout, containers, nodes, links) is loaded
- **THEN** it renders unchanged, since the new fields are additive only
