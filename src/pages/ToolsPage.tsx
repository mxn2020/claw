import { useWorkspace } from "./OverviewPage";

export default function ToolsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🔧 Tools</h1>
                <p>Available tools in {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">🔧</div>
                <h3>Tools</h3>
                <p>Manage native and custom tools available to your agents. Configure tool permissions, rate limits, and execution environments.</p>
            </div>
        </div>
    );
}
