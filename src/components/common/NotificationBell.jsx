import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notificationSlice";
import { timeAgo } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount, status } = useSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const hasFetched = useRef(false);

  // Fetch once when the bell is first opened (or on mount if already
  // opened before) rather than polling — live updates arrive over the
  // socket via RealtimeSync, this is just the initial page-load snapshot.
  useEffect(() => {
    if (open && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchNotifications());
    }
  }, [open, dispatch]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-10 items-center justify-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)]"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[var(--color-critical)] font-[var(--font-mono)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 max-h-[28rem] w-80 overflow-y-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg sm:w-96">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-3.5 py-2.5">
              <p className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                Notifications
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="text-xs font-medium text-[var(--color-info)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {status === "loading" && list.length === 0 && (
              <p className="px-3.5 py-6 text-center text-sm text-[var(--color-ink-soft)]">
                Loading…
              </p>
            )}

            {status !== "loading" && list.length === 0 && (
              <p className="px-3.5 py-6 text-center text-sm text-[var(--color-ink-soft)]">
                You're all caught up.
              </p>
            )}

            {list.map((n) => (
              <button
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b border-[var(--color-line)] px-3.5 py-3 text-left last:border-b-0 hover:bg-[var(--color-surface-2)]",
                  !n.isRead && "bg-[var(--color-amber)]/5"
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--color-amber)]" />
                  )}
                  <p className="text-sm font-medium text-[var(--color-ink)]">{n.title}</p>
                </div>
                <p className="pl-3.5 text-xs text-[var(--color-ink-soft)]">{n.message}</p>
                <p className="pl-3.5 text-[11px] text-[var(--color-ink-soft)]">
                  {timeAgo(n.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
