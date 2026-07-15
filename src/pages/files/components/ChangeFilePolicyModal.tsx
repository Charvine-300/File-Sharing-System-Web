import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getPolicies } from "../../../app/features/policyMgmtSlice";
import { updateFilePolicy } from "../../../app/features/uploadsMgmtSlice";
import Modal from "../../../components/Modal";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Spinner from "../../../components/Spinner";
import PolicyCard from "../../../components/policy/PolicyCard";
import type { FileResponse } from "../../../types/uploadsMgmt";
import type { AllPoliciesResponse } from "../../../types/policyMgmt";

interface ChangeFilePolicyModalProps {
  file: FileResponse;
  onClose: () => void;
  onChanged: () => void;
}

export default function ChangeFilePolicyModal({
  file,
  onClose,
  onChanged,
}: ChangeFilePolicyModalProps) {
  const dispatch = useAppDispatch();
  const { policies, loading } = useAppSelector((state) => state.policyMgmt);

  const [searchInput, setSearchInput] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<AllPoliciesResponse | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(getPolicies({ search: searchInput || undefined, pageNumber: 1, pageSize: 50 }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [dispatch, searchInput]);

  async function handleConfirm() {
    if (!selectedPolicy) return;
    const result = await dispatch(
      updateFilePolicy({ id: file.id, policyId: selectedPolicy.id })
    );
    if (updateFilePolicy.fulfilled.match(result)) {
      onChanged();
      onClose();
    } else {
      setSelectedPolicy(null);
    }
  }

  return (
    <Modal title={`Change policy — ${file.fileName}`} onClose={onClose}>
      <p className="mb-4 text-xs text-muted-foreground">
        Pick a new policy for this file. It's re-encrypted immediately — anyone
        who could open it under the old policy loses access unless they also
        match the new one.
      </p>

      <input
        className="input mb-4"
        placeholder="Search policies"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : policies.length === 0 ? (
        <p className="text-sm text-muted-foreground">No policies found.</p>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onSelect={() => setSelectedPolicy(policy)}
            />
          ))}
        </div>
      )}

      {selectedPolicy && (
        <ConfirmDialog
          title="Change this file's policy?"
          message={
            <>
              Re-encrypt <span className="font-medium text-foreground">{file.fileName}</span>{" "}
              under <span className="font-medium text-foreground">{selectedPolicy.policyName}</span>?
              Anyone who could open it before will lose access unless they also
              match the new policy.
            </>
          }
          confirmLabel="Change policy"
          variant="danger"
          onConfirm={handleConfirm}
          onCancel={() => setSelectedPolicy(null)}
        />
      )}
    </Modal>
  );
}
