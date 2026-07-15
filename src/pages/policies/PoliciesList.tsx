import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { deletePolicy, getPolicies } from "../../app/features/policyMgmtSlice";
import { useCan } from "../../hooks/usePermission";
import { useListLoadingState } from "../../hooks/useListLoadingState";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import ConfirmDialog from "../../components/ConfirmDialog";
import FilterBar, { type ActiveFilter, type FilterFieldDef } from "../../components/FilterBar";
import PolicyCard from "../../components/policy/PolicyCard";
import PolicyBuilderForm from "../../components/policy/PolicyBuilderForm";
import PolicyRowActions from "./components/PolicyRowActions";
import EditPolicyModal from "./components/EditPolicyModal";
import type { AllPoliciesResponse, PolicyParameters } from "../../types/policyMgmt";

const POLICY_FILTER_FIELDS: FilterFieldDef[] = [
  { key: "search", label: "Policy name", type: "text", placeholder: "Search..." },
  { key: "startDate", label: "Created after", type: "date" },
  { key: "endDate", label: "Created before", type: "date" },
];

function buildPolicyParameters(
  activeFilters: ActiveFilter[],
  pageNumber: number
): PolicyParameters {
  const params: PolicyParameters = { pageNumber, pageSize: 10 };

  for (const filter of activeFilters) {
    if (filter.key === "search") params.search = filter.value;
    if (filter.key === "startDate") params.startDate = filter.value;
    if (filter.key === "endDate") params.endDate = filter.value;
  }

  return params;
}

export default function PoliciesList() {
  const dispatch = useAppDispatch();
  const { policies, loading, currentPage, totalPages, totalRecords, pageSize } = useAppSelector(
    (state) => state.policyMgmt
  );
  const canManage = useCan("policies.manage");
  const { showFullLoader, showInlineLoader } = useListLoadingState(loading, policies.length);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AllPoliciesResponse | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<AllPoliciesResponse | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    dispatch(getPolicies(buildPolicyParameters(activeFilters, pageNumber)));
  }, [dispatch, activeFilters, pageNumber]);

  // Lets the Dashboard's "Create policy" quick action link straight into the
  // builder via /policies?action=create instead of just landing on the list.
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setCreating(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  async function handleConfirmDelete() {
    if (!deletingPolicy) return;
    await dispatch(deletePolicy(deletingPolicy.id));
    setDeletingPolicy(null);
  }

  if (creating) {
    return (
      <div className="mx-auto max-w-2xl">
        <PolicyBuilderForm
          onCreated={() => {
            setCreating(false);
            dispatch(getPolicies(buildPolicyParameters(activeFilters, pageNumber)));
          }}
          onCancel={() => setCreating(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Policies</h1>
          <p className="text-sm text-muted-foreground">
            Manage the access rules used to encrypt and decrypt files
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:ring-4 hover:ring-primary/30"
            onClick={() => setCreating(true)}
          >
            Create policy
          </button>
        )}
      </div>

      <FilterBar
        fields={POLICY_FILTER_FIELDS}
        activeFilters={activeFilters}
        onAdd={handleAddFilter}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {showFullLoader ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : policies.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No policies yet — create one to get started.
        </div>
      ) : (
        <>
          {showInlineLoader && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner size="sm" /> Updating...
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                href={`/policies/${policy.id}`}
                actions={
                  <PolicyRowActions
                    policy={policy}
                    onEdit={setEditingPolicy}
                    onDelete={setDeletingPolicy}
                  />
                }
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={setPageNumber}
        />
      </div>

      {editingPolicy && (
        <EditPolicyModal
          policy={editingPolicy}
          filters={buildPolicyParameters(activeFilters, pageNumber)}
          onClose={() => setEditingPolicy(null)}
        />
      )}

      {deletingPolicy && (
        <ConfirmDialog
          title="Delete policy"
          message={`Delete "${deletingPolicy.policyName}"? This cannot be undone. Policies attached to uploaded files can't be deleted.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPolicy(null)}
        />
      )}
    </div>
  );
}
