import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { useViewMode } from "../../context/ViewModeContext";

export default function AdminInstancesPage() {
    const data = useQuery(api.servers.listWithInstances);
    const setStatus = useMutation(api.instances.setStatus);
    const removeInstance = useMutation(api.instances.remove);
    const createInstance = useMutation(api.instances.create);

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const { viewMode } = useViewMode();

    if (data === undefined) {
        return <div className="loading-container"><div className="loading-spinner" /><span className="loading-text">Loading…</span></div>;
    }

    const allInstances = data.flatMap((s) =>
        s.instances.map((i) => ({ ...i, serverHostname: s.hostname, serverId: s._id }))
    ).sort((a, b) => a.instanceNumber - b.instanceNumber);

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === allInstances.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(allInstances.map((i) => i._id)));
        }
    };

    const handleSetStatus = async (id: string, status: "running" | "stopped" | "error") => {
        await setStatus({ id: id as Id<"instances">, status });
    };

    const handleDelete = async (id: string) => {
        await removeInstance({ id: id as Id<"instances"> });
        setConfirmDelete(null);
        setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    };

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🦀 Instance Management</h1>
                <p>View, create, start, stop, and remove OpenClaw instances</p>
            </div>

            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {selected.size > 0 ? `${selected.size} selected` : `${allInstances.length} instances`}
                    </span>
                </div>
                <div className="admin-toolbar-right">
                    {selected.size > 0 && (
                        <>
                            <button className="toolbar-btn success" onClick={async () => {
                                for (const id of selected) await handleSetStatus(id, "running");
                            }}>▶ Start Selected</button>
                            <button className="toolbar-btn warning" onClick={async () => {
                                for (const id of selected) await handleSetStatus(id, "stopped");
                            }}>⏸ Stop Selected</button>
                        </>
                    )}
                    <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)}>+ Add Instance</button>
                </div>
            </div>

            <div className="overview-section" style={{ padding: 0, overflow: "hidden" }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: 36 }}>
                                <input type="checkbox" className="table-checkbox" checked={selected.size === allInstances.length && allInstances.length > 0} onChange={selectAll} />
                            </th>
                            <th>Instance</th>
                            <th>Server</th>
                            <th>Port</th>
                            <th>Tunnel</th>
                            <th>Version</th>
                            <th>Memory</th>
                            <th>PID</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allInstances.map((inst) => {
                            const name = inst.name || `Instance #${inst.instanceNumber}`;
                            const icon = inst.icon || "⚡";
                            return (
                                <tr key={inst._id}>
                                    <td>
                                        <input type="checkbox" className="table-checkbox" checked={selected.has(inst._id)} onChange={() => toggleSelect(inst._id)} />
                                    </td>
                                    <td>
                                        <div className="instance-name-cell">
                                            <span className="cell-icon" style={{ background: inst.color || "var(--bg-elevated)" }}>{icon}</span>
                                            <span className="cell-name">{name}</span>
                                        </div>
                                    </td>
                                    <td><span className="cell-mono" style={{ fontSize: "0.7rem" }}>{inst.serverHostname}</span></td>
                                    <td className="cell-mono">{inst.port}</td>
                                    <td className="cell-mono">:{inst.tunnelPort}</td>
                                    <td className="cell-mono">v{inst.version}</td>
                                    <td className="cell-mono">{inst.memoryMb ? `${inst.memoryMb} MB` : "—"}</td>
                                    <td className="cell-mono">{inst.pid || "—"}</td>
                                    <td><span className={`cell-status ${inst.status}`}>{inst.status}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            {inst.status === "running" ? (
                                                <button className="table-action-btn warning" onClick={() => handleSetStatus(inst._id, "stopped")}>Stop</button>
                                            ) : (
                                                <button className="table-action-btn success" onClick={() => handleSetStatus(inst._id, "running")}>Start</button>
                                            )}
                                            <button className="table-action-btn danger" onClick={() => setConfirmDelete(inst._id)}>Remove</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Confirm Delete Dialog */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>⚠️ Remove Instance</h2>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            Are you sure you want to remove this instance? This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="modal-btn confirm" style={{ background: "var(--error)", borderColor: "var(--error)" }}
                                onClick={() => handleDelete(confirmDelete)}>Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Instance Modal */}
            {showAddModal && <AddInstanceModal servers={data} onCreate={createInstance} onClose={() => setShowAddModal(false)} />}
        </div>
    );
}

/* ---- Add Instance Modal ---- */
function AddInstanceModal({
    servers,
    onCreate,
    onClose,
}: {
    servers: { _id: string; hostname: string }[];
    onCreate: (args: {
        serverId: Id<"servers">;
        instanceNumber: number;
        port: number;
        tunnelPort: number;
        token: string;
        configPath: string;
        version: string;
        name?: string;
        description?: string;
        icon?: string;
        color?: string;
    }) => Promise<unknown>;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        serverId: servers[0]?._id || "",
        instanceNumber: 11,
        port: 18000,
        tunnelPort: 8014,
        token: "",
        configPath: "",
        version: "2026.2.17",
        name: "",
        description: "",
        icon: "⚡",
        color: "#63b3ed",
    });

    const handleSubmit = async () => {
        const configPath = form.configPath || `~/.clawspace${form.instanceNumber}/config.json`;
        const token = form.token || crypto.randomUUID().replace(/-/g, "").slice(0, 48);
        await onCreate({
            serverId: form.serverId as Id<"servers">,
            instanceNumber: form.instanceNumber,
            port: form.port,
            tunnelPort: form.tunnelPort,
            token,
            configPath,
            version: form.version,
            name: form.name || undefined,
            description: form.description || undefined,
            icon: form.icon || undefined,
            color: form.color || undefined,
        });
        onClose();
    };

    const update = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
                <h2>🦀 Add New Instance</h2>
                <div className="settings-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Optional name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Icon</label>
                            <input className="form-input form-input-sm" value={form.icon} onChange={(e) => update("icon", e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input className="form-input" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional description" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Instance #</label>
                            <input className="form-input" type="number" value={form.instanceNumber} onChange={(e) => update("instanceNumber", Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Port</label>
                            <input className="form-input" type="number" value={form.port} onChange={(e) => update("port", Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tunnel Port</label>
                            <input className="form-input" type="number" value={form.tunnelPort} onChange={(e) => update("tunnelPort", Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Version</label>
                            <input className="form-input" value={form.version} onChange={(e) => update("version", e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <div className="color-input-wrap">
                                <input type="color" className="form-color" value={form.color} onChange={(e) => update("color", e.target.value)} />
                                <span className="color-value">{form.color}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
                    <button className="modal-btn confirm" onClick={handleSubmit}>Create Instance</button>
                </div>
            </div>
        </div>
    );
}
