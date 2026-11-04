"use client";

import { useContext, useEffect, useRef } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";

import {
  CanvasSnapshotContext,
  type CanvasSnapshot,
} from "@/components/editor/canvas-snapshot-context";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/** Renders nothing. Registers a getter for the live canvas with the sidebar. */
export function CanvasSnapshotBridge() {
  const { register } = useContext(CanvasSnapshotContext);
  const { nodes, edges } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  });
  const latest = useRef<CanvasSnapshot>({ nodes: [], edges: [] });

  useEffect(() => {
    latest.current = {
      nodes: nodes.map((n) => ({
        id: n.id,
        data: { label: n.data?.label, shape: n.data?.shape },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        data: e.data?.label ? { label: e.data.label } : undefined,
      })),
    };
  }, [nodes, edges]);

  useEffect(() => {
    register(() => latest.current);
    return () => register(null);
  }, [register]);

  return null;
}
