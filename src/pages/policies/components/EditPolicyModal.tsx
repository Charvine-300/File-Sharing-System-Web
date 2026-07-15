import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  clearSelectedPolicy,
  getPolicies,
  getPolicy,
  updatePolicy,
} from "../../../app/features/policyMgmtSlice";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import type {
  AllPoliciesResponse,
  PolicyParameters,
  UpdatePolicyRequest,
} from "../../../types/policyMgmt";

interface EditPolicyModalProps {
  policy: AllPoliciesResponse;
  filters: PolicyParameters;
  onClose: () => void;
}

export default function EditPolicyModal({ policy, filters, onClose }: EditPolicyModalProps) {
  const dispatch = useAppDispatch();
  const selectedPolicy = useAppSelector((state) => state.policyMgmt.selectedPolicy);
  const detailLoading = useAppSelector((state) => state.policyMgmt.detailLoading);
  const mutating = useAppSelector((state) => state.policyMgmt.mutating);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePolicyRequest>({
    defaultValues: { policyName: policy.policyName, description: "" },
  });

  useEffect(() => {
    dispatch(getPolicy(policy.id));
    return () => {
      dispatch(clearSelectedPolicy());
    };
  }, [dispatch, policy.id]);

  useEffect(() => {
    if (selectedPolicy && selectedPolicy.id === policy.id) {
      reset({ policyName: selectedPolicy.policyName, description: selectedPolicy.description });
    }
  }, [selectedPolicy, policy.id, reset]);

  async function onSubmit(data: UpdatePolicyRequest) {
    const result = await dispatch(updatePolicy({ id: policy.id, data }));
    if (updatePolicy.fulfilled.match(result)) {
      dispatch(getPolicies(filters));
      onClose();
    }
  }

  const loading = detailLoading || !selectedPolicy;

  return (
    <Modal title="Edit policy" onClose={onClose}>
      <p className="mb-4 text-xs text-muted-foreground">
        Only the name and description can be changed here — the access rule
        itself (the attribute expression) can't be edited once a policy exists.
      </p>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-field-group">
            <label className="label" htmlFor="editPolicyName">
              Policy name
            </label>
            <input
              id="editPolicyName"
              className="input"
              {...register("policyName", { required: "Policy name is required" })}
            />
            {errors.policyName && (
              <p className="text-xs text-danger">{errors.policyName.message}</p>
            )}
          </div>

          <div className="input-field-group">
            <label className="label" htmlFor="editPolicyDescription">
              Description
            </label>
            <textarea
              id="editPolicyDescription"
              rows={2}
              className="input"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && (
              <p className="text-xs text-danger">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn primary-btn normal-btn inline-flex items-center justify-center gap-2"
            disabled={mutating}
          >
            {mutating && <Spinner size="sm" variant="on-primary" />}
            {mutating ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </Modal>
  );
}
