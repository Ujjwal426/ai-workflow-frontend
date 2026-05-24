import { Trash2, X } from "lucide-react";
import type { ReactNode } from "react";

import { useWorkflowStore } from "../../store/workflowStore";
import type { WorkflowNode } from "../../types/workflow.types";

const getConfigValue = (node: WorkflowNode, key: string) => {
  const value = node.data.config?.[key];

  return value === undefined || value === null ? "" : String(value);
};

const getNumericConfigValue = (node: WorkflowNode, key: string) => {
  const value = Number(node.data.config?.[key]);

  return Number.isFinite(value) ? value : 0;
};

const ConfigField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    {children}
  </label>
);

const inputClass =
  "mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:border-slate-400";

const renderConfigFields = (
  selectedNode: WorkflowNode,
  updateConfig: (key: string, value: unknown) => void,
) => {
  switch (selectedNode.type) {
    case "aiNode":
      return (
        <>
          <ConfigField label="Model">
            <input
              className={inputClass}
              value={getConfigValue(selectedNode, "model")}
              onChange={(event) => updateConfig("model", event.target.value)}
            />
          </ConfigField>
          <ConfigField label="Prompt">
            <textarea
              className={`${inputClass} min-h-28 resize-none`}
              value={getConfigValue(selectedNode, "prompt")}
              onChange={(event) => updateConfig("prompt", event.target.value)}
            />
          </ConfigField>
          <ConfigField label="Temperature">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={getNumericConfigValue(selectedNode, "temperature")}
              onChange={(event) =>
                updateConfig("temperature", Number(event.target.value))
              }
            />
          </ConfigField>
        </>
      );

    case "httpNode":
      return (
        <>
          <ConfigField label="URL">
            <input
              className={inputClass}
              value={getConfigValue(selectedNode, "url")}
              onChange={(event) => updateConfig("url", event.target.value)}
            />
          </ConfigField>
          <ConfigField label="Method">
            <select
              className={inputClass}
              value={getConfigValue(selectedNode, "method")}
              onChange={(event) => updateConfig("method", event.target.value)}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </ConfigField>
          <ConfigField label="Headers">
            <textarea
              className={`${inputClass} min-h-24 resize-none font-mono text-xs`}
              value={getConfigValue(selectedNode, "headers")}
              onChange={(event) => updateConfig("headers", event.target.value)}
            />
          </ConfigField>
        </>
      );

    case "delayNode":
      return (
        <>
          <ConfigField label="Duration">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={getNumericConfigValue(selectedNode, "duration")}
              onChange={(event) =>
                updateConfig("duration", Number(event.target.value))
              }
            />
          </ConfigField>
          <ConfigField label="Unit">
            <select
              className={inputClass}
              value={getConfigValue(selectedNode, "unit")}
              onChange={(event) => updateConfig("unit", event.target.value)}
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </ConfigField>
        </>
      );

    case "webhookNode":
      return (
        <>
          <ConfigField label="Endpoint">
            <input
              className={inputClass}
              value={getConfigValue(selectedNode, "endpoint")}
              onChange={(event) => updateConfig("endpoint", event.target.value)}
            />
          </ConfigField>
          <ConfigField label="Secret Key">
            <input
              className={inputClass}
              type="password"
              value={getConfigValue(selectedNode, "secretKey")}
              onChange={(event) => updateConfig("secretKey", event.target.value)}
            />
          </ConfigField>
        </>
      );

    default:
      return null;
  }
};

const PropertiesPanel = () => {
  const {
    selectedNode,
    selectedEdge,
    updateSelectedNodeData,
    updateSelectedNodeConfig,
    deleteSelectedNode,
    deleteSelectedEdge,
    clearSelection,
    validateWorkflow,
  } = useWorkflowStore();
  const validationResult = validateWorkflow();

  if (selectedEdge) {
    return (
      <aside className="w-80 flex-shrink-0 overflow-y-auto border-l bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Edge Properties</h2>
            <p className="mt-1 text-sm text-slate-500">{selectedEdge.id}</p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex size-8 items-center justify-center rounded-md border text-slate-500 transition hover:bg-slate-50"
            aria-label="Close panel"
          >
            <X className="size-4" />
          </button>
        </div>

        <dl className="mt-5 space-y-3 rounded-lg border bg-slate-50 p-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Source</dt>
            <dd className="mt-1 text-slate-900">{selectedEdge.source}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Target</dt>
            <dd className="mt-1 text-slate-900">{selectedEdge.target}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={deleteSelectedEdge}
          className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          <Trash2 className="size-4" />
          Delete edge
        </button>
      </aside>
    );
  }

  if (!selectedNode) {
    return (
      <aside className="w-80 flex-shrink-0 overflow-y-auto border-l bg-white p-4">
        <h2 className="text-lg font-semibold">Properties</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Select a node or edge on the canvas to edit its details.
        </p>

        <div className="mt-5 rounded-lg border bg-slate-50 p-3">
          <div className="text-sm font-medium text-slate-900">Validation</div>
          {validationResult.errors && validationResult.errors.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-amber-700">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-emerald-700">Workflow is valid.</p>
          )}
        </div>
      </aside>
    );
  }

  const updateConfig = (key: string, value: unknown) => {
    updateSelectedNodeConfig({
      ...selectedNode.data.config,
      [key]: value,
    });
  };

  return (
    <aside className="w-80 flex-shrink-0 overflow-y-auto border-l bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Node Properties</h2>
          <p className="mt-1 text-sm text-slate-500">{selectedNode.type}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={deleteSelectedNode}
            className="inline-flex size-8 items-center justify-center rounded-md border text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete node"
            title="Delete node"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex size-8 items-center justify-center rounded-md border text-slate-500 transition hover:bg-slate-50"
            aria-label="Close panel"
            title="Close panel"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg border bg-slate-50 p-3 text-xs">
        <div>
          <dt className="font-medium text-slate-500">ID</dt>
          <dd className="mt-1 truncate text-slate-900">{selectedNode.id}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Position</dt>
          <dd className="mt-1 text-slate-900">
            {Math.round(selectedNode.position.x)},{" "}
            {Math.round(selectedNode.position.y)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-4">
        <ConfigField label="Title">
          <input
            className={inputClass}
            placeholder="Node title"
            value={selectedNode.data.title}
            onChange={(event) =>
              updateSelectedNodeData({ title: event.target.value })
            }
          />
        </ConfigField>

        <ConfigField label="Description">
          <textarea
            className={`${inputClass} min-h-24 resize-none`}
            placeholder="Description"
            value={selectedNode.data.description ?? ""}
            onChange={(event) =>
              updateSelectedNodeData({ description: event.target.value })
            }
          />
        </ConfigField>

        <ConfigField label="Execution State">
          <select
            className={inputClass}
            value={selectedNode.data.status ?? "idle"}
            onChange={(event) =>
              updateSelectedNodeData({
                status: event.target.value as WorkflowNode["data"]["status"],
              })
            }
          >
            <option value="idle">Idle</option>
            <option value="loading">Loading</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </ConfigField>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-900">Config</h3>
          <div className="mt-3 space-y-4">
            {renderConfigFields(selectedNode, updateConfig)}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
