import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import { useState } from "react";

import {
  createWorkflow,
  deleteWorkflow,
  getWorkflows,
  workflowQueryKeys,
} from "../api/workflowApi";
import type { WorkflowPayload, WorkflowRecord } from "../types/workflow.types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WorkflowFormValues {
  name: string;
  description: string;
}

const emptyWorkflowJson: WorkflowPayload["workflowJson"] = {
  nodes: [],
  edges: [],
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
};

const getWorkflowJson = (workflow: WorkflowRecord) =>
  workflow.workflowJson ?? {
    nodes: workflow.nodes ?? [],
    edges: workflow.edges ?? [],
    viewport: workflow.viewport,
  };

const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] =
    useState<WorkflowRecord | null>(null);
  const form = useForm<WorkflowFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: workflowQueryKeys.all,
    queryFn: getWorkflows,
  });
  const createMutation = useMutation({
    mutationFn: createWorkflow,
    onSuccess: (workflow) => {
      void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.all });
      form.reset();
      setIsCreateOpen(false);
      navigate(`/workflows/${workflow.id}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.all });
      setWorkflowToDelete(null);
    },
  });

  const onCreateWorkflow = (values: WorkflowFormValues) => {
    createMutation.mutate({
      name: values.name,
      description: values.description,
      workflowJson: emptyWorkflowJson,
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Workflows
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage saved workflow automations and open the builder.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Create Workflow
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create workflow</DialogTitle>
              <DialogDescription>
                Name the workflow now. You can build and save its nodes in the
                editor.
              </DialogDescription>
            </DialogHeader>

            <form
              className="mt-5 space-y-4"
              onSubmit={form.handleSubmit(onCreateWorkflow)}
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Workflow name
                </span>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Customer onboarding"
                  {...form.register("name", {
                    required: "Workflow name is required.",
                  })}
                />
                {form.formState.errors.name && (
                  <span className="mt-1 block text-xs text-red-600">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Workflow description
                </span>
                <textarea
                  className="mt-1 min-h-24 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="What should this workflow automate?"
                  {...form.register("description")}
                />
              </label>

              <DialogFooter>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Create
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-lg border bg-white p-5 shadow-sm"
            >
              <div className="h-5 w-2/3 rounded bg-slate-100" />
              <div className="mt-4 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
              <div className="mt-8 h-4 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-4" />
            Could not load workflows
          </div>
          <p className="mt-2 text-sm">
            Make sure the backend is running at your configured API URL.
          </p>
        </div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <div className="rounded-lg border border-dashed bg-white p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Workflow className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            No workflows yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your first workflow and save it from the builder.
          </p>
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((workflow) => {
            const workflowJson = getWorkflowJson(workflow);

            return (
              <div
                key={workflow.id}
                className="group rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                    <Workflow className="size-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-500">
                    {workflow.status ?? "draft"}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-950">
                  {workflow.name || "Untitled workflow"}
                </h3>

                <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
                  {workflow.description ||
                    `${workflowJson.edges.length} connections configured`}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{workflowJson.nodes.length} nodes</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    {formatUpdatedAt(workflow.updatedAt)}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => setWorkflowToDelete(workflow)}
                    className="inline-flex size-9 items-center justify-center rounded-md border text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete workflow"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(workflowToDelete)}
        onOpenChange={(open) => !open && setWorkflowToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workflow?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The workflow will be removed from
              your backend.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (workflowToDelete) {
                  deleteMutation.mutate(workflowToDelete.id);
                }
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowDashboard;
