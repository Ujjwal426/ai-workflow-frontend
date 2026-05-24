import { useEffect, useRef, useState } from "react";
import { Terminal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useExecutionStore } from "../store/executionStore";

const ExecutionLogsPanel = () => {
  const { logs, clearLogs } = useExecutionStore();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current && isExpanded && !isMinimized) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isExpanded, isMinimized]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-emerald-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-amber-600";
      case "info":
      default:
        return "text-slate-600";
    }
  };

  const latestLogs = isExpanded ? logs : logs.slice(-5);
  const hasMoreLogs = logs.length > 5;

  if (isMinimized) {
    return (
      <div className="bg-slate-900 border-t border-slate-700 h-10 flex-shrink-0">
        <div 
          className="flex items-center justify-center px-4 h-full cursor-pointer hover:bg-slate-800 transition"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <Terminal className="size-4" />
            <span className="text-sm font-medium">Execution Logs</span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {logs.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-t border-slate-700 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsMinimized(true)}
        >
          <Terminal className="size-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">Execution Logs</h3>
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 transition"
              title="Clear logs"
            >
              <X className="size-3" />
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-700"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      {/* Logs Content */}
      {logs.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <Terminal className="size-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-500">No logs yet</p>
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            className={`overflow-y-auto bg-slate-950 ${isExpanded ? "max-h-64" : "max-h-32"}`}
          >
            <div className="p-3 space-y-1 font-mono text-xs">
              {latestLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 py-1.5 px-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <span className="text-slate-500 flex-shrink-0 mt-0.5">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  {log.nodeId && (
                    <span className="text-slate-400 flex-shrink-0 mt-0.5">
                      [{log.nodeId}]
                    </span>
                  )}
                  <span className={`${getLogColor(log.type)} flex-1`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Show More Indicator */}
          {!isExpanded && hasMoreLogs && (
            <div 
              className="py-2 text-center border-t border-slate-800 cursor-pointer hover:bg-slate-800 transition"
              onClick={() => setIsExpanded(true)}
            >
              <span className="text-xs text-slate-400 hover:text-slate-300">
                +{logs.length - 5} more entries
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExecutionLogsPanel;
