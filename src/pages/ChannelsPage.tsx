import { useWorkspace } from "./OverviewPage";

export default function ChannelsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>📡 Channels</h1>
                <p>Communication channels for {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">📡</div>
                <h3>Channels</h3>
                <p>Configure messaging channels (Slack, Discord, Telegram, etc.) for your OpenClaw instance. Manage DM pairing, channel connections, and webhook integrations.</p>
            </div>
        </div>
    );
}
