import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("servers").collect();
    },
});

export const listWithInstances = query({
    args: {},
    handler: async (ctx) => {
        const servers = await ctx.db.query("servers").collect();
        const result = await Promise.all(
            servers.map(async (server) => {
                const instances = await ctx.db
                    .query("instances")
                    .withIndex("by_server", (q) => q.eq("serverId", server._id))
                    .collect();
                return { ...server, instances };
            })
        );
        return result;
    },
});

export const get = query({
    args: { id: v.id("servers") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const update = mutation({
    args: {
        id: v.id("servers"),
        hostname: v.optional(v.string()),
        ip: v.optional(v.string()),
        status: v.optional(v.union(v.literal("online"), v.literal("offline"), v.literal("degraded"))),
        memoryUsedGb: v.optional(v.number()),
        diskUsedGb: v.optional(v.number()),
        loadAverage: v.optional(v.string()),
        uptimeDays: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const patch: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) patch[key] = value;
        }
        await ctx.db.patch(id, patch);
        return { status: "updated" };
    },
});
