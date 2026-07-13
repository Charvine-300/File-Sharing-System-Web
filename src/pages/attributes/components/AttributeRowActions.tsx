import { useCan } from "../../../hooks/usePermission";
import DropdownMenu from "../../../components/DropdownMenu";
import type { AllAttributesResponse } from "../../../types/attributeMgmt";

interface AttributeRowActionsProps {
  attribute: AllAttributesResponse;
  onEdit: (attribute: AllAttributesResponse) => void;
  onDelete: (attribute: AllAttributesResponse) => void;
}

export default function AttributeRowActions({
  attribute,
  onEdit,
  onDelete,
}: AttributeRowActionsProps) {
  const canManage = useCan("attributes.manage");

  if (!canManage) return null;

  return (
    <DropdownMenu
      align="right"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Attribute actions"
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
              onEdit(attribute);
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
              onDelete(attribute);
            }}
          >
            Delete
          </button>
        </>
      )}
    </DropdownMenu>
  );
}
