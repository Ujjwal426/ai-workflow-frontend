import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Workflow } from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Workflows",
    path: "/workflows",
    icon: Workflow,
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="border-b p-5 text-xl font-bold">AI Builder</div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                location.pathname === item.path
                  ? "bg-black text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
