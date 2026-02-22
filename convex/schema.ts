import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  servers: defineTable({
    hostname: v.string(),
    ip: v.string(),
    provider: v.string(),
    os: v.string(),
    cpuCores: v.number(),
    ramGb: v.number(),
    diskGb: v.number(),
    sshPorts: v.array(v.number()),
    sshKeyPath: v.string(),
    sshUser: v.string(),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("degraded")),
    memoryUsedGb: v.optional(v.number()),
    diskUsedGb: v.optional(v.number()),
    loadAverage: v.optional(v.string()),
    uptimeDays: v.optional(v.number()),
    lastCheckedAt: v.optional(v.string()),
  }).index("by_hostname", ["hostname"]),

  instances: defineTable({
    serverId: v.id("servers"),
    instanceNumber: v.number(),
    port: v.number(),
    tunnelPort: v.number(),
    token: v.string(),
    configPath: v.string(),
    status: v.union(v.literal("running"), v.literal("stopped"), v.literal("error")),
    version: v.string(),
    pid: v.optional(v.number()),
    memoryMb: v.optional(v.number()),
    startedAt: v.optional(v.string()),
    // Named instance metadata
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }).index("by_server", ["serverId"]),
});
