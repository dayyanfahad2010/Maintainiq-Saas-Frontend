import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  ClipboardList,
  BarChart3,
  Building2,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { closeSidebar } from "@/features/ui/uiSlice";
import { cn } from "@/utils/cn";

const NAV = {
  super_admin: [
    { to: "/super-admin", label: "Organizations", icon: Building2 },
  ],
  admin: [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/assets", label: "Assets", icon: Boxes },
    { to: "/app/issues", label: "Issues", icon: Wrench },
    { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  ],
  technician: [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/assets", label: "Assets", icon: Boxes },
    { to: "/app/my-issues", label: "My Issues", icon: ClipboardList },
  ],
};

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-[var(--radius-tag)] px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-[var(--color-amber)] text-[var(--color-graphite)]"
            : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
        )
      }
    >
      <Icon className="size-4.5 shrink-0" />
      {label}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const role = useSelector((s) => s.auth.user?.role) || "technician";
  const orgName = useSelector((s) => s.auth.user?.organization?.name);
  const items = NAV[role] || NAV.technician;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-[var(--color-graphite)] font-[var(--font-display)] text-sm font-bold text-[var(--color-amber)] dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)]">
          IQ
        </div>
        <div>
          <p className="font-[var(--font-display)] text-base font-bold leading-tight text-[var(--color-ink)]">
            MaintainIQ
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-ink-soft)]">
            Asset Manifest
          </p>
        </div>
      </div>

      <div className="tag-perforation mx-4" />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavigate} />
        ))}
      </nav>

      <div className="mx-4 mb-4 rounded-md border border-dashed border-[var(--color-line)] p-3 font-[var(--font-mono)] text-[10px] text-[var(--color-ink-soft)]">
        {orgName && (
          <p className="mb-1 truncate text-[var(--color-ink)]" title={orgName}>
            {orgName}
          </p>
        )}
        Role: <span className="text-[var(--color-amber-ink)] dark:text-[var(--color-amber)] font-semibold uppercase">{role}</span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);
  const dispatch = useDispatch();

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-[var(--color-line)] lg:bg-[var(--color-surface)]">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => dispatch(closeSidebar())}
          />
          <div className="relative flex h-full w-72 flex-col bg-[var(--color-surface)] shadow-xl">
            <button
              onClick={() => dispatch(closeSidebar())}
              className="absolute right-3 top-4 rounded-full p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)]"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => dispatch(closeSidebar())} />
          </div>
        </div>
      )}
    </>
  );
}
