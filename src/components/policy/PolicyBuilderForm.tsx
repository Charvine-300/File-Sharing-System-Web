import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createPolicy, getPolicies } from "../../app/features/policyMgmtSlice";
import { getAttributeCatalog } from "../../app/features/attributeMgmtSlice";
import Spinner from "../Spinner";
import ConfirmDialog from "../ConfirmDialog";
import PolicyNodeEditor from "./PolicyNodeEditor";
import {
  addGroupToGroup,
  addLeafToGroup,
  createGroup,
  isTreeComplete,
  removeNodeByKey,
  setGroupOperator,
  setLeafAttribute,
  toPolicyNodeRequest,
  type BuilderNode,
} from "../../utils/policyBuilder";
import { buildPolicyExpression, buildReadableExpression } from "../../utils/policyExpression";
import type { AllPoliciesResponse, PolicyOperator } from "../../types/policyMgmt";

interface PolicyNameForm {
  policyName: string;
  description: string;
}

interface PolicyBuilderFormProps {
  onCreated: (policy: AllPoliciesResponse) => void;
  onCancel: () => void;
}

export default function PolicyBuilderForm({ onCreated, onCancel }: PolicyBuilderFormProps) {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector((state) => state.attributeMgmt.catalog);
  const catalogLoading = useAppSelector((state) => state.attributeMgmt.catalogLoading);
  const mutating = useAppSelector((state) => state.policyMgmt.mutating);

  const [tree, setTree] = useState<BuilderNode>(() => createGroup());
  const [resolving, setResolving] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<PolicyNameForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PolicyNameForm>({ defaultValues: { policyName: "", description: "" } });

  useEffect(() => {
    dispatch(getAttributeCatalog());
  }, [dispatch]);

  const attributeNameById = useMemo(
    () => new Map(catalog.map((attribute) => [attribute.id, attribute.attributeName])),
    [catalog]
  );

  const complete = isTreeComplete(tree);

  const readableExpression = useMemo(() => {
    if (!complete) return "";
    try {
      return buildReadableExpression(toPolicyNodeRequest(tree), attributeNameById);
    } catch {
      return "";
    }
  }, [tree, complete, attributeNameById]);

  function handleAddLeaf(groupKey: string) {
    setTree((prev) => addLeafToGroup(prev, groupKey));
  }

  function handleAddGroup(groupKey: string) {
    setTree((prev) => addGroupToGroup(prev, groupKey));
  }

  function handleSetAttribute(leafKey: string, attributeId: string) {
    setTree((prev) => setLeafAttribute(prev, leafKey, attributeId));
  }

  function handleSetOperator(groupKey: string, operator: PolicyOperator) {
    setTree((prev) => setGroupOperator(prev, groupKey, operator));
  }

  function handleRemove(key: string) {
    setTree((prev) => removeNodeByKey(prev, key));
  }

  function onSubmit(data: PolicyNameForm) {
    if (!complete) return;
    setPendingSubmit(data);
  }

  async function handleConfirmCreate() {
    if (!pendingSubmit) return;

    const rules = toPolicyNodeRequest(tree);
    const result = await dispatch(createPolicy({ ...pendingSubmit, rules }));
    if (!createPolicy.fulfilled.match(result)) {
      setPendingSubmit(null);
      return;
    }

    // CreatePolicyAsync doesn't return the new policy's id, so it's located by
    // searching on name and matching the expression we just independently
    // computed — the backend derives that same string from the same rule tree.
    setResolving(true);
    const expectedExpression = buildPolicyExpression(rules, attributeNameById);
    const searchResult = await dispatch(
      getPolicies({ search: pendingSubmit.policyName, pageNumber: 1, pageSize: 50 })
    );
    setResolving(false);
    setPendingSubmit(null);

    if (getPolicies.fulfilled.match(searchResult)) {
      const match = searchResult.payload.records.find(
        (policy) => policy.policyExpression === expectedExpression
      );
      if (match) {
        onCreated(match);
        return;
      }
    }

    toast.error("Policy created, but couldn't be located automatically — pick it from the list.");
    onCancel();
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2>Create a new policy</h2>
        <p className="text-sm text-muted-foreground">
          A policy is a rule that decides who can unlock this file. Combine one or
          more attributes with AND / OR — for example, "Department is Marketing"
          AND ("Clearance Level is 3" OR "Clearance Level is 4"). Only people who
          hold attributes matching the rule will be able to decrypt the file.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-field-group">
          <label className="label" htmlFor="policyName">
            Policy name
          </label>
          <input
            id="policyName"
            className="input"
            {...register("policyName", { required: "Policy name is required" })}
          />
          {errors.policyName && (
            <p className="text-xs text-danger">{errors.policyName.message}</p>
          )}
        </div>

        <div className="input-field-group">
          <label className="label" htmlFor="policyDescription">
            Description
          </label>
          <textarea
            id="policyDescription"
            rows={2}
            className="input"
            {...register("description", {
              required: "A short description helps others understand this policy",
            })}
          />
          {errors.description && (
            <p className="text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        <div className="input-field-group">
          <span className="label">Access rules</span>
          {catalogLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : catalog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No attributes exist yet — create some from the Attributes page first.
            </p>
          ) : (
            <PolicyNodeEditor
              node={tree}
              depth={0}
              catalog={catalog}
              onAddLeaf={handleAddLeaf}
              onAddGroup={handleAddGroup}
              onSetAttribute={handleSetAttribute}
              onSetOperator={handleSetOperator}
              onRemove={handleRemove}
              isRoot
            />
          )}
        </div>

        <div className="mb-6 rounded-md border border-dashed border-border bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">Preview</p>
          <p className="mt-1 text-sm text-foreground">
            {complete && readableExpression
              ? `A user needs: ${readableExpression}`
              : "Add at least one attribute to preview the rule."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn outline-btn mt-0 flex-1"
            disabled={mutating || resolving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn primary-btn normal-btn mt-0 flex-1 inline-flex items-center justify-center gap-2"
            disabled={!complete || mutating || resolving}
          >
            {(mutating || resolving) && <Spinner size="sm" variant="on-primary" />}
            {mutating ? "Creating..." : resolving ? "Finishing up..." : "Create policy"}
          </button>
        </div>
      </form>

      {pendingSubmit && (
        <ConfirmDialog
          title="Create this policy?"
          message={
            <>
              <p>
                Create <span className="font-medium text-foreground">{pendingSubmit.policyName}</span>{" "}
                with this rule?
              </p>
              <p className="mt-2 rounded-md bg-muted px-3 py-2 text-foreground">
                A user needs: {readableExpression}
              </p>
              <p className="mt-2">
                Any file uploaded with this policy can only be decrypted by people who
                match the rule above.
              </p>
            </>
          }
          confirmLabel="Create policy"
          onConfirm={handleConfirmCreate}
          onCancel={() => setPendingSubmit(null)}
        />
      )}
    </div>
  );
}
