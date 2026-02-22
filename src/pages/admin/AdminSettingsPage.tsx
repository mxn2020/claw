export default function AdminSettingsPage() {
    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>⚙️ Admin Settings</h1>
                <p>Configure dashboard and system settings</p>
            </div>

            <div className="overview-section">
                <h3>General</h3>
                <div className="overview-detail-grid">
                    <div className="overview-detail"><span className="detail-label">Dashboard</span><span className="detail-value">OpenClaw Dashboard v1.0</span></div>
                    <div className="overview-detail"><span className="detail-label">Backend</span><span className="detail-value">Convex</span></div>
                    <div className="overview-detail"><span className="detail-label">Auth</span><span className="detail-value">None (dev mode)</span></div>
                </div>
            </div>

            <div className="overview-section">
                <h3>Danger Zone</h3>
                <div className="quick-actions">
                    <button className="action-btn">🔄 Reset Database</button>
                    <button className="action-btn">📥 Re-seed Data</button>
                    <button className="action-btn danger">🗑️ Clear All Instances</button>
                    <button className="action-btn danger">⚠️ Factory Reset</button>
                </div>
            </div>
        </div>
    );
}
