import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { changePassword } from "../../app/features/authSlice";
import Spinner from "../../components/Spinner";
import type { ChangePasswordRequest } from "../../types/auth";

export default function ChangePassword() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordRequest>({
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  async function onSubmit(data: ChangePasswordRequest) {
    const result = await dispatch(changePassword(data));
    if (changePassword.fulfilled.match(result)) {
      reset();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-8 max-w-md">
      <h1>Change password</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Update the password on your account
      </p>

      <div className="input-field-group">
        <label className="label" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className="input"
          {...register("currentPassword", { required: "Current password is required" })}
        />
        {errors.currentPassword && (
          <p className="text-xs text-danger">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="input-field-group">
        <label className="label" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className="input"
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 8, message: "Must be at least 8 characters" },
          })}
        />
        {errors.newPassword && (
          <p className="text-xs text-danger">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="input-field-group">
        <label className="label" htmlFor="confirmNewPassword">
          Confirm new password
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          className="input"
          {...register("confirmNewPassword", {
            required: "Please confirm your new password",
            validate: (value) =>
              value === watch("newPassword") || "New passwords do not match",
          })}
        />
        {errors.confirmNewPassword && (
          <p className="text-xs text-danger">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="btn primary-btn normal-btn inline-flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && <Spinner size="sm" variant="on-primary" />}
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
