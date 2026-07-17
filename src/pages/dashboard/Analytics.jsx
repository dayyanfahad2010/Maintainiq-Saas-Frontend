import { useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, Clock, TrendingUp, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAdminAnalytics } from "@/features/dashboard/dashboardSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import StatCard from "@/components/common/StatCard";
import { Loader, ErrorState, EmptyState } from "@/components/common/Feedback";
import { formatCurrency } from "@/utils/format";

const CHART_COLORS = ["#F2A93B", "#3B7DD8", "#2E8B57", "#DB8A1F", "#D64545", "#8B6FD9", "#4BA3A3"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-[var(--color-ink)]">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const dispatch = useAppDispatch();
  const { analytics, analyticsStatus, analyticsError } = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
  }, [dispatch]);

  if (analyticsStatus === "loading" && !analytics) return <Loader label="Crunching the numbers…" />;
  if (analyticsStatus === "failed" && !analytics)
    return <ErrorState message={analyticsError} onRetry={() => dispatch(fetchAdminAnalytics())} />;
  if (!analytics) return null;

  const {
    monthlyCost = [],
    topProblematicAssets = [],
    technicianPerformance = [],
    issuesByCategory = [],
    issuesByStatus = [],
    avgResolutionHours,
  } = analytics;

  const totalCost = monthlyCost.reduce((sum, m) => sum + m.totalCost, 0);
  const totalIssuesTracked = issuesByStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
          Analytics
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          Cost, downtime, and performance trends across the fleet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Maintenance cost (6mo)"
          value={`PKR ${totalCost}`}
          icon={""}
          tone="amber"
        />
        <StatCard
          index={1}
          label="Avg. resolution time"
          value={avgResolutionHours != null ? `${avgResolutionHours}h` : "—"}
          icon={Clock}
          tone="info"
        />
        <StatCard
          index={2}
          label="Issues tracked"
          value={totalIssuesTracked}
          icon={TrendingUp}
          tone="neutral"
        />
        <StatCard
          index={3}
          label="Active technicians"
          value={technicianPerformance.length}
          icon={Users}
          tone="good"
        />
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
            Monthly maintenance cost
          </h3>
        </CardHeader>
        <CardBody>
          {monthlyCost.length === 0 ? (
            <EmptyState title="No maintenance costs yet" description="Costs will chart here once records are logged." />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCost} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-surface-2)" }} />
                  <Bar dataKey="totalCost" name="Cost" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
              Most problematic assets
            </h3>
          </CardHeader>
          <CardBody>
            {topProblematicAssets.length === 0 ? (
              <EmptyState title="No issues yet" description="Recurring problem assets will surface here." />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topProblematicAssets}
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="assetName"
                      width={110}
                      tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-surface-2)" }} />
                    <Bar dataKey="issueCount" name="Issues" fill={CHART_COLORS[4]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
              Technician performance
            </h3>
          </CardHeader>
          <CardBody>
            {technicianPerformance.length === 0 ? (
              <EmptyState title="No resolved issues yet" description="Resolved-issue counts per technician will show here." />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={technicianPerformance}
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="technicianName"
                      width={110}
                      tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-surface-2)" }} />
                    <Bar dataKey="resolvedCount" name="Resolved" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
              Issues by category
            </h3>
          </CardHeader>
          <CardBody>
            {issuesByCategory.length === 0 ? (
              <EmptyState title="No issues yet" description="Category breakdown will show here." />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issuesByCategory}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {issuesByCategory.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
              Issues by status
            </h3>
          </CardHeader>
          <CardBody>
            {issuesByStatus.length === 0 ? (
              <EmptyState title="No issues yet" description="Status breakdown will show here." />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issuesByStatus}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {issuesByStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
