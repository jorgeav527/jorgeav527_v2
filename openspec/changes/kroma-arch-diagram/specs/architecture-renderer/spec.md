## ADDED Requirements

### Requirement: Node metadata fields
The architecture renderer SHALL support optional `icon`, `layer`, and `desc` fields on node data. `icon` names a Material Symbol icon key resolved via a fallback map; `layer` groups nodes into a visual zone; `desc` holds multi-line service information shown in a tooltip.

#### Scenario: Node renders icon, layer tint, and label
- **WHEN** a node in the JSON defines `icon`, `layer`, and `desc`
- **THEN** the renderer draws the node with a Material Symbol icon, a layer-appropriate accent, and its label
- **AND** nodes without these fields still render with existing defaults (type color, unicode icon, label)

#### Scenario: Tooltip shows service description
- **WHEN** a user hovers over a node that defines `desc`
- **THEN** a tooltip displays the node name, the multi-line `desc`, and the layer label

### Requirement: Flow-colored directed links
The renderer SHALL support link fields `color` (flow key) and `style` (`solid` or `dashed`) so connections are colored per flow type (DNS, data, auth, alert, deploy) and direction is shown with per-flow arrow markers. DASHED links represent response flows.

#### Scenario: Solid flow-colored request link with arrow
- **WHEN** a link defines `color: "flow-data"` and `style: "solid"`
- **THEN** the renderer draws a solid link in the flow-data color with a matching arrow marker

#### Scenario: Dashed response link with dimmer arrow
- **WHEN** a link defines `style: "dashed"`
- **THEN** the renderer draws a dashed link with a dimmer arrow marker representing the return path

#### Scenario: Unknown flow key falls back
- **WHEN** a link defines an unrecognized `color` value
- **THEN** the renderer falls back to the default link color

### Requirement: Animated particle links preserved
Links flagged `animated: true` SHALL keep the existing glowing particle animation, which may combine with flow colors.

#### Scenario: Animated flow link shows particles
- **WHEN** a link sets `animated: true` and a flow `color`
- **THEN** the link is drawn in the flow color with glowing particles traveling along it

### Requirement: Zone containers with dashed march borders
The renderer SHALL support zone containers (existing `containers` schema) that render as rounded rectangles with dashed borders and a label, with the dashes animating in a continuous "march".

#### Scenario: Zone container renders with label and animated dashes
- **WHEN** a container is defined in the JSON
- **THEN** the renderer draws a dashed-border rounded rectangle with the container label
- **AND** the dash offset animates continuously

#### Scenario: Zone container hover shows label tooltip
- **WHEN** a user hovers over a zone container border
- **THEN** a tooltip displays the container label

### Requirement: Hover neighbor highlighting
When a user hovers a node, the renderer SHALL highlight the node's connected links and neighbor nodes while dimming unrelated nodes and links.

#### Scenario: Hover node dims unrelated content
- **WHEN** a user hovers a node
- **THEN** the node's direct links and neighbor nodes stay at full opacity
- **AND** all other nodes and links are dimmed

#### Scenario: Mouse leave restores full opacity
- **WHEN** the user stops hovering a node
- **THEN** all nodes and links return to full opacity

### Requirement: Connection hover tooltip
Hovering a connection SHALL show a tooltip with the source and target names, the connection label, and its flow-type name.

#### Scenario: Link tooltip shows flow details
- **WHEN** a user hovers a connection that has a `label` and `color`
- **THEN** a tooltip displays `source -> target`, the label, and the flow name

### Requirement: Tooltip rendering inside the SVG
Tooltips SHALL render inside the SVG coordinate space so they stay consistent under zoom, and SHALL be clamped to the diagram bounds.

#### Scenario: Tooltip stays within diagram bounds
- **WHEN** a tooltip would overflow the diagram edge
- **THEN** the renderer repositions it so it remains fully inside the viewport

### Requirement: Theme sync preserved
All new visual elements SHALL update when the Catppuccin theme toggles between dark and light, consistent with the existing MutationObserver-based theme sync.

#### Scenario: Flow-colored links and zones update on theme change
- **WHEN** the page theme toggles dark to light
- **THEN** links, zone borders, tooltips, and node colors re-render in the light palette
- **AND** particle and pulse animations continue running
