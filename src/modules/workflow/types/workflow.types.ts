import type { Edge, Node, Viewport } from "reactflow";

export type WorkflowNodeType =
  | "aiNode"
  | "httpNode"
  | "delayNode"
  | "webhookNode"
  | "startNode"
  | "endNode";

export type PracticalNodeType = 'start' | 'webhook' | 'ai' | 'http' | 'delay' | 'end';

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

export interface ExecutionStepRecord {
  id: string;
  nodeId: string;
  status?: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  error?: string;
  output?: Record<string, unknown>;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt?: string;
  completedAt?: string;
  steps?: ExecutionStepRecord[];
}

export interface ExecutionPayload {
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface NodeConfig {
  id: string;
  type: PracticalNodeType;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface EdgeConfig {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: Record<string, unknown>;
  label?: string;
}

export interface WorkflowNodes {
  nodes: NodeConfig[];
  edges: EdgeConfig[];
}
