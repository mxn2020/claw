import { useWorkspace } from "./OverviewPage";

export default function AgentsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🤖 Agents</h1>
                <p>AI agents configured in {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">🤖</div>
                <h3>Agents</h3>
                <p>View, create, and manage AI agents. Configure agent skills, system prompts, model assignments, and behavioral settings for your OpenClaw instance.</p>
            </div>
        </div>
    );
}
