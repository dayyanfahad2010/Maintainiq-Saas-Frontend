import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { login, clearAuthError } from "@/features/auth/authSlice";
import Button from "@/components/common/Button";
import { FormField, Input } from "@/components/common/Field";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((s) => s.auth.status);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back");
      const dest =
        result.payload?.role === "super_admin" ? "/super-admin" : "/app/dashboard";
      navigate(location.state?.from?.pathname || dest, { replace: true });
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div>
      <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
        Welcome back
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
        Log in to your workspace
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
        Access your assigned assets, issues, and maintenance records.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@organization.com"
            autoComplete="email"
            error={!!errors.email}
            {...register("email", { required: "Email is required" })}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            {...register("password", { required: "Password is required" })}
          />
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[var(--color-amber-ink)] dark:text-[var(--color-amber)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" icon={LogIn} loading={status === "loading"}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
        New to MaintainIQ?{" "}
        <Link to="/signup" className="font-medium text-[var(--color-ink)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
