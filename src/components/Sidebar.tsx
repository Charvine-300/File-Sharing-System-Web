import { NavLink } from "react-router-dom";
import { useCan } from "../hooks/usePermission";

function FilesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AttributesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3 3v6.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PoliciesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 3 4 6.5v5c0 4.6 3.2 8.6 8 10 4.8-1.4 8-5.4 8-10v-5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function navItemClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 rounded-md px-3 py-2 text-md ${
    isActive
      ? "bg-accent font-medium text-accent-foreground"
      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;
}

interface SidebarNavProps {
  onNavigate?: () => void;
}

// Nav item list, factored out of the desktop <aside> shell so the mobile
// drawer (MobileNav) can render the exact same links.
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const canViewFiles = useCan("files.view");
  const canViewUsers = useCan("users.view");
  const canViewAttributes = useCan("attributes.view");
  const canViewPolicies = useCan("policies.view");

  return (
    <nav className="flex flex-col gap-1">
      {canViewFiles && (
        <NavLink to="/files" className={navItemClass} onClick={onNavigate}>
          <FilesIcon />
          Files
        </NavLink>
      )}
      {canViewPolicies && (
        <NavLink to="/policies" className={navItemClass} onClick={onNavigate}>
          <PoliciesIcon />
          Policies
        </NavLink>
      )}
      {canViewUsers && (
        <NavLink to="/users" className={navItemClass} onClick={onNavigate}>
          <UsersIcon />
          Users
        </NavLink>
      )}
      {canViewAttributes && (
        <NavLink to="/attributes" className={navItemClass} onClick={onNavigate}>
          <AttributesIcon />
          Attributes
        </NavLink>
      )}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
      <SidebarNav />
    </aside>
  );
}
