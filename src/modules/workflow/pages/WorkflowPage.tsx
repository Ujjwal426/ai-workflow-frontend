import { useState } from "react";
import { Sparkles } from "lucide-react";
import NodeSidebar from "../components/sidebar/NodeSidebar";
import WorkflowCanvas from "../components/canvas/WorkflowCanvas";
import PropertiesPanel from "../components/panel/PropertiesPanel";
import ExecutionLogsPanel from "../../execution/components/ExecutionLogsPanel";
import AIWorkflowGenerator from "../components/AIWorkflowGenerator";
import { useWorkflowStore } from "../store/workflowStore";

const WorkflowPage = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const loadAIGeneratedWorkflow = useWorkflowStore(
    (state) => state.loadAIGeneratedWorkflow,
  );

  const handleWorkflowGenerated = (nodes: any[], edges: any[]) => {
    loadAIGeneratedWorkflow(nodes, edges);
  };

  return (
    <>
      <div className="-m-6 flex flex-col h-[calc(100vh-4rem)] bg-slate-100">
        <div className="flex flex-1 overflow-hidden">
          <NodeSidebar />

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative overflow-hidden">
              <WorkflowCanvas />

              {/* AI Generator Button */}
              <button
                onClick={() => setShowAIGenerator(true)}
                className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-violet-600 hover:to-purple-700 transition"
              >
                <Sparkles className="size-4" />
                AI Generate
              </button>
            </div>

            <PropertiesPanel />
          </div>
        </div>

        {/* Logs Panel at bottom */}
        <ExecutionLogsPanel />
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIWorkflowGenerator
          onWorkflowGenerated={handleWorkflowGenerated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </>
  );
};

export default WorkflowPage;
