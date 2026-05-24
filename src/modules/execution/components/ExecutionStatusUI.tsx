import { Activity, AlertCircle, CheckCircle, Clock, Loader2, X, XCircle } from "lucide-react";
import { useExecutionStore } from "../store/executionStore";
import { useWorkflowStore } from "../../workflow/store/workflowStore";

const ExecutionStatusUI = () => {
  const {
    workflowStatus,
    workflowStartTime,
    workflowEndTime,
    workflowDuration,
    resetExecution,
  } = useExecutionStore();
  
  const resetExecutionState = useWorkflowStore((state) => state.resetExecutionState);

  const handleClose = () => {
    resetExecution();
    resetExecutionState();
  };

  if (workflowStatus === "idle") {
    return null;
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return "0s";
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${Math.floor(milliseconds / 100)}s`;
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "--:--:--";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusConfig = () => {
    switch (workflowStatus) {
      case "running":
        return {
          icon: <Loader2 className="size-5 animate-spin" />,
          title: "Workflow Running",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
          iconBg: "bg-blue-500",
        };
      case "completed":
        return {
          icon: <CheckCircle className="size-5" />,
          title: "Workflow Completed",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-700",
          iconBg: "bg-emerald-500",
        };
      case "failed":
        return {
          icon: <XCircle className="size-5" />,
          title: "Workflow Failed",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          iconBg: "bg-red-500",
        };
      default:
        return {
          icon: <Clock className="size-5" />,
          title: "Workflow Idle",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          textColor: "text-slate-700",
          iconBg: "bg-slate-500",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl border-2 shadow-lg ${statusConfig.bgColor} ${statusConfig.borderColor}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`${statusConfig.iconBg} size-10 rounded-full flex items-center justify-center text-white`}
        >
          {statusConfig.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${statusConfig.textColor}`}>
              {statusConfig.title}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-600">
              Started: {formatTime(workflowStartTime)}
            </span>
            {workflowEndTime && (
              <span className="text-slate-600">
                Ended: {formatTime(workflowEndTime)}
              </span>
            )}
            <span className="text-slate-600">
              Duration: {formatDuration(workflowDuration)}
            </span>
          </div>
        </div>

        {workflowStatus === "running" && (
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-blue-500 animate-pulse" />
            <span className="text-xs text-blue-700 font-medium">Live</span>
          </div>
        )}

        {workflowStatus === "completed" && (
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">Success</span>
          </div>
        )}

        {workflowStatus === "failed" && (
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500" />
            <span className="text-xs text-red-700 font-medium">Error</span>
          </div>
        )}

        {(workflowStatus === "completed" || workflowStatus === "failed") && (
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="size-4 text-slate-600 hover:text-slate-800" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExecutionStatusUI;
