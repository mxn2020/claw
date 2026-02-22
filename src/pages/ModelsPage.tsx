import { useWorkspace } from "./OverviewPage";

export default function ModelsPage() {
    const { instance } = useWorkspace();
    const displayName = instance.name || `Instance #${instance.instanceNumber}`;

    return (
        <div className="placeholder-page">
            <div className="page-header">
                <h1>🧠 Models</h1>
                <p>AI models configured in {displayName}</p>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">🧠</div>
                <h3>Models</h3>
                <p>Configure AI model providers and model assignments. Manage API keys for Nvidia, OpenRouter, Alibaba, and other providers. Set default models and fallback chains.</p>
            </div>
        </div>
    );
}
