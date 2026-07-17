import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, CheckCircle2, PackageSearch } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchTechnicianSummary } from "@/features/dashboard/dashboardSlice";
import { fetchMyIssues } from "@/features/issues/issueSlice";
import StatCard from "@/components/common/StatCard";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import { Loader, ErrorState, EmptyState } from "@/components/common/Feedback";
import { IssueStatusBadge, PriorityBadge } from "@/components/common/Badge";
import { formatDateTime } from "@/utils/format";
import Button from "@/components/common/Button";

export default function TechnicianDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { technicianSummary, status, error } = useAppSelector((s) => s.dashboard);
  const { myList, status: issueStatus } = useAppSelector((s) => s.issues);

  useEffect(() => {
    dispatch(fetchTechnicianSummary());
    dispatch(fetchMyIssues());
  }, [dispatch]);

  if (status === "loading" && !technicianSummary) return <Loader label="Loading your work…" />;
  if (status === "failed" && !technicianSummary)
    return <ErrorState message={error} onRetry={() => dispatch(fetchTechnicianSummary())} />;

  const s = technicianSummary || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
          Your workload
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          Everything currently assigned to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard index={0} label="Assigned" value={s.assigned ?? 0} icon={ClipboardList} tone="info" />
        <StatCard index={1} label="In progress" value={s.inProgress ?? 0} icon={Loader2} tone="warn" />
        <StatCard index={2} label="Waiting for parts" value={s.waitingForParts ?? 0} icon={PackageSearch} tone="amber" />
        <StatCard index={3} label="Resolved" value={s.resolved ?? 0} icon={CheckCircle2} tone="good" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
            Assigned to you
          </h3>
          <Button size="sm" variant="outline" onClick={() => navigate("/app/my-issues")}>
            View all
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {issueStatus === "loading" && !myList.length ? (
            <Loader />
          ) : myList.length === 0 ? (
            <EmptyState title="Nothing assigned yet" description="New work assigned to you will show up here." />
          ) : (
            <div className="divide-y divide-[var(--color-line)]">
              {myList.slice(0, 6).map((issue) => (
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
