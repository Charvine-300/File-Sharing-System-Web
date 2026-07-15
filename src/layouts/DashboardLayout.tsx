import { useState } from "react";
import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import ProfileMenu from "../components/ProfileMenu";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import BrandLogo from "../components/BrandLogo";

export default function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="cursor-pointer rounded-md p-1.5 hover:bg-secondary lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <BrandLogo />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[1440px] p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
