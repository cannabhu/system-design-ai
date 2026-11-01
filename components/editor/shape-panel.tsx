"use client";

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
import { NODE_SHAPES, type CanvasNodeShape } from "@/types/canvas";

const SHAPE_ICONS: Record<CanvasNodeShape, LucideIcon> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: RectangleHorizontal,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

export function ShapePanel() {
  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    shape: CanvasNodeShape,
  ) {
    const payload: ShapeDragPayload = { shape, ...DEFAULT_SHAPE_SIZES[shape] };
    event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
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
