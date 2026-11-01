"use client";

import { useCallback, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";

import { CanvasControls } from "@/components/editor/canvas-controls";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import { useStarterTemplates } from "@/components/editor/starter-templates-context";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SHAPE_DRAG_MIME, parseShapeDragPayload } from "@/lib/canvas-shapes";
import {
  DEFAULT_NODE_COLOR,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes: NodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes: EdgeTypes = { canvasEdge: CanvasEdgeRenderer };

const EDGE_COLOR = "#f8fafc";

function CanvasFlowInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = reactFlow;
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const nodeCounter = useRef(0);

  useKeyboardShortcuts({ reactFlow, undo, redo });

  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge: CanvasEdge = {
        id: `edge-${Date.now()}-${connection.source}-${connection.target}`,
        type: "canvasEdge",
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        style: {
          stroke: EDGE_COLOR,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
      };
      onEdgesChange([{ type: "add", item: edge }]);
    },
    [onEdgesChange],
  );

  const { isOpen: isTemplatesOpen, setOpen: setTemplatesOpen } =
    useStarterTemplates();

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      // Clear the current canvas first, then add the template, all through the
      // shared Liveblocks flow state so collaborators see the replacement.
      onEdgesChange(edges.map((edge) => ({ type: "remove", id: edge.id })));
      onNodesChange(nodes.map((node) => ({ type: "remove", id: node.id })));
      onNodesChange(template.nodes.map((item) => ({ type: "add", item })));
      onEdgesChange(template.edges.map((item) => ({ type: "add", item })));
      setTimeout(() => reactFlow.fitView({ duration: 200 }), 50);
    },
    [edges, nodes, onEdgesChange, onNodesChange, reactFlow],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME);
      if (!raw) return;
      event.preventDefault();

      const payload = parseShapeDragPayload(raw);
      if (!payload) return;

      nodeCounter.current += 1;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const node: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounter.current}`,
        type: "canvasNode",
        position,
        width: payload.width,
        height: payload.height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.fill,
          shape: payload.shape,
        },
      };
      onNodesChange([{ type: "add", item: node }]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <CanvasControls
        reactFlow={reactFlow}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      <ShapePanel />
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={handleImportTemplate}
      />
    </div>
  );
}

export function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner />
    </ReactFlowProvider>
  );
}
