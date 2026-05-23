import type { DragEvent } from "react";
import { Bot, Clock, GripVertical, Globe2, RadioTower, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { WorkflowNodeType } from "../../types/workflow.types";

const nodeItems = [
  {
    type: "aiNode",
    label: "AI Node",
    description: "Generate, classify, or transform text.",
    category: "AI",
    icon: Bot,
  },
  {
    type: "webhookNode",
    label: "Webhook Node",
    description: "Trigger from an incoming request.",
    category: "Triggers",
    icon: RadioTower,
  },
  {
    type: "httpNode",
    label: "HTTP Node",
    description: "Call an external API.",
    category: "Actions",
    icon: Globe2,
  },
  {
    type: "delayNode",
    label: "Delay Node",
    description: "Wait before the next action.",
    category: "Logic",
    icon: Clock,
  },
] satisfies Array<{
  type: WorkflowNodeType;
  label: string;
  description: string;
  category: string;
  icon: typeof Bot;
}>;

const NodeSidebar = () => {
  const [search, setSearch] = useState("");

  const categorizedNodes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredNodes = query
      ? nodeItems.filter((node) =>
          [node.label, node.description, node.category]
            .join(" ")
            .toLowerCase()
            .includes(query),
        )
      : nodeItems;

    return filteredNodes.reduce<Record<string, typeof nodeItems>>(
      (groups, node) => {
        groups[node.category] = [...(groups[node.category] ?? []), node];
        return groups;
      },
      {},
    );
  }, [search]);

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("text/plain", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-72 border-r bg-white p-4">
      <h2 className="text-lg font-semibold">Nodes</h2>
      <p className="mt-1 text-sm text-slate-500">Drag a block onto canvas.</p>

      <label className="mt-5 flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm text-slate-500">
        <Search className="size-4" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search nodes"
          className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="mt-5 space-y-5">
        {Object.entries(categorizedNodes).map(([category, nodes]) => (
          <section key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </h3>

            <div className="space-y-3">
              {nodes.map((node) => (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  className="group cursor-grab rounded-lg border bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white active:cursor-grabbing"
                >
                  <div className="flex items-start gap-3">
                    <node.icon className="mt-0.5 size-4 text-slate-700" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">
                        {node.label}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {node.description}
                      </div>
                    </div>
                    <GripVertical className="mt-0.5 size-4 text-slate-300 transition group-hover:text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {Object.keys(categorizedNodes).length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
            No nodes found.
          </div>
        )}
      </div>
    </aside>
  );
};

export default NodeSidebar;
