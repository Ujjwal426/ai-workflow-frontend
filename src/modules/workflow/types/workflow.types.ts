import type { Edge, Node, Viewport } from "reactflow";

export type WorkflowNodeType =
  | "aiNode"
  | "httpNode"
  | "delayNode"
  | "webhookNode";

export interface WorkflowNodeData {
  title: string;
  description?: string;
  status?: "idle" | "loading" | "success" | "error";
  config?: Record<string, unknown>;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowSnapshot {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: Viewport;
}

export interface WorkflowPayload {
  name: string;
  description?: string;
  workflowJson: WorkflowSnapshot;
}

export interface WorkflowRecord {
  id: string;
  name?: string;
  description?: string;
  status?: "draft" | "active" | "paused" | "error";
  workflowJson?: WorkflowSnapshot;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  viewport?: Viewport;
  createdAt?: string;
  updatedAt?: string;
}
