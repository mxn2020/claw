import { useWorkspace } from "./OverviewPage";

export default function ProjectsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>📁 Projects</h1>
                <p>Manage projects for {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">📁</div>
                <h3>Projects</h3>
                <p>View and manage ClawBot projects. Each project contains a set of tasks, goals, and context for the AI agents to work on.</p>
            </div>
        </div>
    );
}
