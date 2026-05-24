import { useState } from "react";
import { Play, RefreshCw, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

import { loadExampleWorkflow } from "./ExampleWorkflow";
import { useWorkflowStore } from "../store/workflowStore";

const WorkflowDemo = () => {
  const [selectedExample, setSelectedExample] = useState<"simple" | "complex" | "circular">("complex");
  const [demoStep, setDemoStep] = useState(0);
  const {
    nodes,
    edges,
    isValid,
    validation,
    executionStatus,
    startExecution,
    resetExecutionState,
    validateWorkflow,
    setValidation,
  } = useWorkflowStore();

  const handleLoadExample = (type: "simple" | "complex" | "circular") => {
    setSelectedExample(type);
    loadExampleWorkflow(type);
    setDemoStep(1);
    // Trigger validation after loading
    setTimeout(() => {
      const validationResult = validateWorkflow();
      setValidation(validationResult);
      setDemoStep(2);
    }, 100);
  };

  const handleExecuteDemo = () => {
    if (!isValid) {
      toast.error("Please fix validation errors before executing");
      return;
    }

    const executionId = crypto.randomUUID();
    startExecution(executionId);
    setDemoStep(3);
  };

  const handleResetDemo = () => {
    resetExecutionState();
    setDemoStep(0);
  };

  const examples = [
    {
      id: "simple" as const,
      title: "Simple Linear Workflow",
      description: "Basic Start → AI → End flow",
      icon: Sparkles,
    },
    {
      id: "complex" as const,
      title: "Complex Branching Workflow",
      description: "Multi-path workflow with AI processing",
      icon: Zap,
    },
    {
      id: "circular" as const,
      title: "Circular Monitoring Workflow",
      description: "Continuous execution loop",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="workflow-demo p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center">
          <Play className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Workflow Demo</h2>
          <p className="text-sm text-slate-600">Test the practical workflow system</p>
        </div>
      </div>

      {/* Example Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Select Example Workflow:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {examples.map((example) => {
            const Icon = example.icon;
            return (
              <button
                key={example.id}
                onClick={() => handleLoadExample(example.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedExample === example.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="size-5 text-slate-700" />
                  <span className="font-medium text-slate-900">{example.title}</span>
                </div>
                <p className="text-xs text-slate-600">{example.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow Status */}
      {nodes.length > 0 && (
        <div className="space-y-4">
          {/* Workflow Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{nodes.length}</div>
              <div className="text-xs text-slate-600">Nodes</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{edges.length}</div>
              <div className="text-xs text-slate-600">Connections</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className={`text-2xl font-bold ${isValid ? "text-emerald-600" : "text-red-600"}`}>
                {isValid ? "✓" : "✗"}
              </div>
              <div className="text-xs text-slate-600">Valid</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{executionStatus}</div>
              <div className="text-xs text-slate-600">Status</div>
            </div>
          </div>

          {/* Validation Status */}
          <div
            className={`p-4 rounded-lg border ${
              isValid
                ? "bg-emerald-50 border-emerald-200"
                : validation?.errors && validation.errors.length > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="font-medium mb-2">
              {isValid ? "✓ Workflow is valid" : "✗ Workflow has errors"}
            </div>
            {validation?.errors && validation.errors.length > 0 && (
              <ul className="text-sm space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-red-700">
                    • {error}
                  </li>
                ))}
              </ul>
            )}
            {validation?.warnings && validation.warnings.length > 0 && (
              <div className="mt-2">
                <div className="font-medium text-amber-700 mb-1">Warnings:</div>
                <ul className="text-sm space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-amber-700">
                      ⚠ {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Demo Progress */}
          {demoStep > 0 && (
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="font-medium text-slate-900">Demo Progress:</div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        demoStep >= step
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {demoStep === 1 && "Workflow loaded successfully"}
                {demoStep === 2 && "Validation completed"}
                {demoStep === 3 && "Ready for execution"}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExecuteDemo}
              disabled={!isValid || executionStatus === "running"}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Play className="size-4" />
              Execute Workflow
            </button>
            <button
              onClick={handleResetDemo}
              className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-medium hover:bg-slate-300 transition"
            >
              <RefreshCw className="size-4" />
              Reset
            </button>
          </div>

          {/* Node Breakdown */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-3">Node Breakdown:</h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-900">{node.data.title}</div>
                    <div className="text-xs text-slate-600">{node.type}</div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      node.data.status === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : node.data.status === "error"
                          ? "bg-red-100 text-red-700"
                          : node.data.status === "loading"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {node.data.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial State */}
      {nodes.length === 0 && (
        <div className="text-center py-8 text-slate-600">
          <Sparkles className="size-12 mx-auto mb-3 text-slate-400" />
          <p className="text-lg font-medium">Select an example workflow to begin</p>
          <p className="text-sm">Choose from simple, complex, or circular workflows</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowDemo;
