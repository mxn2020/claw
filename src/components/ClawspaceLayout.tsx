import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { useViewMode } from "../context/ViewModeContext";
import "./ClawspaceLayout.css";

const SIDEBAR_ITEMS = [
    { type: "link" as const, path: "", label: "Overview", icon: "📊" },
    { type: "header" as const, label: "ClawBot" },
    { type: "link" as const, path: "chatbot", label: "Chatbot", icon: "💬" },
    { type: "link" as const, path: "projects", label: "Projects", icon: "📁" },
    { type: "link" as const, path: "tasks", label: "Tasks", icon: "✅" },
    { type: "header" as const, label: "Configuration" },
    { type: "link" as const, path: "channels", label: "Channels", icon: "📡" },
    { type: "link" as const, path: "agents", label: "Agents", icon: "🤖" },
    { type: "link" as const, path: "tools", label: "Tools", icon: "🔧" },
    { type: "link" as const, path: "models", label: "Models", icon: "🧠" },
    { type: "link" as const, path: "platforms", label: "Platforms", icon: "🌐" },
    { type: "link" as const, path: "gateway-ops", label: "Gateway & Ops", icon: "⚙️" },
    { type: "link" as const, path: "settings", label: "Settings", icon: "🔒" },
];

export default function ClawspaceLayout() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const instance = useQuery(
        api.instances.getWithServer,
        id ? { id: id as Id<"instances"> } : "skip"
    );

    // Fetch all instances for the switcher
    const allServers = useQuery(api.servers.listWithInstances);
    const { viewMode } = useViewMode();

    // In server mode: show only instances from the current instance's server
    // In unified mode: show all instances across all servers
    const switcherInstances = allServers?.flatMap((s) =>
        viewMode === "server" && instance?.serverId !== s._id
            ? []
            : s.instances.map((i) => ({ ...i, serverHostname: s.hostname }))
    ) ?? [];

    if (instance === undefined) {
        return (
            <div className="clawspace-loading">
                <div className="loading-spinner" />
                <span className="loading-text">Loading Clawspace…</span>
            </div>
        );
    }

    if (instance === null) {
        return (
            <div className="clawspace-loading">
                <h3>Instance not found</h3>
                <button className="back-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>
            </div>
        );
    }

    const displayName = instance.name || `Instance #${instance.instanceNumber}`;
    const displayIcon = instance.icon || "⚡";
    const basePath = `/instance/${id}`;
    const currentPath = location.pathname.replace(basePath, "").replace(/^\//, "");

    return (
        <div className="clawspace">
            <aside className="clawspace-sidebar">
                <div className="sidebar-header">
                    <button className="sidebar-back" onClick={() => navigate("/")}>
                        ← Dashboard
                    </button>
                    <InstanceSwitcher
                        currentInstance={instance}
                        allInstances={switcherInstances}
                        displayName={displayName}
                        displayIcon={displayIcon}
                        onSwitch={(instanceId) => navigate(`/instance/${instanceId}`)}
                        viewMode={viewMode}
                    />
                </div>

                <nav className="sidebar-nav">
                    {SIDEBAR_ITEMS.map((item, i) => {
                        if (item.type === "header") {
                            return <div key={i} className="sidebar-section-header">{item.label}</div>;
                        }
                        const isActive = currentPath === item.path;
                        return (
                            <button
                                key={i}
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
                        <span className="sidebar-footer-label">Port</span>
                        <span className="sidebar-footer-value">{instance.port}</span>
                    </div>
                    <div className="sidebar-footer-info">
                        <span className="sidebar-footer-label">Tunnel</span>
                        <span className="sidebar-footer-value">:{instance.tunnelPort}</span>
                    </div>
                    <div className="sidebar-footer-info">
                        <span className="sidebar-footer-label">v{instance.version}</span>
                    </div>
                </div>
            </aside>

            <main className="clawspace-content">
                <Outlet context={{ instance }} />
            </main>
        </div>
    );
}

/* -------------------------------------------------- */
/* Instance Switcher                                  */
/* -------------------------------------------------- */

type SwitcherInstance = {
    _id: string;
    name?: string;
    icon?: string;
    color?: string;
    instanceNumber: number;
    status: string;
    serverHostname?: string;
};

function InstanceSwitcher({
    currentInstance,
    allInstances,
    displayName,
    displayIcon,
    onSwitch,
    viewMode,
}: {
    currentInstance: { _id: string; color?: string; status: string; description?: string };
    allInstances: SwitcherInstance[];
    displayName: string;
    displayIcon: string;
    onSwitch: (id: string) => void;
    viewMode: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="instance-switcher" ref={ref}>
            <button
                className="switcher-trigger"
                onClick={() => setOpen(!open)}
                style={{ borderLeftColor: currentInstance.color || "var(--border-subtle)" }}
            >
                <span className="switcher-icon" style={{ background: currentInstance.color || "var(--bg-elevated)" }}>
                    {displayIcon}
                </span>
                <div className="switcher-info">
                    <span className="switcher-name">{displayName}</span>
                    <span className={`sidebar-status ${currentInstance.status}`}>
                        <span className="status-dot" />{currentInstance.status}
                    </span>
                </div>
                <span className={`switcher-chevron ${open ? "open" : ""}`}>▾</span>
            </button>

            {currentInstance.description && !open && (
                <p className="sidebar-description">{currentInstance.description}</p>
            )}

            {open && (
                <div className="switcher-dropdown">
                    <div className="switcher-dropdown-header">
                        {viewMode === "server" ? "Server Instances" : "All Clawspaces"}
                    </div>
                    {allInstances
                        .sort((a, b) => a.instanceNumber - b.instanceNumber)
                        .map((inst) => {
                            const isActive = inst._id === currentInstance._id;
                            const name = inst.name || `Instance #${inst.instanceNumber}`;
                            const icon = inst.icon || "⚡";
                            return (
                                <button
                                    key={inst._id}
                                    className={`switcher-option ${isActive ? "active" : ""}`}
                                    onClick={() => { onSwitch(inst._id); setOpen(false); }}
                                >
                                    <span className="switcher-option-icon" style={{ background: inst.color || "var(--bg-elevated)" }}>
                                        {icon}
                                    </span>
                                    <div className="switcher-option-info">
                                        <span className="switcher-option-name">{name}</span>
                                        <span className={`switcher-option-status ${inst.status}`}>
                                            <span className="status-dot" />{inst.status}
                                            {viewMode === "unified" && inst.serverHostname && (
                                                <span className="switcher-option-server"> · {inst.serverHostname}</span>
                                            )}
                                        </span>
                                    </div>
                                    {isActive && <span className="switcher-check">✓</span>}
                                </button>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
