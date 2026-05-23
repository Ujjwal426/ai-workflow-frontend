import NodeSidebar from "../components/sidebar/NodeSidebar";
import WorkflowCanvas from "../components/canvas/WorkflowCanvas";
import PropertiesPanel from "../components/panel/PropertiesPanel";

const WorkflowPage = () => {
  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] bg-slate-100">
      <NodeSidebar />

      <div className="flex-1">
        <WorkflowCanvas />
      </div>

      <PropertiesPanel />
    </div>
  );
};

export default WorkflowPage;
