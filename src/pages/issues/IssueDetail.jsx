import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles, UserPlus, Boxes } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchIssueById,
  assignTechnician,
  updateIssueStatus,
  clearCurrentIssue,
} from "@/features/issues/issueSlice";
import { fetchTechnicians } from "@/features/users/userSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { FormField, Select } from "@/components/common/Field";
import { IssueStatusBadge, PriorityBadge, AssetStatusBadge } from "@/components/common/Badge";
import { Loader, ErrorState } from "@/components/common/Feedback";
import { formatDateTime } from "@/utils/format";
import MaintenancePanel from "./MaintenancePanel";

const NEXT_STATUS = {
  Assigned: ["Inspection Started"],
  "Inspection Started": ["Maintenance In Progress", "Waiting for Parts"],
  "Maintenance In Progress": ["Waiting for Parts"],
  "Waiting for Parts": ["Maintenance In Progress"],
  Resolved: ["Reopened"],
  Reopened: ["Inspection Started"],
};

export default function IssueDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { current: issue, status, error, actionStatus } = useAppSelector((s) => s.issues);
  const technicians = useAppSelector((s) => s.users.technicians);
  const [technicianId, setTechnicianId] = useState("");
  const [nextStatus, setNextStatus] = useState("");

  useEffect(() => {
    dispatch(fetchIssueById(id));
    if (user?.role === "admin") dispatch(fetchTechnicians());
    return () => dispatch(clearCurrentIssue());
  }, [dispatch, id, user?.role]);

  useEffect(() => {
    setTechnicianId(issue?.assignedTechnician?._id || "");
  }, [issue?.assignedTechnician?._id]);

  if (status === "loading" && !issue) return <Loader label="Loading issue…" />;
  if (status === "failed" && !issue)
    return <ErrorState message={error} onRetry={() => dispatch(fetchIssueById(id))} />;
  if (!issue) return null;

  const isAdmin = user?.role === "admin";
  const isAssignedToMe = issue.assignedTechnician?._id === user?._id;
  const canWorkOn = isAdmin || isAssignedToMe;
  const options = NEXT_STATUS[issue.status] || [];

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!technicianId) return;
    const result = await dispatch(assignTechnician({ id: issue._id, assignedTechnician: technicianId }));
    if (assignTechnician.fulfilled.match(result)) {
      toast.success("Technician assigned");
    } else {
      toast.error(result.payload || "Assignment failed");
    }
  };

  const handleStatusChange = async () => {
    if (!nextStatus) return;
    const result = await dispatch(updateIssueStatus({ id: issue._id, status: nextStatus }));
    if (updateIssueStatus.fulfilled.match(result)) {
      toast.success(`Status updated to ${nextStatus}`);
      setNextStatus("");
    } else {
      toast.error(result.payload || "Status update failed");
    }
  };

  const ai = issue.aiSuggestions;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
              {issue.title}
            </h2>
            <IssueStatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <p className="mt-1 font-[var(--font-mono)] text-sm text-[var(--color-ink-soft)]">
            {issue.issueNumber} · Reported {formatDateTime(issue.createdAt)}
          </p>
        </div>
        {issue.asset?._id && (
          <Button
            variant="outline"
            size="sm"
            icon={Boxes}
            onClick={() => navigate(`/app/assets/${issue.asset._id}`)}
          >
            View asset
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                Report details
              </h3>
            </CardHeader>
            <CardBody className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Description</p>
                <p className="text-[var(--color-ink)]">{issue.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Category</p>
                  <p className="text-[var(--color-ink)]">{issue.category}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                    Reported by
                  </p>
                  <p className="text-[var(--color-ink)]">{issue.reporterName || "—"}</p>
                </div>
                {issue.asset?.status && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                      Asset status
                    </p>
                    <AssetStatusBadge status={issue.asset.status} />
                  </div>
                )}
              </div>
              {issue.evidence?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                    Evidence
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {issue.evidence.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-md border border-[var(--color-line)]"
                      >
                        <img src={url} alt={`Evidence ${i + 1}`} className="h-20 w-20 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {ai?.aiGenerated && (
            <Card className="border-[var(--color-amber)]/40">
              <CardHeader className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]" />
                <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                  AI triage summary
                </h3>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                {ai.possibleCauses?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                      Possible causes
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--color-ink)]">
                      {ai.possibleCauses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ai.initialChecks?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                      Safe initial checks
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--color-ink)]">
                      {ai.initialChecks.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ai.recurringWarning && (
                  <p className="rounded-md bg-[var(--color-critical)]/10 p-2.5 text-[var(--color-critical)]">
                    {ai.recurringWarning}
                  </p>
                )}
                <p className="text-xs text-[var(--color-ink-soft)]">
                  AI output is advisory. {ai.userEdited ? "Reviewed and edited by the reporter." : "Not yet edited by a human reviewer."}
                </p>
              </CardBody>
            </Card>
          )}

          <MaintenancePanel issue={issue} canEdit={canWorkOn} />
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <Card>
              <CardHeader className="flex items-center gap-2">
                <UserPlus className="size-4 text-[var(--color-ink-soft)]" />
                <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                  Assignment
                </h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleAssign} className="space-y-3">
                  <FormField label="Technician" htmlFor="technicianId">
                    <Select
                      id="technicianId"
                      value={technicianId}
                      onChange={(e) => setTechnicianId(e.target.value)}
                    >
                      <option value="">Select a technician</option>
                      {technicians.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.userName || t.email}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <Button type="submit" size="sm" className="w-full" loading={actionStatus === "loading"}>
                    {issue.assignedTechnician ? "Reassign" : "Assign technician"}
                  </Button>
                </form>
                {issue.assignedTechnician?._id && (
                  <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
                    Currently assigned to{" "}
                    <span className="font-medium text-[var(--color-ink)]">
                      {issue.assignedTechnician.userName ||
                        issue.assignedTechnician.name ||
                        issue.assignedTechnician.email}
                    </span>
                  </p>
                )}
              </CardBody>
            </Card>
          )}

          {canWorkOn && options.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                  Update status
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                  <option value="">Select next status</option>
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!nextStatus}
                  loading={actionStatus === "loading"}
                  onClick={handleStatusChange}
                >
                  Update status
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
