import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnNodesDelete,
  reconnectEdge,
} from "reactflow";

import type {
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowSnapshot,
  WorkflowNodeType,
  WorkflowValidation,
} from "../types/workflow.types";

const STORAGE_KEY = "ai-workflow-builder.workflow";

const isCompleteConnection = (
  connection: Connection,
): connection is Connection & { source: string; target: string } => {
  return Boolean(connection.source && connection.target);
};

const isConnectionAllowed = (
  connection: Connection,
  edges: WorkflowEdge[],
  ignoredEdgeId?: string,
) => {
  if (!isCompleteConnection(connection)) {
    return false;
  }

  const isSelfConnection = connection.source === connection.target;
  const isDuplicateConnection = edges.some(
    (edge) =>
      edge.id !== ignoredEdgeId &&
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle,
  );

  return !isSelfConnection && !isDuplicateConnection;
};

const createNodeData = (type: WorkflowNodeType): WorkflowNodeData => {
  const labels: Record<WorkflowNodeType, WorkflowNodeData> = {
    startNode: {
      title: "Start",
      description: "Workflow entry point.",
      status: "idle",
      config: {},
    },
    endNode: {
      title: "End",
      description: "Workflow completion point.",
      status: "idle",
      config: {},
    },
    aiNode: {
      title: "AI Node",
      description: "Use a model to transform or generate content.",
      status: "idle",
      config: {
        model: "gpt-4.1-mini",
        prompt: "",
        temperature: 0.7,
      },
    },
    httpNode: {
      title: "HTTP Request",
      description: "Call an external API endpoint.",
      status: "idle",
      config: {
        url: "",
        method: "GET",
        headers: "{}",
      },
    },
    delayNode: {
      title: "Delay",
      description: "Pause the workflow before continuing.",
      status: "idle",
      config: {
        duration: 60,
        unit: "seconds",
      },
    },
    webhookNode: {
      title: "Webhook",
      description: "Start from an incoming webhook event.",
      status: "idle",
      config: {
        endpoint: "/webhook",
        secretKey: "",
      },
    },
  };

  return labels[type];
};

const defaultSnapshot: WorkflowSnapshot = {
  nodes: [
    {
      id: "node-1",
      type: "startNode",
      position: { x: 280, y: 120 },
      data: createNodeData("startNode"),
    },
  ],
  edges: [],
};

const getInitialSnapshot = (): WorkflowSnapshot => {
  if (typeof window === "undefined") {
    return defaultSnapshot;
  }

  const savedWorkflow = window.localStorage.getItem(STORAGE_KEY);

  if (!savedWorkflow) {
    return defaultSnapshot;
  }

  try {
    const parsedWorkflow = JSON.parse(savedWorkflow) as WorkflowSnapshot;

    if (Array.isArray(parsedWorkflow.nodes) && Array.isArray(parsedWorkflow.edges)) {
      return parsedWorkflow;
    }
  } catch {
    return defaultSnapshot;
  }

  return defaultSnapshot;
};

const persistSnapshot = ({ nodes, edges }: WorkflowSnapshot) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
};

