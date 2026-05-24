import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlowProvider,
  SelectionMode,
  useReactFlow,
} from "reactflow";
import {
  Download,
  GitBranch,
  Import,
  Play,
  Redo2,
  RotateCcw,
  Save,
  Square,
  Undo2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import "reactflow/dist/style.css";

import AINode from "../nodes/AINode";
import DelayNode from "../nodes/DelayNode";
import EndNode from "../nodes/EndNode";
import HTTPNode from "../nodes/HTTPNode";
import StartNode from "../nodes/StartNode";
import WebhookNode from "../nodes/WebhookNode";
import ExecutionStatusUI from "../../../execution/components/ExecutionStatusUI";
import { useExecutionEvents } from "../../../execution/services/executionEventService";
import {
  createExecution,
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  workflowQueryKeys,
} from "../../api/workflowApi";
import { useWorkflowAutosave } from "../../hooks/useWorkflowAutosave";
import { useWorkflowStore } from "../../store/workflowStore";
import type {
  WorkflowNode,
  WorkflowNodeType,
  WorkflowPayload,
  WorkflowRecord,
  WorkflowSnapshot,
} from "../../types/workflow.types";

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  aiNode: AINode,
  delayNode: DelayNode,
  httpNode: HTTPNode,
  webhookNode: WebhookNode,
};

const snapGrid: [number, number] = [20, 20];

const snapPositionToGrid = (position: { x: number; y: number }) => ({
  x: Math.round(position.x / snapGrid[0]) * snapGrid[0],
  y: Math.round(position.y / snapGrid[1]) * snapGrid[1],
});

const WORKFLOW_DRAFT_KEY = "workflow-draft";

const getWorkflowJson = (workflow: WorkflowRecord): WorkflowSnapshot =>
  workflow.workflowJson ?? {
    nodes: workflow.nodes ?? [],
    edges: workflow.edges ?? [],
    viewport: workflow.viewport,
  };

