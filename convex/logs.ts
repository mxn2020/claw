"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import WebSocket from "ws";

// Generate UUID for RPC calls
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// Ensure the promise does not hang indefinitely
const withTimeout = <T>(promise: Promise<T>, ms: number, failureMessage: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(failureMessage)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
    });
};

type OutboundLogLine = {
    id: string;
    timestamp: number;
    level: "info" | "warn" | "error" | "debug" | "trace";
    source: "gateway";
    serverId: string;
    instanceId: string;
    message: string;
};

async function fetchInstanceLogs(
    serverIp: string,
    instancePort: number,
    token: string,
    cursor: number | null,
    limit: number
): Promise<{ lines: any[]; newCursor: number | null; error?: string }> {
    return new Promise((resolve, reject) => {
        const url = `ws://${serverIp}:${instancePort}`;
        const ws = new WebSocket(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const rpcId = generateId();
        let connected = false;

        const timeout = setTimeout(() => {
            ws.terminate();
            resolve({ lines: [], newCursor: cursor, error: "Connection timeout" });
        }, 5000);

        ws.on("message", (data: WebSocket.RawData) => {
            try {
                const msg = JSON.parse(data.toString());

                // 1. Handshake
                if (msg.type === "connect.challenge") {
                    const nonce = msg.payload.nonce;
                    const timestamp = msg.payload.timestamp;
                    ws.send(JSON.stringify({
                        type: "connect",
                        payload: {
                            role: "operator",
                            scopes: ["operator.read"],
                            signature: "",
                            timestamp,
                            nonce
                        }
                    }));
                }
                else if (msg.type === "hello-ok") {
                    connected = true;
                    // Provide the params expected by logs.tail
                    ws.send(JSON.stringify({
                        type: "call",
                        id: rpcId,
                        method: "logs.tail",
                        params: {
                            limit,
                            ...(cursor != null ? { cursor } : {})
                        }
                    }));
                }
                else if (msg.type === "hello-error") {
                    clearTimeout(timeout);
                    ws.terminate();
                    resolve({ lines: [], newCursor: cursor, error: `Auth failed: ${JSON.stringify(msg.payload)}` });
                }

                // 2. RPC Response
                else if (msg.type === "call" || msg.id === rpcId) {
                    clearTimeout(timeout);
                    ws.terminate();

                    if (msg.payload && Array.isArray(msg.payload.lines)) {
                        resolve({
                            lines: msg.payload.lines,
                            newCursor: msg.payload.cursor ?? null
                        });
                    } else {
                        resolve({ lines: [], newCursor: cursor, error: "Invalid response payload" });
                    }
                }
            } catch (err) {
                clearTimeout(timeout);
                ws.terminate();
                resolve({ lines: [], newCursor: cursor, error: `Protocol error: ${(err as Error).message}` });
            }
        });

        ws.on("error", (err: Error) => {
            clearTimeout(timeout);
            resolve({ lines: [], newCursor: cursor, error: err.message });
        });

        ws.on("close", () => {
            clearTimeout(timeout);
            if (!connected) {
                resolve({ lines: [], newCursor: cursor, error: "Connection closed unexpectedly" });
            }
        });
    });
}

function parseGatewayLogLine(raw: string): Partial<OutboundLogLine> | null {
    // OpenClaw logs have the format:
    // {"time":"2026-02-22T12:00:00.000Z", "level":"info", "message":"...", "module":"system", ...}
    // Alternatively, they could be text, e.g. "2026-02-22T12:00:00.000Z INFO [system] ..."
    try {
        const parsed = JSON.parse(raw);
        if (parsed.time && parsed.level) {
            return {
                timestamp: new Date(parsed.time).getTime(),
                level: (parsed.level.toLowerCase() as any) || "info",
                message: parsed.message || raw,
            };
        }
    } catch {
        // Fallback or text logs
        const match = raw.match(/^([0-9T:.-]+Z?)\s+(\w+)\s+(.+)$/);
        if (match) {
            return {
                timestamp: new Date(match[1]).getTime() || Date.now(),
                level: (match[2].toLowerCase() as any) || "info",
                message: match[3],
            };
        }
    }

    // If we can't parse it well, return it as info
    return {
        timestamp: Date.now(),
        level: "info",
        message: raw
    };
}

export const tail = action({
    args: {
        serverId: v.optional(v.string()),         // Filter at DB level
        instanceId: v.optional(v.string()),       // Filter at DB level
        limit: v.optional(v.number()),            // Per-instance limit
        cursors: v.optional(v.record(v.string(), v.union(v.number(), v.null()))), // { instanceId: cursor }
    },
    handler: async (ctx, args) => {
        const servers = await ctx.runQuery(api.servers.listWithInstances);
        const limitPerInstance = args.limit || 50;
        const inboundCursors = args.cursors || {};

        let targetedInstances: Array<{ server: any; instance: any }> = [];

        for (const server of servers) {
            if (args.serverId && args.serverId !== "all" && server._id !== args.serverId) continue;

            for (const instance of server.instances) {
                if (args.instanceId && args.instanceId !== "all" && instance._id !== args.instanceId) continue;
                if (!instance.token) continue;

                targetedInstances.push({ server, instance });
            }
        }

        const outLogs: OutboundLogLine[] = [];
        const newCursors: Record<string, number | null> = { ...inboundCursors };

        // Fetch logs across all targeted instances in parallel
        const promises = targetedInstances.map(async ({ server, instance }) => {
            const cursor = inboundCursors[instance._id] ?? null;

            const result = await fetchInstanceLogs(
                server.ip,
                instance.port,
                instance.token,
                cursor,
                limitPerInstance
            );

            newCursors[instance._id] = result.newCursor;

            // Optional: If error, you could emit an error log line into the stream warning the dashboard
            if (result.error) {
                outLogs.push({
                    id: generateId(),
                    timestamp: Date.now(),
                    level: "error",
                    source: "gateway",
                    serverId: server._id,
                    instanceId: instance._id,
                    message: `[Admin Proxy Error] Could not fetch logs: ${result.error}`,
                });
                return;
            }

            for (let i = 0; i < result.lines.length; i++) {
                const rawLine = result.lines[i];
                const parsed = parseGatewayLogLine(rawLine);
                if (parsed) {
                    outLogs.push({
                        id: generateId() + i,
                        timestamp: parsed.timestamp || Date.now(),
                        level: parsed.level || "info",
                        source: "gateway",
                        serverId: server._id,
                        instanceId: instance._id,
                        message: parsed.message || rawLine,
                    });
                }
            }
        });

        await Promise.all(promises);

        // Sort descending (newest first for frontend to put at bottom)
        // Wait, the frontend says: sort((a, b) => a.timestamp - b.timestamp) (oldest top, newest bottom).
        // Let's sort oldest first or newest first? Frontend will sort anyway. Let's do descending here so slicing works if we need to.
        outLogs.sort((a, b) => b.timestamp - a.timestamp);

        // For safety, limit the maximum returned items globally
        const globalLimit = (args.limit || 100) * targetedInstances.length;
        const trimmedLogs = outLogs.slice(0, globalLimit);

        return {
            logs: trimmedLogs,
            cursors: newCursors
        };
    }
});
