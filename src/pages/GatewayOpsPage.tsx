import { useWorkspace } from "./OverviewPage";

export default function GatewayOpsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>⚙️ Gateway & Ops</h1>
                <p>Gateway operations for {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">⚙️</div>
                <h3>Gateway & Operations</h3>
                <p>Monitor gateway health, view logs, manage authentication tokens, configure systemd services, and perform operational tasks like updates and backups.</p>
            </div>
        </div>
    );
}
