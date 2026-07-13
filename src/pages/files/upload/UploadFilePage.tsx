import { useState } from "react";
import PolicySelectionStep from "./components/PolicySelectionStep";
import FileUploadStep from "./components/FileUploadStep";
import type { AllPoliciesResponse } from "../../../types/policyMgmt";

type WizardStep = "policy" | "upload";

export default function UploadFilePage() {
  const [step, setStep] = useState<WizardStep>("policy");
  const [selectedPolicy, setSelectedPolicy] = useState<AllPoliciesResponse | null>(null);

  function handlePolicySelected(policy: AllPoliciesResponse) {
    setSelectedPolicy(policy);
    setStep("upload");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-8 flex items-center gap-4 text-sm">
        <li
          className={`flex items-center gap-2 ${
            step === "policy" ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              step === "policy" ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            1
          </span>
          Access policy
        </li>
        <li className="h-px w-8 bg-border" />
        <li
          className={`flex items-center gap-2 ${
            step === "upload" ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              step === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            2
          </span>
          Upload file
        </li>
      </ol>

      {step === "policy" ? (
        <PolicySelectionStep onSelect={handlePolicySelected} />
      ) : (
        <FileUploadStep policy={selectedPolicy!} onBack={() => setStep("policy")} />
      )}
    </div>
  );
}
