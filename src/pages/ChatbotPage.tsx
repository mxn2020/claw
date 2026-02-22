import { useWorkspace } from "./OverviewPage";

export default function ChatbotPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>💬 Chatbot</h1>
                <p>Interact with {displayName} via the ClawBot interface</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">💬</div>
                <h3>ClawBot Chat Interface</h3>
                <p>Chat with your OpenClaw instance to manage agents, run tasks, and control operations. This will connect to the instance's API at port {instance.port}.</p>
            </div>
        </div>
    );
}
