import { mutation } from "./_generated/server";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db.query("servers").first();
        if (existing) {
            return { status: "already_seeded" };
        }

        // Insert Server 3
        const serverId = await ctx.db.insert("servers", {
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
            lastCheckedAt: "2026-02-22T15:16:00+01:00",
        });

        // Instance data from live SSH
        const instances = [
            { num: 1, port: 17000, tunnel: 8004, token: "d22b1d85691b12c2038a8a60c8f023f5760001230b9d6054", pid: 13261 },
            { num: 2, port: 17100, tunnel: 8005, token: "c6ff60753d39345498abd05e086a4cd4b62dc3daf068d40b", pid: 13196 },
            { num: 3, port: 17200, tunnel: 8006, token: "0ce11f7cfb398c79dd6f6cc6a2e4eb78a113a0c493192812", pid: 13384 },
            { num: 4, port: 17300, tunnel: 8007, token: "d2ec916d951e9657f5731aec1e2c97df81364619bd3af391", pid: 13449 },
            { num: 5, port: 17400, tunnel: 8008, token: "ea8724aed9837367446fdb778dc38afd8c6618d0b2ffe0a5", pid: 15288 },
            { num: 6, port: 17500, tunnel: 8009, token: "3aaa3e93d1ba43d65005dfa84e2c9a689c4c1dceb9d07aa3", pid: 15354 },
            { num: 7, port: 17600, tunnel: 8010, token: "6bd903f4dfc8845e335b204298cb4cbe11c1f5b5f8991cba", pid: 15419 },
            { num: 8, port: 17700, tunnel: 8011, token: "2b2480b321abd29a17cd0f3ac08c9591b5e8fb8050bb25b0", pid: 15489 },
            { num: 9, port: 17800, tunnel: 8012, token: "2a654809ea18dbf97ec6f01e4fb227119be52e129a486e5b", pid: 15555 },
            { num: 10, port: 17900, tunnel: 8013, token: "52d32bf00fc08316a9053e323af21355e1024cce68f93f28", pid: 15624 },
        ];

        for (const inst of instances) {
            await ctx.db.insert("instances", {
                serverId,
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

        return { status: "seeded", serverId, instanceCount: instances.length };
    },
});
