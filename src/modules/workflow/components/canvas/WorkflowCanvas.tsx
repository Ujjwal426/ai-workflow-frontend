import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Redo2,
  RotateCcw,
  Save,
  Undo2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import "reactflow/dist/style.css";

import AINode from "../nodes/AINode";
import DelayNode from "../nodes/DelayNode";
import HTTPNode from "../nodes/HTTPNode";
import WebhookNode from "../nodes/WebhookNode";
import {
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  workflowQueryKeys,
} from "../../api/workflowApi";
import { useWorkflowAutosave } from "../../hooks/useWorkflowAutosave";
import { useWorkflowStore } from "../../store/workflowStore";
import type {
  WorkflowNodeType,
  WorkflowPayload,
  WorkflowRecord,
  WorkflowSnapshot,
} from "../../types/workflow.types";

const nodeTypes = {
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
      if (!workflowId) {
        navigate(`/workflows/${savedWorkflow.id}`);
      }
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

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
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
        <Panel position="top-left" className="flex flex-wrap gap-2">
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
            disabled={saveWorkflowMutation.isPending}
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" />
            {saveWorkflowMutation.isPending ? "Saving" : "Save"}
          </button>
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
