import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AllPoliciesResponse } from "../../types/policyMgmt";

interface PolicyCardProps {
  policy: AllPoliciesResponse;
  // Upload-flow (selection) mode: whole card is a button.
  onSelect?: () => void;
  // Management mode: title links to the details page, with a row-actions
  // menu (Edit/Delete) rendered alongside the badge.
  href?: string;
  actions?: ReactNode;
}

export default function PolicyCard({ policy, onSelect, href, actions }: PolicyCardProps) {
  const badge = policy.isSystemPolicy && (
    <span className="badge bg-accent text-accent-foreground shrink-0">System</span>
  );

  if (href) {
    return (
      <div className="card flex flex-col items-start gap-2 p-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Link to={href} className="min-w-0 flex-1 truncate text-base hover:underline">
            {policy.policyName}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            {badge}
            {actions}
          </div>
        </div>
        <Link to={href} className="w-full">
          <code
            className="block w-full truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
            title={policy.policyExpression}
          >
            {policy.policyExpression}
          </code>
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="card flex cursor-pointer flex-col items-start gap-2 p-4 text-left transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <h3 className="text-base">{policy.policyName}</h3>
        {badge}
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
