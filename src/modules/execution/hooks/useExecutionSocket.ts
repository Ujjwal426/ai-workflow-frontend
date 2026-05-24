import { useEffect, useRef, useCallback } from "react";

export type ExecutionEventType =
  | "NODE_RUNNING"
  | "NODE_SUCCESS"
  | "NODE_ERROR"
  | "EXECUTION_LOG"
  | "EXECUTION_START"
  | "EXECUTION_COMPLETE"
  | "EXECUTION_FAILED";

export interface ExecutionEvent {
  type: ExecutionEventType;
  nodeId?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export interface UseExecutionSocketOptions {
  workflowId: string;
  onEvent?: (event: ExecutionEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export const useExecutionSocket = ({
  workflowId,
  onEvent,
  onConnect,
  onDisconnect,
  onError,
  enabled = true,
}: UseExecutionSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || !workflowId) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/executions/${workflowId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected for workflow ${workflowId}`);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ExecutionEvent;
          data.timestamp = data.timestamp || new Date().toISOString();
          onEvent?.(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log(`WebSocket disconnected for workflow ${workflowId}`);
        onDisconnect?.();

        // Attempt reconnection if not intentionally closed
        if (reconnectAttemptsRef.current < maxReconnectAttempts && enabled) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      onError?.(error as Event);
    }
  }, [workflowId, enabled, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }, []);

  useEffect(() => {
    if (enabled && workflowId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, workflowId, connect, disconnect]);

  return {
    ws: wsRef.current,
    sendMessage,
    disconnect,
    reconnect: connect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};
