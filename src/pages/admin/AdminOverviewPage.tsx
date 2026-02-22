import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

export default function AdminOverviewPage() {
    const data = useQuery(api.servers.listWithInstances);
    const navigate = useNavigate();

    if (data === undefined) {
        return <div className="loading-container"><div className="loading-spinner" /><span className="loading-text">Loading…</span></div>;
    }

    const totalInstances = data.reduce((s, sv) => s + sv.instances.length, 0);
    const running = data.reduce((s, sv) => s + sv.instances.filter(i => i.status === "running").length, 0);
    const stopped = data.reduce((s, sv) => s + sv.instances.filter(i => i.status === "stopped").length, 0);
    const named = data.reduce((s, sv) => s + sv.instances.filter(i => i.name).length, 0);
    const totalMemMb = data.reduce((s, sv) => s + sv.instances.reduce((m, i) => m + (i.memoryMb || 0), 0), 0);

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🛡️ Admin Overview</h1>
                <p>System-wide overview of all OpenClaw infrastructure</p>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat">
                    <div className="admin-stat-label">Servers</div>
                    <div className="admin-stat-value" style={{ color: "var(--accent)" }}>{data.length}</div>
                </div>
                <div className="admin-stat">
                    <div className="admin-stat-label">Total Instances</div>
                    <div className="admin-stat-value" style={{ color: "var(--accent)" }}>{totalInstances}</div>
                </div>
                <div className="admin-stat">
                    <div className="admin-stat-label">Running</div>
                    <div className="admin-stat-value" style={{ color: "var(--success)" }}>{running}</div>
                </div>
                <div className="admin-stat">
                    <div className="admin-stat-label">Stopped</div>
                    <div className="admin-stat-value" style={{ color: stopped > 0 ? "var(--error)" : "var(--text-muted)" }}>{stopped}</div>
                </div>
                <div className="admin-stat">
                    <div className="admin-stat-label">Named</div>
                    <div className="admin-stat-value" style={{ color: "var(--text-primary)" }}>{named}</div>
                </div>
                <div className="admin-stat">
                    <div className="admin-stat-label">Total Memory</div>
                    <div className="admin-stat-value" style={{ color: "var(--text-primary)" }}>{(totalMemMb / 1024).toFixed(1)} GB</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="overview-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                    <button className="action-btn" onClick={() => navigate("/admin/instances")}>🦀 Manage Instances</button>
                    <button className="action-btn" onClick={() => navigate("/admin/server")}>🖥️ Server Details</button>
                    <button className="action-btn" onClick={() => navigate("/admin/logs")}>📜 View Logs</button>
                    <button className="action-btn" onClick={() => navigate("/")}>📊 Back to Dashboard</button>
                </div>
            </div>

            {/* Servers table */}
            <div className="overview-section">
                <h3>Servers</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Hostname</th>
                            <th>IP</th>
                            <th>Provider</th>
                            <th>CPU</th>
                            <th>RAM</th>
                            <th>Disk</th>
                            <th>Status</th>
                            <th>Instances</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((server) => (
                            <tr key={server._id}>
                                <td><span className="cell-name">🖥️ {server.hostname}</span></td>
                                <td className="cell-mono">{server.ip}</td>
                                <td>{server.provider}</td>
                                <td>{server.cpuCores} vCPU</td>
                                <td>{server.ramGb} GB</td>
                                <td>{server.diskGb} GB</td>
                                <td><span className={`cell-status ${server.status}`}>{server.status}</span></td>
                                <td>{server.instances.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
