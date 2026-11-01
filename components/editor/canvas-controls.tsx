"use client";

import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ZoomInstance } from "@/hooks/useKeyboardShortcuts";

const ZOOM_DURATION = 200;

interface ControlButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

function ControlButton({
  label,
  icon: Icon,
  onClick,
  disabled,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-brand disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

interface CanvasControlsProps {
  reactFlow: ZoomInstance;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function CanvasControls({
  reactFlow,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: CanvasControlsProps) {
  return (
    <div className="pointer-events-auto absolute bottom-6 left-6 z-20 flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 backdrop-blur">
      <ControlButton
        label="Zoom out"
        icon={ZoomOut}
        onClick={() => reactFlow.zoomOut({ duration: ZOOM_DURATION })}
      />
      <ControlButton
        label="Fit view"
        icon={Maximize}
        onClick={() => reactFlow.fitView({ duration: ZOOM_DURATION })}
      />
      <ControlButton
        label="Zoom in"
        icon={ZoomIn}
        onClick={() => reactFlow.zoomIn({ duration: ZOOM_DURATION })}
      />
      <div aria-hidden className="mx-1 h-5 w-px bg-surface-border" />
      <ControlButton
        label="Undo"
        icon={Undo2}
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ControlButton
        label="Redo"
        icon={Redo2}
        onClick={onRedo}
        disabled={!canRedo}
      />
    </div>
  );
}
