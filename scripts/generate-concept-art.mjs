// Original engineering diagrams in crisp monochrome with dotted theme elements.
// All diagrams match the Departure Mono, crisp dotted-border, high-contrast black on white theme.
// Regenerate from the project root: node scripts/generate-concept-art.mjs
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const destination = fileURLToPath(
  new URL("../public/illustrations/", import.meta.url),
);
fs.mkdirSync(destination, { recursive: true });

const ink = "#000000";
const white = "#ffffff";
const font = "Departure Mono, ui-monospace, monospace";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const text = (
  x,
  y,
  content,
  {
    size = 11,
    weight = "normal",
    anchor = "start",
    fill = ink,
    letterSpacing = "0px",
  } = {},
) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" stroke="none" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${esc(content)}</text>`;

const dottedBox = (
  x,
  y,
  w,
  h,
  { fill = white, stroke = ink, strokeWidth = 1.5, dash = "3 3" } = {},
) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dash}" />`;

const solidBox = (
  x,
  y,
  w,
  h,
  { fill = white, stroke = ink, strokeWidth = 1.5 } = {},
) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

const dottedLine = (
  x1,
  y1,
  x2,
  y2,
  { stroke = ink, strokeWidth = 1.5, dash = "3 3" } = {},
) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dash}" />`;

const solidLine = (x1, y1, x2, y2, { stroke = ink, strokeWidth = 1.5 } = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

const dottedArrowH = (x1, y, x2) => {
  const line = dottedLine(x1, y, x2 - 5, y, { dash: "3 3" });
  const arrow = `<polygon points="${x2 - 6},${y - 4} ${x2},${y} ${x2 - 6},${y + 4}" fill="${ink}" stroke="none" />`;
  return `${line}${arrow}`;
};

const dottedArrowV = (x, y1, y2) => {
  const line = dottedLine(x, y1, x, y2 - 5, { dash: "3 3" });
  const arrow = `<polygon points="${x - 4},${y2 - 6} ${x},${y2} ${x + 4},${y2 - 6}" fill="${ink}" stroke="none" />`;
  return `${line}${arrow}`;
};

const crosshair = (x, y, s = 4) =>
  `<path d="M${x - s} ${y}h${s * 2}M${x} ${y - s}v${s * 2}" stroke="${ink}" stroke-width="1" stroke-linecap="square" />`;

const gridDots = (w, h, step = 24) => {
  let dots = "";
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      dots += `<rect x="${x}" y="${y}" width="1" height="1" fill="${ink}" opacity="0.18" />`;
    }
  }
  return dots;
};

const outerFrame = (w, h, titleBadge = "") => {
  let out = solidBox(0, 0, w, h, {
    fill: white,
    stroke: ink,
    strokeWidth: 1.5,
  });
  out += dottedBox(6, 6, w - 12, h - 12, {
    fill: "none",
    stroke: ink,
    strokeWidth: 1,
    dash: "2 4",
  });
  out += crosshair(14, 14);
  out += crosshair(w - 14, 14);
  out += crosshair(14, h - 14);
  out += crosshair(w - 14, h - 14);
  if (titleBadge) {
    out += solidBox(20, 0, 180, 20, { fill: ink, stroke: ink });
    out += text(28, 14, titleBadge, {
      size: 10,
      fill: white,
      weight: "bold",
      letterSpacing: "1px",
    });
  }
  return out;
};

