import type { CanvasNodeShape } from "@/types/canvas";

export interface ShapeSize {
  width: number;
  height: number;
}

export interface ShapeDragPayload extends ShapeSize {
  shape: CanvasNodeShape;
}

export const SHAPE_DRAG_MIME = "application/x-canvas-shape";

export const DEFAULT_SHAPE_SIZES: Record<CanvasNodeShape, ShapeSize> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 160, height: 120 },
  circle: { width: 100, height: 100 },
  pill: { width: 160, height: 64 },
  cylinder: { width: 120, height: 100 },
  hexagon: { width: 140, height: 120 },
};

export function parseShapeDragPayload(raw: string): ShapeDragPayload | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { shape } = value as Record<string, unknown>;
    if (
      typeof shape !== "string" ||
      !Object.prototype.hasOwnProperty.call(DEFAULT_SHAPE_SIZES, shape)
    ) {
      return null;
    }
    const size = DEFAULT_SHAPE_SIZES[shape as CanvasNodeShape];
    return { shape: shape as CanvasNodeShape, width: size.width, height: size.height };
  } catch {
    return null;
  }
}
