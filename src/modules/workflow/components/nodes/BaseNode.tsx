import { Handle, Position } from "reactflow";

interface Props {
  title: string;
  description?: string;
  status?: "idle" | "loading" | "success" | "error";
  config?: Record<string, unknown>;
  color: string;
  selected?: boolean;
  executionStatus?: "idle" | "running" | "success" | "error";
}

const executionBorderStyles = {
  idle: "",
  running: "border-yellow-400 border-2",
  success: "border-green-400 border-2",
  error: "border-red-400 border-2",
};

const BaseNode = ({
  title,
  description,
  config,
  color,
  selected = false,
  executionStatus = "idle",
}: Props) => {
  const configFields = Object.keys(config ?? {}).length;

  return (
    <div
      className={`min-w-[190px] rounded-xl border bg-white shadow-lg ${
        selected
          ? "border-slate-900 ring-2 ring-slate-300"
          : executionStatus === "idle"
            ? "border-slate-200"
            : executionBorderStyles[executionStatus]
      }`}
    >
      <Handle type="target" position={Position.Top} />

      <div className={`${color} rounded-t-xl px-4 py-2 text-white`}>
        {title}
      </div>

      <div className="space-y-3 p-4 text-sm leading-5 text-slate-600">
        <p>{description || "Workflow node"}</p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
            {configFields} config {configFields === 1 ? "field" : "fields"}
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
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BaseNode;
