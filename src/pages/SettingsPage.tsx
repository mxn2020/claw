import { useWorkspace } from "./OverviewPage";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export default function SettingsPage() {
    const { instance } = useWorkspace();
    const updateInstance = useMutation(api.instances.update);

    const [name, setName] = useState(instance.name || "");
    const [description, setDescription] = useState(instance.description || "");
    const [icon, setIcon] = useState(instance.icon || "");
    const [color, setColor] = useState(instance.color || "#63b3ed");
    const [tagsInput, setTagsInput] = useState((instance.tags || []).join(", "));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await updateInstance({
            id: instance._id as Id<"instances">,
            name: name || undefined,
            description: description || undefined,
            icon: icon || undefined,
            color: color || undefined,
            tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🔒 Settings</h1>
                <p>Configure instance metadata and controls</p>
            </div>

            <div className="overview-section">
                <h3>Instance Identity</h3>
                <div className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Agent Master" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this instance is used for…" rows={3} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Icon (emoji)</label>
                            <input type="text" className="form-input form-input-sm" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🤖" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <div className="color-input-wrap">
                                <input type="color" className="form-color" value={color} onChange={(e) => setColor(e.target.value)} />
                                <span className="color-value">{color}</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tags (comma-separated)</label>
                        <input type="text" className="form-input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="ai, automation, management" />
                    </div>
                    <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="overview-section">
                <h3>Instance Controls</h3>
                <div className="quick-actions">
                    <button className="action-btn">🔄 Restart Gateway</button>
                    <button className="action-btn">⏸️ Stop Instance</button>
                    <button className="action-btn">▶️ Start Instance</button>
                    <button className="action-btn danger">🗑️ Remove Instance</button>
                </div>
            </div>

            <div className="overview-section">
                <h3>Connection Info</h3>
                <div className="overview-detail-grid">
                    <div className="overview-detail"><span className="detail-label">Port</span><span className="detail-value">{instance.port}</span></div>
                    <div className="overview-detail"><span className="detail-label">Tunnel</span><span className="detail-value">localhost:{instance.tunnelPort}</span></div>
                    <div className="overview-detail"><span className="detail-label">Config</span><span className="detail-value">{instance.configPath}</span></div>
                    <div className="overview-detail"><span className="detail-label">Version</span><span className="detail-value">v{instance.version}</span></div>
                    <div className="overview-detail"><span className="detail-label">Token</span><span className="detail-value">{instance.token.slice(0, 20)}…</span></div>
                </div>
            </div>
        </div>
    );
}
