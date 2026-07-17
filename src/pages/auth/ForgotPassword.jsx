import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword, clearAuthError } from "@/features/auth/authSlice";
import Button from "@/components/common/Button";
import { FormField, Input } from "@/components/common/Field";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((s) => s.auth.status);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const result = await dispatch(forgotPassword(values));
    if (forgotPassword.fulfilled.match(result)) {
      toast.success("OTP sent to your email");
      navigate("/reset-password", { state: { email: values.email } });
    } else {
      toast.error(result.payload || "Couldn't send OTP");
    }
  };

  return (
    <div>
      <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
        Reset access
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
        Forgot your password?
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
        We'll email you a one-time code to reset it.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            defaultValue={getValues("email")}
            placeholder="you@organization.com"
            autoComplete="email"
            error={!!errors.email}
            {...register("email", { required: "Email is required" })}
          />
        </FormField>

        <Button type="submit" className="w-full" icon={Send} loading={status === "loading"}>
          Send OTP
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
        Already have a code?{" "}
        <Link to="/reset-password" className="font-medium text-[var(--color-ink)] hover:underline">
          Reset password
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-[var(--color-ink-soft)]">
        <Link to="/login" className="font-medium text-[var(--color-ink)] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
