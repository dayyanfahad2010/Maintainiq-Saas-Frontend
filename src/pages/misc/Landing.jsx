import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, ClipboardCheck, History, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAppSelector } from "@/app/hooks";

const FEATURES = [
  {
    icon: ScanLine,
    title: "Scan to report",
    body: "Every asset gets a QR-accessible page — no login needed to report a problem.",
  },
  {
    icon: ClipboardCheck,
    title: "AI issue triage",
    body: "Complaints turn into structured, reviewable reports with causes and safe checks.",
  },
  {
    icon: History,
    title: "Permanent history",
    body: "Every inspection, repair, and part replacement stays on the record — forever.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-[var(--color-graphite)] font-[var(--font-display)] text-xs font-bold text-[var(--color-amber)] dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)]">
            IQ
          </div>
          <span className="font-[var(--font-display)] font-bold text-[var(--color-ink)]">MaintainIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button as={Link} to={isAuthenticated ? "/app/dashboard" : "/login"} size="sm">
            {isAuthenticated ? "Go to dashboard" : "Log in"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]"
        >
          AI-powered QR maintenance
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="mt-4 font-[var(--font-display)] text-4xl font-bold leading-tight text-[var(--color-ink)] sm:text-5xl"
        >
          Scan. Report. Diagnose. Maintain.
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mt-4 max-w-xl text-[var(--color-ink-soft)]"
        >
          MaintainIQ gives every physical asset a digital identity, an issue-reporting
          workflow, and a permanent service history.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button as={Link} to={isAuthenticated ? "/app/dashboard" : "/signup"} icon={ArrowRight}>
            {isAuthenticated ? "Open dashboard" : "Create an account"}
          </Button>
          <Button as={Link} to="/login" variant="outline">
            Log in
          </Button>
        </motion.div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              className="corner-bracket rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <Icon className="size-5 text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]" />
              <h3 className="mt-3 font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{body}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