const getSnapshot = (state: WorkflowState): WorkflowSnapshot => ({
  nodes: state.nodes,
  edges: state.edges,
});

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  selectedEdge: WorkflowEdge | null;
  copiedNode: WorkflowNode | null;
  past: WorkflowSnapshot[];
  future: WorkflowSnapshot[];
  executionId: string | null;
  executionStatus: "idle" | "running" | "completed" | "failed" | "cancelled";
  validation: WorkflowValidation | null;
  isValid: boolean;

  addNode: (type: WorkflowNodeType, position: WorkflowNode["position"]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onNodesDelete: OnNodesDelete;
  onEdgesChange: (changes: EdgeChange[]) => void;

  isValidConnection: (connection: Connection, ignoredEdgeId?: string) => boolean;
  onConnect: (connection: Connection) => void;
  onReconnect: (oldEdge: WorkflowEdge, newConnection: Connection) => void;

  setSelectedNode: (node: WorkflowNode | null) => void;
  setSelectedEdge: (edge: WorkflowEdge | null) => void;
  clearSelection: () => void;
  deleteSelectedNode: () => void;
  deleteSelectedEdge: () => void;
  updateSelectedNodeData: (data: Partial<WorkflowNodeData>) => void;
  updateSelectedNodeConfig: (config: Record<string, unknown>) => void;
  copySelectedNode: () => void;
  pasteNode: () => void;
  autoLayout: () => void;
  undo: () => void;
  redo: () => void;
  exportWorkflow: () => string;
  importWorkflow: (workflow: WorkflowSnapshot) => void;
  resetWorkflow: () => void;
  loadAIGeneratedWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  startExecution: (executionId: string) => void;
  updateNodeStatus: (nodeId: string, status: "idle" | "loading" | "success" | "error") => void;
  setExecutionStatus: (status: "idle" | "running" | "completed" | "failed" | "cancelled") => void;
  cancelExecution: () => void;
  resetExecutionState: () => void;
  setValidation: (validation: WorkflowValidation) => void;
  validateWorkflow: () => WorkflowValidation;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...getInitialSnapshot(),
  selectedNode: null,
  selectedEdge: null,
  copiedNode: null,
  past: [],
  future: [],
  executionId: null,
  executionStatus: "idle",
  validation: null,
  isValid: false,

  addNode: (type, position) =>
    set((state) => {
      const nextState = {
        nodes: [
          ...state.nodes,
          {
            id: `node-${crypto.randomUUID()}`,
            type,
            position,
            data: createNodeData(type),
          },
        ],
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: nextState.nodes, edges: state.edges });
      return nextState;
    }),

  onNodesChange: (changes) =>
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes);
      const selectedNode = state.selectedNode
        ? nodes.find((node) => node.id === state.selectedNode?.id) ?? null
        : null;

      persistSnapshot({ nodes, edges: state.edges });
      return { nodes, selectedNode };
    }),

  onNodesDelete: (deletedNodes) =>
    set((state) => {
      const deletedNodeIds = new Set(deletedNodes.map((node) => node.id));

      const nextState = {
        edges: state.edges.filter(
          (edge) =>
            !deletedNodeIds.has(edge.source) && !deletedNodeIds.has(edge.target),
        ),
        selectedNode:
          state.selectedNode && deletedNodeIds.has(state.selectedNode.id)
            ? null
            : state.selectedNode,
        selectedEdge:
          state.selectedEdge &&
          (deletedNodeIds.has(state.selectedEdge.source) ||
            deletedNodeIds.has(state.selectedEdge.target))
            ? null
            : state.selectedEdge,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: state.nodes, edges: nextState.edges });
      return nextState;
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges);
      const selectedEdge = state.selectedEdge
        ? edges.find((edge) => edge.id === state.selectedEdge?.id) ?? null
        : null;

      persistSnapshot({ nodes: state.nodes, edges });
      return { edges, selectedEdge };
    }),

  isValidConnection: (connection, ignoredEdgeId) =>
    isConnectionAllowed(connection, get().edges, ignoredEdgeId),

  onConnect: (connection) =>
    set((state) => {
      if (!isConnectionAllowed(connection, state.edges)) {
        return state;
      }

      const nextState = {
        edges: addEdge(
          {
            ...connection,
            animated: true,
            label: "Next",
            reconnectable: true,
            type: "smoothstep",
          },
          state.edges,
        ),
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: state.nodes, edges: nextState.edges });
      return nextState;
    }),

  onReconnect: (oldEdge, newConnection) =>
    set((state) => {
      if (!isConnectionAllowed(newConnection, state.edges, oldEdge.id)) {
        return state;
      }

      const edges = reconnectEdge(
        oldEdge,
        newConnection,
        state.edges,
      ) as WorkflowEdge[];

      const nextState = {
        edges,
        selectedEdge: edges.find((edge) => edge.id === oldEdge.id) ?? null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: state.nodes, edges });
      return nextState;
    }),

  setSelectedNode: (node) =>
    set((state) => ({
      selectedNode: node,
      selectedEdge: null,
      edges: state.edges.map((edge) => ({ ...edge, selected: false })),
    })),

  setSelectedEdge: (edge) =>
    set((state) => ({
      selectedNode: null,
      selectedEdge: edge,
      edges: state.edges.map((item) => ({
        ...item,
        selected: item.id === edge?.id,
      })),
    })),

  clearSelection: () =>
    set((state) => ({
      selectedNode: null,
      selectedEdge: null,
      edges: state.edges.map((edge) => ({ ...edge, selected: false })),
    })),

  deleteSelectedNode: () =>
    set((state) => {
      if (!state.selectedNode) {
        return state;
      }

      const selectedNodeId = state.selectedNode.id;

      const nextState = {
        nodes: state.nodes.filter((node) => node.id !== selectedNodeId),
        edges: state.edges.filter(
          (edge) =>
            edge.source !== selectedNodeId && edge.target !== selectedNodeId,
        ),
        selectedNode: null,
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: nextState.nodes, edges: nextState.edges });
      return nextState;
    }),

  deleteSelectedEdge: () =>
    set((state) => {
      if (!state.selectedEdge) {
        return state;
      }

      const nextState = {
        edges: state.edges.filter((edge) => edge.id !== state.selectedEdge?.id),
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: state.nodes, edges: nextState.edges });
      return nextState;
    }),

  updateSelectedNodeData: (data) =>
    set((state) => {
      if (!state.selectedNode) {
        return state;
      }

      const nodes = state.nodes.map((node) =>
        node.id === state.selectedNode?.id
          ? { ...node, data: { ...node.data, ...data } }
          : node,
      );

      const nextState = {
        nodes,
        selectedNode:
          nodes.find((node) => node.id === state.selectedNode?.id) ?? null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes, edges: state.edges });
      return nextState;
    }),

  updateSelectedNodeConfig: (config) =>
    get().updateSelectedNodeData({ config }),

  copySelectedNode: () =>
    set((state) => ({
      copiedNode: state.selectedNode,
    })),

  pasteNode: () =>
    set((state) => {
      if (!state.copiedNode) {
        return state;
      }

      const node: WorkflowNode = {
        ...state.copiedNode,
        id: `node-${crypto.randomUUID()}`,
        selected: false,
        position: {
          x: state.copiedNode.position.x + 40,
          y: state.copiedNode.position.y + 40,
        },
      };

      const nextState = {
        nodes: [...state.nodes, node],
        selectedNode: node,
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes: nextState.nodes, edges: state.edges });
      return nextState;
    }),

  autoLayout: () =>
    set((state) => {
      const typeOrder: Record<string, number> = {
        startNode: 0,
        webhookNode: 1,
        aiNode: 2,
        httpNode: 3,
        delayNode: 4,
        endNode: 5,
      };
      const columns = new Map<number, WorkflowNode[]>();

      state.nodes.forEach((node) => {
        const column = typeOrder[node.type ?? ""] ?? 2;
        columns.set(column, [...(columns.get(column) ?? []), node]);
      });

      const nodes = state.nodes.map((node) => {
        const column = typeOrder[node.type ?? ""] ?? 2;
        const row = columns.get(column)?.findIndex((item) => item.id === node.id) ?? 0;

        return {
          ...node,
          position: {
            x: 120 + column * 280,
            y: 100 + row * 180,
          },
        };
      });

      const selectedNode = state.selectedNode
        ? nodes.find((node) => node.id === state.selectedNode?.id) ?? null
        : null;
      const nextState = {
        nodes,
        selectedNode,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot({ nodes, edges: state.edges });
      return nextState;
    }),

  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);

      if (!previous) {
        return state;
      }

      persistSnapshot(previous);

      return {
        ...previous,
        selectedNode: null,
        selectedEdge: null,
        past: state.past.slice(0, -1),
        future: [getSnapshot(state), ...state.future],
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0];

      if (!next) {
        return state;
      }

      persistSnapshot(next);

      return {
        ...next,
        selectedNode: null,
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: state.future.slice(1),
      };
    }),

  exportWorkflow: () => JSON.stringify(getSnapshot(get()), null, 2),

  importWorkflow: (workflow) =>
    set((state) => {
      const nextState = {
        nodes: workflow.nodes,
        edges: workflow.edges,
        selectedNode: null,
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot(workflow);
      return nextState;
    }),

  resetWorkflow: () =>
    set((state) => {
      const nextState = {
        ...defaultSnapshot,
        selectedNode: null,
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot(defaultSnapshot);
      return nextState;
    }),

  loadAIGeneratedWorkflow: (aiNodes, aiEdges) =>
    set((state) => {
      // Auto-layout nodes in a horizontal flow
      const layoutNodes = aiNodes.map((node, index) => ({
        ...node,
        position: {
          x: 100 + (index * 250), // Horizontal spacing
          y: 150, // Vertical center
        },
        data: {
          ...node.data,
          status: "idle" as const, // Reset status with proper type
        },
      })) as WorkflowNode[];

      const workflow = {
        nodes: layoutNodes,
        edges: aiEdges,
      };

      const nextState = {
        nodes: layoutNodes,
        edges: aiEdges,
        selectedNode: null,
        selectedEdge: null,
        past: [...state.past, getSnapshot(state)],
        future: [],
      };

      persistSnapshot(workflow);
      return nextState;
    }),

  validateWorkflow: () => {
    const { nodes, edges } = get();
    const errors: string[] = [];
    const warnings: string[] = [];
    const hasStart = nodes.some((node) => node.type === "startNode");
    const hasEnd = nodes.some((node) => node.type === "endNode");

    if (nodes.length === 0) {
      errors.push("Add at least one node.");
    }

    if (!hasStart) {
      errors.push("Add a Start node to begin the workflow.");
    }

    if (!hasEnd) {
      errors.push("Add an End node to complete the workflow.");
    }

    if (hasStart && hasEnd && nodes.length < 3) {
      warnings.push("Consider adding more nodes between Start and End for a meaningful workflow.");
    }

    // Check if all nodes are connected
    const connectedNodeIds = new Set<string>();

    if (hasStart) {
      const startNode = nodes.find((n) => n.type === "startNode");
      if (startNode) {
        connectedNodeIds.add(startNode.id);
        const traverse = (nodeId: string) => {
          edges
            .filter((e) => e.source === nodeId)
            .forEach((edge) => {
              if (!connectedNodeIds.has(edge.target)) {
                connectedNodeIds.add(edge.target);
                traverse(edge.target);
              }
            });
        };
        traverse(startNode.id);
      }
    }

    const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
    if (unconnectedNodes.length > 0) {
      warnings.push(
        `${unconnectedNodes.length} node(s) are not connected to the Start node: ${unconnectedNodes.map((n) => n.data.title).join(", ")}`,
      );
    }

    // Check if End node is reachable from Start
    if (hasStart && hasEnd) {
      const endNode = nodes.find((n) => n.type === "endNode");
      if (endNode && !connectedNodeIds.has(endNode.id)) {
        errors.push("End node is not reachable from Start node. Please check your connections.");
      }
    }

    nodes.forEach((node) => {
      const config = node.data.config ?? {};

      if (node.type === "aiNode" && !config.prompt) {
        errors.push(`${node.data.title}: add a prompt.`);
      }

      if (node.type === "httpNode" && !config.url) {
        errors.push(`${node.data.title}: add a URL.`);
      }

      if (node.type === "webhookNode" && !config.endpoint) {
        errors.push(`${node.data.title}: add an endpoint.`);
      }
    });

    edges.forEach((edge) => {
      if (!nodes.some((node) => node.id === edge.source)) {
        errors.push(`Edge ${edge.id} has a missing source.`);
      }

      if (!nodes.some((node) => node.id === edge.target)) {
        errors.push(`Edge ${edge.id} has a missing target.`);
      }

      // Check for self-loops
      if (edge.source === edge.target) {
        errors.push(`Edge ${edge.id} creates a self-loop on node ${edge.source}.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  },

  setValidation: (validation) =>
    set(() => ({
      validation,
      isValid: validation.isValid,
    })),

  startExecution: (executionId) =>
    set(() => ({
      executionId,
      executionStatus: "running",
    })),

  updateNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node,
      ),
    })),

  setExecutionStatus: (status: "idle" | "running" | "completed" | "failed" | "cancelled") =>
    set(() => ({
      executionStatus: status,
    })),

  cancelExecution: () =>
    set(() => ({
      executionStatus: "cancelled",
    })),

  resetExecutionState: () =>
    set((state) => ({
      executionId: null,
      executionStatus: "idle",
      nodes: state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, status: "idle" as const },
      })),
    })),
}));
