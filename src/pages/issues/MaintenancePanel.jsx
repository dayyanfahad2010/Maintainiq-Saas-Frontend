import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Sparkles, Wrench, PenSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createMaintenance,
  updateMaintenance,
  fetchMaintenanceByIssue,
  clearCurrentMaintenance,
} from "@/features/maintenance/maintenanceSlice";
import { runMaintenanceSummary, clearSummary } from "@/features/ai/aiSlice";
import { fetchIssueById } from "@/features/issues/issueSlice";
import { fetchAssetById } from "@/features/assets/assetSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { FormField, Input, Textarea, Select } from "@/components/common/Field";
import EvidencePicker from "@/components/common/EvidencePicker";
import { formatCurrency, formatDate } from "@/utils/format";
import { toFormData } from "@/utils/formData";

export default function MaintenancePanel({ issue, canEdit }) {
  const dispatch = useAppDispatch();
  const { current: maintenance, status } = useAppSelector((s) => s.maintenance);
  const { summary, summaryStatus } = useAppSelector((s) => s.ai);
  const [editing, setEditing] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      inspectionNotes: "",
      workPerformed: "",
      partsName: "",
      partsQuantity: 1,
      cost: 0,
      finalCondition: "Good",
      nextServiceDate: "",
      aiSummary: "",
    },
  });

  useEffect(() => {
    dispatch(fetchMaintenanceByIssue(issue._id));
    dispatch(clearSummary());
    return () => dispatch(clearCurrentMaintenance());
  }, [dispatch, issue._id]);

  useEffect(() => {
    if (maintenance && maintenance.issue) {
      reset({
        inspectionNotes: maintenance.inspectionNotes || "",
        workPerformed: maintenance.workPerformed || "",
        partsName: maintenance.parts?.[0]?.name || "",
        partsQuantity: maintenance.parts?.[0]?.quantity || 1,
        cost: maintenance.cost || 0,
        finalCondition: maintenance.finalCondition || "Good",
        nextServiceDate: maintenance.nextServiceDate
          ? maintenance.nextServiceDate.slice(0, 10)
          : "",
        aiSummary: maintenance.aiSummary || "",
      });
    }
  }, [maintenance, reset]);

  const hasRecord = Boolean(maintenance?.issue);

  const handleGenerateSummary = async () => {
    const inspectionNotes = watch("inspectionNotes");
    const workPerformed = watch("workPerformed");
    if (!inspectionNotes || !workPerformed) {
      toast.error("Fill in inspection notes and work performed first");
      return;
    }
    const result = await dispatch(
      runMaintenanceSummary({
        assetName: issue.asset?.name,
        technician: undefined,
        inspectionNotes,
        workPerformed,
        parts: watch("partsName"),
      })
    );
    if (runMaintenanceSummary.fulfilled.match(result)) {
      setValue("aiSummary", result.payload.summary);
      toast.success("AI summary generated — review before saving");
    } else {
      toast.error(result.payload || "AI summary failed");
    }
  };

  const onSubmit = async (values) => {
    const payload = {
      issue: issue._id,
      inspectionNotes: values.inspectionNotes,
      workPerformed: values.workPerformed,
      parts: values.partsName ? [{ name: values.partsName, quantity: Number(values.partsQuantity) || 1 }] : [],
      cost: Number(values.cost) || 0,
      finalCondition: values.finalCondition,
      nextServiceDate: values.nextServiceDate || undefined,
      aiSummary: values.aiSummary,
    };
    const body = evidenceFiles.length ? toFormData(payload, evidenceFiles) : payload;

    if (hasRecord) {
      const result = await dispatch(updateMaintenance({ id: maintenance._id, payload: body }));
      if (updateMaintenance.fulfilled.match(result)) {
        toast.success("Maintenance record updated");
        setEditing(false);
        setEvidenceFiles([]);
      } else {
        toast.error(result.payload || "Update failed");
      }
    } else {
      const result = await dispatch(createMaintenance(body));
      if (createMaintenance.fulfilled.match(result)) {
        toast.success("Maintenance logged — issue resolved");
        dispatch(fetchIssueById(issue._id));
        dispatch(fetchAssetById(issue.asset?._id || issue.asset));
        setEditing(false);
        setEvidenceFiles([]);
      } else {
        toast.error(result.payload || "Couldn't log maintenance");
      }
    }
  };

  const showForm = canEdit && (editing || !hasRecord);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-[var(--color-ink-soft)]" />
          <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
            Maintenance record
          </h3>
        </div>
        {canEdit && hasRecord && !editing && (
          <Button size="sm" variant="outline" icon={PenSquare} onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {!showForm && hasRecord && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                Inspection findings
              </p>
              <p className="text-[var(--color-ink)]">{maintenance.inspectionNotes}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                Work performed
              </p>
              <p className="text-[var(--color-ink)]">{maintenance.workPerformed}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Parts</p>
                <p className="text-[var(--color-ink)]">
                  {maintenance.parts?.length
                    ? maintenance.parts.map((p) => `${p.name} ×${p.quantity}`).join(", ")
                    : "None"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Cost</p>
                <p className="text-[var(--color-ink)]">{formatCurrency(maintenance.cost)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                  Next service
                </p>
                <p className="text-[var(--color-ink)]">{formatDate(maintenance.nextServiceDate)}</p>
              </div>
            </div>
            {maintenance.evidence?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                  Evidence
                </p>
                <div className="flex flex-wrap gap-2">
                  {maintenance.evidence.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-md border border-[var(--color-line)]"
                    >
                      <img src={url} alt={`Evidence ${i + 1}`} className="h-16 w-16 object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {maintenance.aiSummary && (
              <div className="rounded-md border border-dashed border-[var(--color-amber)]/40 bg-[var(--color-amber)]/5 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                  <Sparkles className="size-3.5" /> AI maintenance summary
                </p>
                <p className="whitespace-pre-line text-[var(--color-ink)]">{maintenance.aiSummary}</p>
              </div>
            )}
          </div>
        )}

        {!showForm && !hasRecord && (
          <p className="text-sm text-[var(--color-ink-soft)]">
            {status === "loading"
              ? "Checking for an existing record…"
              : canEdit
              ? "No maintenance record yet. Log inspection and repair details to resolve this issue."
              : "No maintenance record has been logged for this issue yet."}
          </p>
        )}

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Inspection findings"
              htmlFor="inspectionNotes"
              required
              error={errors.inspectionNotes?.message}
            >
              <Textarea
                id="inspectionNotes"
                placeholder="What did you find on inspection?"
                error={!!errors.inspectionNotes}
                {...register("inspectionNotes", { required: "Required" })}
              />
            </FormField>

            <FormField
              label="Work performed"
              htmlFor="workPerformed"
              required
              error={errors.workPerformed?.message}
            >
              <Textarea
                id="workPerformed"
                placeholder="What repair or action was taken?"
                error={!!errors.workPerformed}
                {...register("workPerformed", { required: "Required" })}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Part replaced" htmlFor="partsName">
                <Input id="partsName" placeholder="Optional" {...register("partsName")} />
              </FormField>
              <FormField label="Quantity" htmlFor="partsQuantity">
                <Input id="partsQuantity" type="number" min={1} {...register("partsQuantity")} />
              </FormField>
              <FormField label="Cost" htmlFor="cost">
                <Input id="cost" type="number" min={0} step="0.01" {...register("cost")} />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Final condition" htmlFor="finalCondition">
                <Select id="finalCondition" {...register("finalCondition")}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </Select>
              </FormField>
              <FormField label="Next service date" htmlFor="nextServiceDate">
                <Input id="nextServiceDate" type="date" {...register("nextServiceDate")} />
              </FormField>
            </div>

            <EvidencePicker files={evidenceFiles} onChange={setEvidenceFiles} label="Repair evidence (optional)" />

            <FormField
              label="AI maintenance summary"
              htmlFor="aiSummary"
              hint="Optional — generate a professional report from your notes above, then edit as needed."
            >
              <Textarea id="aiSummary" rows={5} {...register("aiSummary")} />
            </FormField>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Sparkles}
              loading={summaryStatus === "loading"}
              onClick={handleGenerateSummary}
            >
              Generate with AI
            </Button>

            <div className="flex justify-end gap-2 pt-2">
              {hasRecord && (
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={status === "loading"}>
                {hasRecord ? "Save changes" : "Log maintenance & resolve"}
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
