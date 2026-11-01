"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";

import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const HIT_AREA_WIDTH = 20;
const LABEL_HINT = "Double-click to label";

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const label = data?.label ?? "";
  const isActive = isHovered || selected || isEditing;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  // Size the input to a hidden mirror of its text so it grows while typing.
  useLayoutEffect(() => {
    const input = inputRef.current;
    const measure = measureRef.current;
    if (!isEditing || !input || !measure) return;
    input.style.width = `${measure.offsetWidth + 4}px`;
  }, [isEditing, label]);

  const stopEditing = () => setIsEditing(false);

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => setIsEditing(true)}
    >
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          opacity: isActive ? 1 : 0.55,
          transition: "opacity 150ms",
        }}
        interactionWidth={HIT_AREA_WIDTH}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDoubleClick={(event) => {
            event.stopPropagation();
            setIsEditing(true);
          }}
        >
          {isEditing ? (
            <>
              <span
                ref={measureRef}
                aria-hidden
                className="invisible absolute px-2 text-xs whitespace-pre"
              >
                {label || " "}
              </span>
              <input
                ref={inputRef}
                value={label}
                onChange={(event) =>
                  updateEdgeData(id, { label: event.target.value })
                }
                onBlur={stopEditing}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === "Enter" || event.key === "Escape") {
                    stopEditing();
                  }
                }}
                className="rounded-xl border border-brand bg-elevated px-2 py-0.5 text-center text-xs text-copy-primary outline-none"
              />
            </>
          ) : label ? (
            <span
              className={cn(
                "block cursor-text rounded-xl border bg-elevated px-2 py-0.5 text-xs text-copy-primary transition-colors",
                isActive ? "border-brand" : "border-surface-border",
              )}
            >
              {label}
            </span>
          ) : isActive ? (
            <span className="block cursor-text rounded-xl px-2 py-0.5 text-xs text-copy-primary opacity-40">
              {LABEL_HINT}
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
}
