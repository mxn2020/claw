import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo, useEffect, useRef } from "react";
import { useViewMode } from "../../context/ViewModeContext";

type OutboundLogLine = {
    id: string;
    timestamp: number;
    level: "info" | "warn" | "error" | "debug" | "trace";
    source: "gateway";
    serverId: string;
    instanceId: string;
    message: string;
};

export default function AdminLogsPage() {
    const serversData = useQuery(api.servers.listWithInstances);
    const tailLogs = useAction(api.logs.tail);
    const { viewMode } = useViewMode();

    const [selectedServer, setSelectedServer] = useState<string>("all");
    const [selectedInstance, setSelectedInstance] = useState<string>("all");
    const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [autoScroll, setAutoScroll] = useState(true);

    const [logsData, setLogsData] = useState<OutboundLogLine[]>([]);
    const cursorsRef = useRef<Record<string, number | null>>({});

    const logsEndRef = useRef<HTMLDivElement>(null);
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // Polling logic for Gateway WS Proxy
    useEffect(() => {
        if (!autoScroll) return;

        let active = true;
        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            try {
                // Pass current filters to the backend to minimize traffic
                const res = await tailLogs({
                    limit: 150,
                    cursors: cursorsRef.current,
                    ...(selectedServer !== "all" ? { serverId: selectedServer } : {}),
                    ...(selectedInstance !== "all" ? { instanceId: selectedInstance } : {}),
                });

                if (!active) return;

                if (res) {
                    cursorsRef.current = Object.assign({}, cursorsRef.current, res.cursors);

                    if (res.logs && res.logs.length > 0) {
                        setLogsData(prev => {
                            const merged = [...res.logs, ...prev];
                            // Deduplicate by ID just in case
                            const uniqueMap = new Map();
                            for (const log of merged) {
                                uniqueMap.set(log.id, log);
                            }
                            const unique = Array.from(uniqueMap.values());
                            // Keep max 2000 logs in memory, sorting descending (newest first)
                            unique.sort((a, b) => b.timestamp - a.timestamp);
                            return unique.slice(0, 2000);
                        });
                    }
                }

                timer = setTimeout(poll, 2500);
            } catch (err) {
                console.error("Log fetch failed:", err);
                if (active) timer = setTimeout(poll, 10000); // Back off heavily on error
            }
        };

        // Start polling 
        poll();

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [autoScroll, tailLogs, selectedServer, selectedInstance]);

    // Cleanup cursors when changing specific targets so we don't accidentally pull from stale cursors
    useEffect(() => {
        cursorsRef.current = {};
        setLogsData([]);
    }, [selectedServer, selectedInstance]);


    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logsData, autoScroll]);

    const handleScroll = () => {
        if (!logsContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setAutoScroll(isNearBottom);
    };

    // Derived data for dropdowns
    const availableInstances = useMemo(() => {
        if (!serversData) return [];
        if (selectedServer === "all") return serversData.flatMap(s => s.instances);
        const server = serversData.find(s => s._id === selectedServer);
        return server ? server.instances : [];
    }, [serversData, selectedServer]);

    // Apply explicit frontend filters
    const filteredLogs = useMemo(() => {
        if (!logsData) return [];
        return logsData.filter(log => {
            // Server filter
            if (selectedServer !== "all" && log.serverId !== selectedServer) return false;
            // Instance filter
            if (selectedInstance !== "all" && log.instanceId !== selectedInstance) return false;
            // Severity filter
            if (selectedSeverity !== "all" && log.level !== selectedSeverity) return false;
            // Search filter
            if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            return true;
        }).sort((a, b) => a.timestamp - b.timestamp); // Sort ascending for terminal view (oldest top, newest bottom)
    }, [logsData, selectedServer, selectedInstance, selectedSeverity, searchQuery]);

    // Format helpers
    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toISOString().replace("T", " ").substring(0, 19);
    };

    const getServerName = (id?: string) => {
        if (!id || !serversData) return "System";
        const s = serversData.find(s => s._id === id);
        return s ? s.hostname : "Unknown";
    };

    const getInstanceIdentifier = (id?: string) => {
        if (!id || !serversData) return "";
        for (const s of serversData) {
            const inst = s.instances.find(i => i._id === id);
            if (inst) return inst.name ? `[${inst.name}]` : `[Inst #${inst.instanceNumber}]`;
        }
        return "";
    };

    if (serversData === undefined) {
        return <div className="loading-container"><div className="loading-spinner" /><span className="loading-text">Loading Logs…</span></div>;
    }

    return (
        <div className="admin-logs-page">
            <div className="page-header" style={{ marginBottom: 16 }}>
                <h1>📜 System & Gateway Logs</h1>
                <p>Real-time audit trail and diagnostics</p>
            </div>

            <div className="logs-filters">
                <div className="filter-group hide-scrollbar">
                    <select className="log-select" value={selectedServer} onChange={(e) => {
                        setSelectedServer(e.target.value);
                        setSelectedInstance("all");
                    }}>
                        <option value="all">All Servers</option>
                        {serversData.map(s => <option key={s._id} value={s._id}>{s.hostname}</option>)}
                    </select>

                    <select className="log-select" value={selectedInstance} onChange={(e) => setSelectedInstance(e.target.value)} disabled={selectedServer === "all" && viewMode === "server"}>
                        <option value="all">All Instances</option>
                        {availableInstances.map(i => (
                            <option key={i._id} value={i._id}>{i.name || `Instance #${i.instanceNumber}`}</option>
                        ))}
                    </select>

                    <select className="log-select" value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}>
                        <option value="all">All Severities</option>
                        <option value="info">INFO</option>
                        <option value="warn">WARN</option>
                        <option value="error">ERROR</option>
                    </select>

                    <div className="log-search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="log-search-input"
                            placeholder="Filter messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-actions">
                    <button className={`log-toggle-scroll ${autoScroll ? "active" : ""}`} onClick={() => setAutoScroll(!autoScroll)}>
                        {autoScroll ? "⏸ Pause Stream" : "▶ Resume Stream"}
                    </button>
                    <div className="log-count">{filteredLogs.length} events</div>
                </div>
            </div>

            <div className="logs-terminal" ref={logsContainerRef} onScroll={handleScroll}>
                {filteredLogs.length === 0 ? (
                    <div className="terminal-empty">No logs match the current filters or connecting to gateway...</div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log.id} className={`log-line level-${log.level}`}>
                            <span className="log-timestamp">{formatTime(log.timestamp)}</span>
                            <span className={`log-level level-${log.level}`}>{log.level.toUpperCase().padEnd(5)}</span>
                            <span className="log-source">
                                <span className="source-server">{getServerName(log.serverId)}</span>
                                {log.instanceId && <span className="source-instance">{getInstanceIdentifier(log.instanceId)}</span>}
                            </span>
                            <span className="log-arrow">›</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}
