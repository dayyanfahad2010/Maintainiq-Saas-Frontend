import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getSocket, disconnectSocket } from "@/api/socketClient";
import { notificationReceived } from "@/features/notifications/notificationSlice";
import { fetchIssues, fetchMyIssues } from "@/features/issues/issueSlice";
import { organizationUpserted, organizationRemoved } from "@/features/organizations/organizationSlice";

// Mounted once inside DashboardLayout so every staff page (admin or
// technician) gets live updates without each page having to know about
// sockets individually. It doesn't render anything — it just keeps Redux
// (and the notification bell) in sync with what's happening elsewhere.
export default function RealtimeSync() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const role = useSelector((s) => s.auth.user?.role);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    socket.connect();

    const refetchIssues = () => {
      dispatch(fetchIssues());
      if (role === "technician") dispatch(fetchMyIssues());
    };

    const onNotification = (notification) => {
      dispatch(notificationReceived(notification));
      toast(notification.title, { icon: "🔔" });
    };

    const onNewIssue = ({ issue }) => {
      toast(`New issue reported: "${issue.title}"`, { icon: "🆕" });
      refetchIssues();
    };

    const onStatusUpdated = ({ issue }) => {
      toast(`Issue "${issue.title}" is now ${issue.status}`, { icon: "🔄" });
      refetchIssues();
    };

    const onAssigned = () => {
      refetchIssues();
    };

    const onMaintenanceCompleted = ({ issue }) => {
      toast(`Maintenance logged for "${issue?.title ?? "an issue"}"`, { icon: "✅" });
      refetchIssues();
    };

    const onOrgChange = (org) => dispatch(organizationUpserted(org));
    const onOrgDeleted = ({ _id }) => dispatch(organizationRemoved(_id));

    socket.on("notification:new", onNotification);
    socket.on("issue:new", onNewIssue);
    socket.on("issue:statusUpdated", onStatusUpdated);
    socket.on("issue:assigned", onAssigned);
    socket.on("maintenance:completed", onMaintenanceCompleted);
    socket.on("organization:created", onOrgChange);
    socket.on("organization:updated", onOrgChange);
    socket.on("organization:deleted", onOrgDeleted);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("issue:new", onNewIssue);
      socket.off("issue:statusUpdated", onStatusUpdated);
      socket.off("issue:assigned", onAssigned);
      socket.off("maintenance:completed", onMaintenanceCompleted);
      socket.off("organization:created", onOrgChange);
      socket.off("organization:updated", onOrgChange);
      socket.off("organization:deleted", onOrgDeleted);
    };
  }, [isAuthenticated, role, dispatch]);

  return null;
}
