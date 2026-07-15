import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createUser, getUsers } from "../../../app/features/userMgmtSlice";
import { getAttributeCatalog } from "../../../app/features/attributeMgmtSlice";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import ConfirmDialog from "../../../components/ConfirmDialog";
import AttributeCheckboxList from "../../../components/AttributeCheckboxList";
import ProfilePhotoInput from "../../../components/ProfilePhotoInput";
import type { UserParameters } from "../../../types/userMgmt";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateUserModalProps {
  filters: UserParameters;
  onClose: () => void;
}

interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateUserModal({ filters, onClose }: CreateUserModalProps) {
  const dispatch = useAppDispatch();
  const mutating = useAppSelector((state) => state.userMgmt.mutating);
  const catalog = useAppSelector((state) => state.attributeMgmt.catalog);
  const catalogLoading = useAppSelector((state) => state.attributeMgmt.catalogLoading);

  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<CreateUserFormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  useEffect(() => {
    dispatch(getAttributeCatalog());
  }, [dispatch]);

  function toggleAttribute(id: string) {
    setSelectedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
  }

  function onSubmit(data: CreateUserFormValues) {
    setPendingSubmit(data);
  }

  async function handleConfirmCreate() {
    if (!pendingSubmit) return;
    const result = await dispatch(
      createUser({
        ...pendingSubmit,
        attributes: selectedAttributeIds,
        profilePhoto: profilePhoto ?? undefined,
      })
    );
    setPendingSubmit(null);
    if (createUser.fulfilled.match(result)) {
      dispatch(getUsers(filters));
      onClose();
    }
  }

  return (
    <Modal title="Create user" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ProfilePhotoInput value={profilePhoto} onChange={setProfilePhoto} />

        <div className="input-field-group">
          <label className="label" htmlFor="createFirstName">
            First name
          </label>
          <input
            id="createFirstName"
            className="input"
            {...register("firstName", { required: "First name is required" })}
          />
          {errors.firstName && (
            <p className="text-xs text-danger">{errors.firstName.message}</p>
          )}
        </div>

        <div className="input-field-group">
          <label className="label" htmlFor="createLastName">
            Last name
          </label>
          <input
            id="createLastName"
            className="input"
            {...register("lastName", { required: "Last name is required" })}
          />
          {errors.lastName && (
            <p className="text-xs text-danger">{errors.lastName.message}</p>
          )}
        </div>

        <div className="input-field-group">
          <label className="label" htmlFor="createEmail">
            Email
          </label>
          <input
            id="createEmail"
            type="email"
            className="input"
            {...register("email", {
              required: "Email is required",
              pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
            })}
          />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="input-field-group">
          <span className="label">Attributes</span>
          {catalogLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <AttributeCheckboxList
              attributes={catalog}
              selectedIds={selectedAttributeIds}
              onToggle={toggleAttribute}
            />
          )}
        </div>

        <button
          type="submit"
          className="btn primary-btn normal-btn inline-flex items-center justify-center gap-2"
          disabled={mutating}
        >
          {mutating && <Spinner size="sm" variant="on-primary" />}
          {mutating ? "Creating..." : "Create user"}
        </button>
      </form>

      {pendingSubmit && (
        <ConfirmDialog
          title="Create this user?"
          message={
            <>
              Create an account for{" "}
              <span className="font-medium text-foreground">
                {pendingSubmit.firstName} {pendingSubmit.lastName}
              </span>
              ? They'll be emailed a generated password at {pendingSubmit.email}.
            </>
          }
          confirmLabel="Create user"
          onConfirm={handleConfirmCreate}
          onCancel={() => setPendingSubmit(null)}
        />
      )}
    </Modal>
  );
}
