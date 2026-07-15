import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getDashboardSummary, getRecentFiles } from "../app/features/dashboardSlice";
import { useCan } from "../hooks/usePermission";
import { formatRelativeDate } from "../utils/date";
import Spinner from "../components/Spinner";

function FilesStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 3 4 6.5v5c0 4.6 3.2 8.6 8 10 4.8-1.4 8-5.4 8-10v-5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3 3v6.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const firstName = useAppSelector((state) => state.auth.firstName);
  const { summary, summaryLoading, recentFiles, recentFilesLoading } = useAppSelector(
    (state) => state.dashboard
  );
  const canCreateUser = useCan("users.create");
  const canManagePolicies = useCan("policies.manage");
  const canManageAttributes = useCan("attributes.manage");

  useEffect(() => {
    dispatch(getDashboardSummary());
    dispatch(getRecentFiles());
  }, [dispatch]);

  const stats = [
    { label: "Total Files", value: summary?.totalFiles, icon: FilesStatIcon },
    { label: "Total Users", value: summary?.totalUsers, icon: UsersIcon },
    { label: "Total Policies", value: summary?.totalPolicies, icon: ShieldIcon },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1>Welcome back{firstName ? `, ${firstName}` : ""}</h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with your files.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Icon />
            </div>
            <div>
              {summaryLoading && value === undefined ? (
                <Spinner size="sm" />
              ) : (
                <p className="text-2xl font-semibold text-foreground">{value ?? 0}</p>
              )}
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-3">Latest uploads</h2>
        {recentFilesLoading && recentFiles.length === 0 ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : recentFiles.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted-foreground">
            No files uploaded yet.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Uploaded by</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Policy</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => navigate(`/files/${file.id}`)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary"
                  >
                    <td className="px-4 py-3 text-foreground">
                      <div className="max-w-[220px] truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {file.uploadedBy}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {file.uploadedBy}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">{file.policy}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeDate(file.uploadedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/files/upload"
            className="card flex flex-col items-center gap-2 p-6 text-center transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
          >
            <UploadIcon />
            <span className="text-sm font-medium text-foreground">Upload file</span>
          </Link>

          {canCreateUser && (
            <Link
              to="/users?action=create"
              className="card flex flex-col items-center gap-2 p-6 text-center transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
            >
              <UsersIcon />
              <span className="text-sm font-medium text-foreground">Create user</span>
            </Link>
          )}

          {canManagePolicies && (
            <Link
              to="/policies?action=create"
              className="card flex flex-col items-center gap-2 p-6 text-center transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
            >
              <ShieldIcon />
              <span className="text-sm font-medium text-foreground">Create policy</span>
            </Link>
          )}

          {canManageAttributes && (
            <Link
              to="/attributes?action=create"
              className="card flex flex-col items-center gap-2 p-6 text-center transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
            >
              <TagIcon />
              <span className="text-sm font-medium text-foreground">Create attribute</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
