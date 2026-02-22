import { useWorkspace } from "./OverviewPage";

export default function TasksPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>✅ Tasks</h1>
                <p>Track tasks for {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">✅</div>
                <h3>Tasks</h3>
                <p>View active, pending, and completed tasks. Monitor AI agent progress and manage task queues.</p>
            </div>
        </div>
    );
}
