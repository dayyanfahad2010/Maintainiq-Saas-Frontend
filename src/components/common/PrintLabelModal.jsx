import { QRCodeCanvas } from "qrcode.react";
import { Printer } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";

const STATUS_DOT = {
  Operational: "var(--color-good)",
  "Issue Reported": "var(--color-warn)",
  "Under Inspection": "var(--color-info)",
  "Under Maintenance": "var(--color-warn)",
  "Out of Service": "var(--color-critical)",
  Retired: "var(--color-ink-soft)",
};

export default function PrintLabelModal({ open, onClose, asset, publicUrl }) {
  if (!asset) return null;

  return (
    <Modal open={open} onClose={onClose} title="Printable asset label" size="sm">
      <div className="space-y-4">
        <div
          id="printable-asset-label"
          className="mx-auto w-full max-w-[280px] rounded-lg border-2 border-[var(--color-graphite)] bg-white p-4 text-[var(--color-graphite)]"
        >
          <div className="flex items-center justify-between border-b border-dashed border-black/20 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="flex size-6 items-center justify-center rounded bg-[var(--color-graphite)] font-[var(--font-display)] text-[10px] font-bold text-[var(--color-amber)]">
                IQ
              </div>
              <span className="font-[var(--font-display)] text-xs font-bold">MaintainIQ</span>
            </div>
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: STATUS_DOT[asset.status] || "var(--color-ink-soft)" }}
            >
              {asset.status}
            </span>
          </div>

          <div className="mt-3 flex flex-col items-center gap-2 text-center">
            <div className="rounded-md border border-black/10 p-2">
              <QRCodeCanvas value={publicUrl} size={128} level="M" />
            </div>
            <p className="font-[var(--font-display)] text-sm font-bold leading-tight">{asset.name}</p>
            <p className="font-[var(--font-mono)] text-xs tracking-wide text-black/60">
              {asset.assetCode}
            </p>
            <p className="text-[10px] text-black/50">{asset.location}</p>
          </div>

          <div className="tag-perforation my-2 !bg-black/15" />

          <p className="text-center text-[9px] leading-snug text-black/50">
            Scan this code to view service history and report an issue.
          </p>
        </div>

        <div className="no-print flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" icon={Printer} onClick={() => window.print()}>
            Print label
          </Button>
        </div>
      </div>
    </Modal>
  );
}
