"use client";

import { useEffect, useRef, useState } from "react";
import type { EdgeChange, NodeChange } from "@xyflow/react";

import type { CanvasEdge, CanvasNode, CanvasSnapshot } from "@/types/canvas";

interface UseCanvasLoadOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
}

/**
 * Loads the saved canvas once, only when the Liveblocks room is empty, so an
 * active collaboration is never overwritten. Returns true once that check has
 * settled (loaded, skipped, or no saved canvas). Stays false if the fetch fails
 * or the response can't be parsed, so autosave stays disabled.
 */
export function useCanvasLoad({
  projectId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: UseCanvasLoadOptions) {
  const [isSettled, setIsSettled] = useState(false);
  const started = useRef(false);
  const latest = useRef({ nodes, edges, onNodesChange, onEdgesChange });
  useEffect(() => {
    latest.current = { nodes, edges, onNodesChange, onEdgesChange };
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const isRoomEmpty = () =>
      latest.current.nodes.length === 0 && latest.current.edges.length === 0;

    if (!isRoomEmpty()) {
      setIsSettled(true);
      return;
    }

    async function load() {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (!response.ok) return;
        const { canvas } = (await response.json()) as {
          canvas: CanvasSnapshot | null;
        };
        // A collaborator may have filled the room while we were fetching.
        if (canvas && isRoomEmpty()) {
          latest.current.onNodesChange(
            canvas.nodes.map((item) => ({ type: "add", item })),
          );
          latest.current.onEdgesChange(
            canvas.edges.map((item) => ({ type: "add", item })),
          );
        }
        setIsSettled(true);
      } catch {
        // Stay unsettled so autosave remains disabled and an empty canvas
        // can't overwrite the saved snapshot we failed to load.
      }
    }
    void load();
  }, [projectId]);

  return isSettled;
}
