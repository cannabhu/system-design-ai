"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasEdge, CanvasNode, CanvasSnapshot } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 1500;

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  /** Autosave stays off until the initial load has settled. */
  enabled: boolean;
  /** The initial load failed; surfaced through the "error" save status. */
  loadFailed?: boolean;
}

// Drop per-viewer UI state so selecting or measuring never triggers a save.
function toSnapshot(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasSnapshot {
  return {
    nodes: nodes.map(
      ({ selected, dragging, resizing, measured, ...node }) => node,
    ),
    edges: edges.map(({ selected, ...edge }) => edge),
  };
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
  loadFailed = false,
}: UseCanvasAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const enabledRef = useRef(enabled);
  const latest = useRef({ nodes, edges });
  const lastSaved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latest.current = { nodes, edges };
    enabledRef.current = enabled;
  });

  const save = useCallback(async () => {
    const body = JSON.stringify(
      toSnapshot(latest.current.nodes, latest.current.edges),
    );
    if (body === lastSaved.current) {
      setStatus((current) => (current === "error" ? "saved" : current));
      return;
    }

    setStatus("saving");
    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!response.ok) throw new Error("Save failed");
      lastSaved.current = body;
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [projectId]);

  // The first enabled render is the baseline: only later changes are saved.
  useEffect(() => {
    if (!enabled || lastSaved.current !== null) return;
    lastSaved.current = JSON.stringify(toSnapshot(nodes, edges));
  }, [enabled, nodes, edges]);

  useEffect(() => {
    if (!enabled || lastSaved.current === null) return;
    timer.current = setTimeout(save, AUTOSAVE_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, nodes, edges, save]);

  const saveNow = useCallback(async () => {
    // Manual saves stay blocked until the canvas has loaded successfully, so a
    // failed load can never overwrite the saved snapshot with an empty canvas.
    if (!enabledRef.current || lastSaved.current === null) return;
    if (timer.current) clearTimeout(timer.current);
    await save();
  }, [save]);

  return { status: loadFailed ? "error" : status, saveNow };
}
