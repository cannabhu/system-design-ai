"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";

import { NodeShape } from "@/components/editor/node-shape";
import { cn } from "@/lib/utils";
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas";

const MIN_NODE_WIDTH = 60;
const MIN_NODE_HEIGHT = 40;
const LABEL_PLACEHOLDER = "Label";
const HANDLE_SIDES = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const;

export function CanvasNodeRenderer({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const palette =
    NODE_COLORS.find((color) => color.fill === data.color) ??
    DEFAULT_NODE_COLOR;

  useEffect(() => {
    if (!isEditing) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isEditing]);

  // Grow the textarea with its content so it stays centered over the label.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!isEditing || !textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [isEditing, data.label]);

  const isEmpty = data.label.length === 0;

  return (
    <>
      <NodeResizer
        isVisible={selected && !isEditing}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        handleClassName="!size-2 !rounded-[3px] !border !border-brand !bg-base"
        lineClassName="!border-brand/30"
      />
      <NodeToolbar isVisible={selected} position={Position.Top} offset={12}>
        <div
          className="nodrag nopan nowheel flex items-center gap-1.5 rounded-xl border border-surface-border bg-elevated px-2 py-1.5 shadow-lg"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {NODE_COLORS.map((color) => {
            const isActive = color.fill === palette.fill;
            return (
              <button
                key={color.fill}
                type="button"
                aria-label={`Set node color ${color.fill}`}
                aria-pressed={isActive}
                onClick={() => updateNodeData(id, { color: color.fill })}
                style={
                  {
                    backgroundColor: color.fill,
                    borderColor: color.text,
                    color: color.text,
                    "--swatch-glow": color.text,
                  } as React.CSSProperties
                }
                className={cn(
                  "size-5 cursor-pointer rounded-full border transition-shadow hover:shadow-[0_0_4px_1px_var(--swatch-glow)]",
                  isActive
                    ? "ring-2 ring-offset-2 ring-offset-elevated"
                    : "opacity-70 hover:opacity-100",
                )}
              />
            );
          })}
        </div>
      </NodeToolbar>
      <div className="group relative h-full w-full">
        {HANDLE_SIDES.map((side) => (
          <Handle
            key={side.id}
            id={side.id}
            type="source"
            position={side.position}
            className="!size-2.5 !border !border-base !bg-white opacity-0 transition-opacity group-hover:opacity-100"
          />
        ))}
        <NodeShape
          shape={data.shape}
          fill={palette.fill}
          textColor={palette.text}
          selected={selected}
        >
          <span
            className={
              isEditing
                ? "invisible"
                : isEmpty
                  ? "opacity-40"
                  : undefined
            }
          >
            {isEmpty ? LABEL_PLACEHOLDER : data.label}
          </span>
        </NodeShape>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            rows={1}
            value={data.label}
            placeholder={LABEL_PLACEHOLDER}
            onChange={(event) => updateNodeData(id, { label: event.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Escape") setIsEditing(false);
            }}
            style={{ color: palette.text }}
            className="nodrag nopan nowheel absolute top-1/2 left-0 w-full -translate-y-1/2 resize-none overflow-hidden bg-transparent px-3 text-center text-sm outline-none placeholder:text-current placeholder:opacity-40"
          />
        ) : (
          <div
            className="absolute inset-x-[10%] inset-y-[20%]"
            onDoubleClick={() => setIsEditing(true)}
          />
        )}
      </div>
    </>
  );
}
