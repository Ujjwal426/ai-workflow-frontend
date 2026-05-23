import type { NodeProps } from "reactflow";

import type { WorkflowNodeData } from "../../types/workflow.types";
import BaseNode from "./BaseNode";

const WebhookNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      title={data.title}
      description={data.description}
      status={data.status}
      config={data.config}
      color="bg-emerald-500"
      selected={selected}
    />
  );
};

export default WebhookNode;
