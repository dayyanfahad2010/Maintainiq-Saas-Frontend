import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Pencil,
  Archive,
  MapPin,
  Calendar,
  User2,
  Tag,
  FlaskConical,
  History as HistoryIcon,
  Printer,
  FileText,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAssetById,
  deleteAsset,
  clearCurrentAsset,
} from "@/features/assets/assetSlice";
import { fetchAssetHistory, clearHistory } from "@/features/history/historySlice";
import { clearHealth } from "@/features/ai/aiSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { AssetStatusBadge } from "@/components/common/Badge";
import { Loader, ErrorState, EmptyState, ConfirmDialog } from "@/components/common/Feedback";
import QRBlock from "@/components/common/QRBlock";
import PrintLabelModal from "@/components/common/PrintLabelModal";
import Timeline from "@/components/common/Timeline";
import { generateAssetReportPDF } from "@/utils/assetReportPdf";
import { formatDate } from "@/utils/format";
import AssetFormModal from "./AssetFormModal";
import AssetHealthCard from "./AssetHealthCard";
import AssetChatWidget from "./AssetChatWidget";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-soft)]" />
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-ink)]">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function AssetDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { current: asset, status, error } = useAppSelector((s) => s.assets);
  const { list: history, status: historyStatus } = useAppSelector((s) => s.history);
  const { health } = useAppSelector((s) => s.ai);

  const [editOpen, setEditOpen] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [retiring, setRetiring] = useState(false);

  useEffect(() => {
    dispatch(fetchAssetById(id));
    dispatch(fetchAssetHistory(id));
    return () => {
      dispatch(clearCurrentAsset());
      dispatch(clearHistory());
      dispatch(clearHealth());
    };
  }, [dispatch, id]);

  const handleRetire = async () => {
    setRetiring(true);
    const result = await dispatch(deleteAsset(id));
    setRetiring(false);
    setRetireOpen(false);
    if (deleteAsset.fulfilled.match(result)) {
      toast.success("Asset retired");
      dispatch(fetchAssetById(id));
    } else {
      toast.error(result.payload || "Couldn't retire asset");
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await generateAssetReportPDF({ asset, health, history });
    } catch {
      toast.error("Couldn't generate the PDF report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (status === "loading" && !asset) return <Loader label="Loading asset…" />;
  if (status === "failed" && !asset)
    return <ErrorState message={error} onRetry={() => dispatch(fetchAssetById(id))} />;
  if (!asset) return null;

  const publicUrl = asset.publicUrl || `${window.location.origin}/scan/${asset.assetCode}`;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/app/assets")}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="size-4" /> Back to assets
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
              {asset.name}
            </h2>
            <AssetStatusBadge status={asset.status} />
          </div>
          <p className="mt-1 font-[var(--font-mono)] text-sm text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
            {asset.assetCode}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={FileText}
            loading={generatingReport}
            onClick={handleGenerateReport}
          >
            PDF report
          </Button>
          {role === "admin" && (
            <>
              <Button variant="outline" icon={Pencil} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              {asset.status !== "Retired" && (
                <Button variant="danger" icon={Archive} onClick={() => setRetireOpen(true)}>
                  Retire
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                Asset details
              </h3>
            </CardHeader>
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Tag} label="Category" value={asset.category} />
              <InfoRow icon={MapPin} label="Location" value={asset.location} />
              <InfoRow icon={FlaskConical} label="Condition" value={asset.condition} />
              <InfoRow
                icon={User2}
                label="Assigned technician"
                value={
                  asset.assignedTechnician?.userName ||
                  asset.assignedTechnician?.name ||
                  asset.assignedTechnician?.email
                }
              />
              <InfoRow icon={Calendar} label="Last service" value={formatDate(asset.lastServiceDate)} />
              <InfoRow icon={Calendar} label="Next service" value={formatDate(asset.nextServiceDate)} />
            </CardBody>
          </Card>

          <AssetHealthCard assetId={asset._id} />

          <Card>
            <CardHeader className="flex items-center gap-2">
              <HistoryIcon className="size-4 text-[var(--color-ink-soft)]" />
              <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                Asset history
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {historyStatus === "loading" ? (
                <Loader />
              ) : history.length === 0 ? (
                <EmptyState
                  icon={HistoryIcon}
                  title="No activity yet"
                  description="Meaningful events for this asset will be logged here permanently."
                />
              ) : (
                <Timeline items={history} />
              )}
            </CardBody>
          </Card>

          <AssetChatWidget assetId={asset._id} assetName={asset.name} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                QR asset tag
              </h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <QRBlock value={publicUrl} label={publicUrl} fileName={asset.assetCode} />
              <Button variant="outline" size="sm" icon={Printer} className="w-full" onClick={() => setPrintOpen(true)}>
                Print asset label
              </Button>
            </CardBody>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Report a problem on behalf of someone who found this asset in person.
            </p>
            <Button
              variant="amber"
              className="mt-3 w-full"
              onClick={() => navigate(`/scan/${asset.assetCode}`)}
            >
              Open public report form
            </Button>
          </Card>
        </div>
      </div>

      <PrintLabelModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        asset={asset}
        publicUrl={publicUrl}
      />

      {role === "admin" && (
        <>
          <AssetFormModal open={editOpen} onClose={() => setEditOpen(false)} asset={asset} />
          <ConfirmDialog
            open={retireOpen}
            onClose={() => setRetireOpen(false)}
            onConfirm={handleRetire}
            loading={retiring}
            title="Retire this asset?"
            description={`${asset.name} will be marked as Retired. Its QR code and history remain viewable, but it will stop appearing as an active asset.`}
            confirmLabel="Retire asset"
          />
        </>
      )}
    </div>
  );
}
