import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/features/ui/uiSlice";

export default function ThemeToggle({ className = "" }) {
  const theme = useSelector((s) => s.ui.theme);
  const dispatch = useDispatch();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
      className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-2)] transition-colors ${className}`}
    >
      <span
        className={`absolute left-1 flex size-7 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm border border-[var(--color-line)] transition-transform duration-200 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="size-3.5 text-[var(--color-amber)]" />
        ) : (
          <Sun className="size-3.5 text-[var(--color-warn)]" />
        )}
      </span>
    </button>
  );
}
