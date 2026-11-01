"use client";

import { AppDialog } from "@/components/ui/app-dialog";
import { Button } from "@/components/ui/button";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { DEFAULT_SHAPE_SIZES } from "@/lib/canvas-shapes";
import { NODE_COLORS, type CanvasNode } from "@/types/canvas";

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 140;
const PREVIEW_PADDING = 12;

const SHAPE_POINTS: Record<string, string> = {
  diamond: "0.5,0 1,0.5 0.5,1 0,0.5",
  hexagon: "0.18,0 0.82,0 1,0.5 0.82,1 0.18,1 0,0.5",
};

function nodeSize(node: CanvasNode) {
  const fallback = DEFAULT_SHAPE_SIZES[node.data.shape];
  return {
    width: node.width ?? fallback.width,
    height: node.height ?? fallback.height,
  };
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const boxes = template.nodes.map((node) => ({
    node,
    ...node.position,
    ...nodeSize(node),
  }));
  if (boxes.length === 0) return null;

  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));

  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / (maxX - minX),
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / (maxY - minY),
  );
  const offsetX = (PREVIEW_WIDTH - (maxX - minX) * scale) / 2 - minX * scale;
  const offsetY = (PREVIEW_HEIGHT - (maxY - minY) * scale) / 2 - minY * scale;

  const placed = new Map(
    boxes.map((b) => [
      b.node.id,
      {
        x: b.x * scale + offsetX,
        y: b.y * scale + offsetY,
        width: b.width * scale,
        height: b.height * scale,
        node: b.node,
      },
    ]),
  );

  return (
    <svg
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      className="rounded-2xl bg-base"
      aria-hidden
    >
      {template.edges.map((edge) => {
        const from = placed.get(edge.source);
        const to = placed.get(edge.target);
        if (!from || !to) return null;
        return (
          <line
            key={edge.id}
            x1={from.x + from.width / 2}
            y1={from.y + from.height / 2}
            x2={to.x + to.width / 2}
            y2={to.y + to.height / 2}
            stroke="#8b8b8b"
            strokeWidth={1}
          />
        );
      })}
      {[...placed.values()].map(({ x, y, width, height, node }) => {
        const { shape, color } = node.data;
        const palette =
          NODE_COLORS.find((c) => c.fill === color) ?? NODE_COLORS[0];
        const common = {
          fill: palette.fill,
          stroke: palette.text,
          strokeOpacity: 0.7,
          strokeWidth: 1,
        };

        if (shape === "circle") {
          return (
            <ellipse
              key={node.id}
              cx={x + width / 2}
              cy={y + height / 2}
              rx={width / 2}
              ry={height / 2}
              {...common}
            />
          );
        }
        const points = SHAPE_POINTS[shape];
        if (points) {
          return (
            <polygon
              key={node.id}
              points={points
                .split(" ")
                .map((pair) => {
                  const [px, py] = pair.split(",").map(Number);
                  return `${x + px * width},${y + py * height}`;
                })
                .join(" ")}
              {...common}
            />
          );
        }
        const radius =
          shape === "pill" ? height / 2 : shape === "cylinder" ? 4 : 3;
        return (
          <rect
            key={node.id}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={radius}
            {...common}
          />
        );
      })}
    </svg>
  );
}

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Starter templates"
      description="Start from a pre-built diagram. Importing replaces everything on the current canvas."
      className="sm:max-w-3xl"
    >
      <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        {CANVAS_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-3"
          >
            <div className="flex justify-center">
              <TemplatePreview template={template} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-copy-primary">
                {template.name}
              </h3>
              <p className="mt-1 text-xs text-copy-muted">
                {template.description}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleImport(template)}
            >
              Import
            </Button>
          </div>
        ))}
      </div>
    </AppDialog>
  );
}
