import { Handle, Position } from "reactflow";

interface Props {
  title: string;
  description?: string;
  status?: "idle" | "loading" | "success" | "error";
  config?: Record<string, unknown>;
  color: string;
  selected?: boolean;
}

const statusStyles = {
  idle: "bg-slate-100 text-slate-500",
  loading: "bg-blue-50 text-blue-700",
  success: "bg-emerald-50 text-emerald-700",
  error: "bg-red-50 text-red-700",
};

const BaseNode = ({
  title,
  description,
  status = "idle",
  config,
  color,
  selected = false,
}: Props) => {
  const configFields = Object.keys(config ?? {}).length;

  return (
    <div
      className={`min-w-[190px] rounded-xl border bg-white shadow-lg ${
        selected ? "border-slate-900 ring-2 ring-slate-300" : "border-slate-200"
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
          <div
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
          >
            {status}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BaseNode;
