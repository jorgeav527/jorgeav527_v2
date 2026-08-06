(function () {
  "use strict";

  var PALETTES = {
    dark: {
      page: "#0a0a0f",
      container: "#111318",
      containerBorder: "rgba(255,255,255,0.06)",
      node: "#1a1d2e",
      nodeBorder: "rgba(255,255,255,0.08)",
      text: "#e2e8f0",
      subtext: "#64748b",
      link: "#334155",
      linkAnimated: "#38bdf8",
      env: "#06b6d4",
      app: "#6366f1",
      data: "#a855f7",
      vpc: "#f97316",
      obs: "#10b981",
      infra: "#eab308",
      glow: "rgba(56,189,248,0.5)",
      subsection: "#1e293b",
      tooltipBg: "rgba(17,24,39,0.96)",
    },
    light: {
      page: "#f0f2f5",
      container: "rgba(255,255,255,0.7)",
      containerBorder: "rgba(0,0,0,0.08)",
      node: "#ffffff",
      nodeBorder: "rgba(0,0,0,0.08)",
      text: "#1e293b",
      subtext: "#64748b",
      link: "#cbd5e1",
      linkAnimated: "#0284c7",
      env: "#0891b2",
      app: "#4f46e5",
      data: "#7c3aed",
      vpc: "#ea580c",
      obs: "#059669",
      infra: "#ca8a04",
      glow: "rgba(2,132,199,0.3)",
      subsection: "#f1f5f9",
      tooltipBg: "rgba(255,255,255,0.97)",
    },
  };

  // Flow colors (from the standalone prototype palette), shared by both themes.
  var FLOW_COLORS = {
    dns: "#4D90FE",
    data: "#34A853",
    auth: "#FF6D01",
    alert: "#EA4335",
    deploy: "#A142F4",
  };

  var FLOW_NAMES = {
    dns: "DNS / Network",
    data: "Data Flow",
    auth: "Authentication",
    alert: "Monitoring / Alert",
    deploy: "Deploy / CI",
  };

  var TYPE_NAMES = {
    env: "Environment",
    app: "Application",
    data: "Data Store",
    vpc: "Network / VPC",
    obs: "Observability",
    infra: "Infrastructure",
  };

  var ICONS = {
    person: "\u{1F464}",
    language: "\u{1F310}",
    cloud: "\u2601",
    verified_user: "\u{1F512}",
    folder: "\u{1F5C2}",
    description: "\u{1F4C4}",
    passkey: "\u{1F511}",
    code: "\u{1F4BB}",
    api: "\u{1F4F1}",
    bolt: "\u26A1",
    speed: "\u{1F680}",
    database: "\u{1F4BE}",
    monitoring: "\u{1F4CA}",
    notifications: "\u{1F514}",
    account_balance_wallet: "\u{1F4B0}",
    admin_panel_settings: "\u{1F6E1}",
    fingerprint: "\u{1F5F1}",
    hub: "\u{1F517}",
    deployed_code: "\u{1F6D2}",
  };

  function isLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }
  function P() {
    return PALETTES[isLight() ? "light" : "dark"];
  }
  function typeColor(p, t) {
    var map = {
      env: p.env,
      app: p.app,
      data: p.data,
      vpc: p.vpc,
      obs: p.obs,
      infra: p.infra,
    };
    return map[t] || p.linkAnimated;
  }
  function containerColor(p, t) {
    var map = {
      vpc: p.vpc,
      cluster: p.linkAnimated,
      obs: p.obs,
      infra: p.infra,
      subsection: p.subsection,
      app: p.app,
      data: p.data,
    };
    return map[t] || p.linkAnimated;
  }

  var NODE_H = 46; // fixed height for all auto-sized nodes
  var CHAR_W = 6.5; // approx px per char at font-size 12
  var LABEL_X = 30; // label starts at n.x + 30 (after icon)
  var RIGHT_PAD = 14;
  function nodeSize(n) {
    if (n.w && n.h) return { w: n.w, h: n.h }; // explicit JSON wins
    var longest = (n.label || "")
      .split("\n")
      .reduce(function (a, b) {
        return b.length > a.length ? b : a;
      }, "");
    return { w: LABEL_X + longest.length * CHAR_W + RIGHT_PAD, h: NODE_H };
  }

  function rectEdge(rect, tx, ty) {
    var cx = rect.x + rect.w / 2,
      cy = rect.y + rect.h / 2;
    var dx = tx - cx,
      dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    if (Math.abs(dx) * rect.h > Math.abs(dy) * rect.w) {
      var ix = dx > 0 ? rect.x + rect.w : rect.x;
      return { x: ix, y: cy + (dy * (ix - cx)) / dx };
    }
    var iy = dy > 0 ? rect.y + rect.h : rect.y;
    return { x: cx + (dx * (iy - cy)) / dy, y: iy };
  }

  function curvePath(x1, y1, x2, y2) {
    var dx = x2 - x1,
      dy = y2 - y1;
    var adx = Math.abs(dx),
      ady = Math.abs(dy);
    var off = Math.max(adx, ady) * 0.35;
    var cpx1, cpy1, cpx2, cpy2;
    if (ady > adx) {
      cpx1 = x1 + dx * 0.1;
      cpy1 = y1 + (dy > 0 ? off : -off);
      cpx2 = x2 - dx * 0.1;
      cpy2 = y2 - (dy > 0 ? off : -off);
    } else {
      cpy1 = y1 + dy * 0.1;
      cpx1 = x1 + (dx > 0 ? off : -off);
      cpy2 = y2 - dy * 0.1;
      cpx2 = x2 - (dx > 0 ? off : -off);
    }
    return (
      "M " +
      x1 +
      "," +
      y1 +
      " C " +
      cpx1 +
      "," +
      cpy1 +
      " " +
      cpx2 +
      "," +
      cpy2 +
      " " +
      x2 +
      "," +
      y2
    );
  }

  function getIcon(type, id) {
    var map = {
      dev: "\u25C9",
      staging: "\u25C9",
      production: "\u25C9",
      webhook: "\u26A1",
      "workflow-engine": "\u2699",
      executions: "\u25B6",
      schedules: "\u23F0",
      credentials: "\uD83D\uDD11",
      redis: "\u26A1",
      rabbitmq: "\uD83D\uDCE8",
      nats: "\uD83D\uDCE1",
      postgresql: "\uD83D\uDCC4",
      minio: "\uD83D\uDEE2",
      "private-subnets": "\uD83C\uDF10",
      "nat-gateway": "\uD83D\uDD04",
      "security-groups": "\uD83D\uDEE1",
      prometheus: "\uD83D\uDCC8",
      grafana: "\uD83D\uDCCA",
      loki: "\uD83D\uDCCB",
      alertmanager: "\uD83D\uDD14",
      docker: "\uD83D\uDC33",
      helm: "\u26F5",
      "kubernetes-infra": "\u2699",
      ingress: "\uD83D\uDEAA",
      "cert-manager": "\uD83D\uDCDC",
      hpa: "\uD83D\uDCCF",
    };
    if (map[id]) return map[id];
    if (type === "app") return "\u2699";
    return "\u25CF";
  }

  function iconGlyph(n) {
    if (n.icon && ICONS[n.icon]) return ICONS[n.icon];
    return getIcon(n.type, n.id);
  }

  function defMarker(defs, id, color, width, opacity) {
    var m = defs
      .append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", width || 6)
      .attr("markerHeight", width || 6)
      .attr("orient", "auto");
    var path = m
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", color);
    if (opacity) path.attr("opacity", opacity);
    return { id: id, path: path };
  }

  // ─── Main ────────────────────────────────────────────
  function render(container) {
    if (container.dataset._archRendered) return;
    container.dataset._archRendered = "1";

    var jsonEl = container.querySelector(
      'script[type="application/architecture+json"]'
    );
    if (!jsonEl) return;
    var data = JSON.parse(jsonEl.textContent);
    var p = P();

    var svg = d3.select(container).select("svg");
    var W = 1100,
      H = 830;

    svg.selectAll("*").remove();
    svg.attr("viewBox", "0 0 1100 830");
    svg.style("background", p.page);

    var g = svg.append("g").attr("class", "zoom-group");
    var zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", function (e) {
        g.attr("transform", e.transform);
      });
    svg.call(zoom);

    var defs = svg.append("defs");

    // Glow filter
    defs
      .append("filter")
      .attr("id", "glow")
      .append("feGaussianBlur")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    defs
      .select("#glow")
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", function (d) {
        return d;
      });

    // Arrow markers
    var baseMarker = defMarker(defs, "arrow", p.link);
    defMarker(defs, "arrow-ani", p.linkAnimated);

    // Flow-colored markers (solid + dashed response)
    var flowMarkers = {};
    Object.keys(FLOW_COLORS).forEach(function (key) {
      flowMarkers[key] = defMarker(defs, "arrow-flow-" + key, FLOW_COLORS[key]);
      flowMarkers[key + "resp"] = defMarker(
        defs,
        "arrow-flow-" + key + "-resp",
        FLOW_COLORS[key],
        5,
        0.7
      );
    });

    function arrowId(flow, resp) {
      if (flow) return resp ? "arrow-flow-" + flow + "-resp" : "arrow-flow-" + flow;
      return "arrow";
    }

    // Build lookup
    var lookup = {};
    (data.containers || []).forEach(function (c) {
      lookup[c.id] = { x: c.x, y: c.y, w: c.w, h: c.h, isContainer: true };
    });
    (data.nodes || []).forEach(function (n) {
      var s = nodeSize(n);
      lookup[n.id] = { x: n.x, y: n.y, w: s.w, h: s.h, isContainer: false };
    });

    var bg = g.append("g").attr("class", "bg");

    // ─── Zone containers (dashed marching borders + label) ──
    if (data.containers) {
      data.containers.forEach(function (c) {
        var tc = containerColor(p, c.type);
        var grp = bg.append("g").attr("class", "arch-container").attr("data-zone-id", c.id);

        // Fill
        grp
          .append("rect")
          .attr("x", c.x + 1)
          .attr("y", c.y + 1)
          .attr("width", c.w - 2)
          .attr("height", c.h - 2)
          .attr("rx", 13)
          .attr("fill", c.type === "subsection" ? p.subsection : p.container)
          .attr("fill-opacity", c.type === "subsection" ? 0.5 : 0.8)
          .attr("class", "container-fill");

        // Dashed marching border
        var border = grp
          .append("rect")
          .attr("x", c.x)
          .attr("y", c.y)
          .attr("width", c.w)
          .attr("height", c.h)
          .attr("rx", 14)
          .attr("fill", "none")
          .attr("stroke", tc)
          .attr("stroke-width", 1.2)
          .attr("stroke-opacity", 0.55)
          .attr("stroke-dasharray", "12,10")
          .attr("class", "container-glow arch-zone");

        // Label
        grp
          .append("text")
          .attr("x", c.x + 16)
          .attr("y", c.y + c.h - 16)
          .attr("fill", tc)
          .attr("fill-opacity", 0.7)
          .attr("font-size", 11)
          .attr("font-weight", 600)
          .attr("font-family", "ui-monospace, monospace")
          .attr("letter-spacing", "1px")
          .attr("class", "zone-label")
          .text((c.label || "").toUpperCase());

        // Zone hover highlight
        border
          .on("mouseenter", function () {
            border.attr("stroke-opacity", 0.95);
          })
          .on("mouseleave", function () {
            border.attr("stroke-opacity", 0.55);
          });
      });
    }

    // ─── Links ─────────────────────────────────────────
    var lg = g.append("g").attr("class", "links");
    var linkNodes = [];

    data.links.forEach(function (link, li) {
      var src = lookup[link.source];
      var tgt = lookup[link.target];
      if (!src || !tgt) return;

      var scx = src.x + src.w / 2,
        scy = src.y + src.h / 2;
      var tcx = tgt.x + tgt.w / 2,
        tcy = tgt.y + tgt.h / 2;

      var p1 = rectEdge(src, tcx, tcy);
      var p2 = rectEdge(tgt, scx, scy);

      var d = curvePath(p1.x, p1.y, p2.x, p2.y);
      var isAnimated = !!link.animated;
      var style = link.style || "solid";
      var flow = FLOW_COLORS[link.color] || null;
      var isResp = style === "dashed";

      var stroke = flow ? flow : isAnimated ? p.linkAnimated : p.link;
      var strokeWidth = isAnimated ? 2 : 1.5;
      var dashArray = style === "dashed" ? "6,5" : style === "dotted" ? "2,5" : "none";

      // Hit area
      lg.append("path")
        .attr("d", d)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 12);

      // Visible path
      var pathEl = lg
        .append("path")
        .attr("d", d)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-dasharray", dashArray)
        .attr("stroke-opacity", flow ? 0.9 : 0.6)
        .attr("marker-end", "url(#" + arrowId(link.color, isResp) + ")")
        .attr("class", "arch-link")
        .attr("data-flow", link.color || "")
        .attr("data-style", style)
        .attr("data-anim", isAnimated ? "1" : "0")
        .attr("data-link-idx", li)
        .attr("data-link-key", link.source + "-" + link.target);

      linkNodes.push(pathEl);

      // Label
      if (link.label) {
        var pEl = pathEl.node();
        try {
          var len = pEl.getTotalLength();
          var mid = pEl.getPointAtLength(len / 2);
          var lw = link.label.length * 6.5 + 12;
          lg.append("rect")
            .attr("x", mid.x - lw / 2)
            .attr("y", mid.y - 9)
            .attr("width", lw)
            .attr("height", 18)
            .attr("rx", 4)
            .attr("fill", p.page)
            .attr("fill-opacity", 0.85)
            .attr("class", "link-label-bg");
          lg.append("text")
            .attr("x", mid.x)
            .attr("y", mid.y + 4)
            .attr("text-anchor", "middle")
            .attr("fill", flow ? flow : p.subtext)
            .attr("font-size", 10)
            .attr("font-family", "ui-monospace, monospace")
            .attr("class", "link-label")
            .text(link.label);
        } catch (_) {}
      }

      // Link hover highlight
      pathEl
        .on("mouseenter", function () {
          var ni = { nodes: {}, links: {} };
          ni.nodes[link.source] = 1;
          ni.nodes[link.target] = 1;
          ni.links[li] = 1;
          applyNeighborFocus(ni, true);
        })
        .on("mouseleave", function () {
          applyNeighborFocus(null, false);
        });
    });

    // ─── Neighbor index ────────────────────────────────
    var neighborIndex = {};
    data.links.forEach(function (link, li) {
      [link.source, link.target].forEach(function (id) {
        if (!neighborIndex[id]) neighborIndex[id] = { nodes: {}, links: {} };
        neighborIndex[id].nodes[link.source] = 1;
        neighborIndex[id].nodes[link.target] = 1;
        neighborIndex[id].links[li] = 1;
      });
    });

    function getNeighbors(id) {
      var ni = neighborIndex[id];
      if (!ni) return { nodes: {}, links: {} };
      var nodeSet = {};
      Object.keys(ni.nodes).forEach(function (k) {
        nodeSet[k] = 1;
      });
      nodeSet[id] = 1;
      return { nodes: nodeSet, links: ni.links };
    }

    function applyNeighborFocus(neighbors, isActive) {
      ng.selectAll(".arch-node").each(function () {
        var selfId = this.getAttribute("data-id");
        var on = isActive && neighbors.nodes[selfId];
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", on ? 1 : isActive ? 0.22 : 1);
      });
      lg.selectAll(".arch-link").each(function () {
        var idx = parseInt(this.getAttribute("data-link-idx"), 10);
        var on = isActive && neighbors.links[idx];
        var baseOpacity = this.getAttribute("data-flow") ? 0.9 : 0.6;
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke-opacity", on ? 1 : isActive ? 0.06 : baseOpacity);
      });
    }

    // ─── Nodes ─────────────────────────────────────────
    var ng = g.append("g").attr("class", "nodes");

    data.nodes.forEach(function (n) {
      var s = nodeSize(n);
      n.w = s.w;
      n.h = s.h;
      var tc = typeColor(p, n.type);
      var grp = ng.append("g").attr("class", "arch-node").attr("data-id", n.id);
      grp.attr("data-layer", n.layer || "");

      // Shadow
      grp
        .append("rect")
        .attr("x", n.x + 2)
        .attr("y", n.y + 2)
        .attr("width", n.w)
        .attr("height", n.h)
        .attr("rx", 8)
        .attr("fill", "rgba(0,0,0,0.25)")
        .attr("filter", "url(#glow)");

      // Background
      grp
        .append("rect")
        .attr("x", n.x)
        .attr("y", n.y)
        .attr("width", n.w)
        .attr("height", n.h)
        .attr("rx", 8)
        .attr("fill", p.node)
        .attr("stroke", p.nodeBorder)
        .attr("stroke-width", 1)
        .attr("class", "node-bg");

      // Left accent bar
      grp
        .append("rect")
        .attr("x", n.x + 2)
        .attr("y", n.y + 6)
        .attr("width", 3)
        .attr("height", n.h - 12)
        .attr("rx", 1.5)
        .attr("fill", tc)
        .attr("class", "node-accent");

      // Icon
      grp
        .append("text")
        .attr("x", n.x + 16)
        .attr("y", n.y + n.h / 2 + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", 14)
        .attr("class", "node-icon")
        .text(iconGlyph(n));

      // Label
      var lines = n.label.split("\n");
      var labelGrp = grp
        .append("text")
        .attr("x", n.x + 30)
        .attr("y", n.y + n.h / 2)
        .attr("fill", p.text)
        .attr("font-size", 12)
        .attr("font-weight", 600)
        .attr("font-family", "system-ui, sans-serif")
        .attr("dominant-baseline", "central")
        .attr("class", "node-label");
      labelGrp
        .selectAll("tspan")
        .data(lines)
        .enter()
        .append("tspan")
        .attr("x", n.x + 30)
        .attr("dy", function (_, i) {
          return i === 0 ? 0 : 14;
        })
        .text(function (d) {
          return d;
        });

      // Pulse dot
      if (n.type === "env" || n.id === "workflow-engine" || n.id === "k8s-container") {
        grp
          .append("circle")
          .attr("cx", n.x + n.w - 12)
          .attr("cy", n.y + 12)
          .attr("r", 4)
          .attr("fill", tc)
          .attr("class", "pulse-dot");
      }

      // Hover: neighbor highlight
      grp
        .on("mouseenter", function () {
          applyNeighborFocus(getNeighbors(n.id), true);
        })
        .on("mouseleave", function () {
          applyNeighborFocus(null, false);
        });
    });

    // ─── Root outline ──────────────────────────────────
    (function () {
      var xs = [], ys = [], xe = [], ye = [];
      (data.nodes || []).forEach(function (nn) {
        xs.push(nn.x); ys.push(nn.y); xe.push(nn.x + nn.w); ye.push(nn.y + nn.h);
      });
      (data.containers || []).forEach(function (cc) {
        xs.push(cc.x); ys.push(cc.y); xe.push(cc.x + cc.w); ye.push(cc.y + cc.h);
      });
      if (!xs.length) return;
      var x0 = Math.min.apply(null, xs),
        y0 = Math.min.apply(null, ys),
        x1 = Math.max.apply(null, xe),
        y1 = Math.max.apply(null, ye);
      bg
        .append("rect")
        .attr("x", x0 - 15)
        .attr("y", y0 - 28)
        .attr("width", x1 - x0 + 30)
        .attr("height", y1 - y0 + 43)
        .attr("rx", 18)
        .attr("fill", "none")
        .attr("stroke", p.linkAnimated)
        .attr("stroke-opacity", 0.15)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "10,9")
        .attr("pointer-events", "none")
        .attr("class", "root-outline");
    })();

    // ─── Legend (bottom-right overlay) ─────────────────
    var legendG = g
      .append("g")
      .attr("class", "arch-legend")
      .attr("pointer-events", "none");

    function buildLegend() {
      legendG.selectAll("*").remove();
      var lp = P();

      var sections = [
        {
          title: "NODES",
          items: ["env", "app", "data", "vpc", "obs", "infra"].map(function (
            t
          ) {
            return { label: TYPE_NAMES[t] || t, color: typeColor(lp, t) };
          }),
        },
        {
          title: "FLOWS",
          items: Object.keys(FLOW_COLORS).map(function (k) {
            return { label: FLOW_NAMES[k] || k, color: FLOW_COLORS[k] };
          }),
        },
      ];

      var pad = 10;
      var swatch = 10;
      var rowH = 17;
      var gap = 6;
      var headerH = 14;
      var colGap = 22;
      var fontSize = 10;

      var x = 0;
      var totalW = 0;
      var totalH = headerH + sections[0].items.length * rowH + pad * 2;

      var cols = [];
      sections.forEach(function (sec) {
        var col = { title: sec.title, items: [] };
        var w = 0;
        sec.items.forEach(function (it) {
          var t = legendG
            .append("text")
            .attr("class", "legend-sample")
            .attr("font-family", "ui-monospace, monospace")
            .attr("font-size", fontSize)
            .attr("opacity", 0)
            .text(it.label);
          var tw = 0;
          try {
            tw = t.node().getBBox().width;
          } catch (_) {}
          t.remove();
          col.items.push({ label: it.label, color: it.color, w: tw });
          if (tw > w) w = tw;
        });
        col.w = w;
        cols.push(col);
      });

      cols.forEach(function (col, ci) {
        var cx = x;
        x += col.w + swatch + gap + colGap;
        totalW = x;
      });
      totalW -= colGap - pad * 2;
      totalW += pad * 2;

      var bg = legendG
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", totalW)
        .attr("height", totalH)
        .attr("rx", 8)
        .attr("fill", lp.tooltipBg)
        .attr("stroke", lp.nodeBorder)
        .attr("stroke-width", 1)
        .attr("class", "legend-bg");

      var ox = pad;
      cols.forEach(function (col, ci) {
        var colX = ox;
        legendG
          .append("text")
          .attr("x", colX)
          .attr("y", pad + 2)
          .attr("font-family", "ui-monospace, monospace")
          .attr("font-size", 9)
          .attr("font-weight", 700)
          .attr("letter-spacing", "1px")
          .attr("fill", lp.subtext)
          .attr("class", "legend-title")
          .text(col.title);
        col.items.forEach(function (it, ii) {
          var iy = pad + headerH + ii * rowH;
          legendG
            .append("rect")
            .attr("x", colX)
            .attr("y", iy - 7)
            .attr("width", swatch)
            .attr("height", swatch)
            .attr("rx", 3)
            .attr("fill", it.color)
            .attr("class", "legend-swatch");
          legendG
            .append("text")
            .attr("x", colX + swatch + gap)
            .attr("y", iy)
            .attr("font-family", "ui-monospace, monospace")
            .attr("font-size", fontSize)
            .attr("fill", lp.text)
            .attr("class", "legend-label")
            .text(it.label);
        });
        ox += col.w + swatch + gap + colGap;
      });

      legendG.attr(
        "transform",
        "translate(" + (1070 - totalW) + "," + (700 - totalH) + ")"
      );
    }
    buildLegend();

    // ─── Particle Animation ────────────────────────────
    var particles = [];
    data.links.forEach(function (link) {
      if (!link.animated) return;
      var pathEl = svg.select('[data-link-key="' + link.source + "-" + link.target + '"]');
      if (pathEl.empty()) return;
      var pNode = pathEl.node();
      var len;
      try {
        len = pNode.getTotalLength();
      } catch (_) {
        return;
      }
      if (!len || len < 1) return;

      var src = lookup[link.source];
      var tc = p.linkAnimated;
      var srcNode = data.nodes.find(function (n) {
        return n.id === link.source;
      });
      if (srcNode) tc = typeColor(p, srcNode.type);

      var dot1 = g
        .append("circle")
        .attr("r", 3.5)
        .attr("fill", tc)
        .attr("filter", "url(#glow)")
        .attr("class", "particle");
      particles.push({
        el: dot1.node(),
        path: pNode,
        len: len,
        progress: Math.random(),
        speed: 1 / (2200 + Math.random() * 1200),
      });

      var dot2 = g
        .append("circle")
        .attr("r", 2)
        .attr("fill", tc)
        .attr("opacity", 0.4)
        .attr("class", "particle");
      particles.push({
        el: dot2.node(),
        path: pNode,
        len: len,
        progress: (Math.random() + 0.4) % 1,
        speed: 1 / (2800 + Math.random() * 1500),
      });
    });

    var lastTime = performance.now();
    var rafId;

    function tick(time) {
      var dt = time - lastTime;
      lastTime = time;
      for (var i = 0; i < particles.length; i++) {
        var pa = particles[i];
        pa.progress = (pa.progress + pa.speed * dt) % 1;
        var t = Math.max(0, Math.min(1, pa.progress));
        try {
          var pt = pa.path.getPointAtLength(t * pa.len);
          pa.el.setAttribute("cx", pt.x);
          pa.el.setAttribute("cy", pt.y);
        } catch (_) {}
      }
      rafId = requestAnimationFrame(tick);
    }
    if (particles.length > 0) {
      rafId = requestAnimationFrame(tick);
    }

    // ─── Pulse Animation ───────────────────────────────
    var pulseInterval = setInterval(function () {
      svg
        .selectAll(".pulse-dot")
        .transition()
        .duration(600)
        .attr("r", 6)
        .attr("opacity", 0.5)
        .transition()
        .duration(600)
        .attr("r", 4)
        .attr("opacity", 1);
    }, 2500);

    // ─── Zone dash march (fallback for CSS-less browsers) ─
    var zoneOffset = 0;
    var zoneInterval = setInterval(function () {
      zoneOffset = (zoneOffset + 0.4) % (12 + 10);
      svg.selectAll(".arch-zone").attr("stroke-dashoffset", zoneOffset);
    }, 90);

    // Cleanup on removal
    container._archCleanup = function () {
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(pulseInterval);
      clearInterval(zoneInterval);
      if (mutationObserver) mutationObserver.disconnect();
    };

    // ─── Theme Sync ────────────────────────────────────
    var mutationObserver;
    function syncTheme() {
      var np = P();
      svg.style("background", np.page);

      defs.select("#arrow path").attr("fill", np.link);
      defs.select("#arrow-ani path").attr("fill", np.linkAnimated);

      svg.selectAll(".arch-container").each(function () {
        var el = d3.select(this);
        var cid = this.getAttribute("data-zone-id");
        var c = (data.containers || []).find(function (c2) {
          return c2.id === cid;
        });
        if (!c) return;
        var tc = containerColor(np, c.type);
        el.select(".container-fill").attr(
          "fill",
          c.type === "subsection" ? np.subsection : np.container
        );
        el.select(".arch-zone").attr("stroke", tc);
        el.selectAll(".zone-label").attr("fill", tc);
      });

      svg.selectAll(".arch-link").attr("stroke", function () {
        var flow = this.getAttribute("data-flow");
        if (flow && FLOW_COLORS[flow]) return FLOW_COLORS[flow];
        var key = this.getAttribute("data-link-key");
        var found = data.links.find(function (l) {
          return l.source + "-" + l.target === key;
        });
        var anim = this.getAttribute("data-anim") === "1";
        return anim ? np.linkAnimated : np.link;
      });

      svg.selectAll(".link-label-bg").attr("fill", np.page);
      svg.selectAll(".link-label").attr("fill", np.subtext);

      svg.selectAll(".arch-node").each(function () {
        var id = this.getAttribute("data-id");
        var n = data.nodes.find(function (n2) {
          return n2.id === id;
        });
        if (!n) return;
        var tc = typeColor(np, n.type);
        d3.select(this)
          .select(".node-bg")
          .attr("fill", np.node)
          .attr("stroke", np.nodeBorder);
        d3.select(this).select(".node-accent").attr("fill", tc);
        d3.select(this).selectAll(".node-label").attr("fill", np.text);
        d3.select(this).selectAll(".pulse-dot").attr("fill", tc);
      });

      buildLegend();
    }

    mutationObserver = new MutationObserver(syncTheme);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // ─── Zoom to fit ───────────────────────────────────
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    (data.nodes || []).forEach(function (n) {
      var b = lookup[n.id];
      if (n.x < x0) x0 = n.x;
      if (n.y < y0) y0 = n.y;
      if (b.x + b.w > x1) x1 = b.x + b.w;
      if (b.y + b.h > y1) y1 = b.y + b.h;
    });
    (data.containers || []).forEach(function (c) {
      if (c.x < x0) x0 = c.x;
      if (c.y < y0) y0 = c.y;
      if (c.x + c.w > x1) x1 = c.x + c.w;
      if (c.y + c.h > y1) y1 = c.y + c.h;
    });
    if (x0 === Infinity) {
      x0 = 0; y0 = 0; x1 = 1100; y1 = 830;
    }
    var pad = 30;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    var cw = x1 - x0, ch = y1 - y0;
    var s = Math.max(0.3, Math.min(W / cw, H / ch, 3));
    var tx = (W - cw * s) / 2 - x0 * s;
    var ty = (H - ch * s) / 2 - y0 * s;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(s));

    container.classList.add("arch-ready");
  }

  // ─── Init ────────────────────────────────────────────
  function init() {
    document.querySelectorAll(".d3-architecture").forEach(render);
  }
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