const drawings = [
  {
    id: "engineering-desk",
    width: 1200,
    height: 410,
    title: "Deadline driven technical preparation engine blueprint.",
    draw: () => {
      let out = gridDots(1200, 410, 30);
      out += outerFrame(1200, 410, "PRECAP // BLUEPRINT v1.0");

      // Top info bar
      out += text(220, 14, "STATUS: ONLINE · PIPELINE: ACTIVE · LATENCY: 0ms", {
        size: 10,
        fill: ink,
        letterSpacing: "1px",
      });
      out += text(1170, 14, "[ SPEC // 2026 ]", {
        size: 10,
        fill: ink,
        anchor: "end",
        letterSpacing: "1px",
      });
      out += solidLine(6, 32, 1194, 32, { strokeWidth: 1 });

      // 5 Sequential Architecture Stage Blocks
      const stages = [
        {
          num: "01",
          name: "LANGUAGE",
          sub: "TYPES & RUNTIMES",
          metric: "GO · PY · JS · C++",
          x: 40,
          w: 200,
        },
        {
          num: "02",
          name: "ALGORITHMS",
          sub: "DATA STRUCTURES",
          metric: "15 PATTERNS · O(N)",
          x: 270,
          w: 200,
        },
        {
          num: "03",
          name: "SYSTEM BASICS",
          sub: "PROTOCOLS & DATA",
          metric: "ACID · CACHE · RPC",
          x: 500,
          w: 200,
        },
        {
          num: "04",
          name: "LOW-LEVEL DESIGN",
          sub: "OOP & CONTRACTS",
          metric: "15 REAL EXERCISES",
          x: 730,
          w: 200,
        },
        {
          num: "05",
          name: "HIGH-LEVEL DESIGN",
          sub: "DISTRIBUTED ARCH",
          metric: "15 BLUEPRINTS",
          x: 960,
          w: 200,
        },
      ];

      stages.forEach((st, i) => {
        // Stage card
        out += solidBox(st.x, 60, st.w, 180, {
          fill: white,
          stroke: ink,
          strokeWidth: 1.5,
        });
        out += solidBox(st.x, 60, st.w, 28, { fill: ink, stroke: ink });
        out += text(st.x + 10, 78, `[ ${st.num} ] ${st.name}`, {
          size: 11,
          fill: white,
          weight: "bold",
          letterSpacing: "1px",
        });
        out += dottedBox(st.x + 8, 96, st.w - 16, 90, {
          fill: "none",
          stroke: ink,
          strokeWidth: 1,
          dash: "2 3",
        });
        out += text(st.x + 16, 120, st.sub, { size: 11, weight: "bold" });
        out += dottedLine(st.x + 16, 132, st.x + st.w - 24, 132);
        out += text(st.x + 16, 150, st.metric, { size: 10 });
        out += solidBox(st.x + 16, 162, 70, 16, {
          fill: white,
          stroke: ink,
          strokeWidth: 1,
        });
        out += text(st.x + 22, 174, "READY", { size: 9, weight: "bold" });

        // Connector arrow to next stage
        if (i < stages.length - 1) {
          out += dottedArrowH(st.x + st.w, 150, st.x + st.w + 30);
        }
      });

      // Bottom Terminal & Data Flow Register Area
      out += solidBox(40, 260, 1120, 120, {
        fill: white,
        stroke: ink,
        strokeWidth: 1.5,
      });
      out += solidBox(40, 260, 1120, 24, { fill: ink, stroke: ink });
      out += text(50, 276, "SYSTEM REGISTERS // PREPARATION EXECUTION BUS", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });
      out += text(1140, 276, "OK [200]", {
        size: 10,
        fill: white,
        anchor: "end",
        weight: "bold",
      });

      // Columns inside the terminal block
      out += text(60, 310, "$ precap --verify --all", {
        size: 12,
        weight: "bold",
      });
      out += text(60, 330, "> 37 test suites passed without mutation", {
        size: 11,
      });
      out += text(
        60,
        350,
        "> In-browser compiler workers loaded: Pyodide · Go Wasip1 · Clang WASM · Java",
        { size: 11 },
      );

      out += dottedLine(650, 290, 650, 370, { strokeWidth: 1 });

      out += text(670, 310, "CURRICULUM METRICS:", {
        size: 11,
        weight: "bold",
      });
      out += text(670, 330, "· 692 Static Pages Prerendered", { size: 11 });
      out += text(670, 350, "· 0 External Trackers · 100% Offline Capable", {
        size: 11,
      });

      out += dottedBox(950, 296, 190, 68, {
        fill: white,
        stroke: ink,
        strokeWidth: 1.5,
        dash: "2 2",
      });
      out += text(965, 320, "TARGET READINESS", {
        size: 10,
        weight: "bold",
        letterSpacing: "1px",
      });
      out += text(965, 345, "100.0% VERIFIED", { size: 13, weight: "bold" });

      return out;
    },
  },
  {
    id: "machine-coding",
    width: 720,
    height: 420,
    title: "Machine coding algorithmic execution schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "TRACK 01 // MACHINE CODING");

      out += text(
        30,
        45,
        "PIPELINE: SYNTAX · DATA STRUCTURES · IN-BROWSER EXECUTION",
        { size: 10, letterSpacing: "1px" },
      );

      // Left: Input Array & Pointers
      out += solidBox(30, 70, 260, 150, { fill: white, stroke: ink });
      out += solidBox(30, 70, 260, 26, { fill: ink });
      out += text(42, 88, "INPUT BUFFER: ARRAY SCAN", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      // Array boxes
      const items = ["04", "12", "07", "19", "03", "25"];
      items.forEach((item, i) => {
        const bx = 45 + i * 38;
        out += solidBox(bx, 115, 34, 34, {
          fill: i === 2 ? ink : white,
          stroke: ink,
          strokeWidth: 1.5,
        });
        out += text(bx + 17, 136, item, {
          size: 11,
          fill: i === 2 ? white : ink,
          anchor: "middle",
          weight: "bold",
        });
        out += text(bx + 17, 164, `[${i}]`, { size: 9, anchor: "middle" });
      });
      out += text(45 + 2 * 38 + 17, 185, "↑ PTR_L", {
        size: 9,
        anchor: "middle",
        weight: "bold",
      });
      out += text(45 + 5 * 38 + 17, 185, "↑ PTR_R", {
        size: 9,
        anchor: "middle",
        weight: "bold",
      });
      out += text(45, 208, "SLIDING WINDOW · O(N) TIME", {
        size: 10,
        weight: "bold",
      });

      // Connector Arrow
      out += dottedArrowH(290, 145, 330);

      // Right: Binary Tree / Graph Structure
      out += solidBox(330, 70, 360, 150, { fill: white, stroke: ink });
      out += solidBox(330, 70, 360, 26, { fill: ink });
      out += text(342, 88, "STRUCTURE: BINARY SEARCH TREE", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      // Tree nodes
      const drawNode = (nx, ny, val, isKey = false) => {
        let node = solidBox(nx - 20, ny - 14, 40, 28, {
          fill: isKey ? ink : white,
          stroke: ink,
          strokeWidth: 1.5,
        });
        node += text(nx, ny + 5, val, {
          size: 11,
          fill: isKey ? white : ink,
          anchor: "middle",
          weight: "bold",
        });
        return node;
      };

      out += dottedLine(510, 115, 430, 155);
      out += dottedLine(510, 115, 590, 155);
      out += dottedLine(430, 155, 390, 195);
      out += dottedLine(430, 155, 470, 195);

      out += drawNode(510, 115, "12", true);
      out += drawNode(430, 155, "07");
      out += drawNode(590, 155, "19");
      out += drawNode(390, 195, "03");
      out += drawNode(470, 195, "09");

      // Bottom: Execution Harness & Assertions
      out += solidBox(30, 245, 660, 145, { fill: white, stroke: ink });
      out += solidBox(30, 245, 660, 26, { fill: ink });
      out += text(42, 263, "TEST RUNNER // NATIVE WASM WORKER SUITE", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      out += text(50, 300, "$ test_runner --track dsa --problem 01-arrays", {
        size: 11,
        weight: "bold",
      });
      out += text(50, 322, "  ✓ test_empty_array               (0.2ms)", {
        size: 10,
      });
      out += text(50, 340, "  ✓ test_duplicate_keys            (0.4ms)", {
        size: 10,
      });
      out += text(50, 358, "  ✓ test_extreme_boundary_values   (0.7ms)", {
        size: 10,
      });

      out += dottedBox(480, 285, 190, 90, {
        fill: white,
        stroke: ink,
        strokeWidth: 1.5,
        dash: "2 2",
      });
      out += text(500, 315, "ASSERTIONS", {
        size: 10,
        weight: "bold",
        letterSpacing: "1px",
      });
      out += text(500, 340, "ALL PASSED", { size: 14, weight: "bold" });
      out += text(500, 360, "15/15 CHECKS OK", { size: 10 });

      return out;
    },
  },
  {
    id: "system-basics",
    width: 720,
    height: 420,
    title: "System design basics network, cache and database schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "TRACK 02 // SYSTEM DESIGN BASICS");

      out += text(
        30,
        45,
        "FOUNDATIONS: REQUEST PATH · IDEMPOTENCY · CACHING · REPLICATION",
        { size: 10, letterSpacing: "1px" },
      );

      // Diagram Blocks
      // 1. Client
      out += solidBox(30, 80, 130, 120, { fill: white, stroke: ink });
      out += solidBox(30, 80, 130, 24, { fill: ink });
      out += text(40, 96, "CLIENT", { size: 10, fill: white, weight: "bold" });
      out += text(40, 125, "POST /checkout", { size: 10, weight: "bold" });
      out += text(40, 145, "Idem-Key: 9f4a", { size: 9 });
      out += text(40, 165, "Timeout: 2500ms", { size: 9 });
      out += text(40, 185, "TLS 1.3 / HTTP2", { size: 9 });

      out += dottedArrowH(160, 140, 205);

      // 2. Gateway / Reverse Proxy
      out += solidBox(205, 80, 140, 120, { fill: white, stroke: ink });
      out += solidBox(205, 80, 140, 24, { fill: ink });
      out += text(215, 96, "GATEWAY / LB", {
        size: 10,
        fill: white,
        weight: "bold",
      });
      out += text(215, 125, "Rate Limiting", { size: 10 });
      out += text(215, 145, "Token Bucket", { size: 9 });
      out += text(215, 165, "Circuit Breaker", { size: 9 });
      out += text(215, 185, "TCP Termination", { size: 9 });

      out += dottedArrowH(345, 140, 390);

      // 3. Application Server
      out += solidBox(390, 80, 140, 120, { fill: white, stroke: ink });
      out += solidBox(390, 80, 140, 24, { fill: ink });
      out += text(400, 96, "APP SERVICE", {
        size: 10,
        fill: white,
        weight: "bold",
      });
      out += text(400, 125, "State Machine", { size: 10 });
      out += text(400, 145, "Idempotent Check", { size: 9 });
      out += text(400, 165, "TX Coordination", { size: 9 });
      out += text(400, 185, "Outbox Emit", { size: 9 });

      // App to Cache (Dotted V)
      out += dottedArrowV(460, 200, 250);

      // App to DB (Dotted H)
      out += dottedArrowH(530, 140, 575);

      // 4. Primary Database
      out += solidBox(575, 80, 115, 120, { fill: white, stroke: ink });
      out += solidBox(575, 80, 115, 24, { fill: ink });
      out += text(585, 96, "POSTGRES DB", {
        size: 10,
        fill: white,
        weight: "bold",
      });
      out += text(585, 125, "WAL Commit", { size: 10 });
      out += text(585, 145, "Row Lock", { size: 9 });
      out += text(585, 165, "ACID Boundary", { size: 9 });
      out += text(585, 185, "Serializability", { size: 9 });

      // Lower Layer: Cache & Replica DB
      out += solidBox(390, 250, 140, 130, { fill: white, stroke: ink });
      out += solidBox(390, 250, 140, 24, { fill: ink });
      out += text(400, 266, "REDIS CACHE", {
        size: 10,
        fill: white,
        weight: "bold",
      });
      out += text(400, 295, "Key: idem:9f4a", { size: 10 });
      out += text(400, 315, "TTL: 86400s", { size: 9 });
      out += text(400, 335, "Cache-Aside", { size: 9 });
      out += text(400, 355, "Memory: 1.2 GB", { size: 9 });

      out += solidBox(575, 250, 115, 130, { fill: white, stroke: ink });
      out += solidBox(575, 250, 115, 24, { fill: ink });
      out += text(585, 266, "ASYNC REPLICA", {
        size: 10,
        fill: white,
        weight: "bold",
      });
      out += text(585, 295, "Streaming WAL", { size: 10 });
      out += text(585, 315, "Read Scaling", { size: 9 });
      out += text(585, 335, "Replica Lag: 4ms", { size: 9 });
      out += text(585, 355, "Eventual Sync", { size: 9 });

      out += dottedArrowV(632, 200, 250);

      // Bottom info note
      out += dottedBox(30, 250, 335, 130, {
        fill: white,
        stroke: ink,
        strokeWidth: 1.5,
        dash: "2 2",
      });
      out += text(45, 280, "MECHANISM LESSON CONCEPTS", {
        size: 10,
        weight: "bold",
        letterSpacing: "1px",
      });
      out += text(45, 305, "1. Requests and protocols (HTTP/REST/gRPC)", {
        size: 10,
      });
      out += text(45, 325, "2. Cache races and stampede prevention", {
        size: 10,
      });
      out += text(45, 345, "3. Outbox pattern & guaranteed delivery", {
        size: 10,
      });
      out += text(45, 365, "4. Database transactions and isolation", {
        size: 10,
      });

      return out;
    },
  },
  {
    id: "low-level-design",
    width: 720,
    height: 420,
    title: "Low-level design UML interface and state invariants schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "TRACK 03 // LOW-LEVEL DESIGN");

      out += text(
        30,
        45,
        "OBJECT MODELING: CONTRACTS · PATTERNS · EXTENSIBILITY · INVARIANTS",
        { size: 10, letterSpacing: "1px" },
      );

      // Interface Card
      out += solidBox(30, 75, 290, 130, { fill: white, stroke: ink });
      out += solidBox(30, 75, 290, 24, { fill: ink });
      out += text(40, 91, "<<interface>> IParkingStrategy", {
        size: 10,
        fill: white,
        weight: "bold",
      });
      out += text(40, 120, "+ findSpot(vehicle: Vehicle): Spot", { size: 10 });
      out += text(40, 140, "+ calculateFee(ticket: Ticket): Money", {
        size: 10,
      });
      out += text(40, 160, "+ releaseSpot(spot: Spot): void", { size: 10 });
      out += dottedLine(30, 172, 320, 172);
      out += text(40, 190, "INVARIANT: No double-allocation of Spot", {
        size: 9,
        weight: "bold",
      });

      // Realizations below
      out += dottedArrowV(100, 205, 240);
      out += dottedArrowV(240, 205, 240);

      out += solidBox(30, 240, 135, 135, { fill: white, stroke: ink });
      out += solidBox(30, 240, 135, 22, { fill: ink });
      out += text(40, 255, "CompactStrategy", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(40, 280, "- spots: Set[Spot]", { size: 9 });
      out += text(40, 300, "+ findSpot()", { size: 9 });
      out += text(40, 320, "+ calculateFee()", { size: 9 });
      out += text(40, 340, "// Closest spot", { size: 8 });
      out += text(40, 358, "O(1) Allocation", { size: 8, weight: "bold" });

      out += solidBox(185, 240, 135, 135, { fill: white, stroke: ink });
      out += solidBox(185, 240, 135, 22, { fill: ink });
      out += text(195, 255, "EvStrategy", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(195, 280, "- chargers: Map", { size: 9 });
      out += text(195, 300, "+ findSpot()", { size: 9 });
      out += text(195, 320, "+ calculateFee()", { size: 9 });
      out += text(195, 340, "// Power quota", { size: 8 });
      out += text(195, 358, "Kilowatt Metering", { size: 8, weight: "bold" });

      // State Transition Diagram on Right
      out += solidBox(355, 75, 335, 300, { fill: white, stroke: ink });
      out += solidBox(355, 75, 335, 24, { fill: ink });
      out += text(365, 91, "STATE MACHINE: PARKING TICKET LIFECYCLE", {
        size: 10,
        fill: white,
        weight: "bold",
      });

      const statePill = (sx, sy, label) => {
        let p = solidBox(sx, sy, 160, 32, {
          fill: white,
          stroke: ink,
          strokeWidth: 1.5,
        });
        p += text(sx + 80, sy + 20, label, {
          size: 10,
          anchor: "middle",
          weight: "bold",
        });
        return p;
      };

      out += statePill(440, 120, "[ 1 ] CREATED");
      out += dottedArrowV(520, 152, 185);
      out += text(530, 172, "vehicle.enter()", { size: 9 });

      out += statePill(440, 185, "[ 2 ] ACTIVE_OCCUPIED");
      out += dottedArrowV(520, 217, 250);
      out += text(530, 237, "payment.process()", { size: 9 });

      out += statePill(440, 250, "[ 3 ] PAID_SETTLED");
      out += dottedArrowV(520, 282, 315);
      out += text(530, 302, "gate.open()", { size: 9 });

      out += statePill(440, 315, "[ 4 ] CLOSED_EXIT");

      return out;
    },
  },
  {
    id: "high-level-design",
    width: 720,
    height: 420,
    title: "High-level design distributed system architecture schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "TRACK 04 // HIGH-LEVEL DESIGN");

      out += text(
        30,
        45,
        "SCALE: GLOBAL EDGE · PARTITIONING · EVENT LOG · STORAGE TIERS",
        { size: 10, letterSpacing: "1px" },
      );

      // Edge Layer
      out += solidBox(30, 80, 110, 130, { fill: white, stroke: ink });
      out += solidBox(30, 80, 110, 24, { fill: ink });
      out += text(40, 96, "GLOBAL EDGE", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(40, 125, "Anycast DNS", { size: 9 });
      out += text(40, 145, "CDN Cache", { size: 9 });
      out += text(40, 165, "WAF Shield", { size: 9 });
      out += text(40, 185, "100k QPS Load", { size: 9, weight: "bold" });

      out += dottedArrowH(140, 145, 180);

      // API Gateway & Service Cluster
      out += solidBox(180, 80, 150, 130, { fill: white, stroke: ink });
      out += solidBox(180, 80, 150, 24, { fill: ink });
      out += text(190, 96, "API GATEWAY CLUSTER", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(190, 125, "JWT Auth Token", { size: 9 });
      out += text(190, 145, "Consistent Hash", { size: 9 });
      out += text(190, 165, "gRPC Service Mesh", { size: 9 });
      out += text(190, 185, "Circuit Breakers", { size: 9 });

      out += dottedArrowH(330, 145, 370);

      // Event Broker (Kafka)
      out += solidBox(370, 80, 140, 130, { fill: white, stroke: ink });
      out += solidBox(370, 80, 140, 24, { fill: ink });
      out += text(380, 96, "KAFKA EVENT LOG", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(380, 125, "Topic: writes.v1", { size: 9 });
      out += text(380, 145, "Partitions: 32", { size: 9 });
      out += text(380, 165, "Replica Factor: 3", { size: 9 });
      out += text(380, 185, "Ordered Append", { size: 9, weight: "bold" });

      out += dottedArrowH(510, 145, 550);

      // Database Shards
      out += solidBox(550, 80, 140, 130, { fill: white, stroke: ink });
      out += solidBox(550, 80, 140, 24, { fill: ink });
      out += text(560, 96, "SHARDED STORAGE", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(560, 125, "Shard 00 [A-H]", { size: 9 });
      out += text(560, 145, "Shard 01 [I-P]", { size: 9 });
      out += text(560, 165, "Shard 02 [Q-Z]", { size: 9 });
      out += text(560, 185, "Paxos Consensus", { size: 9 });

      // Lower Architecture: Observability & Tradeoffs
      out += solidBox(30, 240, 660, 145, { fill: white, stroke: ink });
      out += solidBox(30, 240, 660, 24, { fill: ink });
      out += text(42, 256, "TRADE-OFF MATRIX // CAP & SLO DEFENSE", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      const cols = [
        {
          title: "CONSISTENCY (PACELC)",
          line1: "Strict serializable writes",
          line2: "Bounded staleness read replica",
          line3: "Raft leader consensus",
          x: 50,
        },
        {
          title: "PARTITION TOLERANCE",
          line1: "Network split heartbeat detection",
          line2: "Split-brain fencing tokens",
          line3: "Graceful degraded read mode",
          x: 270,
        },
        {
          title: "AVAILABILITY TARGET",
          line1: "99.99% uptime SLO target",
          line2: "P99 latency budget < 45ms",
          line3: "Multi-region fallback routing",
          x: 490,
        },
      ];

      cols.forEach((col, idx) => {
        out += text(col.x, 290, col.title, { size: 9, weight: "bold" });
        out += text(col.x, 310, `· ${col.line1}`, { size: 9 });
        out += text(col.x, 330, `· ${col.line2}`, { size: 9 });
        out += text(col.x, 350, `· ${col.line3}`, { size: 9 });
        if (idx < cols.length - 1) {
          out += dottedLine(col.x + 200, 275, col.x + 200, 365);
        }
      });

      return out;
    },
  },
  {
    id: "frontend",
    width: 720,
    height: 420,
    title:
      "Frontend engineering browser runtime and rendering pipeline schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "ARCADE CARD // FRONTEND ENGINEERING");

      out += text(
        30,
        45,
        "BROWSER ENGINE: PARSER · DOM · CSSOM · RENDER TREE · COMPOSITOR",
        { size: 10, letterSpacing: "1px" },
      );

      // Flow
      out += solidBox(30, 80, 150, 120, { fill: white, stroke: ink });
      out += solidBox(30, 80, 150, 24, { fill: ink });
      out += text(40, 96, "BYTE STREAM & PARSE", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(40, 125, "HTML Tokens", { size: 9 });
      out += text(40, 145, "Speculative Preload", { size: 9 });
      out += text(40, 165, "DOM Node Build", { size: 9 });
      out += text(40, 185, "CSSOM Recalc", { size: 9 });

      out += dottedArrowH(180, 140, 220);

      out += solidBox(220, 80, 150, 120, { fill: white, stroke: ink });
      out += solidBox(220, 80, 150, 24, { fill: ink });
      out += text(230, 96, "LAYOUT & GEOMETRY", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(230, 125, "Box Model Tree", { size: 9 });
      out += text(230, 145, "Viewport Sizing", { size: 9 });
      out += text(230, 165, "Reflow Cost: O(N)", { size: 9, weight: "bold" });
      out += text(230, 185, "Stacking Context", { size: 9 });

      out += dottedArrowH(370, 140, 410);

      out += solidBox(410, 80, 140, 120, { fill: white, stroke: ink });
      out += solidBox(410, 80, 140, 24, { fill: ink });
      out += text(420, 96, "PAINT & RASTER", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(420, 125, "Draw DisplayList", { size: 9 });
      out += text(420, 145, "Bitmap Generation", { size: 9 });
      out += text(420, 165, "GPU Tiles Allocation", { size: 9 });
      out += text(420, 185, "Layer Promotion", { size: 9 });

      out += dottedArrowH(550, 140, 590);

      out += solidBox(590, 80, 100, 120, { fill: white, stroke: ink });
      out += solidBox(590, 80, 100, 24, { fill: ink });
      out += text(600, 96, "GPU SCREEN", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(600, 125, "Compositor", { size: 9 });
      out += text(600, 145, "vsync 60Hz", { size: 9, weight: "bold" });
      out += text(600, 165, "Frame: 16ms", { size: 9 });
      out += text(600, 185, "0 JANK", { size: 9, weight: "bold" });

      // Lower Stage: Event Loop & Hydration
      out += solidBox(30, 235, 660, 150, { fill: white, stroke: ink });
      out += solidBox(30, 235, 660, 24, { fill: ink });
      out += text(42, 251, "EVENT LOOP & WORKER CONCURRENCY // 3 MODULES", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      out += text(50, 285, "MODULE 01: BROWSER FOUNDATIONS", {
        size: 10,
        weight: "bold",
      });
      out += text(
        50,
        305,
        "· DOM node manipulation & synthetic event dispatching",
        { size: 9 },
      );
      out += text(
        50,
        325,
        "· Microtasks (Promise) vs Macrotasks (setTimeout / I/O)",
        { size: 9 },
      );
      out += text(
        50,
        345,
        "· Web workers, SharedArrayBuffer & structured clone",
        { size: 9 },
      );

      out += dottedLine(360, 270, 360, 370);

      out += text(380, 285, "MODULE 02 & 03: ARCHITECTURE & DELIVERY", {
        size: 10,
        weight: "bold",
      });
      out += text(
        380,
        305,
        "· Partial hydration and streaming server rendering (RSC)",
        { size: 9 },
      );
      out += text(
        380,
        325,
        "· Offline sync, indexedDB schema migrations, cache leases",
        { size: 9 },
      );
      out += text(
        380,
        345,
        "· Core Web Vitals: LCP, INP, CLS budgeting and attribution",
        { size: 9 },
      );

      return out;
    },
  },
  {
    id: "backend",
    width: 720,
    height: 420,
    title: "Backend engineering execution and data correctness schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "ARCADE CARD // BACKEND ENGINEERING");

      out += text(
        30,
        45,
        "SYSTEM: RPC PROTOCOLS · CONCURRENCY · TRANSACTIONS · OUTBOX ENGINE",
        { size: 10, letterSpacing: "1px" },
      );

      // Top Diagram: RPC Request through Outbox
      out += solidBox(30, 80, 150, 130, { fill: white, stroke: ink });
      out += solidBox(30, 80, 150, 24, { fill: ink });
      out += text(40, 96, "RPC WORKER POOL", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(40, 125, "Thread Isolation", { size: 9 });
      out += text(40, 145, "Context Cancellation", { size: 9 });
      out += text(40, 165, "Deadline: 1500ms", { size: 9 });
      out += text(40, 185, "Backpressure Queue", { size: 9, weight: "bold" });

      out += dottedArrowH(180, 145, 220);

      out += solidBox(220, 80, 150, 130, { fill: white, stroke: ink });
      out += solidBox(220, 80, 150, 24, { fill: ink });
      out += text(230, 96, "TX ATOMIC BOUNDARY", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(230, 125, "BEGIN TRANSACTION", { size: 9, weight: "bold" });
      out += text(230, 145, "Update account balance", { size: 9 });
      out += text(230, 165, "INSERT INTO outbox", { size: 9, weight: "bold" });
      out += text(230, 185, "COMMIT TRANSACTION", { size: 9, weight: "bold" });

      out += dottedArrowH(370, 145, 410);

      out += solidBox(410, 80, 140, 130, { fill: white, stroke: ink });
      out += solidBox(410, 80, 140, 24, { fill: ink });
      out += text(420, 96, "RELATIONAL WAL", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(420, 125, "Fsync durability", { size: 9 });
      out += text(420, 145, "CDC Debezium log", { size: 9 });
      out += text(420, 165, "Exactly-once write", { size: 9, weight: "bold" });
      out += text(420, 185, "Zero dual-write bug", { size: 9 });

      out += dottedArrowH(550, 145, 590);

      out += solidBox(590, 80, 100, 130, { fill: white, stroke: ink });
      out += solidBox(590, 80, 100, 24, { fill: ink });
      out += text(600, 96, "BROKER", { size: 9, fill: white, weight: "bold" });
      out += text(600, 125, "RabbitMQ", { size: 9 });
      out += text(600, 145, "Kafka PubSub", { size: 9 });
      out += text(600, 165, "Ack / Nack", { size: 9 });
      out += text(600, 185, "Dead-Letter", { size: 9 });

      // Lower Section: Architecture modules
      out += solidBox(30, 240, 660, 145, { fill: white, stroke: ink });
      out += solidBox(30, 240, 660, 24, { fill: ink });
      out += text(42, 256, "CORE CURRICULUM TOPICS // PRODUCTION BACKEND", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      out += text(50, 290, "MODULE 01: REQUESTS & EXECUTION", {
        size: 10,
        weight: "bold",
      });
      out += text(
        50,
        310,
        "· HTTP/2 framing, gRPC streaming, protoc generation",
        { size: 9 },
      );
      out += text(
        50,
        330,
        "· Worker thread pools, epoll event loops, non-blocking I/O",
        { size: 9 },
      );
      out += text(
        50,
        350,
        "· Token-bucket rate limiting, circuit breakers & bulkhead isolation",
        { size: 9 },
      );

      out += dottedLine(360, 275, 360, 370);

      out += text(380, 290, "MODULE 02 & 03: DATA & OPERATIONS", {
        size: 10,
        weight: "bold",
      });
      out += text(
        380,
        310,
        "· Isolation levels: Read Committed vs Repeatable Read vs Serializable",
        { size: 9 },
      );
      out += text(
        380,
        330,
        "· Distributed transactions, 2-phase commit & Saga compensation",
        { size: 9 },
      );
      out += text(
        380,
        350,
        "· Graceful shutdown, connection drain & zero-downtime schema roll",
        { size: 9 },
      );

      return out;
    },
  },
  {
    id: "devops",
    width: 720,
    height: 420,
    title: "DevOps and SRE infrastructure and reconcile loop schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "ARCADE CARD // DEVOPS & SRE");

      out += text(
        30,
        45,
        "INFRASTRUCTURE: CONTAINERS · ORCHESTRATION · RECONCILE LOOP · TRAFFIC",
        { size: 10, letterSpacing: "1px" },
      );

      // Reconcile Loop Diagram
      out += solidBox(30, 80, 140, 130, { fill: white, stroke: ink });
      out += solidBox(30, 80, 140, 24, { fill: ink });
      out += text(40, 96, "DESIRED (GIT)", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(40, 125, "GitOps Manifest", { size: 9 });
      out += text(40, 145, "kind: Deployment", { size: 9, weight: "bold" });
      out += text(40, 165, "replicas: 4", { size: 9 });
      out += text(40, 185, "image: tag-v2.1", { size: 9 });

      out += dottedArrowH(170, 145, 210);

      out += solidBox(210, 80, 150, 130, { fill: white, stroke: ink });
      out += solidBox(210, 80, 150, 24, { fill: ink });
      out += text(220, 96, "K8S RECONCILER", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(220, 125, "Observe World", { size: 9 });
      out += text(220, 145, "Diff Desired State", { size: 9, weight: "bold" });
      out += text(220, 165, "Actuate Mutation", { size: 9 });
      out += text(220, 185, "Status: Reconciled", { size: 9 });

      out += dottedArrowH(360, 145, 400);

      out += solidBox(400, 80, 140, 130, { fill: white, stroke: ink });
      out += solidBox(400, 80, 140, 24, { fill: ink });
      out += text(410, 96, "ACTUAL PODS", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(410, 125, "Pod 01: [ RUNNING ]", { size: 9 });
      out += text(410, 145, "Pod 02: [ RUNNING ]", { size: 9 });
      out += text(410, 165, "Pod 03: [ RUNNING ]", { size: 9 });
      out += text(410, 185, "Pod 04: [ RUNNING ]", { size: 9 });

      out += dottedArrowH(540, 145, 580);

      out += solidBox(580, 80, 110, 130, { fill: white, stroke: ink });
      out += solidBox(580, 80, 110, 24, { fill: ink });
      out += text(590, 96, "CANARY INGRESS", {
        size: 9,
        fill: white,
        weight: "bold",
      });
      out += text(590, 125, "95% -> v2.0", { size: 9 });
      out += text(590, 145, "05% -> v2.1", { size: 9, weight: "bold" });
      out += text(590, 165, "Error < 0.01%", { size: 9 });
      out += text(590, 185, "Auto-Rollback", { size: 9 });

      // Lower Section
      out += solidBox(30, 240, 660, 145, { fill: white, stroke: ink });
      out += solidBox(30, 240, 660, 24, { fill: ink });
      out += text(42, 256, "SRE & RELIABILITY CURRICULUM // 3 MODULES", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      out += text(50, 290, "MODULE 01: PROCESSES & HOSTS", {
        size: 10,
        weight: "bold",
      });
      out += text(
        50,
        310,
        "· Linux cgroups, namespaces, systemd services & signals",
        { size: 9 },
      );
      out += text(
        50,
        330,
        "· Network namespaces, iptables, eBPF packet capture",
        { size: 9 },
      );
      out += text(
        50,
        350,
        "· Disk I/O schedulers, memory cgroup OOM killer dynamics",
        { size: 9 },
      );

      out += dottedLine(360, 275, 360, 370);

      out += text(380, 290, "MODULE 02 & 03: INFRASTRUCTURE & DELIVERY", {
        size: 10,
        weight: "bold",
      });
      out += text(
        380,
        310,
        "· Multi-stage container builds, rootless execution, distroless",
        { size: 9 },
      );
      out += text(
        380,
        330,
        "· Terraform state locks, drift remediation & immutable infra",
        { size: 9 },
      );
      out += text(
        380,
        350,
        "· Zero-downtime blue/green, canary shifts & MTTR reduction",
        { size: 9 },
      );

      return out;
    },
  },
  {
    id: "last-mile-prep",
    width: 720,
    height: 420,
    title: "Last mile prep incident triage and telemetry traces schematic.",
    draw: () => {
      let out = gridDots(720, 420, 20);
      out += outerFrame(720, 420, "ARCADE CARD // LAST MILE PREP");

      out += text(
        30,
        45,
        "LAST MILE: INCIDENT TRIAGE · DISTRIBUTED TRACES · METRICS · PRODUCT MANAGEMENT",
        { size: 10, letterSpacing: "1px" },
      );

      // Trace Waterfall Diagram
      out += solidBox(30, 80, 380, 130, { fill: white, stroke: ink });
      out += solidBox(30, 80, 380, 24, { fill: ink });
      out += text(40, 96, "OPENTELEMETRY TRACE WATERFALL: tx_98fa", {
        size: 9,
        fill: white,
        weight: "bold",
      });

      const spans = [
        { name: "gateway:ingress", x: 45, w: 340, t: "120ms" },
        { name: "auth:verify_jwt", x: 60, w: 60, t: "15ms" },
        { name: "order:create", x: 130, w: 240, t: "95ms" },
        { name: "db:select_balance", x: 140, w: 80, t: "30ms" },
        { name: "stripe:charge_card", x: 230, w: 120, t: "55ms" },
      ];

      spans.forEach((sp, idx) => {
        const sy = 122 + idx * 16;
        out += text(sp.x, sy + 10, sp.name, { size: 8 });
        out += solidBox(sp.x + 105, sy + 2, sp.w - 110, 10, {
          fill: idx === 4 ? ink : white,
          stroke: ink,
          strokeWidth: 1,
        });
        out += text(sp.x + sp.w + 5, sy + 10, sp.t, { size: 8 });
      });

      // Right: Incident Triage Box
      out += solidBox(430, 80, 260, 130, { fill: white, stroke: ink });
      out += solidBox(430, 80, 260, 24, { fill: ink });
      out += text(440, 96, "ALERT: SEV-1 INCIDENT ACTIVE", {
        size: 9,
        fill: white,
        weight: "bold",
      });

      out += text(440, 125, "SIGNAL: P99 Latency > 1500ms", {
        size: 9,
        weight: "bold",
      });
      out += text(440, 145, "ROOT CAUSE: DB connection exhaustion", {
        size: 9,
      });
      out += text(440, 165, "ACTION: Scale pool + drop stale tx", { size: 9 });
      out += dottedLine(430, 175, 690, 175);
      out += text(440, 195, "STATUS: MITIGATED (PAGERDUTY ACK)", {
        size: 9,
        weight: "bold",
      });

      // Lower Section: 3 Modules
      out += solidBox(30, 240, 660, 145, { fill: white, stroke: ink });
      out += solidBox(30, 240, 660, 24, { fill: ink });
      out += text(42, 256, "3 MODULES // INTERVIEW FINAL MILE PREPARATION", {
        size: 10,
        fill: white,
        weight: "bold",
        letterSpacing: "1px",
      });

      out += text(50, 285, "MODULE 01: INCIDENT TRIAGE", {
        size: 10,
        weight: "bold",
      });
      out += text(
        50,
        305,
        "· Production war rooms, paging protocols & blameless postmortems",
        { size: 9 },
      );
      out += text(
        50,
        325,
        "· Grafana, New Relic, Sentry, Honeybadger & stack trace root causing",
        { size: 9 },
      );

      out += dottedLine(360, 275, 360, 370);

      out += text(380, 285, "MODULE 02 & 03: PRODUCT & OBSERVABILITY", {
        size: 10,
        weight: "bold",
      });
      out += text(
        380,
        305,
        "· Product analytics: PostHog, Pendo, GA4 event tagging and cohorts",
        { size: 9 },
      );
      out += text(
        380,
        325,
        "· A/B experimentation, statistical significance & sample ratio mismatch",
        { size: 9 },
      );
      out += text(
        380,
        345,
        "· Metrics, logs, traces pipeline and cost-controlled retention",
        { size: 9 },
      );

      return out;
    },
  },
];

for (const drawing of drawings) {
  const width = drawing.width || 720;
  const height = drawing.height || 420;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${drawing.title.replaceAll("&", "&amp;")}</title><g fill="none">${drawing.draw()}</g></svg>\n`;
  fs.writeFileSync(`${destination}${drawing.id}.svg`, svg);
}
console.log(
  `Generated ${drawings.length} minimal, meaningful, dotted-theme illustrations.`,
);
