import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateAttribute, getAttributes } from "../../../app/features/attributeMgmtSlice";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import { ATTRIBUTE_TYPES, type AttributeType } from "../../../types/attributeMgmt";
import { humanize, toPascalCase } from "../../../utils/format";
import type {
  AllAttributesResponse,
  AttributeParameters,
} from "../../../types/attributeMgmt";

interface EditAttributeModalProps {
  attribute: AllAttributesResponse;
  filters: AttributeParameters;
  onClose: () => void;
}

interface AttributeFormValues {
  attributeName: string;
  attributeType: AttributeType | "";
}

export default function EditAttributeModal({
  attribute,
  filters,
  onClose,
}: EditAttributeModalProps) {
  const dispatch = useAppDispatch();
  const mutating = useAppSelector((state) => state.attributeMgmt.mutating);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttributeFormValues>({
    defaultValues: {
      attributeName: attribute.attributeName,
      attributeType: attribute.attributeType as AttributeType,
    },
  });

  async function onSubmit(data: AttributeFormValues) {
    const result = await dispatch(
      updateAttribute({
        id: attribute.id,
        data: {
          attributeName: toPascalCase(data.attributeName),
          attributeType: data.attributeType as AttributeType,
        },
      })
    );
    if (updateAttribute.fulfilled.match(result)) {
      dispatch(getAttributes(filters));
      onClose();
    }
  }

  return (
    <Modal title="Edit attribute" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-field-group">
          <label className="label" htmlFor="editAttributeName">
            Attribute name
          </label>
          <input
            id="editAttributeName"
            className="input"
            {...register("attributeName", {
              required: "Attribute name is required",
              minLength: { value: 2, message: "Must be at least 2 characters" },
            })}
          />
          {errors.attributeName && (
            <p className="text-xs text-danger">{errors.attributeName.message}</p>
          )}
        </div>

        <div className="input-field-group">
          <label className="label" htmlFor="editAttributeType">
            Attribute type
          </label>
          <select
            id="editAttributeType"
            className="input"
            {...register("attributeType", { required: "Attribute type is required" })}
          >
            <option value="" disabled>
              Select a type
            </option>
            {ATTRIBUTE_TYPES.map((type) => (
              <option key={type} value={type}>
                {humanize(type)}
              </option>
            ))}
          </select>
          {errors.attributeType && (
            <p className="text-xs text-danger">{errors.attributeType.message}</p>
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
    </Modal>
  );
}
