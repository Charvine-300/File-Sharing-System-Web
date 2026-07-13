import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login } from "../../app/features/authSlice";
import Spinner from "../../components/Spinner";
import type { LoginRequest } from "../../types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAppSelector((state) => state.auth.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({ defaultValues: { email: "", password: "" } });

  async function onSubmit(data: LoginRequest) {
    const result = await dispatch(login(data));

    if (login.fulfilled.match(result)) {
      toast.success("Welcome back");
      const redirectTo =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-8">
      <h1>Sign in</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Access your secure workspace
      </p>

      <div className="input-field-group">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          {...register("email", {
            required: "Email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
          })}
        />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>

      <div className="input-field-group">
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="input"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className="text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="btn primary-btn normal-btn inline-flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && <Spinner size="sm" variant="on-primary" />}
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
