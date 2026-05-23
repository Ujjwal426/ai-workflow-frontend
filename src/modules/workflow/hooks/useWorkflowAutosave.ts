import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";

import { updateWorkflow } from "../api/workflowApi";
import type { WorkflowPayload } from "../types/workflow.types";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const autosave = debounce(
  async (workflowId: string, payload: WorkflowPayload) => {
    await updateWorkflow(workflowId, payload);
  },
  1500,
);

export const useWorkflowAutosave = (
  workflowId: string | undefined,
  payload: WorkflowPayload,
) => {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const serializedPayload = useMemo(() => JSON.stringify(payload), [payload]);

  useEffect(() => {
    if (!workflowId) {
      return;
    }

    const savingTimer = window.setTimeout(() => setStatus("saving"), 0);

    autosave(workflowId, payload)
      ?.then(() => setStatus("saved"))
      .catch(() => setStatus("error"));

    return () => {
      window.clearTimeout(savingTimer);
      autosave.cancel();
    };
  }, [payload, serializedPayload, workflowId]);

  return status;
};
