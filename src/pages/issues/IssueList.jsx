import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Wrench } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchIssues, fetchMyIssues } from "@/features/issues/issueSlice";
import Card from "@/components/common/Card";
import { Input, Select } from "@/components/common/Field";
import { IssueStatusBadge, PriorityBadge } from "@/components/common/Badge";
import { Loader, ErrorState, EmptyState } from "@/components/common/Feedback";
import { formatDateTime } from "@/utils/format";

const STATUSES = [
  "Reported",
  "Assigned",
  "Inspection Started",
  "Maintenance In Progress",
  "Waiting for Parts",
  "Resolved",
  "Closed",
  "Reopened",
];

export default function IssueList({ mine = false }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, myList, status, error } = useAppSelector((s) => s.issues);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(mine ? fetchMyIssues() : fetchIssues());
  }, [dispatch, mine]);

  const source = mine ? myList : list;

  const filtered = useMemo(() => {
    return source.filter((i) => {
      const matchesSearch =
        !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.issueNumber?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [source, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
          {mine ? "My issues" : "All issues"}
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          {source.length} issue{source.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]" />
          <Input
            placeholder="Search by title or issue number…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-56">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {status === "loading" && !source.length ? (
        <Loader label="Loading issues…" />
      ) : status === "failed" && !source.length ? (
        <ErrorState message={error} onRetry={() => dispatch(mine ? fetchMyIssues() : fetchIssues())} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No issues found"
          description={
            source.length === 0
              ? mine
                ? "Nothing has been assigned to you yet."
                : "Reported issues will appear here."
              : "Try adjusting your search or filters."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-[var(--color-line)]">
            {filtered.map((issue) => (
              <button
                key={issue._id}
                onClick={() => navigate(`/app/issues/${issue._id}`)}
                className="flex w-full flex-col gap-2 px-5 py-4 text-left hover:bg-[var(--color-surface-2)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-ink)]">{issue.title}</p>
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
        </Card>
      )}
    </div>
  );
}
