import { query } from "./_generated/server";
import { v } from "convex/values";

type LogEntry = {
    id: string;
    timestamp: number;
    level: "info" | "warn" | "error";
    source: "system" | "gateway" | "agent";
    serverId?: string;
    instanceId?: string;
    message: string;
};

// Mock log messages
const SYSTEM_LOGS = [
    { level: "info", msg: "SSH login successful for user admin" },
    { level: "warn", msg: "High memory utilization detected (>85%)" },
    { level: "info", msg: "Package updates available: 12 packages can be updated" },
    { level: "error", msg: "Failed to sync chrony time daemon" },
    { level: "info", msg: "New connection from 192.168.1.100" },
    { level: "warn", msg: "Disk space on /var/log is reaching critical levels" },
    { level: "info", msg: "System health check passed" },
];

const INSTANCE_LOGS = [
    { level: "info", msg: "Gateway initialized successfully on port {port}" },
    { level: "info", msg: "Received API request: GET /api/v1/status" },
    { level: "warn", msg: "Rate limiting applied to IP 203.0.113.42" },
    { level: "error", msg: "Connection to metadata service failed: timeout" },
    { level: "info", msg: "Agent {name} started and registered" },
    { level: "info", msg: "WebSocket connection established" },
    { level: "error", msg: "Unhandled exception in processing pipeline: Cannot read property 'id' of undefined" },
    { level: "warn", msg: "High latency detected on upstream route" },
    { level: "info", msg: "Configuration reloaded" },
];

// Seed for deterministic random generation based on time/id
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export const list = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const servers = await ctx.db.query("servers").collect();
        const instances = await ctx.db.query("instances").collect();
        const limit = args.limit || 100;

        const logs: LogEntry[] = [];
        const now = Date.now();
        // Generate logs spread over the last 2 hours
        const timeWindow = 2 * 60 * 60 * 1000;

        for (let i = 0; i < limit; i++) {
            // Use index purely to spread them backward in time
            const logTime = now - Math.floor(seededRandom(i * 10) * timeWindow);

            // Randomly pick if it's a server or instance log
            const isInstanceLog = seededRandom(i * 11) > 0.3; // 70% instance logs

            let level: "info" | "warn" | "error" = "info";
            const levelRand = seededRandom(i * 12);
            if (levelRand > 0.9) level = "error";
            else if (levelRand > 0.7) level = "warn";

            if (isInstanceLog && instances.length > 0) {
                const instIndex = Math.floor(seededRandom(i * 13) * instances.length);
                const inst = instances[instIndex];
                const msgTemplate = INSTANCE_LOGS[Math.floor(seededRandom(i * 14) * INSTANCE_LOGS.length)];

                // Keep level from random or override if template is explicit
                const finalLevel = levelRand > 0.5 ? msgTemplate.level as "info" | "warn" | "error" : level;

                let msg = msgTemplate.msg
                    .replace("{port}", inst.port.toString())
                    .replace("{name}", inst.name || `Instance ${inst.instanceNumber}`);

                logs.push({
                    id: `log_inst_${i}_${logTime}`,
                    timestamp: logTime,
                    level: finalLevel,
                    source: "gateway",
                    serverId: inst.serverId,
                    instanceId: inst._id,
                    message: msg,
                });
            } else if (servers.length > 0) {
                const srvIndex = Math.floor(seededRandom(i * 15) * servers.length);
                const srv = servers[srvIndex];
                const msgTemplate = SYSTEM_LOGS[Math.floor(seededRandom(i * 16) * SYSTEM_LOGS.length)];

                const finalLevel = levelRand > 0.5 ? msgTemplate.level as "info" | "warn" | "error" : level;

                logs.push({
                    id: `log_sys_${i}_${logTime}`,
                    timestamp: logTime,
                    level: finalLevel,
                    source: "system",
                    serverId: srv._id,
                    message: msgTemplate.msg,
                });
            }
        }

        // Sort descending (newest first)
        logs.sort((a, b) => b.timestamp - a.timestamp);

        return logs;
    },
});
