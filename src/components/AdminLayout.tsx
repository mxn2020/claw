import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./AdminLayout.css";

const ADMIN_ITEMS = [
    { path: "", label: "Overview", icon: "📊" },
    { path: "instances", label: "Instances", icon: "🦀" },
    { path: "server", label: "Server", icon: "🖥️" },
    { path: "logs", label: "Logs", icon: "📜" },
    { path: "settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = "/admin";
    const currentPath = location.pathname.replace(basePath, "").replace(/^\//, "");

    return (
        <div className="admin">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <button className="sidebar-back" onClick={() => navigate("/")}>
                        ← Dashboard
                    </button>
                    <div className="admin-title">
                        <span className="admin-title-icon">🛡️</span>
                        <div className="admin-title-info">
                            <span className="admin-title-name">Admin Panel</span>
                            <span className="admin-title-sub">OpenClaw Management</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {ADMIN_ITEMS.map((item) => {
                        const isActive = currentPath === item.path;
                        return (
                            <button
                                key={item.path}
                                className={`sidebar-link ${isActive ? "active" : ""}`}
                                onClick={() => navigate(item.path ? `${basePath}/${item.path}` : basePath)}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-footer-info">
                        <span className="sidebar-footer-label">Admin Panel v1.0</span>
                    </div>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
