import axios from "axios";

import type {
  ExecutionPayload,
  ExecutionRecord,
  ExecutionStepRecord,
  WorkflowNodes,
  WorkflowPayload,
  WorkflowRecord,
  WorkflowValidation,
} from "../types/workflow.types";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const workflowClient = axios.create({
  baseURL: API,
});

export const workflowQueryKeys = {
  all: ["workflows"] as const,
  detail: (id: string) => ["workflows", id] as const,
  executions: (workflowId: string) => ["workflows", workflowId, "executions"] as const,
  execution: (id: string) => ["executions", id] as const,
  validation: (workflowJson: WorkflowNodes) => ["workflows", "validation", workflowJson] as const,
};

export const createWorkflow = async (data: WorkflowPayload) => {
  const response = await workflowClient.post<WorkflowRecord>(
    "/workflows",
    data,
  );

  return response.data;
};

export const getWorkflows = async () => {
  const response = await workflowClient.get<WorkflowRecord[]>("/workflows");

  return response.data;
};

export const getWorkflow = async (id: string) => {
  const response = await workflowClient.get<WorkflowRecord>(`/workflows/${id}`);

  return response.data;
};

export const updateWorkflow = async (id: string, data: WorkflowPayload) => {
  const response = await workflowClient.put<WorkflowRecord>(
    `/workflows/${id}`,
    data,
  );

  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await workflowClient.delete<{ success: boolean }>(
    `/workflows/${id}`,
  );

  return response.data;
};

export const createExecution = async (data: ExecutionPayload) => {
  const response = await workflowClient.post<ExecutionRecord>(
    "/executions",
    data,
  );

  return response.data;
};

export const executeStep = async (
  executionId: string,
  stepId: string,
) => {
  const response = await workflowClient.post<ExecutionStepRecord>(
    `/executions/${executionId}/steps/${stepId}/execute`,
  );

  return response.data;
};

export const cancelExecution = async (executionId: string) => {
  const response = await workflowClient.post<{ success: boolean }>(
    `/executions/${executionId}/cancel`,
  );

  return response.data;
};

export const getWorkflowExecutions = async (workflowId: string) => {
  const response = await workflowClient.get<ExecutionRecord[]>(
    `/workflows/${workflowId}/executions`,
  );

  return response.data;
};

export const getExecution = async (executionId: string) => {
  const response = await workflowClient.get<ExecutionRecord>(
    `/executions/${executionId}`,
  );

  return response.data;
};

export const validateWorkflow = async (workflowJson: WorkflowNodes) => {
  const response = await workflowClient.post<WorkflowValidation>(
    "/workflows/validate",
    { workflowJson },
  );

  return response.data;
};

// AI Workflow Generation
export interface GenerateWorkflowRequest {
  prompt: string;
}

export interface AIWorkflowNode {
  id: string;
  type: string;
  title: string;
  description: string;
  config: Record<string, unknown>;
}

export interface AIWorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface GenerateWorkflowResponse {
  nodes: AIWorkflowNode[];
  edges: AIWorkflowEdge[];
}

export const generateWorkflow = async (data: GenerateWorkflowRequest) => {
  const response = await workflowClient.post<GenerateWorkflowResponse>(
    "/ai/generate-workflow",
    data,
  );

  return response.data;
};
