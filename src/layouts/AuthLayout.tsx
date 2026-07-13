import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <BrandLogo />
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
