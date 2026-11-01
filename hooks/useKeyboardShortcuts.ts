"use client";

import { useEffect } from "react";

interface AnimationOptions {
  duration?: number;
}

export interface ZoomInstance {
  zoomIn: (options?: AnimationOptions) => unknown;
  zoomOut: (options?: AnimationOptions) => unknown;
  fitView: (options?: AnimationOptions) => unknown;
}

const ZOOM_DURATION = 200;

interface UseKeyboardShortcutsOptions {
  reactFlow: ZoomInstance;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (event.metaKey || event.ctrlKey) {
        if (event.altKey) return;
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        } else if (key === "y" && !event.shiftKey) {
          event.preventDefault();
          redo();
        }
        return;
      }

      if (event.altKey) return;

      if (key === "+" || key === "=") {
        event.preventDefault();
        reactFlow.zoomIn({ duration: ZOOM_DURATION });
      } else if (key === "-") {
        event.preventDefault();
        reactFlow.zoomOut({ duration: ZOOM_DURATION });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, undo, redo]);
}
