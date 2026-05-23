import { Outlet } from "react-router-dom";

import Navbar from "../components/common/Navbar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
