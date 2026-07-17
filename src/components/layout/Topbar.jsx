import { Menu, LogOut, ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleSidebar } from "@/features/ui/uiSlice";
import { logout } from "@/features/auth/authSlice";
import { resetNotifications } from "@/features/notifications/notificationSlice";
import ThemeToggle from "@/components/common/ThemeToggle";
import NotificationBell from "@/components/common/NotificationBell";
import { initials } from "@/utils/format";
import toast from "react-hot-toast";

export default function Topbar({ title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyOrgCode = async (e) => {
    e.stopPropagation();
    const code = user?.organization?.slug;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Organization code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Please copy it manually.");
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetNotifications());
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-md p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-[var(--color-line)] py-1 pl-1 pr-2.5 hover:bg-[var(--color-surface-2)]"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-amber)] font-[var(--font-mono)] text-xs font-bold text-[var(--color-graphite)]">
              {initials(user?.userName || user?.email || "U")}
            </span>
            <span className="hidden text-sm font-medium text-[var(--color-ink)] sm:inline">
              {user?.userName || user?.email}
            </span>
            <ChevronDown className="size-3.5 text-[var(--color-ink-soft)]" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-lg">
                <div className="px-2.5 py-2 text-xs text-[var(--color-ink-soft)]">
                  Signed in as
                  <p className="truncate font-medium text-[var(--color-ink)]">{user?.email}</p>
                  {user?.organization?.name && (
                    <p className="truncate text-[var(--color-ink-soft)]">{user.organization.name}</p>
                  )}
                </div>

                {user?.role === "admin" && user?.organization?.slug && (
                  <div className="mx-1.5 mb-1.5 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                      Organization Code
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <code className="truncate font-[var(--font-mono)] text-sm text-[var(--color-ink)]">
                        {user.organization.slug}
                      </code>
                      <button
                        onClick={handleCopyOrgCode}
                        className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--color-line)] px-1.5 py-1 text-[var(--color-ink-soft)] hover:bg-[var(--color-surface)]"
                        aria-label="Copy organization code"
                        title="Copy organization code"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--color-ink-soft)]">
                      Share this with technicians so they can join your workspace.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--color-critical)] hover:bg-[var(--color-critical)]/10"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
