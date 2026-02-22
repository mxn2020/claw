import { useOutletContext } from "react-router-dom";

type WorkspaceContext = {
    instance: {
        _id: string;
        name?: string;
        description?: string;
        icon?: string;
        color?: string;
        tags?: string[];
        port: number;
        tunnelPort: number;
        token: string;
        configPath: string;
        status: string;
        version: string;
        pid?: number;
        memoryMb?: number;
        startedAt?: string;
        instanceNumber: number;
        server?: {
            hostname: string;
            ip: string;
            provider: string;
            os: string;
            cpuCores: number;
            ramGb: number;
            diskGb: number;
            memoryUsedGb?: number;
            diskUsedGb?: number;
            loadAverage?: string;
            uptimeDays?: number;
        } | null;
    };
};

export function useWorkspace() {
    return useOutletContext<WorkspaceContext>();
}

export default function OverviewPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;
    const dashboardUrl = `http://localhost:${instance.tunnelPort}/?token=${instance.token}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>{instance.icon || "⚡"} {displayName}</h1>
                <p>{instance.description || "OpenClaw gateway instance"}</p>
            </div>

            <div className="overview-grid">
                <div className="overview-stat">
                    <div className="overview-stat-label">Status</div>
                    <div className="overview-stat-value" style={{ color: instance.status === "running" ? "var(--success)" : "var(--error)" }}>
                        {instance.status}
                    </div>
                </div>
                <div className="overview-stat">
                    <div className="overview-stat-label">Port</div>
                    <div className="overview-stat-value" style={{ color: "var(--accent)" }}>{instance.port}</div>
                </div>
                <div className="overview-stat">
                    <div className="overview-stat-label">Tunnel</div>
                    <div className="overview-stat-value" style={{ color: "var(--accent)" }}>:{instance.tunnelPort}</div>
                </div>
                <div className="overview-stat">
                    <div className="overview-stat-label">Version</div>
                    <div className="overview-stat-value" style={{ color: "var(--text-primary)" }}>v{instance.version}</div>
                </div>
                {instance.memoryMb && (
                    <div className="overview-stat">
                        <div className="overview-stat-label">Memory</div>
                        <div className="overview-stat-value" style={{ color: "var(--text-primary)" }}>~{instance.memoryMb} MB</div>
                    </div>
                )}
                {instance.pid && (
                    <div className="overview-stat">
                        <div className="overview-stat-label">PID</div>
                        <div className="overview-stat-value" style={{ color: "var(--text-muted)" }}>{instance.pid}</div>
                    </div>
                )}
            </div>

            <div className="overview-section">
                <h3>Instance Details</h3>
                <div className="overview-detail-grid">
                    <div className="overview-detail"><span className="detail-label">Config</span><span className="detail-value">{instance.configPath}</span></div>
                    <div className="overview-detail"><span className="detail-label">Token</span><span className="detail-value">{instance.token.slice(0, 16)}…</span></div>
                    {instance.startedAt && <div className="overview-detail"><span className="detail-label">Started</span><span className="detail-value">{instance.startedAt}</span></div>}
                    {instance.server && (
                        <>
                            <div className="overview-detail"><span className="detail-label">Server</span><span className="detail-value">{instance.server.hostname}</span></div>
                            <div className="overview-detail"><span className="detail-label">Server IP</span><span className="detail-value">{instance.server.ip}</span></div>
                            <div className="overview-detail"><span className="detail-label">Provider</span><span className="detail-value">{instance.server.provider}</span></div>
                        </>
                    )}
                </div>
                {instance.tags && instance.tags.length > 0 && (
                    <div className="tag-list">
                        {instance.tags.map(tag => <span key={tag} className="overview-tag">{tag}</span>)}
                    </div>
                )}
            </div>

            <div className="overview-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                    <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="action-btn">🌐 Open Dashboard</a>
                    <button className="action-btn">🔄 Restart Gateway</button>
                    <button className="action-btn">📋 Copy Token</button>
                    <button className="action-btn">📋 Copy SSH Tunnel Command</button>
                </div>
            </div>
        </div>
    );
}
