import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword, clearAuthError } from "@/features/auth/authSlice";
import Button from "@/components/common/Button";
import { FormField, Input } from "@/components/common/Field";

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((s) => s.auth.status);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { email: location.state?.email || "" },
  });

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const { confirmPassword, ...payload } = values;
    const result = await dispatch(resetPassword(payload));
    if (resetPassword.fulfilled.match(result)) {
      toast.success("Password reset — log in with your new password");
      navigate("/login");
    } else {
      toast.error(result.payload || "Reset failed");
    }
  };

  return (
    <div>
      <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
        Reset access
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
        Enter your OTP
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
        Check your inbox for the 6-digit code we just sent.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            {...register("email", { required: "Email is required" })}
          />
        </FormField>

        <FormField label="OTP code" htmlFor="otp" required error={errors.otp?.message}>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            error={!!errors.otp}
            {...register("otp", { required: "OTP is required" })}
          />
        </FormField>

        <FormField
          label="New password"
          htmlFor="password"
          required
          error={errors.password?.message}
          hint="At least 8 characters."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            error={!!errors.password}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
          />
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })}
          />
        </FormField>

        <Button type="submit" className="w-full" icon={KeyRound} loading={status === "loading"}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
        <Link to="/login" className="font-medium text-[var(--color-ink)] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
