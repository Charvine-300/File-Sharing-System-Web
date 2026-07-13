import { Link, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/features/authSlice";

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const firstName = useAppSelector((state) => state.auth.firstName);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-lg font-semibold text-foreground">
          Vault
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Hi, {firstName}</span>
          <Link to="/change-password" className="text-primary">
            Change password
          </Link>
          <button
            type="button"
            className="text-danger cursor-pointer"
            onClick={() => dispatch(logout())}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
