import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { signUp, clearAuthError } from "@/features/auth/authSlice";
import Button from "@/components/common/Button";
import { FormField, Input, Select } from "@/components/common/Field";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((s) => s.auth.status);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "technician" } });

  const role = watch("role");

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const result = await dispatch(signUp(values));
    if (signUp.fulfilled.match(result)) {
      toast.success(
        values.role === "admin"
          ? "Workspace created — log in to continue"
          : "Account created — log in to continue"
      );
      navigate("/login");
    } else {
      toast.error(result.payload || "Sign up failed");
    }
  };

  return (
    <div>
      <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
        Get started
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
        Create your account
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
        Set up a new organization workspace, or join one as a technician.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Full name" htmlFor="userName" required error={errors.userName?.message}>
          <Input
            id="userName"
            placeholder="Ayesha Khan"
            autoComplete="name"
            error={!!errors.userName}
            {...register("userName", { required: "Name is required" })}
          />
        </FormField>

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

        <FormField label="Role" htmlFor="role" hint="Determines what you can see and manage.">
          <Select id="role" {...register("role")}>
            <option value="technician">Technician — join an existing workspace</option>
            <option value="admin">Administrator — create a new workspace</option>
          </Select>
        </FormField>

        {role === "admin" ? (
          <FormField
            label="Organization name"
            htmlFor="organizationName"
            required
            error={errors.organizationName?.message}
            hint="This creates a brand-new workspace — assets, users, and reports below it are all separate from every other organization."
          >
            <Input
              id="organizationName"
              placeholder="Dow University"
              error={!!errors.organizationName}
              {...register("organizationName", {
                required: "Organization name is required",
              })}
            />
          </FormField>
        ) : (
          <FormField
            label="Organization code"
            htmlFor="organizationCode"
            required
            error={errors.organizationCode?.message}
            hint="Ask your organization's administrator for this code."
          >
            <Input
              id="organizationCode"
              placeholder="dow-university"
              error={!!errors.organizationCode}
              {...register("organizationCode", {
                required: "Organization code is required",
              })}
            />
          </FormField>
        )}

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
          hint="At least 8 characters."
        >
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={!!errors.password}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })}
          />
        </FormField>

        <Button type="submit" className="w-full" icon={UserPlus} loading={status === "loading"}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[var(--color-ink)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
