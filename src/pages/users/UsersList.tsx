import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { deleteUser, getUsers, updateUserStatus } from "../../app/features/userMgmtSlice";
import { useCan } from "../../hooks/usePermission";
import { useListLoadingState } from "../../hooks/useListLoadingState";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import FilterBar, { type ActiveFilter, type FilterFieldDef } from "../../components/FilterBar";
import type { AllUsersResponse, UserParameters } from "../../types/userMgmt";
import UserRowActions from "./components/UserRowActions";
import CreateUserModal from "./components/CreateUserModal";
import UserAttributesModal from "./components/UserAttributesModal";

const USER_FILTER_FIELDS: FilterFieldDef[] = [
  { key: "search", label: "Name or email", type: "text", placeholder: "Search..." },
  {
    key: "isActive",
    label: "Status",
    type: "select",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  { key: "startDate", label: "Created after", type: "date" },
  { key: "endDate", label: "Created before", type: "date" },
];

function buildUserParameters(activeFilters: ActiveFilter[], pageNumber: number): UserParameters {
  const params: UserParameters = { pageNumber, pageSize: 10 };

  for (const filter of activeFilters) {
    if (filter.key === "search") params.search = filter.value;
    if (filter.key === "isActive") params.isActive = filter.value === "true";
    if (filter.key === "startDate") params.startDate = filter.value;
    if (filter.key === "endDate") params.endDate = filter.value;
  }

  return params;
}

export default function UsersList() {
  const dispatch = useAppDispatch();
  const { users, loading, currentPage, totalPages, totalRecords, pageSize } =
    useAppSelector((state) => state.userMgmt);
  const canCreate = useCan("users.create");
  const { showFullLoader, showInlineLoader } = useListLoadingState(loading, users.length);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [attributesUser, setAttributesUser] = useState<AllUsersResponse | null>(
    null
  );

  useEffect(() => {
    dispatch(getUsers(buildUserParameters(activeFilters, pageNumber)));
  }, [dispatch, activeFilters, pageNumber]);

  function handleAddFilter(key: string, value: string) {
    setActiveFilters((prev) => [...prev.filter((filter) => filter.key !== key), { key, value }]);
    setPageNumber(1);
  }

  function handleRemoveFilter(key: string) {
    setActiveFilters((prev) => prev.filter((filter) => filter.key !== key));
    setPageNumber(1);
  }

  function handleClearAllFilters() {
    setActiveFilters([]);
    setPageNumber(1);
  }

  async function handleToggleStatus(user: AllUsersResponse) {
    await dispatch(updateUserStatus({ id: user.id, data: { isActive: !user.isActive } }));
  }

  async function handleDelete(user: AllUsersResponse) {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
      return;
    }
    await dispatch(deleteUser(user.id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to the system
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:ring-4 hover:ring-primary/30"
            onClick={() => setCreateOpen(true)}
          >
            Create user
          </button>
        )}
      </div>

      <FilterBar
        fields={USER_FILTER_FIELDS}
        activeFilters={activeFilters}
        onAdd={handleAddFilter}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {showFullLoader ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          {showInlineLoader && (
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
              <Spinner size="sm" /> Updating...
            </div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">
                    <div>
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {user.email}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.isActive ? "badge-authorized" : "badge-restricted"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserRowActions
                      user={user}
                      onManageAttributes={setAttributesUser}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setPageNumber}
            />
          </div>
        </div>
      )}

      {createOpen && <CreateUserModal filters={buildUserParameters(activeFilters, pageNumber)} onClose={() => setCreateOpen(false)} />}
      {attributesUser && (
        <UserAttributesModal user={attributesUser} onClose={() => setAttributesUser(null)} />
      )}
    </div>
  );
}
