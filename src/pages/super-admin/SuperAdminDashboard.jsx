import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Building2, Plus, Ban, CheckCircle2, Trash2, Users, Boxes, Wrench } from "lucide-react";
import {
  fetchOrganizations,
  createOrganization,
  suspendOrganization,
  activateOrganization,
  deleteOrganization,
} from "@/features/organizations/organizationSlice";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import StatCard from "@/components/common/StatCard";
import Modal from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { FormField, Input } from "@/components/common/Field";
import { Loader, EmptyState, ErrorState, ConfirmDialog } from "@/components/common/Feedback";
import { formatDate } from "@/utils/format";

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((s) => s.organizations);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { _id, name }
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onCreate = async (values) => {
    const result = await dispatch(createOrganization(values));
    if (createOrganization.fulfilled.match(result)) {
      toast.success(`"${result.payload.name}" created`);
      reset();
      setCreateOpen(false);
    } else {
      toast.error(result.payload || "Could not create organization");
    }
  };

  const handleToggle = async (org) => {
    setBusyId(org._id);
    const action = org.status === "active" ? suspendOrganization : activateOrganization;
    const result = await dispatch(action(org._id));
    setBusyId(null);
    if (action.fulfilled.match(result)) {
      toast.success(`${org.name} ${org.status === "active" ? "suspended" : "activated"}`);
    } else {
      toast.error(result.payload || "Action failed");
    }
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setBusyId(confirmTarget._id);
    const result = await dispatch(deleteOrganization(confirmTarget._id));
    setBusyId(null);
    setConfirmTarget(null);
    if (deleteOrganization.fulfilled.match(result)) {
      toast.success("Organization deleted");
    } else {
      toast.error(result.payload || "Could not delete organization");
    }
  };

  const totals = list.reduce(
    (acc, o) => ({
      users: acc.users + (o.userCount || 0),
      assets: acc.assets + (o.assetCount || 0),
      issues: acc.issues + (o.issueCount || 0),
    }),
    { users: 0, assets: 0, issues: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Every tenant workspace on MaintainIQ. Data never crosses between organizations.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          New organization
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Organizations" value={list.length} icon={Building2} index={0} />
        <StatCard label="Total users" value={totals.users} icon={Users} tone="info" index={1} />
        <StatCard label="Total assets" value={totals.assets} icon={Boxes} tone="amber" index={2} />
        <StatCard label="Total issues" value={totals.issues} icon={Wrench} tone="warn" index={3} />
      </div>

      {status === "loading" && list.length === 0 && <Loader label="Loading organizations…" />}

      {status === "failed" && list.length === 0 && (
        <ErrorState message={error} onRetry={() => dispatch(fetchOrganizations())} />
      )}

      {status !== "loading" && list.length === 0 && status !== "failed" && (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create the first tenant workspace to get started."
          action={
            <Button icon={Plus} onClick={() => setCreateOpen(true)}>
              New organization
            </Button>
          }
        />
      )}

      {list.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                <th className="px-5 py-3 font-semibold">Organization</th>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Users</th>
                <th className="px-5 py-3 font-semibold">Assets</th>
                <th className="px-5 py-3 font-semibold">Issues</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((org) => (
                <tr key={org._id} className="border-b border-[var(--color-line)] last:border-b-0">
                  <td className="px-5 py-3 font-medium text-[var(--color-ink)]">{org.name}</td>
                  <td className="px-5 py-3 font-[var(--font-mono)] text-xs text-[var(--color-ink-soft)]">
                    {org.slug}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={org.status === "active" ? "good" : "critical"}>{org.status}</Badge>
                  </td>
                  <td className="px-5 py-3">{org.userCount ?? "—"}</td>
                  <td className="px-5 py-3">{org.assetCount ?? "—"}</td>
                  <td className="px-5 py-3">{org.issueCount ?? "—"}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-soft)]">{formatDate(org.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={org.status === "active" ? Ban : CheckCircle2}
                        loading={busyId === org._id}
                        onClick={() => handleToggle(org)}
                      >
                        {org.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setConfirmTarget(org)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New organization" size="sm">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <FormField label="Organization name" htmlFor="name" required error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Indus Hospital"
              error={!!errors.name}
              {...register("name", { required: "Organization name is required" })}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title="Delete organization?"
        description={`This permanently deletes "${confirmTarget?.name}" and every user, asset, issue, and maintenance record it owns. This cannot be undone.`}
        confirmLabel="Delete permanently"
        loading={busyId === confirmTarget?._id}
      />
    </div>
  );
}
