import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";

import type { WorkflowNodeData } from "../../types/workflow.types";
import { useExecutionStore } from "../../../execution/store/executionStore";

const executionBorderStyles = {
  idle: "",
  running: "border-yellow-400 border-2",
  success: "border-green-400 border-2",
  error: "border-red-400 border-2",
};

const EndNode = ({ data, selected, id }: NodeProps<WorkflowNodeData>) => {
  const nodeStates = useExecutionStore((state) => state.nodeStates);
  const executionStatus = nodeStates[id || ""]?.status || "idle";

  const statusStyles = {
    idle: "bg-slate-100 text-slate-500",
    loading: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div
      className={`min-w-[140px] rounded-xl border bg-white shadow-lg ${
        selected
          ? "border-slate-900 ring-2 ring-slate-300"
          : executionStatus === "idle"
            ? "border-slate-200"
            : executionBorderStyles[executionStatus]
      }`}
    >
      <div className="bg-red-500 rounded-t-xl px-4 py-2 text-white">
        {data.title}
      </div>

      <div className="space-y-3 p-4 text-sm leading-5 text-slate-600">
        <p>{data.description || "Workflow node"}</p>
        <div
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles[data.status ?? "idle"]}`}
        >
          {data.status ?? "idle"}
        </div>
        {executionStatus !== "idle" && (
          <div
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
              executionStatus === "running"
                ? "bg-yellow-100 text-yellow-700"
                : executionStatus === "success"
                  ? "bg-green-100 text-green-700"
                  : executionStatus === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-500"
            }`}
          >
            {executionStatus}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !border-2 !border-red-600"
      />
    </div>
  );
};

export default EndNode;
