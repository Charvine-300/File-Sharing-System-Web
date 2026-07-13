import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { changePassword } from "../../app/features/authSlice";

export default function ChangePassword() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const result = await dispatch(
      changePassword({ currentPassword, newPassword, confirmNewPassword })
    );

    if (changePassword.fulfilled.match(result)) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 max-w-md">
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
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
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
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
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
          value={confirmNewPassword}
          onChange={(event) => setConfirmNewPassword(event.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn primary-btn normal-btn"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
