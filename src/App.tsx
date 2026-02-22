import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ClawspaceLayout from "./components/ClawspaceLayout";
import AdminLayout from "./components/AdminLayout";
import OverviewPage from "./pages/OverviewPage";
import ChatbotPage from "./pages/ChatbotPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import ChannelsPage from "./pages/ChannelsPage";
import AgentsPage from "./pages/AgentsPage";
import ToolsPage from "./pages/ToolsPage";
import ModelsPage from "./pages/ModelsPage";
import PlatformsPage from "./pages/PlatformsPage";
import GatewayOpsPage from "./pages/GatewayOpsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminInstancesPage from "./pages/admin/AdminInstancesPage";
import AdminServerPage from "./pages/admin/AdminServerPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/instance/:id" element={<ClawspaceLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="channels" element={<ChannelsPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="platforms" element={<PlatformsPage />} />
        <Route path="gateway-ops" element={<GatewayOpsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="instances" element={<AdminInstancesPage />} />
        <Route path="server" element={<AdminServerPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
