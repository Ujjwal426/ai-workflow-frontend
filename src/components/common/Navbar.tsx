import { NavLink } from "react-router-dom";
import { Bell, LayoutDashboard, User, Workflow } from "lucide-react";

const navItems = [
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

const Navbar = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-4 md:gap-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Workflow size={18} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold leading-none text-slate-950">
              AI Builder
            </h1>
            <p className="mt-1 text-xs text-slate-500">Workflow studio</p>
          </div>
        </NavLink>

        <nav className="flex min-w-0 items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition sm:px-3 ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-white transition hover:bg-slate-800"
          aria-label="User profile"
        >
          <User size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
