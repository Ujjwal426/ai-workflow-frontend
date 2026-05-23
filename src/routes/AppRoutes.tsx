import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import DashboardPage from "../pages/Dashboard/DashboardPage";
import WorkflowDashboard from "../modules/workflow/pages/WorkflowDashboard";
import WorkflowPage from "../modules/workflow/pages/WorkflowPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workflows" element={<WorkflowDashboard />} />
        <Route path="/workflows/new" element={<WorkflowPage />} />
        <Route path="/workflows/:workflowId" element={<WorkflowPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
