import { MarkerType } from "@xyflow/react";

import { DEFAULT_SHAPE_SIZES } from "@/lib/canvas-shapes";
import {
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type Side = "top" | "right" | "bottom" | "left";

const EDGE_COLOR = "#f8fafc";

const COLOR = {
  neutral: NODE_COLORS[0].fill,
  blue: NODE_COLORS[1].fill,
  purple: NODE_COLORS[2].fill,
  orange: NODE_COLORS[3].fill,
  red: NODE_COLORS[4].fill,
  pink: NODE_COLORS[5].fill,
  green: NODE_COLORS[6].fill,
  teal: NODE_COLORS[7].fill,
};

function node(
  id: string,
  shape: CanvasNodeShape,
  label: string,
  x: number,
  y: number,
  color: string,
): CanvasNode {
  const { width, height } = DEFAULT_SHAPE_SIZES[shape];
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: { label, color, shape },
  };
}

function link(
  source: string,
  target: string,
  sourceHandle: Side = "right",
  targetHandle: Side = "left",
  label?: string,
): CanvasEdge {
  return {
    id: `edge-${source}-${target}`,
    type: "canvasEdge",
    source,
    target,
    sourceHandle,
    targetHandle,
    ...(label ? { data: { label } } : {}),
    style: {
      stroke: EDGE_COLOR,
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
  };
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "Clients reach independent services through an API gateway, each with its own datastore.",
  nodes: [
    node("client", "pill", "Client", 0, 190, COLOR.neutral),
    node("gateway", "hexagon", "API Gateway", 240, 180, COLOR.purple),
    node("users", "rectangle", "User Service", 520, 0, COLOR.blue),
    node("orders", "rectangle", "Order Service", 520, 190, COLOR.blue),
    node("payments", "rectangle", "Payment Service", 520, 380, COLOR.blue),
    node("users-db", "cylinder", "Users DB", 800, -10, COLOR.green),
    node("orders-db", "cylinder", "Orders DB", 800, 180, COLOR.green),
    node("payments-db", "cylinder", "Payments DB", 800, 370, COLOR.green),
  ],
  edges: [
    link("client", "gateway"),
    link("gateway", "users"),
    link("gateway", "orders"),
    link("gateway", "payments"),
    link("users", "users-db"),
    link("orders", "orders-db"),
    link("payments", "payments-db"),
  ],
};

const cicdPipeline: CanvasTemplate = {
  id: "ci-cd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "Commits trigger a build and test run, then deploy to staging and production after a gate.",
  nodes: [
    node("commit", "circle", "Commit", 0, 10, COLOR.neutral),
    node("build", "rectangle", "Build", 220, 30, COLOR.blue),
    node("test", "rectangle", "Test", 440, 30, COLOR.blue),
    node("approve", "diamond", "Approved?", 660, 10, COLOR.orange),
    node("staging", "rectangle", "Deploy Staging", 920, 30, COLOR.purple),
    node("production", "rectangle", "Deploy Production", 1140, 30, COLOR.green),
    node("registry", "cylinder", "Artifact Registry", 220, 220, COLOR.teal),
    node("fix", "pill", "Notify & Fix", 440, 220, COLOR.red),
  ],
  edges: [
    link("commit", "build"),
    link("build", "test"),
    link("test", "approve"),
    link("approve", "staging", "right", "left", "yes"),
    link("staging", "production"),
    link("build", "registry", "bottom", "top"),
    link("approve", "fix", "bottom", "right", "no"),
  ],
};

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "Producers publish events to a broker, and independent consumers react to them asynchronously.",
  nodes: [
    node("orders", "rectangle", "Order Service", 0, 40, COLOR.blue),
    node("inventory", "rectangle", "Inventory Service", 0, 240, COLOR.blue),
    node("broker", "hexagon", "Event Broker", 300, 130, COLOR.purple),
    node("billing", "rectangle", "Billing Consumer", 580, 0, COLOR.orange),
    node("notify", "rectangle", "Notification Consumer", 580, 160, COLOR.orange),
    node("analytics", "rectangle", "Analytics Consumer", 580, 320, COLOR.orange),
    node("store", "cylinder", "Event Store", 860, 320, COLOR.green),
  ],
  edges: [
    link("orders", "broker", "right", "left", "publish"),
    link("inventory", "broker", "right", "left", "publish"),
    link("broker", "billing", "right", "left", "subscribe"),
    link("broker", "notify", "right", "left", "subscribe"),
    link("broker", "analytics", "right", "left", "subscribe"),
    link("analytics", "store"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservices,
  cicdPipeline,
  eventDriven,
];
