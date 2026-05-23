import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  Globe,
  Plus,
  Timer,
  Webhook,
  Workflow,
} from "lucide-react";

import {
  getWorkflows,
  workflowQueryKeys,
} from "@/modules/workflow/api/workflowApi";
import type { WorkflowRecord } from "@/modules/workflow/types/workflow.types";

const nodeTypes = [
  {
    icon: Bot,
    label: "AI Node",
    description: "Run prompts with language models",
  },
  {
    icon: Globe,
    label: "HTTP Node",
    description: "Call external APIs and services",
  },
  {
    icon: Timer,
    label: "Delay Node",
    description: "Add timed pauses between steps",
  },
  {
    icon: Webhook,
    label: "Webhook Node",
    description: "Trigger workflows via webhooks",
  },
];

const formatDate = (value?: string) => {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getNodeCount = (w: WorkflowRecord) =>
  w.workflowJson?.nodes?.length ?? w.nodes?.length ?? 0;

const DashboardPage = () => {
  const { data: workflows, isLoading } = useQuery({
    queryKey: workflowQueryKeys.all,
    queryFn: getWorkflows,
  });

  const total = workflows?.length ?? 0;
  const active = workflows?.filter((w) => w.status === "active").length ?? 0;
  const draft = workflows?.filter((w) => w.status === "draft" || !w.status).length ?? 0;

  const recent = workflows
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.updatedAt ?? a.createdAt ?? 0).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Hero */}
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Welcome to AI Builder
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
          Design and automate AI-powered workflows visually. Connect AI models,
          APIs, webhooks, and timing controls into pipelines — no code required.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/workflows"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Workflow className="size-4" />
            View Workflows
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { label: "Total Workflows", value: total, color: "bg-slate-950 text-white" },
          { label: "Active", value: active, color: "bg-emerald-50 text-emerald-700" },
          { label: "Draft", value: draft, color: "bg-amber-50 text-amber-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {isLoading ? "—" : stat.value}
            </p>
            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${stat.color}`}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Workflows */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Recent Workflows
          </h2>
          <Link
            to="/workflows"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {!isLoading && (!recent || recent.length === 0) && (
          <div className="p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <Workflow className="size-5" />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              No workflows yet. Create your first one to get started.
            </p>
            <Link
              to="/workflows"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Create Workflow
            </Link>
          </div>
        )}

        {!isLoading && recent && recent.length > 0 && (
          <ul className="divide-y">
            {recent.map((w) => (
              <li key={w.id}>
                <Link
                  to={`/workflows/${w.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Workflow className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {w.name || "Untitled workflow"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {w.description || `${getNodeCount(w)} nodes`}
                    </p>
                  </div>
                  <div className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                    <CalendarClock className="size-3.5" />
                    {formatDate(w.updatedAt)}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-500">
                    {w.status ?? "draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Node Types */}
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Available Node Types
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Drag these onto the canvas when building a workflow.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.label}
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-950">
                  {node.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {node.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
