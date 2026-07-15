import { useCan } from "../../../hooks/usePermission";
import DropdownMenu from "../../../components/DropdownMenu";
import type { AllPoliciesResponse } from "../../../types/policyMgmt";

interface PolicyRowActionsProps {
  policy: AllPoliciesResponse;
  onEdit: (policy: AllPoliciesResponse) => void;
  onDelete: (policy: AllPoliciesResponse) => void;
}

export default function PolicyRowActions({ policy, onEdit, onDelete }: PolicyRowActionsProps) {
  const canManage = useCan("policies.manage");

  // System policies can't be edited or deleted server-side — no point showing
  // a menu whose only actions would just come back as errors.
  if (!canManage || policy.isSystemPolicy) return null;

  return (
    <DropdownMenu
      align="right"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Policy actions"
          className="cursor-pointer rounded-md p-1.5 hover:bg-secondary"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      )}
    >
      {({ close }) => (
        <>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => {
              close();
              onEdit(policy);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-danger hover:bg-secondary"
            onClick={() => {
              close();
              onDelete(policy);
            }}
          >
            Delete
          </button>
        </>
      )}
    </DropdownMenu>
  );
}
