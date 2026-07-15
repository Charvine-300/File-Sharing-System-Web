import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  clearSelectedUser,
  getUser,
  updateUserAttributes,
} from "../../../app/features/userMgmtSlice";
import { getAttributeCatalog } from "../../../app/features/attributeMgmtSlice";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import ConfirmDialog from "../../../components/ConfirmDialog";
import AttributeCheckboxList from "../../../components/AttributeCheckboxList";
import type { AllUsersResponse } from "../../../types/userMgmt";

interface UserAttributesModalProps {
  user: AllUsersResponse;
  onClose: () => void;
}

export default function UserAttributesModal({ user, onClose }: UserAttributesModalProps) {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector((state) => state.userMgmt.selectedUser);
  const detailLoading = useAppSelector((state) => state.userMgmt.detailLoading);
  const mutating = useAppSelector((state) => state.userMgmt.mutating);
  const catalog = useAppSelector((state) => state.attributeMgmt.catalog);
  const catalogLoading = useAppSelector((state) => state.attributeMgmt.catalogLoading);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    dispatch(getUser(user.id));
    dispatch(getAttributeCatalog());
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, user.id]);

  // Matches by name: UserResponse only gives back assigned attribute names,
  // while the update endpoint needs ids — the catalog bridges the two.
  useEffect(() => {
    if (initialized || !selectedUser || catalog.length === 0) return;

    const currentNames = new Set(selectedUser.attributes);
    const matchedIds = catalog
      .filter((attribute) => currentNames.has(attribute.attributeName))
      .map((attribute) => attribute.id);

    setSelectedIds(matchedIds);
    setInitialized(true);
  }, [selectedUser, catalog, initialized]);

  function toggleAttribute(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
  }

  async function handleConfirmSave() {
    const result = await dispatch(
      updateUserAttributes({ id: user.id, data: { attributes: selectedIds } })
    );
    setConfirming(false);
    if (updateUserAttributes.fulfilled.match(result)) {
      onClose();
    }
  }

  const loading = detailLoading || catalogLoading || !initialized;

  return (
    <Modal title={`Attributes — ${user.firstName} ${user.lastName}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <AttributeCheckboxList
          attributes={catalog}
          selectedIds={selectedIds}
          onToggle={toggleAttribute}
        />
      )}

      <button
        type="button"
        className="btn primary-btn normal-btn inline-flex items-center justify-center gap-2"
        disabled={loading || mutating}
        onClick={() => setConfirming(true)}
      >
        {mutating && <Spinner size="sm" variant="on-primary" />}
        {mutating ? "Saving..." : "Save attributes"}
      </button>

      {confirming && (
        <ConfirmDialog
          title="Update attributes?"
          message={`This changes which files ${user.firstName} ${user.lastName} can decrypt. Continue?`}
          confirmLabel="Save attributes"
          onConfirm={handleConfirmSave}
          onCancel={() => setConfirming(false)}
        />
      )}
    </Modal>
  );
}
