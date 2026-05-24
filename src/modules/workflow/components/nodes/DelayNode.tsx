import type { NodeProps } from "reactflow";

import type { WorkflowNodeData } from "../../types/workflow.types";
import BaseNode from "./BaseNode";
import { useExecutionStore } from "../../../execution/store/executionStore";

const DelayNode = ({ data, selected, id }: NodeProps<WorkflowNodeData>) => {
  const nodeStates = useExecutionStore((state) => state.nodeStates);
  const executionStatus = nodeStates[id || ""]?.status || "idle";

  return (
    <BaseNode
      title={data.title}
      description={data.description}
      status={data.status}
      config={data.config}
      color="bg-orange-500"
      selected={selected}
      executionStatus={executionStatus}
    />
  );
};

export default DelayNode;
