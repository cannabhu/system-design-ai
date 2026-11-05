import { NODE_COLORS } from "@/types/canvas";

type Palette = (typeof NODE_COLORS)[number];

const GREY = NODE_COLORS[0];
const BLUE = NODE_COLORS[1];
const PURPLE = NODE_COLORS[2];
const ORANGE = NODE_COLORS[3];
const GREEN = NODE_COLORS[6];
const TEAL = NODE_COLORS[7];

type Shape = "rectangle" | "pill" | "diamond" | "cylinder";

interface MockNode {
  id: string;
  label: string;
  shape: Shape;
  x: number;
  y: number;
  w: number;
  h: number;
  color: Palette;
  selected?: boolean;
}

const NODES: MockNode[] = [
  { id: "client", label: "Client", shape: "pill", x: 40, y: 200, w: 130, h: 56, color: BLUE },
  { id: "gateway", label: "API Gateway", shape: "rectangle", x: 250, y: 190, w: 150, h: 76, color: GREY },
  { id: "auth", label: "Auth", shape: "diamond", x: 480, y: 50, w: 150, h: 110, color: ORANGE },
  { id: "orders", label: "Orders", shape: "rectangle", x: 480, y: 190, w: 150, h: 76, color: PURPLE, selected: true },
  { id: "queue", label: "Event Queue", shape: "pill", x: 480, y: 330, w: 150, h: 56, color: TEAL },
  { id: "db", label: "Postgres", shape: "cylinder", x: 720, y: 178, w: 130, h: 100, color: GREEN },
];

// Right-angle (smooth-step style) paths between node handles.
const EDGES = [
  "M170 228 H250",
  "M400 228 H440 V105 H480",
  "M400 228 H480",
  "M400 228 H440 V358 H480",
  "M630 228 H720",
  "M630 358 H785 V278",
];

function ShapeBody({ node }: { node: MockNode }) {
  const { shape, x, y, w, h, color, selected } = node;
  const stroke = selected ? "stroke-brand" : "stroke-surface-border-subtle";
  const common = { className: stroke, strokeWidth: selected ? 2 : 1.5, style: { fill: color.fill } };

  if (shape === "diamond") {
    const pts = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
    return <polygon points={pts} strokeLinejoin="round" {...common} />;
  }
  if (shape === "cylinder") {
    const ry = 12;
    const rx = w / 2;
    const body = `M${x} ${y + ry} A${rx} ${ry} 0 0 1 ${x + w} ${y + ry} V${y + h - ry} A${rx} ${ry} 0 0 1 ${x} ${y + h - ry} Z`;
    return (
      <>
        <path d={body} {...common} />
        <ellipse cx={x + rx} cy={y + ry} rx={rx} ry={ry} className={stroke} strokeWidth={1.5} style={{ fill: color.fill }} />
      </>
    );
  }
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={shape === "pill" ? h / 2 : 16}
      {...common}
    />
  );
}

function MockNodeView({ node, index }: { node: MockNode; index: number }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2 + (node.shape === "cylinder" ? 6 : 0);
  return (
    <g className="hero-node" style={{ "--d": `${index * 110}ms` } as React.CSSProperties}>
      <ShapeBody node={node} />
      {node.selected && (
        <>
          {[
            [node.x, node.y],
            [node.x + node.w, node.y],
            [node.x, node.y + node.h],
            [node.x + node.w, node.y + node.h],
          ].map(([hx, hy]) => (
            <rect
              key={`${hx}-${hy}`}
              x={hx - 4}
              y={hy - 4}
              width={8}
              height={8}
              rx={2}
              className="fill-base stroke-brand"
              strokeWidth={1.5}
            />
          ))}
        </>
      )}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={500}
        style={{ fill: node.color.text }}
      >
        {node.label}
      </text>
    </g>
  );
}

function Avatar({ initials, color }: { initials: string; color: Palette }) {
  return (
    <span
      className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold first:ml-0"
      style={{ backgroundColor: color.fill, color: color.text }}
    >
      {initials}
    </span>
  );
}

export function HeroPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-5xl rounded-3xl border border-surface-border bg-surface p-2 shadow-2xl sm:p-3"
    >
      {/* Editor top bar */}
      <div className="flex h-11 items-center justify-between rounded-2xl border border-surface-border bg-elevated px-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-subtle" />
            <span className="size-2.5 rounded-full bg-subtle" />
            <span className="size-2.5 rounded-full bg-subtle" />
          </div>
          <span className="text-xs font-medium text-copy-secondary">
            Order platform
          </span>
        </div>
        <div className="flex items-center">
          <Avatar initials="AK" color={BLUE} />
          <Avatar initials="MR" color={PURPLE} />
          <Avatar initials="JT" color={ORANGE} />
        </div>
      </div>

      {/* Mock canvas */}
      <div className="mt-2 overflow-hidden rounded-2xl border border-surface-border bg-base">
        <svg
          viewBox="0 0 960 480"
          preserveAspectRatio="xMidYMid slice"
          className="block h-72 w-full sm:h-auto sm:aspect-[2/1]"
          focusable="false"
        >
          <defs>
            <pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" className="fill-surface-border" />
            </pattern>
            <marker
              id="hero-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M1 1 L9 5 L1 9 Z" className="fill-copy-muted" />
            </marker>
          </defs>

          <rect width="960" height="480" fill="url(#hero-dots)" />

          {/* Edges */}
          {EDGES.map((d, i) => (
            <g key={d} style={{ "--d": `${450 + i * 110}ms` } as React.CSSProperties}>
              <path
                d={d}
                pathLength={1}
                fill="none"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hero-edge stroke-copy-muted"
              />
              <path
                d={d}
                fill="none"
                stroke="transparent"
                markerEnd="url(#hero-arrow)"
                className="hero-arrow"
              />
            </g>
          ))}

          {/* Nodes */}
          {NODES.map((node, i) => (
            <MockNodeView key={node.id} node={node} index={i} />
          ))}

          {/* AI chat bubble */}
          <g className="hero-fade" style={{ "--d": "1100ms" } as React.CSSProperties}>
            <rect x="40" y="330" width="330" height="96" rx="18" className="fill-elevated stroke-surface-border" strokeWidth={1.5} />
            <circle cx="68" cy="358" r="12" className="fill-ai" />
            <path d="M68 351 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 z" className="fill-copy-primary" />
            <text x="90" y="362" fontSize={13} fontWeight={600} className="fill-ai-text">
              Grand AI
            </text>
            <text x="58" y="392" fontSize={14} className="fill-copy-secondary">
              Added an event queue between
            </text>
            <text x="58" y="412" fontSize={14} className="fill-copy-secondary">
              Orders and Postgres.
            </text>
          </g>

          {/* Collaborator cursor */}
          <g className="hero-cursor-wrap">
            <g className="hero-cursor" style={{ "--d": "1300ms" } as React.CSSProperties}>
              <path d="M590 262 L590 288 L597 282 L603 295 L609 292 L603 280 L612 280 Z" style={{ fill: PURPLE.text }} stroke="var(--bg-base)" strokeWidth={1} strokeLinejoin="round" />
              <rect x="606" y="294" width="64" height="24" rx="12" style={{ fill: PURPLE.text }} />
              <text x="638" y="306" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} className="fill-base">
                Maya
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
