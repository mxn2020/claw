import { mutation } from "./_generated/server";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db.query("servers").first();
        if (existing) {
            return { status: "already_seeded" };
        }

        // ----------------------------------------------------------------
        // Server 1 — Alibaba Cloud (Frankfurt)
        // ----------------------------------------------------------------
        const server1Id = await ctx.db.insert("servers", {
            hostname: "myclaw1",
            ip: "8.209.64.31",
            provider: "Alibaba Cloud",
            os: "Ubuntu 22.04 LTS",
            cpuCores: 2,
            ramGb: 4,
            diskGb: 40,
            sshPorts: [443],
            sshKeyPath: "/Users/mehdinabhani/Projects/antigravity/mega-claw/_myclaw/newkey.pem",
            sshUser: "root",
            status: "online",
            memoryUsedGb: 1.6,
            diskUsedGb: 8.2,
            loadAverage: "0.12 / 0.08 / 0.03",
            uptimeDays: 14,
            lastCheckedAt: "2026-02-22T17:00:00+01:00",
        });

        await ctx.db.insert("instances", {
            serverId: server1Id,
            instanceNumber: 1,
            port: 16050,
            tunnelPort: 7001,
            token: "aa7ade79a08d1c1ff7fa61cd8962bf53",
            configPath: "~/.openclaw/openclaw.json",
            status: "running",
            version: "2026.2.9",
            pid: 8421,
            memoryMb: 310,
            startedAt: "2026-02-18",
            name: "Gateway Alpha",
            description: "Primary gateway instance on Alibaba Cloud Frankfurt. Handles AI agent routing and API key management.",
            icon: "🌐",
            color: "#f56565",
            tags: ["alibaba", "gateway", "primary", "frankfurt"],
        });

        // ----------------------------------------------------------------
        // Server 2 — Alibaba Cloud (Frankfurt)
        // ----------------------------------------------------------------
        const server2Id = await ctx.db.insert("servers", {
            hostname: "myclaw2",
            ip: "8.209.78.74",
            provider: "Alibaba Cloud",
            os: "Ubuntu 22.04 LTS",
            cpuCores: 2,
            ramGb: 4,
            diskGb: 40,
            sshPorts: [443],
            sshKeyPath: "/Users/mehdinabhani/Projects/antigravity/mega-claw/_myclaw/myclawkey.pem",
            sshUser: "root",
            status: "online",
            memoryUsedGb: 1.2,
            diskUsedGb: 5.7,
            loadAverage: "0.05 / 0.03 / 0.01",
            uptimeDays: 21,
            lastCheckedAt: "2026-02-22T17:00:00+01:00",
        });

        await ctx.db.insert("instances", {
            serverId: server2Id,
            instanceNumber: 1,
            port: 16051,
            tunnelPort: 7002,
            token: "753b2d9d7ff0469c3b451bfe5f627a76",
            configPath: "~/.openclaw/openclaw.json",
            status: "running",
            version: "2026.2.9",
            pid: 9102,
            memoryMb: 280,
            startedAt: "2026-02-17",
            name: "Gateway Beta",
            description: "Secondary gateway on Alibaba Cloud Frankfurt. Backup routing and security-hardened configuration.",
            icon: "🔒",
            color: "#ed8936",
            tags: ["alibaba", "gateway", "backup", "security"],
        });

        // ----------------------------------------------------------------
        // Server 3 — Hetzner Cloud
        // ----------------------------------------------------------------
        const server3Id = await ctx.db.insert("servers", {
            hostname: "myclaw3",
            ip: "46.62.203.189",
            provider: "Hetzner Cloud",
            os: "Ubuntu 24.04.3 LTS",
            cpuCores: 4,
            ramGb: 7.5,
            diskGb: 75,
            sshPorts: [22, 443],
            sshKeyPath: "/Users/mehdinabhani/Projects/antigravity/mega-claw/_myclaw/server3key.pem",
            sshUser: "root",
            status: "online",
            memoryUsedGb: 3.8,
            diskUsedGb: 3.3,
            loadAverage: "0.00 / 0.00 / 0.00",
            uptimeDays: 3,
            lastCheckedAt: "2026-02-22T17:00:00+01:00",
        });

        // Named instances with purpose
        const namedInstances = [
            {
                num: 1, port: 17000, tunnel: 8004,
                token: "d22b1d85691b12c2038a8a60c8f023f5760001230b9d6054", pid: 13261,
                name: "Agent Master",
                description: "AI agent configurations, skill management, dashboard orchestration. Manages OpenClaw Dashboard, Claw Control, and MegaClaw projects.",
                icon: "🤖",
                color: "#63b3ed",
                tags: ["ai", "agents", "management", "dashboard", "claw-control", "megaclaw"],
            },
            {
                num: 2, port: 17100, tunnel: 8005,
                token: "c6ff60753d39345498abd05e086a4cd4b62dc3daf068d40b", pid: 13196,
                name: "Jobs & Projects",
                description: "Autonomous freelance project discovery and job application engine. Finds opportunities and applies on your behalf.",
                icon: "💼",
                color: "#48bb78",
                tags: ["freelance", "jobs", "projects", "automation", "career"],
            },
            {
                num: 3, port: 17200, tunnel: 8006,
                token: "0ce11f7cfb398c79dd6f6cc6a2e4eb78a113a0c493192812", pid: 13384,
                name: "OSS King",
                description: "Open-source project development and maintenance. Manages repositories, issues, PRs, and community contributions.",
                icon: "👑",
                color: "#ecc94b",
                tags: ["open-source", "github", "development", "community", "oss"],
            },
            {
                num: 4, port: 17300, tunnel: 8007,
                token: "d2ec916d951e9657f5731aec1e2c97df81364619bd3af391", pid: 13449,
                name: "Minions",
                description: "Minions ecosystem orchestration. Manages minions-web, minions-openclaw, minions-prompts, blogs, docs, and npm packages.",
                icon: "🍌",
                color: "#b794f4",
                tags: ["minions", "ecosystem", "web", "plugins", "npm"],
            },
            {
                num: 5, port: 17400, tunnel: 8008,
                token: "ea8724aed9837367446fdb778dc38afd8c6618d0b2ffe0a5", pid: 15288,
                name: "Wiesn Tracker",
                description: "Oktoberfest reservation management and tracking. Monitors availability, manages bookings, and sends alerts.",
                icon: "🍺",
                color: "#f6ad55",
                tags: ["oktoberfest", "reservations", "tracking", "alerts"],
            },
        ];

        // Generic instances (6–10)
        const genericInstances = [
            { num: 6, port: 17500, tunnel: 8009, token: "3aaa3e93d1ba43d65005dfa84e2c9a689c4c1dceb9d07aa3", pid: 15354 },
            { num: 7, port: 17600, tunnel: 8010, token: "6bd903f4dfc8845e335b204298cb4cbe11c1f5b5f8991cba", pid: 15419 },
            { num: 8, port: 17700, tunnel: 8011, token: "2b2480b321abd29a17cd0f3ac08c9591b5e8fb8050bb25b0", pid: 15489 },
            { num: 9, port: 17800, tunnel: 8012, token: "2a654809ea18dbf97ec6f01e4fb227119be52e129a486e5b", pid: 15555 },
            { num: 10, port: 17900, tunnel: 8013, token: "52d32bf00fc08316a9053e323af21355e1024cce68f93f28", pid: 15624 },
        ];

        for (const inst of namedInstances) {
            await ctx.db.insert("instances", {
                serverId: server3Id,
                instanceNumber: inst.num,
                port: inst.port,
                tunnelPort: inst.tunnel,
                token: inst.token,
                configPath: `~/.openclaw${inst.num}/config.json`,
                status: "running",
                version: "2026.2.17",
                pid: inst.pid,
                memoryMb: 420,
                startedAt: "2026-02-19",
                name: inst.name,
                description: inst.description,
                icon: inst.icon,
                color: inst.color,
                tags: inst.tags,
            });
        }

        for (const inst of genericInstances) {
            await ctx.db.insert("instances", {
                serverId: server3Id,
                instanceNumber: inst.num,
                port: inst.port,
                tunnelPort: inst.tunnel,
                token: inst.token,
                configPath: `~/.openclaw${inst.num}/config.json`,
                status: "running",
                version: "2026.2.17",
                pid: inst.pid,
                memoryMb: 420,
                startedAt: "2026-02-19",
            });
        }

        return {
            status: "seeded",
            servers: { server1Id, server2Id, server3Id },
            instanceCount: namedInstances.length + genericInstances.length + 2,
        };
    },
});

// Re-seed: clear and re-populate (for development)
export const reseed = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete all instances
        const instances = await ctx.db.query("instances").collect();
        for (const inst of instances) {
            await ctx.db.delete(inst._id);
        }
        // Delete all servers
        const servers = await ctx.db.query("servers").collect();
        for (const s of servers) {
            await ctx.db.delete(s._id);
        }
        return { status: "cleared" };
    },
});
