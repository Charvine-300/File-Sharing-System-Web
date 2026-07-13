import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { getPolicies } from "../../../../app/features/policyMgmtSlice";
import Spinner from "../../../../components/Spinner";
import PolicyCard from "./PolicyCard";
import PolicyBuilderForm from "./PolicyBuilderForm";
import type { AllPoliciesResponse } from "../../../../types/policyMgmt";

interface PolicySelectionStepProps {
  onSelect: (policy: AllPoliciesResponse) => void;
}

export default function PolicySelectionStep({ onSelect }: PolicySelectionStepProps) {
  const dispatch = useAppDispatch();
  const { policies, loading } = useAppSelector((state) => state.policyMgmt);
  const [searchInput, setSearchInput] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(getPolicies({ search: searchInput || undefined, pageNumber: 1, pageSize: 50 }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [dispatch, searchInput]);

  if (creating) {
    return <PolicyBuilderForm onCreated={onSelect} onCancel={() => setCreating(false)} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1>Choose an access policy</h1>
        <p className="text-sm text-muted-foreground">
          A policy controls who can decrypt this file, based on the attributes
          they've been assigned (like department or clearance level). Pick an
          existing one or create a new one for this file.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search policies"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:ring-4 hover:ring-primary/30"
        >
          + Create new policy
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : policies.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No policies yet — create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} onSelect={() => onSelect(policy)} />
          ))}
        </div>
      )}
    </div>
  );
}
