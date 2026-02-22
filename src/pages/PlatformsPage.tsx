import { useWorkspace } from "./OverviewPage";

export default function PlatformsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🌐 Platforms</h1>
                <p>Platform integrations for {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">🌐</div>
                <h3>Platforms</h3>
                <p>Connect external platforms and services. Manage integrations with GitHub, GitLab, Jira, Linear, and other development and productivity tools.</p>
            </div>
        </div>
    );
}
