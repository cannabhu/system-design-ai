"use client";

import type { NodeProps } from "@xyflow/react";

import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  type CanvasNode,
} from "@/types/canvas";

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  const palette =
    NODE_COLORS.find((color) => color.fill === data.color) ??
    DEFAULT_NODE_COLOR;

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-xl border border-surface-border px-3 text-center text-sm"
      style={{ backgroundColor: palette.fill, color: palette.text }}
    >
      {data.label}
    </div>
  );
}
