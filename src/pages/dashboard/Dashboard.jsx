import { useSelector } from "react-redux";
import AdminDashboard from "./AdminDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

export default function Dashboard() {
  const role = useSelector((s) => s.auth.user?.role);
  return role === "admin" ? <AdminDashboard /> : <TechnicianDashboard />;
}
