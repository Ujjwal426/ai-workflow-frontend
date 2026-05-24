import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { generateWorkflow } from "../api/workflowApi";
import type { GenerateWorkflowRequest } from "../api/workflowApi";

interface AIWorkflowGeneratorProps {
  onWorkflowGenerated: (nodes: any[], edges: any[]) => void;
  onClose: () => void;
}

const AIWorkflowGenerator = ({ onWorkflowGenerated, onClose }: AIWorkflowGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe your workflow");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateWorkflowRequest = { prompt };
      const response = await generateWorkflow(request);

      // Convert AI response to React Flow format
      const reactFlowNodes = response.nodes.map((node) => {
        // Map AI response types to React Flow node types
        const typeMapping: Record<string, string> = {
          "startNode": "startNode",
          "endNode": "endNode",
          "webhookNode": "webhookNode",
          "delayNode": "delayNode",
          "httpNode": "httpNode",
          "aiNode": "aiNode",
        };

        return {
          id: node.id,
          type: typeMapping[node.type] || node.type,
          position: { x: 0, y: 0 }, // Will be auto-laid out
          data: {
            title: node.title,
            description: node.description,
            status: "idle" as const,
            config: node.config,
          },
        };
      });

      const reactFlowEdges = response.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
      }));

      onWorkflowGenerated(reactFlowNodes, reactFlowEdges);
      onClose();
      toast.success("Workflow generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate workflow");
      toast.error(err instanceof Error ? err.message : "Failed to generate workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "When webhook receives data, wait 5 seconds and call an API",
    "Start with webhook, process with AI, then send HTTP request",
    "Receive webhook, delay for 10 seconds, call external API",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="size-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">AI Workflow Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="size-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe your workflow in plain English
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., When webhook receives data, wait 5 seconds and call an API"
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Example Prompts */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate Workflow
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowGenerator;
