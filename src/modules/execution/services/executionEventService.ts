import type {
  ExecutionEvent,
  UseExecutionSocketOptions,
} from "../hooks/useExecutionSocket";
import {
  useExecutionSocket,
} from "../hooks/useExecutionSocket";
import { useExecutionStore } from "../store/executionStore";

export interface UseExecutionEventsOptions
  extends Omit<UseExecutionSocketOptions, "onEvent"> {
  onExecutionComplete?: () => void;
  onExecutionFailed?: () => void;
}

export const useExecutionEvents = ({
  workflowId,
  onConnect,
  onDisconnect,
  onError,
  onExecutionComplete,
  onExecutionFailed,
  enabled = true,
}: UseExecutionEventsOptions) => {
  const {
    setWorkflowStatus,
    setWorkflowStartTime,
    setWorkflowEndTime,
    setWorkflowDuration,
    setNodeStatus,
    setNodeStartTime,
    setNodeEndTime,
    setNodeDuration,
    setNodeOutput,
    setNodeError,
    addLog,
    resetExecution,
  } = useExecutionStore();

  const handleEvent = (event: ExecutionEvent) => {
    switch (event.type) {
      case "EXECUTION_START":
        setWorkflowStatus("running");
        setWorkflowStartTime(event.timestamp || new Date().toISOString());
        addLog({
          type: "info",
          message: "Workflow execution started",
          timestamp: event.timestamp || new Date().toISOString(),
        });
        break;

      case "EXECUTION_COMPLETE":
        setWorkflowStatus("completed");
        setWorkflowEndTime(event.timestamp || new Date().toISOString());

        // Calculate duration
        const startTime = useExecutionStore.getState().workflowStartTime;
        if (startTime) {
          const duration =
            new Date(event.timestamp || new Date()).getTime() -
            new Date(startTime).getTime();
          setWorkflowDuration(duration);
        }

        addLog({
          type: "success",
          message: "Workflow execution completed successfully",
          timestamp: event.timestamp || new Date().toISOString(),
        });

        onExecutionComplete?.();
        break;

      case "EXECUTION_FAILED":
        setWorkflowStatus("failed");
        setWorkflowEndTime(event.timestamp || new Date().toISOString());

        const failedStartTime = useExecutionStore.getState().workflowStartTime;
        if (failedStartTime) {
          const failedDuration =
            new Date(event.timestamp || new Date()).getTime() -
            new Date(failedStartTime).getTime();
          setWorkflowDuration(failedDuration);
        }

        addLog({
          type: "error",
          message: event.message || "Workflow execution failed",
          timestamp: event.timestamp || new Date().toISOString(),
        });

        onExecutionFailed?.();
        break;

      case "NODE_RUNNING":
        if (event.nodeId) {
          setNodeStatus(event.nodeId, "running");
          setNodeStartTime(event.nodeId, event.timestamp || new Date().toISOString());
          addLog({
            type: "info",
            message: `Executing node: ${event.nodeId}`,
            nodeId: event.nodeId,
            timestamp: event.timestamp || new Date().toISOString(),
          });
        }
        break;

      case "NODE_SUCCESS":
        if (event.nodeId) {
          setNodeStatus(event.nodeId, "success");
          setNodeEndTime(event.nodeId, event.timestamp || new Date().toISOString());

          // Calculate node duration
          const nodeStartTime = useExecutionStore.getState().nodeStates[
            event.nodeId
          ]?.startTime;
          if (nodeStartTime) {
            const duration =
              new Date(event.timestamp || new Date()).getTime() -
              new Date(nodeStartTime).getTime();
            setNodeDuration(event.nodeId, duration);
          }

          if (event.data) {
            setNodeOutput(event.nodeId, event.data);
          }

          addLog({
            type: "success",
            message: `Node completed: ${event.nodeId}`,
            nodeId: event.nodeId,
            timestamp: event.timestamp || new Date().toISOString(),
          });
        }
        break;

      case "NODE_ERROR":
        if (event.nodeId) {
          setNodeStatus(event.nodeId, "error");
          setNodeEndTime(event.nodeId, event.timestamp || new Date().toISOString());
          setNodeError(event.nodeId, event.message);

          const errorNodeStartTime = useExecutionStore.getState().nodeStates[
            event.nodeId
          ]?.startTime;
          if (errorNodeStartTime) {
            const errorDuration =
              new Date(event.timestamp || new Date()).getTime() -
              new Date(errorNodeStartTime).getTime();
            setNodeDuration(event.nodeId, errorDuration);
          }

          addLog({
            type: "error",
            message: event.message || `Node failed: ${event.nodeId}`,
            nodeId: event.nodeId,
            timestamp: event.timestamp || new Date().toISOString(),
          });
        }
        break;

      case "EXECUTION_LOG":
        addLog({
          type: "info",
          message: event.message || "Execution log",
          timestamp: event.timestamp || new Date().toISOString(),
        });
        break;

      default:
        console.warn("Unknown event type:", event.type);
    }
  };

  const socket = useExecutionSocket({
    workflowId,
    onEvent: handleEvent,
    onConnect,
    onDisconnect,
    onError,
    enabled,
  });

  return {
    ...socket,
    resetExecution,
  };
};
