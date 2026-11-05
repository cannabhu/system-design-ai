"use client";

import { useRef } from "react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  RectangleHorizontal,
  Square,
  type LucideIcon,
} from "lucide-react";

import {
  DEFAULT_SHAPE_SIZES,
  SHAPE_DRAG_MIME,
  type ShapeDragPayload,
} from "@/lib/canvas-shapes";
import { NodeShape } from "@/components/editor/node-shape";
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  type CanvasNodeShape,
} from "@/types/canvas";

const SHAPE_ICONS: Record<CanvasNodeShape, LucideIcon> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: RectangleHorizontal,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

export function ShapePanel() {
  const ghostRefs = useRef<Partial<Record<CanvasNodeShape, HTMLDivElement>>>(
    {},
  );

  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    shape: CanvasNodeShape,
  ) {
    const payload: ShapeDragPayload = { shape, ...DEFAULT_SHAPE_SIZES[shape] };
    event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";

    // The node lands with its top-left at the cursor, so anchor the ghost there.
    const ghost = ghostRefs.current[shape];
    if (ghost) event.dataTransfer.setDragImage(ghost, 0, 0);
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 sm:bottom-6 flex justify-center">
      <div aria-hidden className="pointer-events-none fixed -top-[9999px] left-0">
        {NODE_SHAPES.map((shape) => {
          const { width, height } = DEFAULT_SHAPE_SIZES[shape];
          return (
            <div
              key={shape}
              ref={(element) => {
                if (element) ghostRefs.current[shape] = element;
                else delete ghostRefs.current[shape];
              }}
              className="opacity-60"
              style={{ width, height }}
            >
              <NodeShape
                shape={shape}
                fill={DEFAULT_NODE_COLOR.fill}
                textColor={DEFAULT_NODE_COLOR.text}
              />
            </div>
          );
        })}
      </div>
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 backdrop-blur">
        {NODE_SHAPES.map((shape) => {
          const Icon = SHAPE_ICONS[shape];
          return (
            <button
              key={shape}
              type="button"
              draggable
              aria-label={`Drag ${shape} onto the canvas`}
              title={shape}
              onDragStart={(event) => handleDragStart(event, shape)}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-brand active:cursor-grabbing"
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
