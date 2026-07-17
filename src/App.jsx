import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchProfile } from "@/features/auth/authSlice";
import { Loader } from "@/components/common/Feedback";

import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute, RoleRoute, PublicOnlyRoute, OrgStaffRoute, SuperAdminRoute } from "@/components/layout/RouteGuards";

import Landing from "@/pages/misc/Landing";
import NotFound from "@/pages/misc/NotFound";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import AssetList from "@/pages/assets/AssetList";
import AssetDetail from "@/pages/assets/AssetDetail";
import IssueList from "@/pages/issues/IssueList";
import IssueDetail from "@/pages/issues/IssueDetail";
import PublicAsset from "@/pages/public/PublicAsset";
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";

// Pulls in recharts — only load it when an admin actually visits Analytics.
const Analytics = lazy(() => import("@/pages/dashboard/Analytics"));

function ThemeEffect() {
  const theme = useAppSelector((s) => s.ui.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeEffect />
      <AuthBootstrap />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan/:assetCode" element={<PublicAsset />} />

        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<SuperAdminRoute />}>
            <Route path="/super-admin" element={<DashboardLayout />}>
              <Route
                index
                element={<SuperAdminDashboard />}
                handle={{ title: "Organizations" }}
              />
            </Route>
          </Route>

          <Route element={<OrgStaffRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={<Dashboard />}
              handle={{ title: "Dashboard" }}
            />
            <Route
              path="assets"
              element={<AssetList />}
              handle={{ title: "Assets" }}
            />
            <Route
              path="assets/:id"
              element={<AssetDetail />}
              handle={{ title: "Asset details" }}
            />

            <Route element={<RoleRoute roles={["admin"]} />}>
              <Route
                path="issues"
                element={<IssueList />}
                handle={{ title: "Issues" }}
              />
              <Route
                path="analytics"
                element={
                  <Suspense fallback={<Loader label="Loading analytics…" />}>
                    <Analytics />
                  </Suspense>
                }
                handle={{ title: "Analytics" }}
              />
            </Route>

            <Route element={<RoleRoute roles={["technician"]} />}>
              <Route
                path="my-issues"
                element={<IssueList mine />}
                handle={{ title: "My issues" }}
              />
            </Route>

            <Route
              path="issues/:id"
              element={<IssueDetail />}
              handle={{ title: "Issue details" }}
            />
          </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
