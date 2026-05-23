import type { NodeProps } from "reactflow";

import type { WorkflowNodeData } from "../../types/workflow.types";
import BaseNode from "./BaseNode";

const HTTPNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      title={data.title}
      description={data.description}
      status={data.status}
      config={data.config}
      color="bg-blue-500"
      selected={selected}
    />
  );
};

export default HTTPNode;
