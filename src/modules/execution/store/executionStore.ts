import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type NodeExecutionStatus = "idle" | "running" | "success" | "error";

export type ExecutionWorkflowStatus = "idle" | "running" | "completed" | "failed";

export interface ExecutionLog {
  id: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  nodeId?: string;
  timestamp: string;
}

export interface NodeExecutionState {
  status: NodeExecutionStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: Record<string, unknown>;
  error?: string;
}

interface ExecutionState {
  // Workflow level
  workflowStatus: ExecutionWorkflowStatus;
  workflowStartTime?: string;
  workflowEndTime?: string;
  workflowDuration?: number;

  // Node level
  nodeStates: Record<string, NodeExecutionState>;

  // Logs
  logs: ExecutionLog[];
  maxLogs: number;

  // Actions
  setWorkflowStatus: (status: ExecutionWorkflowStatus) => void;
  setWorkflowStartTime: (time?: string) => void;
  setWorkflowEndTime: (time?: string) => void;
  setWorkflowDuration: (duration?: number) => void;

  setNodeStatus: (nodeId: string, status: NodeExecutionStatus) => void;
  setNodeStartTime: (nodeId: string, time?: string) => void;
  setNodeEndTime: (nodeId: string, time?: string) => void;
  setNodeDuration: (nodeId: string, duration?: number) => void;
  setNodeOutput: (nodeId: string, output?: Record<string, unknown>) => void;
  setNodeError: (nodeId: string, error?: string) => void;
  updateNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void;

  addLog: (log: Omit<ExecutionLog, "id">) => void;
  addLogs: (logs: Omit<ExecutionLog, "id">[]) => void;
  clearLogs: () => void;

  resetExecution: () => void;
  resetNodeStates: () => void;
  resetWorkflowStatus: () => void;
}

const generateLogId = () => `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useExecutionStore = create<ExecutionState>()(
  devtools(
    (set) => ({
      // Initial state
      workflowStatus: "idle",
      workflowStartTime: undefined,
      workflowEndTime: undefined,
      workflowDuration: undefined,
      nodeStates: {},
      logs: [],
      maxLogs: 500,

      // Workflow actions
      setWorkflowStatus: (status) =>
        set(() => ({
          workflowStatus: status,
        })),

      setWorkflowStartTime: (time) =>
        set(() => ({
          workflowStartTime: time || new Date().toISOString(),
        })),

      setWorkflowEndTime: (time) =>
        set(() => ({
          workflowEndTime: time || new Date().toISOString(),
        })),

      setWorkflowDuration: (duration) =>
        set(() => ({
          workflowDuration: duration,
        })),

      // Node actions
      setNodeStatus: (nodeId, status) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              status,
            },
          },
        })),

      setNodeStartTime: (nodeId, time) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              startTime: time || new Date().toISOString(),
            },
          },
        })),

      setNodeEndTime: (nodeId, time) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              endTime: time || new Date().toISOString(),
            },
          },
        })),

      setNodeDuration: (nodeId, duration) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              duration,
            },
          },
        })),

      setNodeOutput: (nodeId, output) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              output,
            },
          },
        })),

      setNodeError: (nodeId, error) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              error,
            },
          },
        })),

      updateNodeState: (nodeId, nodeState) =>
        set((state) => ({
          nodeStates: {
            ...state.nodeStates,
            [nodeId]: {
              ...state.nodeStates[nodeId],
              ...nodeState,
            },
          },
        })),

      // Log actions
      addLog: (log) =>
        set((state) => {
          const newLog: ExecutionLog = {
            id: generateLogId(),
            ...log,
            timestamp: log.timestamp || new Date().toISOString(),
          };

          const logs = [newLog, ...state.logs];
          const trimmedLogs = logs.slice(0, state.maxLogs);

          return {
            logs: trimmedLogs,
          };
        }),

      addLogs: (logs) =>
        set((state) => {
          const newLogs = logs.map((log) => ({
            id: generateLogId(),
            ...log,
            timestamp: log.timestamp || new Date().toISOString(),
          }));

          const combinedLogs = [...newLogs, ...state.logs];
          const trimmedLogs = combinedLogs.slice(0, state.maxLogs);

          return {
            logs: trimmedLogs,
          };
        }),

      clearLogs: () =>
        set(() => ({
          logs: [],
        })),

      // Reset actions
      resetExecution: () =>
        set(() => ({
          workflowStatus: "idle",
          workflowStartTime: undefined,
          workflowEndTime: undefined,
          workflowDuration: undefined,
          nodeStates: {},
          logs: [],
        })),

      resetNodeStates: () =>
        set(() => ({
          nodeStates: {},
        })),

      resetWorkflowStatus: () =>
        set(() => ({
          workflowStatus: "idle",
          workflowStartTime: undefined,
          workflowEndTime: undefined,
          workflowDuration: undefined,
        })),
    }),
    { name: "ExecutionStore" }
  )
);
