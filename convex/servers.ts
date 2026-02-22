import { query } from "./_generated/server";

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
