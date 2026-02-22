import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

export default function AdminServerPage() {
    const data = useQuery(api.servers.listWithInstances);
    const updateServer = useMutation(api.servers.update);
    const [editing, setEditing] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    if (data === undefined) {
        return <div className="loading-container"><div className="loading-spinner" /><span className="loading-text">Loading…</span></div>;
    }

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🖥️ Server Management</h1>
                <p>View and manage server infrastructure</p>
            </div>

            {data.map((server) => {
                const memPct = server.memoryUsedGb && server.ramGb ? Math.round((server.memoryUsedGb / server.ramGb) * 100) : 0;
                const diskPct = server.diskUsedGb && server.diskGb ? Math.round((server.diskUsedGb / server.diskGb) * 100) : 0;
                const isEditing = editing === server._id;

                return (
                    <div key={server._id}>
                        <div className="admin-stats-grid">
                            <div className="admin-stat">
                                <div className="admin-stat-label">Status</div>
                                <div className="admin-stat-value" style={{ color: server.status === "online" ? "var(--success)" : "var(--error)" }}>{server.status}</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-label">CPU</div>
                                <div className="admin-stat-value" style={{ color: "var(--accent)" }}>{server.cpuCores} vCPU</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-label">Memory</div>
                                <div className="admin-stat-value" style={{ color: memPct > 80 ? "var(--warning)" : "var(--success)" }}>{memPct}%</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-label">Disk</div>
                                <div className="admin-stat-value" style={{ color: diskPct > 80 ? "var(--warning)" : "var(--success)" }}>{diskPct}%</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-label">Uptime</div>
                                <div className="admin-stat-value" style={{ color: "var(--text-primary)" }}>{server.uptimeDays ?? "?"} days</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-label">Instances</div>
                                <div className="admin-stat-value" style={{ color: "var(--accent)" }}>{server.instances.length}</div>
                            </div>
                        </div>

                        <div className="overview-section">
                            <h3>Server Details — {server.hostname}</h3>
                            {!isEditing ? (
                                <>
                                    <div className="overview-detail-grid">
                                        <div className="overview-detail"><span className="detail-label">Hostname</span><span className="detail-value">{server.hostname}</span></div>
                                        <div className="overview-detail"><span className="detail-label">IP</span><span className="detail-value">{server.ip}</span></div>
                                        <div className="overview-detail"><span className="detail-label">Provider</span><span className="detail-value">{server.provider}</span></div>
                                        <div className="overview-detail"><span className="detail-label">OS</span><span className="detail-value">{server.os}</span></div>
                                        <div className="overview-detail"><span className="detail-label">SSH User</span><span className="detail-value">{server.sshUser}</span></div>
                                        <div className="overview-detail"><span className="detail-label">SSH Ports</span><span className="detail-value">{server.sshPorts.join(", ")}</span></div>
                                        <div className="overview-detail"><span className="detail-label">SSH Key</span><span className="detail-value">{server.sshKeyPath}</span></div>
                                        <div className="overview-detail"><span className="detail-label">Load</span><span className="detail-value">{server.loadAverage || "—"}</span></div>
                                        <div className="overview-detail"><span className="detail-label">Memory</span><span className="detail-value">{server.memoryUsedGb ?? "?"} / {server.ramGb} GB</span></div>
                                        <div className="overview-detail"><span className="detail-label">Disk</span><span className="detail-value">{server.diskUsedGb ?? "?"} / {server.diskGb} GB</span></div>
                                    </div>
                                    <div className="quick-actions" style={{ marginTop: 16 }}>
                                        <button className="action-btn" onClick={() => setEditing(server._id)}>✏️ Edit Server</button>
                                        <button className="action-btn">🔄 Refresh Status</button>
                                        <button className="action-btn">🔌 SSH Connect</button>
                                        <button className="action-btn danger">🔒 Set Offline</button>
                                    </div>
                                </>
                            ) : (
                                <ServerEditForm
                                    server={server}
                                    onSave={async (updates) => {
                                        await updateServer({ id: server._id as Id<"servers">, ...updates });
                                        setEditing(null);
                                        setSaved(true);
                                        setTimeout(() => setSaved(false), 2000);
                                    }}
                                    onCancel={() => setEditing(null)}
                                />
                            )}
                            {saved && <p style={{ color: "var(--success)", fontSize: "0.82rem", marginTop: 12 }}>✓ Server updated</p>}
                        </div>

                        <div className="overview-section">
                            <h3>Resource Bars</h3>
                            <div className="resource-bars">
                                <div className="resource-bar">
                                    <div className="resource-bar-header">
                                        <span className="resource-label">Memory</span>
                                        <span className="resource-value">{server.memoryUsedGb ?? "?"} / {server.ramGb} GB ({memPct}%)</span>
                                    </div>
                                    <div className="bar-track"><div className={`bar-fill ${memPct > 85 ? "danger" : memPct > 65 ? "warning" : ""}`} style={{ width: `${memPct}%` }} /></div>
                                </div>
                                <div className="resource-bar">
                                    <div className="resource-bar-header">
                                        <span className="resource-label">Disk</span>
                                        <span className="resource-value">{server.diskUsedGb ?? "?"} / {server.diskGb} GB ({diskPct}%)</span>
                                    </div>
                                    <div className="bar-track"><div className={`bar-fill ${diskPct > 85 ? "danger" : diskPct > 65 ? "warning" : ""}`} style={{ width: `${diskPct}%` }} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ServerEditForm({
    server,
    onSave,
    onCancel,
}: {
    server: { hostname: string; ip: string; memoryUsedGb?: number; diskUsedGb?: number; loadAverage?: string; uptimeDays?: number };
    onSave: (updates: { hostname?: string; ip?: string; memoryUsedGb?: number; diskUsedGb?: number; loadAverage?: string; uptimeDays?: number }) => Promise<void>;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        hostname: server.hostname,
        ip: server.ip,
        memoryUsedGb: server.memoryUsedGb ?? 0,
        diskUsedGb: server.diskUsedGb ?? 0,
        loadAverage: server.loadAverage ?? "",
        uptimeDays: server.uptimeDays ?? 0,
    });

    return (
        <div className="settings-form" style={{ marginTop: 16 }}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Hostname</label>
                    <input className="form-input" value={form.hostname} onChange={(e) => setForm(p => ({ ...p, hostname: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label">IP</label>
                    <input className="form-input" value={form.ip} onChange={(e) => setForm(p => ({ ...p, ip: e.target.value }))} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Memory Used (GB)</label>
                    <input className="form-input" type="number" step="0.1" value={form.memoryUsedGb} onChange={(e) => setForm(p => ({ ...p, memoryUsedGb: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                    <label className="form-label">Disk Used (GB)</label>
                    <input className="form-input" type="number" step="0.1" value={form.diskUsedGb} onChange={(e) => setForm(p => ({ ...p, diskUsedGb: Number(e.target.value) }))} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Load Average</label>
                    <input className="form-input" value={form.loadAverage} onChange={(e) => setForm(p => ({ ...p, loadAverage: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label">Uptime (days)</label>
                    <input className="form-input" type="number" value={form.uptimeDays} onChange={(e) => setForm(p => ({ ...p, uptimeDays: Number(e.target.value) }))} />
                </div>
            </div>
            <div className="quick-actions">
                <button className="action-btn" onClick={() => onSave(form)} style={{ background: "var(--accent)", color: "var(--bg-primary)", borderColor: "var(--accent)" }}>💾 Save</button>
                <button className="action-btn" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}