const WorkflowCanvasInner = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { getViewport, project, setViewport } = useReactFlow();
  const queryClient = useQueryClient();
  const importInputRef = useRef<HTMLInputElement>(null);
  const loadedWorkflowIdRef = useRef<string | null>(null);
  const [loadedWorkflowId, setLoadedWorkflowId] = useState<string | null>(null);
  const [isDraftPromptOpen, setIsDraftPromptOpen] = useState(
    () =>
      !workflowId && Boolean(window.localStorage.getItem(WORKFLOW_DRAFT_KEY)),
  );

  // WebSocket execution connection
  useExecutionEvents({
    workflowId: workflowId || "local",
    enabled: workflowId !== undefined,
    onExecutionComplete: () => {
      console.log("Execution completed");
    },
    onExecutionFailed: () => {
      console.log("Execution failed");
    },
  });
  const {
    nodes,
    edges,
    addNode,
    onNodesChange,
    onNodesDelete,
    onEdgesChange,
    onConnect,
    onReconnect,
    isValidConnection,
    setSelectedNode,
    setSelectedEdge,
    clearSelection,
    copySelectedNode,
    pasteNode,
    autoLayout,
    undo,
    redo,
    exportWorkflow,
    importWorkflow,
    resetWorkflow,
    validateWorkflow,
    setValidation,
    validation,
    isValid,
    executionStatus,
    startExecution,
    updateNodeStatus,
    setExecutionStatus,
    cancelExecution,
    resetExecutionState,
  } = useWorkflowStore();
  const { data: workflow } = useQuery({
    queryKey: workflowId ? workflowQueryKeys.detail(workflowId) : [],
    queryFn: () => getWorkflow(workflowId ?? ""),
    enabled: Boolean(workflowId),
  });
  const workflowPayload = useMemo<WorkflowPayload>(
    () => ({
      name: workflow?.name ?? "Untitled workflow",
      description: workflow?.description,
      workflowJson: {
        nodes,
        edges,
        viewport: getViewport(),
      },
    }),
    [edges, getViewport, nodes, workflow?.description, workflow?.name],
  );
  const autosaveWorkflowId =
    !workflowId || loadedWorkflowId === workflowId ? workflowId : undefined;
  const autosaveStatus = useWorkflowAutosave(
    autosaveWorkflowId,
    workflowPayload,
  );
  const saveWorkflowMutation = useMutation({
    mutationFn: (payload: WorkflowPayload) =>
      workflowId ? updateWorkflow(workflowId, payload) : createWorkflow(payload),
    onSuccess: (savedWorkflow) => {
      window.localStorage.removeItem(WORKFLOW_DRAFT_KEY);
      void queryClient.invalidateQueries({
        queryKey: workflowQueryKeys.all,
      });
      toast.success(workflowId ? "Workflow updated successfully" : "Workflow created successfully");
      if (!workflowId) {
        navigate(`/workflows/${savedWorkflow.id}`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save workflow");
    },
  });

  useEffect(() => {
    if (!workflow || loadedWorkflowIdRef.current === workflow.id) {
      return;
    }

    const workflowJson = getWorkflowJson(workflow);

    importWorkflow(workflowJson);
    if (workflowJson.viewport) {
      void setViewport(workflowJson.viewport, { duration: 300 });
    }
    loadedWorkflowIdRef.current = workflow.id;
    const loadedTimer = window.setTimeout(() => setLoadedWorkflowId(workflow.id), 0);

    return () => window.clearTimeout(loadedTimer);
  }, [importWorkflow, setViewport, workflow]);

  useEffect(() => {
    window.localStorage.setItem(
      WORKFLOW_DRAFT_KEY,
      JSON.stringify({
        nodes,
        edges,
        viewport: getViewport(),
      }),
    );
  }, [edges, getViewport, nodes]);

  useEffect(() => {
    if (autosaveStatus === "saved") {
      window.localStorage.removeItem(WORKFLOW_DRAFT_KEY);
    }
  }, [autosaveStatus]);

  // Auto-validate workflow when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const validationResult = validateWorkflow();
      setValidation(validationResult);
    }
  }, [nodes, edges, validateWorkflow, setValidation]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        clearSelection();
        return;
      }

      if (isEditing) {
        return;
      }

      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (isModifierPressed && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelectedNode();
      }

      if (isModifierPressed && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteNode();
      }

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
          return;
        }

        undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection, copySelectedNode, pasteNode, redo, undo]);

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData(
      "application/reactflow",
    ) as WorkflowNodeType;

    if (!nodeType) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    addNode(nodeType, snapPositionToGrid(position));
  };

  const onExportWorkflow = () => {
    const blob = new Blob([exportWorkflow()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const onSaveWorkflow = () => {
    saveWorkflowMutation.mutate(workflowPayload);
  };

  const onImportWorkflow = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    const workflow = JSON.parse(text);

    const workflowJson = workflow.workflowJson ?? workflow;

    if (
      Array.isArray(workflowJson.nodes) &&
      Array.isArray(workflowJson.edges)
    ) {
      importWorkflow(workflowJson);
      if (workflowJson.viewport) {
        void setViewport(workflowJson.viewport, { duration: 300 });
      }
    }
  };

  const onRecoverDraft = () => {
    const draft = window.localStorage.getItem(WORKFLOW_DRAFT_KEY);

    if (!draft) {
      return;
    }

    const workflowJson = JSON.parse(draft) as WorkflowSnapshot;
    importWorkflow(workflowJson);
    if (workflowJson.viewport) {
      void setViewport(workflowJson.viewport, { duration: 300 });
    }
    setIsDraftPromptOpen(false);
  };

  const onDiscardDraft = () => {
    window.localStorage.removeItem(WORKFLOW_DRAFT_KEY);
    setIsDraftPromptOpen(false);
  };

  const executeWorkflow = async () => {
    if (executionStatus === "running") {
      cancelExecution();
      return;
    }

    if (!isValid) {
      toast.error(`Workflow validation errors:\n${validation?.errors?.join("\n") || "Invalid workflow"}`);
      return;
    }

    // For now, use the local simulation if no workflowId
    // In production, this would call the backend API
    if (!workflowId) {
      executeLocalSimulation();
      return;
    }

    // Call backend execution API
    try {
      const response = await fetch("http://localhost:8000/api/executions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowId: parseInt(workflowId),
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute workflow");
      }

      console.log("Workflow execution started");
      toast.success("Workflow execution started");
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      toast.error("Failed to execute workflow. Please try again.");
    }
  };

  const executeLocalSimulation = async () => {
    const newExecutionId = crypto.randomUUID();
    startExecution(newExecutionId);

    const currentExecutionStatus = () => {
      const state = useWorkflowStore.getState();
      return state.executionStatus;
    };

    // Build adjacency list for traversal
    const buildAdjacencyList = () => {
      const adj = new Map<string, string[]>();
      nodes.forEach((node) => adj.set(node.id, []));
      edges.forEach((edge) => {
        const targets = adj.get(edge.source) ?? [];
        adj.set(edge.source, [...targets, edge.target]);
      });
      return adj;
    };

    // Find start node
    const findStartNode = () => {
      return nodes.find((node) => node.type === "startNode");
    };

    // Execute a single node based on its type
    const executeNode = async (node: WorkflowNode) => {
      updateNodeStatus(node.id, "loading");

      // Different execution rules based on node type
      let delay = 1000;
      let successRate = 0.9;

      switch (node.type) {
        case "aiNode":
          delay = Math.floor(Math.random() * 2000) + 2000; // 2-4 seconds
          successRate = 0.85;
          break;
        case "httpNode":
          delay = Math.floor(Math.random() * 1500) + 500; // 0.5-2 seconds
          successRate = 0.95;
          break;
        case "delayNode":
          const config = node.data.config as { duration?: number };
          delay = (config.duration ?? 1) * 1000; // Use actual delay config
          successRate = 1.0; // Delay always succeeds
          break;
        case "webhookNode":
          delay = 500;
          successRate = 0.9;
          break;
        case "startNode":
          delay = 500;
          successRate = 1.0;
          break;
        case "endNode":
          delay = 500;
          successRate = 1.0;
          break;
        default:
          delay = 1000;
          successRate = 0.9;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));

      if (currentExecutionStatus() === "cancelled") {
        return false;
      }

      const isSuccess = Math.random() < successRate;
      updateNodeStatus(node.id, isSuccess ? "success" : "error");
      return isSuccess;
    };

    // Traverse and execute workflow
    const traverseAndExecute = async () => {
      const adj = buildAdjacencyList();
      const startNode = findStartNode();

      if (!startNode) {
        console.error("No start node found");
        setExecutionStatus("failed");
        return;
      }

      // BFS traversal with execution
      const queue: string[] = [startNode.id];
      const visited = new Set<string>();
      const executed = new Set<string>();

      while (queue.length > 0) {
        if (currentExecutionStatus() === "cancelled") {
          break;
        }

        const nodeId = queue.shift()!;
        if (executed.has(nodeId)) {
          continue;
        }

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
          continue;
        }

        // Execute the node
        const success = await executeNode(node);
        if (!success) {
          setExecutionStatus("failed");
          return;
        }

        executed.add(nodeId);

        // Check if this is an end node
        if (node.type === "endNode") {
          // Check if end node connects to start (circular)
          const outgoingEdges = edges.filter((e) => e.source === nodeId);
          const connectsToStart = outgoingEdges.some((e) => {
            const targetNode = nodes.find((n) => n.id === e.target);
            return targetNode?.type === "startNode";
          });

          if (connectsToStart) {
            // Circular workflow - restart from start
            visited.clear();
            executed.clear();
            queue.push(startNode.id);
            // Small delay before restart
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }

        // Add next nodes to queue
        const nextNodes = adj.get(nodeId) ?? [];
        nextNodes.forEach((nextNodeId) => {
          if (!visited.has(nextNodeId)) {
            visited.add(nextNodeId);
            queue.push(nextNodeId);
          }
        });
      }

      if (currentExecutionStatus() !== "cancelled") {
        setExecutionStatus("completed");
      }
    };

    try {
      if (workflowId) {
        await createExecution({
          workflowId,
          nodes,
          edges,
        });
      }

      await traverseAndExecute();
    } catch (error) {
      console.error("Execution error:", error);
      setExecutionStatus("failed");
    }
  };

  const resetExecution = () => {
    resetExecutionState();
  };

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ExecutionStatusUI />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodeClick={(_, node) => setSelectedNode(node)}
        onEdgeClick={(_, edge) => setSelectedEdge(edge)}
        onPaneClick={() => {
          clearSelection();
        }}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 400 }}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid
        snapGrid={snapGrid}
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        nodesDraggable
        nodesConnectable
        edgesFocusable
        edgesUpdatable
        elementsSelectable
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Meta", "Control"]}
        panActivationKeyCode="Space"
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        selectNodesOnDrag={false}
        nodeDragThreshold={1}
        elevateNodesOnSelect
        elevateEdgesOnSelect
        reconnectRadius={12}
        connectionLineType={ConnectionLineType.SmoothStep}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          label: "Next",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            strokeWidth: 2,
          },
          labelStyle: {
            fill: "#334155",
            fontSize: 12,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: "#ffffff",
          },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 6,
        }}
      >
        <Panel position="top-left" className="flex flex-col gap-2">
          {/* Validation Status Bar */}
          <div
            className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm shadow-sm ${
              isValid
                ? "border-emerald-200 bg-emerald-50"
                : validation && validation.errors && validation.errors.length > 0
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-white"
            }`}
          >
            <span
              className={`font-semibold ${
                isValid
                  ? "text-emerald-700"
                  : validation && validation.errors && validation.errors.length > 0
                    ? "text-red-700"
                    : "text-slate-700"
              }`}
            >
              {isValid ? "✓ Valid" : validation?.errors && validation.errors.length > 0 ? "✗ Invalid" : "Waiting..."}
            </span>
            {validation?.errors && validation.errors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {validation.errors.map((error, i) => (
                  <span key={i} className="text-xs text-red-700">
                    {error}
                  </span>
                ))}
              </div>
            )}
            {validation?.warnings && validation.warnings.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {validation.warnings.map((warning, i) => (
                  <span key={i} className="text-xs text-amber-700">
                    ⚠ {warning}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={autoLayout}
              className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <GitBranch className="size-4" />
              Layout
            </button>
          <button
            type="button"
            onClick={undo}
            className="inline-flex size-9 items-center justify-center rounded-md border bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            className="inline-flex size-9 items-center justify-center rounded-md border bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onExportWorkflow}
            className="inline-flex size-9 items-center justify-center rounded-md border bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Export JSON"
            title="Export JSON"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={onSaveWorkflow}
            disabled={saveWorkflowMutation.isPending || !isValid}
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" />
            {saveWorkflowMutation.isPending ? "Saving" : "Save"}
          </button>
          <button
            type="button"
            onClick={executeWorkflow}
            disabled={saveWorkflowMutation.isPending || !isValid}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              executionStatus === "running"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {executionStatus === "running" ? (
              <>
                <Square className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Play className="size-4" />
                Execute
              </>
            )}
          </button>
          {(executionStatus === "completed" ||
            executionStatus === "failed" ||
            executionStatus === "cancelled") && (
            <button
              type="button"
              onClick={resetExecution}
              className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="inline-flex size-9 items-center justify-center rounded-md border bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Import JSON"
            title="Import JSON"
          >
            <Import className="size-4" />
          </button>
          <button
            type="button"
            onClick={resetWorkflow}
            className="inline-flex size-9 items-center justify-center rounded-md border bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Reset workflow"
            title="Reset workflow"
          >
            <RotateCcw className="size-4" />
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => onImportWorkflow(event.target.files?.[0])}
          />
          {saveWorkflowMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
              Save failed
            </div>
          )}
          {saveWorkflowMutation.isSuccess && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 shadow-sm">
              Saved
            </div>
          )}
          {workflowId && (
            <div className="rounded-md border bg-white px-3 py-2 text-sm capitalize text-slate-600 shadow-sm">
              Autosave: {autosaveStatus}
            </div>
          )}
          {executionStatus !== "idle" && (
            <div
              className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm ${
                executionStatus === "running"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : executionStatus === "completed"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : executionStatus === "failed"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              Execution: {executionStatus}
            </div>
          )}
          </div>
        </Panel>
        {isDraftPromptOpen && (
          <Panel position="top-center">
            <div className="rounded-lg border bg-white p-4 shadow-lg">
              <div className="text-sm font-semibold text-slate-900">
                Recover unsaved draft?
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRecoverDraft}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white"
                >
                  Recover
                </button>
                <button
                  type="button"
                  onClick={onDiscardDraft}
                  className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium text-slate-700"
                >
                  Discard
                </button>
              </div>
            </div>
          </Panel>
        )}
        {nodes.length === 0 && (
          <Panel position="top-center">
            <div className="rounded-lg border border-dashed bg-white px-5 py-4 text-center shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Drag nodes here
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Use the node palette to start building your workflow.
              </div>
            </div>
          </Panel>
        )}
        <Controls fitViewOptions={{ padding: 0.2, duration: 400 }} />
        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={3}
          className="overflow-hidden rounded-lg border border-slate-200 bg-white"
        />
        <Background variant={BackgroundVariant.Lines} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvas = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
