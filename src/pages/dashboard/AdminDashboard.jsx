import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Wrench, CheckCircle2, AlertOctagon, Gauge, Hourglass } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAdminSummary } from "@/features/dashboard/dashboardSlice";
import { fetchIssues } from "@/features/issues/issueSlice";
import StatCard from "@/components/common/StatCard";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import { Loader, ErrorState, EmptyState } from "@/components/common/Feedback";
import { IssueStatusBadge, PriorityBadge } from "@/components/common/Badge";
import { formatDateTime } from "@/utils/format";
import Button from "@/components/common/Button";

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminSummary, status, error } = useAppSelector((s) => s.dashboard);
  const { list: issues, status: issueStatus } = useAppSelector((s) => s.issues);

  useEffect(() => {
    dispatch(fetchAdminSummary());
    dispatch(fetchIssues());
  }, [dispatch]);

  if (status === "loading" && !adminSummary) return <Loader label="Loading dashboard…" />;
  if (status === "failed" && !adminSummary)
    return <ErrorState message={error} onRetry={() => dispatch(fetchAdminSummary())} />;

  const s = adminSummary || {};
  const recentIssues = issues.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
          Operations overview
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          Fleet-wide health across every registered asset.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard index={0} label="Total assets" value={s.totalAssets ?? 0} icon={Boxes} tone="neutral" />
        <StatCard index={1} label="Total issues" value={s.totalIssues ?? 0} icon={Wrench} tone="info" />
        <StatCard index={2} label="Operational" value={s.operationalAssets ?? 0} icon={CheckCircle2} tone="good" />
        <StatCard index={3} label="Under maintenance" value={s.underMaintenance ?? 0} icon={Gauge} tone="warn" />
        <StatCard index={4} label="Out of service" value={s.outOfService ?? 0} icon={AlertOctagon} tone="critical" />
        <StatCard index={5} label="Resolved issues" value={s.resolvedIssues ?? 0} icon={CheckCircle2} tone="good" />
        <StatCard index={6} label="Pending issues" value={s.pendingIssues ?? 0} icon={Hourglass} tone="warn" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
            Recent issues
          </h3>
          <Button size="sm" variant="outline" onClick={() => navigate("/app/issues")}>
            View all
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {issueStatus === "loading" && !issues.length ? (
            <Loader />
          ) : recentIssues.length === 0 ? (
            <EmptyState title="No issues yet" description="Reported issues will appear here." />
          ) : (
            <div className="divide-y divide-[var(--color-line)]">
              {recentIssues.map((issue) => (
                <button
                  key={issue._id}
                  onClick={() => navigate(`/app/issues/${issue._id}`)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-[var(--color-surface-2)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                      {issue.title}
                    </p>
                    <p className="font-[var(--font-mono)] text-xs text-[var(--color-ink-soft)]">
                      {issue.issueNumber} · {issue.asset?.name || "Unknown asset"} ·{" "}
                      {formatDateTime(issue.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={issue.priority} />
                    <IssueStatusBadge status={issue.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
