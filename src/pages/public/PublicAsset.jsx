import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  QrCode,
  MapPin,
  Tag,
  Calendar,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPublicAsset, reportPublicIssue, resetReportState } from "@/features/public/publicSlice";
import { runIssueTriage, clearTriage } from "@/features/ai/aiSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { FormField, Input, Textarea, Select } from "@/components/common/Field";
import EvidencePicker from "@/components/common/EvidencePicker";
import { AssetStatusBadge } from "@/components/common/Badge";
import { Loader, ErrorState } from "@/components/common/Feedback";
import ThemeToggle from "@/components/common/ThemeToggle";
import { formatDate } from "@/utils/format";

const CATEGORIES = [
  "Electrical",
  "HVAC",
  "IT Equipment",
  "Furniture",
  "Plumbing",
  "Safety Equipment",
  "Vehicle",
  "Machinery",
  "Leakage / Performance",
  "Other",
];

export default function PublicAsset() {
  const { assetCode } = useParams();
  const dispatch = useAppDispatch();
  const { asset, status, error, reportStatus, reportSuccess, lastIssueNumber } = useAppSelector(
    (s) => s.public
  );
  const { triage, triageStatus, triageError } = useAppSelector((s) => s.ai);
  const [edited, setEdited] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      category: "",
      priority: "Medium",
      description: "",
      reporterName: "",
      reporterEmail: "",
    },
  });

  useEffect(() => {
    dispatch(fetchPublicAsset(assetCode));
    dispatch(clearTriage());
    dispatch(resetReportState());
  }, [dispatch, assetCode]);

  const handleRunTriage = async () => {
    const complaint = watch("description");
    if (!complaint || complaint.trim().length < 8) {
      toast.error("Describe the problem in a bit more detail first");
      return;
    }
    const result = await dispatch(
      runIssueTriage({
        assetName: asset?.name,
        category: asset?.category,
        location: asset?.location,
        condition: asset?.condition,
        complaint,
      })
    );
    if (runIssueTriage.fulfilled.match(result)) {
      const t = result.payload;
      setValue("title", t.title || "");
      setValue("category", t.category || "");
      setValue("priority", t.priority || "Medium");
      setEdited(false);
      toast.success("AI suggestions ready — review before submitting");
    }
    // On failure (e.g. unauthenticated visitor — triage requires staff login)
    // we simply fall back to manual entry; no toast needed to avoid alarming
    // a public visitor about something outside their control.
  };

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      reporterName: values.reporterName,
      reporterEmail: values.reporterEmail,
      aiSuggestions: triage
        ? {
            suggestedTitle: triage.title,
            suggestedCategory: triage.category,
            suggestedPriority: triage.priority,
            possibleCauses: triage.possibleCauses || [],
            initialChecks: triage.initialChecks || [],
            aiGenerated: true,
            userEdited: edited,
          }
        : { aiGenerated: false, userEdited: false },
    };

    const result = await dispatch(reportPublicIssue({ assetCode, payload, files: evidenceFiles }));
    if (reportPublicIssue.fulfilled.match(result)) {
      toast.success("Issue reported — thank you");
      reset();
      setEvidenceFiles([]);
      dispatch(clearTriage());
      dispatch(fetchPublicAsset(assetCode));
    } else {
      toast.error(result.payload || "Couldn't submit the report");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-[var(--color-graphite)] font-[var(--font-display)] text-xs font-bold text-[var(--color-amber)] dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)]">
            IQ
          </div>
          <span className="font-[var(--font-display)] font-bold text-[var(--color-ink)]">MaintainIQ</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        {status === "loading" ? (
          <Loader label="Looking up this asset…" />
        ) : status === "failed" ? (
          <ErrorState
            message={error || "We couldn't find an asset with that code."}
            onRetry={() => dispatch(fetchPublicAsset(assetCode))}
          />
        ) : asset ? (
          <div className="space-y-6">
            <Card tag className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 font-[var(--font-mono)] text-xs text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                    <QrCode className="size-3.5" /> {asset.assetCode}
                  </p>
                  <h1 className="mt-1 font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
                    {asset.name}
                  </h1>
                </div>
                <AssetStatusBadge status={asset.status} />
              </div>

              <div className="tag-perforation my-4" />

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <Tag className="size-4 shrink-0" /> {asset.category}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <MapPin className="size-4 shrink-0" /> {asset.location}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <Calendar className="size-4 shrink-0" /> Last service {formatDate(asset.lastServiceDate)}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <Calendar className="size-4 shrink-0" /> Next service {formatDate(asset.nextServiceDate)}
                </p>
              </div>

              {asset.status === "Retired" && (
                <div className="mt-4 flex items-center gap-2 rounded-md bg-[var(--color-critical)]/10 p-3 text-sm text-[var(--color-critical)]">
                  <AlertTriangle className="size-4 shrink-0" />
                  This asset has been retired and is no longer in active service.
                </div>
              )}
            </Card>

            {reportSuccess ? (
              <Card className="flex flex-col items-center gap-3 p-8 text-center">
                <CheckCircle2 className="size-10 text-[var(--color-good)]" />
                <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
                  Report submitted
                </h2>
                <p className="max-w-sm text-sm text-[var(--color-ink-soft)]">
                  Thanks — your report has been logged against this asset and a technician will be
                  assigned shortly.
                </p>
                {lastIssueNumber && (
                  <p className="font-[var(--font-mono)] text-xs text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                    Reference: {lastIssueNumber}
                  </p>
                )}
                <Button variant="outline" size="sm" onClick={() => dispatch(resetReportState())}>
                  Report another issue
                </Button>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <h2 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                    Report an issue
                  </h2>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      label="What's the problem?"
                      htmlFor="description"
                      required
                      error={errors.description?.message}
                      hint="Describe it in plain language — AI can help fill in the rest below."
                    >
                      <Textarea
                        id="description"
                        rows={3}
                        placeholder="The projector display is flickering and sometimes doesn't detect HDMI."
                        error={!!errors.description}
                        {...register("description", { required: "Please describe the issue" })}
                      />
                    </FormField>

                    <Button
                      type="button"
                      variant="amber"
                      size="sm"
                      icon={Sparkles}
                      loading={triageStatus === "loading"}
                      onClick={handleRunTriage}
                    >
                      Suggest details with AI
                    </Button>

                    {triageStatus === "failed" && (
                      <p className="text-xs text-[var(--color-ink-soft)]">
                        AI suggestions aren't available right now — no problem, just fill in the
                        fields below.
                      </p>
                    )}

                    {triage && (
                      <div className="space-y-2 rounded-md border border-dashed border-[var(--color-amber)]/40 bg-[var(--color-amber)]/5 p-3 text-sm">
                        {triage.possibleCauses?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                              Possible causes
                            </p>
                            <ul className="list-disc space-y-0.5 pl-5 text-[var(--color-ink)]">
                              {triage.possibleCauses.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {triage.initialChecks?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                              Safe initial checks
                            </p>
                            <ul className="list-disc space-y-0.5 pl-5 text-[var(--color-ink)]">
                              {triage.initialChecks.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                              For electrical, fire, or safety hazards, stop use and contact a
                              qualified technician immediately.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
                        <Input
                          id="title"
                          placeholder="Short summary"
                          error={!!errors.title}
                          {...register("title", { required: "Title is required" })}
                          onChange={(e) => {
                            setEdited(true);
                            register("title").onChange(e);
                          }}
                        />
                      </FormField>
                      <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
                        <Select
                          id="category"
                          error={!!errors.category}
                          {...register("category", { required: "Category is required" })}
                        >
                          <option value="">Select category</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>

                    <FormField label="Priority" htmlFor="priority">
                      <Select id="priority" {...register("priority")}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </Select>
                    </FormField>

                    <EvidencePicker files={evidenceFiles} onChange={setEvidenceFiles} />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Your name" htmlFor="reporterName" required error={errors.reporterName?.message}>
                        <Input
                          id="reporterName"
                          error={!!errors.reporterName}
                          {...register("reporterName", { required: "Name is required" })}
                        />
                      </FormField>
                      <FormField label="Email" htmlFor="reporterEmail" hint="Optional — for status updates">
                        <Input id="reporterEmail" type="email" {...register("reporterEmail")} />
                      </FormField>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      icon={Send}
                      loading={reportStatus === "loading"}
                    >
                      Submit report
                    </Button>
                  </form>
                </CardBody>
              </Card>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
