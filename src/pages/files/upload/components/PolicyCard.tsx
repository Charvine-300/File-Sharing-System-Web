import type { AllPoliciesResponse } from "../../../../types/policyMgmt";

interface PolicyCardProps {
  policy: AllPoliciesResponse;
  onSelect: () => void;
}

export default function PolicyCard({ policy, onSelect }: PolicyCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="card flex cursor-pointer flex-col items-start gap-2 p-4 text-left transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <h3 className="text-base">{policy.policyName}</h3>
        {policy.isSystemPolicy && (
          <span className="badge bg-accent text-accent-foreground shrink-0">System</span>
        )}
      </div>
      <code
        className="w-full truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
        title={policy.policyExpression}
      >
        {policy.policyExpression}
      </code>
    </button>
  );
}
