import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import "./App.css";

/* -------------------------------------------------- */
/* Chart theme                                        */
/* -------------------------------------------------- */
const CHART_COLORS = {
  accent: "#63b3ed",
  accentHover: "#90cdf4",
  success: "#48bb78",
  warning: "#ecc94b",
  error: "#fc8181",
  bg: "#1a2234",
  bgSecondary: "#111827",
  text: "#94a3b8",
  muted: "#64748b",
  grid: "rgba(255,255,255,0.06)",
};

const INSTANCE_COLORS = [
  "#63b3ed", "#90cdf4", "#48bb78", "#68d391",
  "#ecc94b", "#f6e05e", "#fc8181", "#feb2b2",
  "#b794f4", "#d6bcfa",
];

/* -------------------------------------------------- */
/* Custom tooltip                                     */
/* -------------------------------------------------- */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="chart-tooltip-value">
          {entry.name}: <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------- */
/* App                                                */
/* -------------------------------------------------- */

function App() {
  const data = useQuery(api.servers.listWithInstances);

  if (data === undefined) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span className="loading-text">Connecting to OpenClaw…</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <h3>No servers found</h3>
        <p>Run the seed command to populate your dashboard:</p>
        <div className="seed-command">npx convex run seed:seed</div>
      </div>
    );
  }

  const totalInstances = data.reduce((sum, s) => sum + s.instances.length, 0);
  const runningInstances = data.reduce(
    (sum, s) => sum + s.instances.filter((i) => i.status === "running").length,
    0
  );

  return (
    <>
      <header className="dashboard-header">
        <h1>
          <span className="logo-icon">🦀</span>
          OpenClaw Dashboard
        </h1>
        <p className="subtitle">
          Real-time overview of all OpenClaw gateway instances
        </p>
      </header>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Servers</div>
          <div className="stat-value accent">{data.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Instances</div>
          <div className="stat-value accent">{totalInstances}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Running</div>
          <div className="stat-value success">{runningInstances}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Down</div>
          <div className="stat-value" style={{ color: totalInstances - runningInstances > 0 ? "var(--error)" : "var(--text-muted)" }}>
            {totalInstances - runningInstances}
          </div>
        </div>
      </div>

      {/* Health + Charts Section (moved to top) */}
      {data.map((server) => (
        <div key={`health-${server._id}`}>
          <HealthSection server={server} />
          <ChartsSection server={server} />
        </div>
      ))}

      {/* Server Cards with Instances */}
      {data.map((server) => (
        <ServerCard key={server._id} server={server} />
      ))}
    </>
  );
}

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */

type Server = NonNullable<ReturnType<typeof useQuery<typeof api.servers.listWithInstances>>>[number];
type Instance = Server["instances"][number];

/* -------------------------------------------------- */
/* Health Section (moved to top)                      */
/* -------------------------------------------------- */

