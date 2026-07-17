import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Button from "./Button";

export default function QRBlock({ value, label, fileName = "asset-qr", size = 176 }) {
  const canvasWrapRef = useRef(null);

  const handleDownload = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.png`;
    a.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[var(--color-line)] p-5 text-center">
      <div ref={canvasWrapRef} className="rounded-md bg-white p-3 corner-bracket">
        <QRCodeCanvas value={value} size={size} level="M" includeMargin={false} />
      </div>
      {label && <p className="font-[var(--font-mono)] text-xs text-[var(--color-ink-soft)] break-all">{label}</p>}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant="outline" icon={Download} onClick={handleDownload}>
          Download
        </Button>
        <Button size="sm" variant="outline" icon={Copy} onClick={handleCopy}>
          Copy link
        </Button>
        <Button
          as="a"
          href={value}
          target="_blank"
          rel="noreferrer"
          size="sm"
          variant="ghost"
          icon={ExternalLink}
        >
          Open
        </Button>
      </div>
    </div>
  );
}
