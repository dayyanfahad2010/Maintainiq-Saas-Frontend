import { Outlet } from "react-router-dom";
import { QrCode, ScanLine, ClipboardCheck, History } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

const STEPS = [
  { icon: ScanLine, label: "Scan the asset tag" },
  { icon: ClipboardCheck, label: "AI triages the report" },
  { icon: QrCode, label: "Technician resolves it" },
  { icon: History, label: "History stays permanent" },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-graphite)] p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #F2A93B 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-[var(--color-amber)] font-[var(--font-display)] text-sm font-bold text-[var(--color-graphite)]">
            IQ
          </div>
          <span className="font-[var(--font-display)] text-lg font-bold">MaintainIQ</span>
        </div>

        <div className="relative">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--color-amber)]">
            Asset Lifecycle Manifest
          </p>
          <h2 className="mt-3 max-w-md font-[var(--font-display)] text-4xl font-bold leading-tight">
            Scan. Report. Diagnose. Maintain.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Every asset gets a digital identity, a QR-accessible page, and a
            permanent service history — from first report to final repair.
          </p>

          <ul className="mt-8 space-y-3">
            {STEPS.map(({ icon: Icon, label }, i) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-7 shrink-0 items-center justify-center rounded border border-white/15 bg-white/5 font-[var(--font-mono)] text-[11px] text-[var(--color-amber)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="size-4 text-[var(--color-amber)]" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-[var(--font-mono)] text-[11px] text-white/40">
          MaintainIQ · SMIT Final Hackathon Build
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-center px-6 py-5 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-md bg-[var(--color-graphite)] font-[var(--font-display)] text-xs font-bold text-[var(--color-amber)] dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)]">
              IQ
            </div>
            <span className="font-[var(--font-display)] font-bold text-[var(--color-ink)]">
              MaintainIQ
            </span>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
