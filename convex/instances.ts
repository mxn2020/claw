import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByServer = query({
    args: { serverId: v.id("servers") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("instances")
            .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
            .collect();
    },
});

export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("instances").collect();
    },
});

export const get = query({
    args: { id: v.id("instances") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getWithServer = query({
    args: { id: v.id("instances") },
    handler: async (ctx, args) => {
        const instance = await ctx.db.get(args.id);
        if (!instance) return null;
        const server = await ctx.db.get(instance.serverId);
        return { ...instance, server };
    },
});

export const update = mutation({
    args: {
        id: v.id("instances"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        status: v.optional(v.union(v.literal("running"), v.literal("stopped"), v.literal("error"))),
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

export const create = mutation({
    args: {
        serverId: v.id("servers"),
        instanceNumber: v.number(),
        port: v.number(),
        tunnelPort: v.number(),
        token: v.string(),
        configPath: v.string(),
        version: v.string(),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("instances", {
            ...args,
            status: "stopped",
        });
        return { status: "created", id };
    },
});

export const remove = mutation({
    args: { id: v.id("instances") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return { status: "deleted" };
    },
});

export const setStatus = mutation({
    args: {
        id: v.id("instances"),
        status: v.union(v.literal("running"), v.literal("stopped"), v.literal("error")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
        return { status: "updated" };
    },
});

export const bulkSetStatus = mutation({
    args: {
        ids: v.array(v.id("instances")),
        status: v.union(v.literal("running"), v.literal("stopped"), v.literal("error")),
    },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.patch(id, { status: args.status });
        }
        return { status: "updated", count: args.ids.length };
    },
});
