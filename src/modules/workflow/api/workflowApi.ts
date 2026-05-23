import axios from "axios";

import type {
  WorkflowPayload,
  WorkflowRecord,
} from "../types/workflow.types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const workflowClient = axios.create({
  baseURL: API,
});

export const workflowQueryKeys = {
  all: ["workflows"] as const,
  detail: (id: string) => ["workflows", id] as const,
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
