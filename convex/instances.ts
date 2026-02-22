import { query } from "./_generated/server";
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

export const get = query({
    args: { id: v.id("instances") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