function HealthSection({ server }: { server: Server }) {
  const checks: { icon: string; text: string }[] = [];

  const running = server.instances.filter((i) => i.status === "running").length;
  const total = server.instances.length;

  checks.push({
    icon: running === total ? "✅" : "⚠️",
    text: `${server.hostname}: ${running}/${total} instances running`,
  });

  const memPct = server.memoryUsedGb && server.ramGb
    ? (server.memoryUsedGb / server.ramGb) * 100 : 0;
  checks.push({
    icon: memPct < 80 ? "✅" : "⚠️",
    text: `Memory: ${Math.round(memPct)}% used`,
  });

  const diskPct = server.diskUsedGb && server.diskGb
    ? (server.diskUsedGb / server.diskGb) * 100 : 0;
  checks.push({
    icon: diskPct < 80 ? "✅" : "⚠️",
    text: `Disk: ${Math.round(diskPct)}% used`,
  });

  checks.push({
    icon: server.loadAverage?.startsWith("0") ? "✅" : "⚠️",
    text: `Load: ${server.loadAverage ?? "unknown"}`,
  });

  const versions = [...new Set(server.instances.map((i) => i.version))];
  checks.push({
    icon: versions.length === 1 ? "✅" : "⚠️",
    text: `Version: ${versions.length === 1 ? `uniform (v${versions[0]})` : `mixed (${versions.join(", ")})`}`,
  });

  return (
    <div className="health-section">
      <h3 className="section-title">Health Summary — {server.hostname}</h3>
      <div className="health-grid">
        {checks.map((check, i) => (
          <div key={i} className="health-item">
            <span className="health-icon">{check.icon}</span>
            {check.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Charts Section                                     */
/* -------------------------------------------------- */

function ChartsSection({ server }: { server: Server }) {
  // Memory per instance (bar chart)
  const memoryData = server.instances
    .sort((a, b) => a.instanceNumber - b.instanceNumber)
    .map((inst) => ({
      name: `#${inst.instanceNumber}`,
      memory: inst.memoryMb ?? 0,
    }));

  // Status distribution (pie chart)
  const statusCounts = server.instances.reduce<Record<string, number>>((acc, inst) => {
    acc[inst.status] = (acc[inst.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const STATUS_PIE_COLORS: Record<string, string> = {
    running: CHART_COLORS.success,
    stopped: CHART_COLORS.error,
    error: CHART_COLORS.warning,
  };

  // Resource gauges (radial bar)
  const memPct = server.memoryUsedGb && server.ramGb
    ? Math.round((server.memoryUsedGb / server.ramGb) * 100) : 0;
  const diskPct = server.diskUsedGb && server.diskGb
    ? Math.round((server.diskUsedGb / server.diskGb) * 100) : 0;

  const gaugeData = [
    { name: "Disk", value: diskPct, fill: diskPct > 80 ? CHART_COLORS.error : CHART_COLORS.accent },
    { name: "Memory", value: memPct, fill: memPct > 80 ? CHART_COLORS.warning : CHART_COLORS.success },
  ];

  // Port allocation (bar chart)
  const portData = server.instances
    .sort((a, b) => a.instanceNumber - b.instanceNumber)
    .map((inst) => ({
      name: `#${inst.instanceNumber}`,
      port: inst.port,
      tunnel: inst.tunnelPort,
    }));

  return (
    <div className="charts-section">
      <h3 className="section-title">Analytics</h3>
      <div className="charts-grid">

        {/* Memory per instance */}
        <div className="chart-card">
          <h4 className="chart-title">Memory per Instance (MB)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={memoryData} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="memory" radius={[4, 4, 0, 0]}>
                {memoryData.map((_, i) => (
                  <Cell key={i} fill={INSTANCE_COLORS[i % INSTANCE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Instance status pie */}
        <div className="chart-card">
          <h4 className="chart-title">Instance Status</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_PIE_COLORS[entry.name] || CHART_COLORS.accent} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={30}
                formatter={(value: string) => <span style={{ color: CHART_COLORS.text, fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resource gauges */}
        <div className="chart-card">
          <h4 className="chart-title">Resource Usage</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="90%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
              barSize={16}
            >
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.04)" }}
                dataKey="value"
                cornerRadius={8}
              />
              <Legend
                verticalAlign="bottom"
                height={30}
                formatter={(value: string, entry) => {
                  const item = gaugeData.find(d => d.name === value);
                  return <span style={{ color: CHART_COLORS.text, fontSize: 12 }}>{value}: {item?.value ?? (entry as unknown as { payload?: { value?: number } })?.payload?.value}%</span>;
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Port allocation */}
        <div className="chart-card">
          <h4 className="chart-title">Port Allocation</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={portData} barCategoryGap="15%">
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
                domain={["dataMin - 500", "dataMax + 500"]}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="port" name="Server Port" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="tunnel" name="Tunnel Port" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value: string) => <span style={{ color: CHART_COLORS.text, fontSize: 12 }}>{value}</span>}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Server Card                                        */
/* -------------------------------------------------- */

function ServerCard({ server }: { server: Server }) {
  const memPercent = server.memoryUsedGb && server.ramGb
    ? Math.round((server.memoryUsedGb / server.ramGb) * 100) : 0;
  const diskPercent = server.diskUsedGb && server.diskGb
    ? Math.round((server.diskUsedGb / server.diskGb) * 100) : 0;

  return (
    <div className="server-card">
      <div className="server-card-header">
        <h2>
          🖥️ {server.hostname}
          <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.85rem" }}>
            ({server.provider})
          </span>
        </h2>
        <span className={`server-badge ${server.status}`}>
          <span className="dot" />
          {server.status}
        </span>
      </div>

      <div className="server-info-grid">
        <div className="info-item">
          <span className="info-label">IP</span>
          <span className="info-value">{server.ip}</span>
        </div>
        <div className="info-item">
          <span className="info-label">OS</span>
          <span className="info-value">{server.os}</span>
        </div>
        <div className="info-item">
          <span className="info-label">CPU</span>
          <span className="info-value">{server.cpuCores} vCPU</span>
        </div>
        <div className="info-item">
          <span className="info-label">RAM</span>
          <span className="info-value">{server.ramGb} GB</span>
        </div>
        <div className="info-item">
          <span className="info-label">Disk</span>
          <span className="info-value">{server.diskGb} GB</span>
        </div>
        <div className="info-item">
          <span className="info-label">SSH</span>
          <span className="info-value">{server.sshUser}@{server.ip}:{server.sshPorts.join(", ")}</span>
        </div>
        {server.uptimeDays !== undefined && (
          <div className="info-item">
            <span className="info-label">Uptime</span>
            <span className="info-value">{server.uptimeDays} days</span>
          </div>
        )}
        {server.loadAverage && (
          <div className="info-item">
            <span className="info-label">Load</span>
            <span className="info-value">{server.loadAverage}</span>
          </div>
        )}
      </div>

      <div className="resource-bars">
        <div className="resource-bar">
          <div className="resource-bar-header">
            <span className="resource-label">Memory</span>
            <span className="resource-value">
              {server.memoryUsedGb ?? "?"} / {server.ramGb} GB ({memPercent}%)
            </span>
          </div>
          <div className="bar-track">
            <div
              className={`bar-fill ${memPercent > 85 ? "danger" : memPercent > 65 ? "warning" : ""}`}
              style={{ width: `${memPercent}%` }}
            />
          </div>
        </div>
        <div className="resource-bar">
          <div className="resource-bar-header">
            <span className="resource-label">Disk</span>
            <span className="resource-value">
              {server.diskUsedGb ?? "?"} / {server.diskGb} GB ({diskPercent}%)
            </span>
          </div>
          <div className="bar-track">
            <div
              className={`bar-fill ${diskPercent > 85 ? "danger" : diskPercent > 65 ? "warning" : ""}`}
              style={{ width: `${diskPercent}%` }}
            />
          </div>
        </div>
      </div>

      <h3 className="section-title">
        Instances ({server.instances.length})
      </h3>
      <div className="instance-grid">
        {server.instances
          .sort((a, b) => a.instanceNumber - b.instanceNumber)
          .map((inst) => (
            <InstanceCard key={inst._id} instance={inst} />
          ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Instance Card                                      */
/* -------------------------------------------------- */

function InstanceCard({ instance }: { instance: Instance }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const dashboardUrl = `http://localhost:${instance.tunnelPort}/?token=${instance.token}`;

  return (
    <div className="instance-card">
      <div className="instance-card-header">
        <span className="instance-number">
          #{instance.instanceNumber}
        </span>
        <span className={`instance-status ${instance.status}`}>
          <span className="status-dot" />
          {instance.status}
        </span>
      </div>

      <div className="instance-details">
        <div className="instance-row">
          <span className="row-label">Port</span>
          <span className="row-value">{instance.port}</span>
        </div>
        <div className="instance-row">
          <span className="row-label">Tunnel</span>
          <span className="row-value">localhost:{instance.tunnelPort}</span>
        </div>
        <div className="instance-row">
          <span className="row-label">Version</span>
          <span className="row-value">v{instance.version}</span>
        </div>
        {instance.pid && (
          <div className="instance-row">
            <span className="row-label">PID</span>
            <span className="row-value">{instance.pid}</span>
          </div>
        )}
        {instance.memoryMb && (
          <div className="instance-row">
            <span className="row-label">Memory</span>
            <span className="row-value">~{instance.memoryMb} MB</span>
          </div>
        )}
        <div className="instance-row">
          <span className="row-label">Config</span>
          <span className="row-value">{instance.configPath}</span>
        </div>
      </div>

      <div className="token-row">
        <span className="token-value" title={instance.token}>
          {instance.token}
        </span>
        <button
          className={`copy-btn ${copied === "token" ? "copied" : ""}`}
          onClick={() => copyToClipboard(instance.token, "token")}
        >
          {copied === "token" ? "✓" : "Copy"}
        </button>
      </div>

      <a
        href={dashboardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="dashboard-link"
      >
        Open Dashboard →
      </a>
    </div>
  );
}

export default App;
